const dns = require('dns');
const mongoose = require('mongoose');

const DEFAULT_DNS_FALLBACK = ['8.8.8.8', '1.1.1.1'];

const getMongoOptions = () => ({
  serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 15000),
  connectTimeoutMS: Number(process.env.MONGO_CONNECT_TIMEOUT_MS || 10000),
  socketTimeoutMS: Number(process.env.MONGO_SOCKET_TIMEOUT_MS || 45000),
  family: 4,
});

const getDnsTimeout = () => Number(process.env.MONGO_DNS_TIMEOUT_MS || 5000);

const getDnsFallbackServers = () => {
  const raw = process.env.MONGO_DNS_FALLBACK || DEFAULT_DNS_FALLBACK.join(',');
  return raw
    .split(',')
    .map((server) => server.trim())
    .filter(Boolean);
};

const isSrvLookupError = (error) =>
  /querySrv|ETIMEOUT|ENOTFOUND|EAI_AGAIN|dns/i.test(error?.message || '');

const getSrvHost = (uri) => {
  const match = uri.match(/@([^/?]+)/);
  return match ? match[1] : 'unknown-host';
};

const withTimeout = (promise, timeoutMs, message) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${message} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });

const ensureMongoSrvDns = async (mongoUri) => {
  if (!mongoUri.startsWith('mongodb+srv://')) return;

  const srvHost = getSrvHost(mongoUri);
  const srvRecord = `_mongodb._tcp.${srvHost}`;
  const timeoutMs = getDnsTimeout();

  try {
    await withTimeout(dns.promises.resolveSrv(srvRecord), timeoutMs, 'MongoDB SRV lookup');
  } catch (error) {
    const fallbackDnsServers = getDnsFallbackServers();
    dns.setServers(fallbackDnsServers);

    try {
      await withTimeout(
        dns.promises.resolveSrv(srvRecord),
        timeoutMs,
        'MongoDB SRV lookup (fallback DNS)'
      );
      console.log(`MongoDB SRV resolved using fallback DNS: ${fallbackDnsServers.join(', ')}`);
    } catch (retryError) {
      throw new Error(
        `MongoDB SRV lookup failed for ${srvHost}. Tried DNS servers: ${fallbackDnsServers.join(', ')}. ${retryError.message}`
      );
    }
  }
};

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  const mongoUriDirect = process.env.MONGO_URI_DIRECT;
  if (!mongoUri) {
    console.error('MongoDB connection error: MONGO_URI is not set');
    process.exit(1);
  }

  const options = getMongoOptions();

  try {
    await ensureMongoSrvDns(mongoUri);
    const conn = await mongoose.connect(mongoUri, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return;
  } catch (error) {
    if (mongoUriDirect && isSrvLookupError(error)) {
      try {
        const conn = await mongoose.connect(mongoUriDirect, options);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log('Connected with MONGO_URI_DIRECT after SRV lookup failure.');
        return;
      } catch (directError) {
        console.error(`MongoDB direct connection error: ${directError.message}`);
      }
    }

    const canRetryWithFallbackDns =
      mongoUri.startsWith('mongodb+srv://')
      && isSrvLookupError(error)
      && !String(error.message).includes('MongoDB SRV lookup failed for');

    if (canRetryWithFallbackDns) {
      const fallbackDnsServers = getDnsFallbackServers();
      try {
        dns.setServers(fallbackDnsServers);
        const conn = await mongoose.connect(mongoUri, options);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`MongoDB SRV resolved using fallback DNS: ${fallbackDnsServers.join(', ')}`);
        return;
      } catch (retryError) {
        console.error(`MongoDB SRV lookup failed for ${getSrvHost(mongoUri)}.`);
        console.error(`Tried DNS servers: ${fallbackDnsServers.join(', ')}`);
        console.error(`MongoDB connection error: ${retryError.message}`);
        process.exit(1);
      }
    }

    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
