const toLower = (value) => String(value || '').trim().toLowerCase();

const parseIntEnv = (name, fallback, min, max) => {
  const raw = process.env[name];
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return fallback;
  if (typeof min === 'number' && parsed < min) return min;
  if (typeof max === 'number' && parsed > max) return max;
  return parsed;
};

const parseFloatEnv = (name, fallback, min, max) => {
  const raw = process.env[name];
  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed)) return fallback;
  if (typeof min === 'number' && parsed < min) return min;
  if (typeof max === 'number' && parsed > max) return max;
  return parsed;
};

const parseCsvEnv = (name, fallbackCsv) =>
  String(process.env[name] || fallbackCsv || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const DEFAULT_AI_PROVIDER = toLower(process.env.AI_PROVIDER || 'groq');
const ENABLE_OFFLINE_FALLBACK = toLower(process.env.AI_ENABLE_OFFLINE_FALLBACK || 'true') === 'true';

const AI_MAX_INPUT_MESSAGES = parseIntEnv('AI_MAX_INPUT_MESSAGES', 10, 2, 40);
const AI_MAX_MESSAGE_CHARS = parseIntEnv('AI_MAX_MESSAGE_CHARS', 1200, 200, 6000);
const AI_MAX_CONTEXT_CHARS = parseIntEnv('AI_MAX_CONTEXT_CHARS', 1200, 0, 6000);
const AI_MAX_OUTPUT_TOKENS = parseIntEnv('AI_MAX_OUTPUT_TOKENS', 256, 64, 4096);
const AI_TEMPERATURE = parseFloatEnv('AI_TEMPERATURE', 0.4, 0, 2);
const AI_MIN_REQUEST_INTERVAL_MS = parseIntEnv('AI_MIN_REQUEST_INTERVAL_MS', 2500, 0, 60000);
const AI_MAX_REQUESTS_PER_MINUTE = parseIntEnv('AI_MAX_REQUESTS_PER_MINUTE', 12, 1, 120);

const DEFAULT_GROQ_API_BASE_URL = process.env.GROQ_API_BASE_URL || 'https://api.groq.com/openai/v1';
const DEFAULT_GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
const DEFAULT_GROQ_FALLBACK_MODELS = parseCsvEnv(
  'GROQ_FALLBACK_MODELS',
  'llama-3.1-8b-instant,llama3-8b-8192,gemma2-9b-it'
);

const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const DEFAULT_GEMINI_API_VERSION = process.env.GEMINI_API_VERSION || 'v1beta';
const GEMINI_FALLBACK_MODELS = parseCsvEnv(
  'GEMINI_FALLBACK_MODELS',
  'gemini-2.0-flash,gemini-1.5-flash'
);
const GEMINI_FALLBACK_API_VERSIONS = parseCsvEnv(
  'GEMINI_FALLBACK_API_VERSIONS',
  'v1beta,v1'
);

const DEFAULT_GROK_MODEL = process.env.GROK_MODEL || 'grok-3-mini';
const DEFAULT_GROK_API_VERSION = process.env.GROK_API_VERSION || 'v1';
const DEFAULT_GROK_BASE_URL =
  process.env.GROK_BASE_URL
  || process.env.GROK_API_BASE_URL
  || `https://api.x.ai/${DEFAULT_GROK_API_VERSION}`;
const DEFAULT_GROK_FALLBACK_MODELS = parseCsvEnv(
  'GROK_FALLBACK_MODELS',
  'grok-3-mini,grok-3'
);

const ONE_MINUTE_MS = 60 * 1000;
const usageByUser = new Map();

const clipText = (value, maxChars) => {
  const text = String(value || '');
  if (!maxChars || maxChars < 1) return text;
  return text.length > maxChars ? text.slice(0, maxChars) : text;
};

const normalizeMessageText = (content) => {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') return part;
        if (part && typeof part.text === 'string') return part.text;
        return '';
      })
      .filter(Boolean)
      .join('\n');
  }
  return '';
};

const normalizeRole = (role) => (role === 'assistant' ? 'assistant' : 'user');

const sanitizeMessages = (messages) => {
  const normalized = messages
    .map((message) => ({
      role: normalizeRole(message?.role),
      content: clipText(normalizeMessageText(message?.content).trim(), AI_MAX_MESSAGE_CHARS),
    }))
    .filter((message) => Boolean(message.content));

  if (normalized.length <= AI_MAX_INPUT_MESSAGES) {
    return normalized;
  }
  return normalized.slice(normalized.length - AI_MAX_INPUT_MESSAGES);
};

const checkUsageLimits = (rateKey) => {
  const now = Date.now();
  const state = usageByUser.get(rateKey) || {
    lastRequestAt: 0,
    timestamps: [],
    lastSeenAt: now,
  };

  state.timestamps = state.timestamps.filter((ts) => now - ts < ONE_MINUTE_MS);
  state.lastSeenAt = now;

  if (AI_MIN_REQUEST_INTERVAL_MS > 0 && state.lastRequestAt > 0) {
    const elapsed = now - state.lastRequestAt;
    if (elapsed < AI_MIN_REQUEST_INTERVAL_MS) {
      const waitMs = AI_MIN_REQUEST_INTERVAL_MS - elapsed;
      usageByUser.set(rateKey, state);
      return {
        ok: false,
        message: `Please wait ${Math.ceil(waitMs / 1000)}s before sending another message.`,
        retryAfterMs: waitMs,
      };
    }
  }

  if (state.timestamps.length >= AI_MAX_REQUESTS_PER_MINUTE) {
    const oldest = state.timestamps[0];
    const waitMs = Math.max(1, ONE_MINUTE_MS - (now - oldest));
    usageByUser.set(rateKey, state);
    return {
      ok: false,
      message: `Free-tier safety limit reached (${AI_MAX_REQUESTS_PER_MINUTE}/minute). Retry in ${Math.ceil(waitMs / 1000)}s.`,
      retryAfterMs: waitMs,
    };
  }

  state.lastRequestAt = now;
  state.timestamps.push(now);
  usageByUser.set(rateKey, state);

  if (usageByUser.size > 5000) {
    const staleCutoff = now - 10 * ONE_MINUTE_MS;
    for (const [key, value] of usageByUser.entries()) {
      if ((value?.lastSeenAt || 0) < staleCutoff) {
        usageByUser.delete(key);
      }
    }
  }

  return { ok: true };
};

const parseProviderError = ({ data, rawText, fallbackMessage = 'Provider error' }) => {
  if (typeof data?.error === 'string' && data.error.trim()) return data.error.trim();
  if (typeof data?.error?.message === 'string' && data.error.message.trim()) {
    return data.error.message.trim();
  }
  if (typeof data?.message === 'string' && data.message.trim()) return data.message.trim();
  if (typeof data?.code === 'string' && data.code.trim()) return data.code.trim();
  if (typeof rawText === 'string' && rawText.trim()) return rawText.trim().slice(0, 500);
  return fallbackMessage;
};

const readProviderResponse = async (response) => {
  let data = {};
  let rawText = '';
  try {
    rawText = await response.text();
    if (rawText) {
      try {
        data = JSON.parse(rawText);
      } catch (_parseError) {
        data = {};
      }
    }
  } catch (_error) {
    data = {};
    rawText = '';
  }

  return {
    ok: response.ok,
    status: response.status,
    data,
    rawText,
  };
};

const buildSystemPrompt = ({ user, context }) => {
  const currentUserName = user?.name || 'Unknown user';
  const currentUserRole = user?.role || 'student';
  const safeContext = clipText(String(context || ''), AI_MAX_CONTEXT_CHARS).trim();

  return `You are an AI study assistant for Internix, a smart internship management platform.
The current user is ${currentUserName} (role: ${currentUserRole}).
${safeContext ? `Context: ${safeContext}` : ''}
Help students with their internship tasks, learning materials, and career advice.
Be concise, friendly, and practical. Respond in 2-4 sentences unless more detail is needed.`;
};

const buildOfflineFallbackReply = ({ messages, user, warning }) => {
  const latestUserMessage = messages
    .slice()
    .reverse()
    .find((message) => message.role === 'user')?.content || 'your internship work';
  const userName = user?.name || 'there';
  const reason = warning ? ` Reason: ${warning}` : '';

  return `Hi ${userName}, external AI is currently unavailable, so I switched to free fallback mode.${reason} For "${latestUserMessage}", split it into 3 short tasks, complete the first task today, and send progress to your mentor. Share your exact task details and I will give you a day-wise actionable plan.`;
};

const sendOfflineFallback = ({ res, messages, user, warning, limited }) =>
  res.json({
    reply: buildOfflineFallbackReply({ messages, user, warning }),
    fallback: true,
    provider: 'offline',
    limited: Boolean(limited),
    warning: warning || undefined,
  });

const extractOpenAICompatibleText = (data) => {
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content.trim();
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') return part;
        if (typeof part?.text === 'string') return part.text;
        return '';
      })
      .filter(Boolean)
      .join('\n')
      .trim();
  }
  return '';
};

const buildOpenAIMessages = (messages, systemPrompt) => [
  { role: 'system', content: systemPrompt },
  ...messages.map((message) => ({
    role: message.role,
    content: message.content,
  })),
];

const shouldTryAnotherModel = (status, message) =>
  status === 400
  && /model not found|unknown model|invalid model|unsupported model|does not exist/i.test(String(message || ''));

const buildModelAttemptPlan = (primaryModel, fallbackModels) =>
  [primaryModel, ...(fallbackModels || [])].filter(
    (model, index, list) => Boolean(model) && list.indexOf(model) === index
  );

const callOpenAICompatible = async ({
  apiKey,
  model,
  baseUrl,
  systemPrompt,
  messages,
}) => {
  const normalizedBaseUrl = String(baseUrl || '').replace(/\/+$/, '');
  const url = `${normalizedBaseUrl}/chat/completions`;
  const requestMessages = buildOpenAIMessages(messages, systemPrompt);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: requestMessages,
      temperature: AI_TEMPERATURE,
      max_tokens: AI_MAX_OUTPUT_TOKENS,
      stream: false,
    }),
  });

  return readProviderResponse(response);
};

const runOpenAICompatibleChat = async ({
  providerLabel,
  apiKey,
  baseUrl,
  model,
  fallbackModels,
  systemPrompt,
  messages,
}) => {
  const modelsToTry = buildModelAttemptPlan(model, fallbackModels);
  let lastProviderMessage = `${providerLabel} provider error`;

  for (const modelToTry of modelsToTry) {
    let result;
    try {
      result = await callOpenAICompatible({
        apiKey,
        model: modelToTry,
        baseUrl,
        systemPrompt,
        messages,
      });
    } catch (error) {
      return {
        ok: false,
        status: 502,
        message: `${providerLabel} request failed: ${error?.message || 'network error'}`,
      };
    }

    if (result.ok) {
      const reply = extractOpenAICompatibleText(result.data);
      if (reply) return { ok: true, reply };
      return {
        ok: false,
        status: 502,
        message: `${providerLabel} returned an empty response.`,
      };
    }

    const providerMessage = parseProviderError({
      data: result.data,
      rawText: result.rawText,
      fallbackMessage: `${providerLabel} provider error`,
    });
    lastProviderMessage = providerMessage;

    if (shouldTryAnotherModel(result.status, providerMessage)) {
      continue;
    }

    if (result.status === 429 || /rate limit|too many requests|quota|resource_exhausted/i.test(providerMessage)) {
      return {
        ok: false,
        status: 429,
        message: `${providerLabel} rate limit reached. Slow down requests or reduce token settings.`,
      };
    }

    return {
      ok: false,
      status: 502,
      message: `${providerLabel} API ${result.status}: ${providerMessage}`,
    };
  }

  return {
    ok: false,
    status: 502,
    message: `${providerLabel} model error: ${lastProviderMessage}. Tried models: ${modelsToTry.join(', ')}.`,
  };
};

const buildGeminiContents = (messages, systemPrompt) => [
  {
    role: 'user',
    parts: [{ text: `[System instructions]\n${systemPrompt}` }],
  },
  ...messages.map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }],
  })),
];

const extractGeminiText = (data) =>
  data?.candidates?.[0]?.content?.parts
    ?.map((part) => (typeof part?.text === 'string' ? part.text : ''))
    .filter(Boolean)
    .join('\n')
    .trim() || '';

const buildGeminiAttemptPlan = () => {
  const models = buildModelAttemptPlan(DEFAULT_GEMINI_MODEL, GEMINI_FALLBACK_MODELS);
  const versions = buildModelAttemptPlan(DEFAULT_GEMINI_API_VERSION, GEMINI_FALLBACK_API_VERSIONS);

  const attempts = [];
  for (const version of versions) {
    for (const model of models) {
      attempts.push({ version, model });
    }
  }
  return attempts;
};

const shouldTryAnotherGeminiAttempt = (status, message) =>
  status === 404
  || /not found|not supported|unsupported|for api version|invalid model/i.test(String(message || ''));

const callGemini = async ({
  apiKey,
  version,
  model,
  systemPrompt,
  messages,
}) => {
  const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`;
  const contents = buildGeminiContents(messages, systemPrompt);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: AI_TEMPERATURE,
        maxOutputTokens: AI_MAX_OUTPUT_TOKENS,
      },
    }),
  });

  return readProviderResponse(response);
};

const runGeminiChat = async ({ apiKey, systemPrompt, messages }) => {
  const attempts = buildGeminiAttemptPlan();
  let lastProviderMessage = 'Gemini provider error';

  for (const attempt of attempts) {
    let result;
    try {
      result = await callGemini({
        apiKey,
        version: attempt.version,
        model: attempt.model,
        systemPrompt,
        messages,
      });
    } catch (error) {
      return {
        ok: false,
        status: 502,
        message: `Gemini request failed: ${error?.message || 'network error'}`,
      };
    }

    if (result.ok) {
      const reply = extractGeminiText(result.data);
      if (reply) return { ok: true, reply };
      return {
        ok: false,
        status: 502,
        message: 'Gemini returned an empty response.',
      };
    }

    const providerMessage = parseProviderError({
      data: result.data,
      rawText: result.rawText,
      fallbackMessage: 'Gemini provider error',
    });
    lastProviderMessage = providerMessage;

    if (shouldTryAnotherGeminiAttempt(result.status, providerMessage)) {
      continue;
    }

    if (result.status === 429 || /rate limit|quota|resource_exhausted|too many requests/i.test(providerMessage)) {
      return {
        ok: false,
        status: 429,
        message: 'Gemini rate limit reached. Slow down requests or use smaller limits.',
      };
    }

    return {
      ok: false,
      status: 502,
      message: `Gemini API ${result.status}: ${providerMessage}`,
    };
  }

  return {
    ok: false,
    status: 502,
    message: `Gemini model/version error: ${lastProviderMessage}.`,
  };
};

const resolveRateKey = (req) =>
  String(
    req.user?._id
    || req.user?.id
    || req.user?.email
    || req.headers['x-forwarded-for']
    || req.ip
    || 'anonymous'
  );

const runConfiguredProvider = async ({
  provider,
  systemPrompt,
  messages,
}) => {
  if (provider === 'groq') {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return { ok: false, status: 500, message: 'GROQ_API_KEY is not configured.' };
    }
    const model = String(DEFAULT_GROQ_MODEL || '').trim();
    if (!model) {
      return { ok: false, status: 500, message: 'GROQ_MODEL is not configured.' };
    }
    return runOpenAICompatibleChat({
      providerLabel: 'Groq',
      apiKey,
      baseUrl: DEFAULT_GROQ_API_BASE_URL,
      model,
      fallbackModels: DEFAULT_GROQ_FALLBACK_MODELS,
      systemPrompt,
      messages,
    });
  }

  if (provider === 'gemini') {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { ok: false, status: 500, message: 'GEMINI_API_KEY is not configured.' };
    }
    return runGeminiChat({
      apiKey,
      systemPrompt,
      messages,
    });
  }

  if (provider === 'grok') {
    const apiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
    if (!apiKey) {
      return { ok: false, status: 500, message: 'GROK_API_KEY (or XAI_API_KEY) is not configured.' };
    }
    const model = String(DEFAULT_GROK_MODEL || '').trim();
    if (!model) {
      return { ok: false, status: 500, message: 'GROK_MODEL is not configured.' };
    }
    return runOpenAICompatibleChat({
      providerLabel: 'xAI',
      apiKey,
      baseUrl: DEFAULT_GROK_BASE_URL,
      model,
      fallbackModels: DEFAULT_GROK_FALLBACK_MODELS,
      systemPrompt,
      messages,
    });
  }

  return {
    ok: false,
    status: 500,
    message: "Unsupported AI_PROVIDER. Use 'groq', 'gemini', or 'grok'.",
  };
};

// AI proxy - keeps provider API keys server-side
const aiChat = async (req, res, next) => {
  try {
    const { messages, context } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: 'messages must be a non-empty array' });
    }

    const normalizedMessages = sanitizeMessages(messages);
    if (normalizedMessages.length === 0) {
      return res.status(400).json({ message: 'messages must contain text content' });
    }

    const rateCheck = checkUsageLimits(resolveRateKey(req));
    if (!rateCheck.ok) {
      if (ENABLE_OFFLINE_FALLBACK) {
        return sendOfflineFallback({
          res,
          messages: normalizedMessages,
          user: req.user,
          warning: rateCheck.message,
          limited: true,
        });
      }
      return res.status(429).json({ message: rateCheck.message });
    }

    const systemPrompt = buildSystemPrompt({
      user: req.user,
      context,
    });

    const providerResult = await runConfiguredProvider({
      provider: DEFAULT_AI_PROVIDER,
      systemPrompt,
      messages: normalizedMessages,
    });

    if (!providerResult.ok) {
      if (ENABLE_OFFLINE_FALLBACK) {
        return sendOfflineFallback({
          res,
          messages: normalizedMessages,
          user: req.user,
          warning: providerResult.message,
          limited: providerResult.status === 429,
        });
      }
      return res.status(providerResult.status || 502).json({ message: providerResult.message });
    }

    return res.json({
      reply: providerResult.reply,
      provider: DEFAULT_AI_PROVIDER,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { aiChat };