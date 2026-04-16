const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const DEFAULT_GEMINI_API_VERSION = process.env.GEMINI_API_VERSION || 'v1';
const GEMINI_FALLBACK_MODELS = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash'];
const GEMINI_FALLBACK_API_VERSIONS = ['v1', 'v1beta'];

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

const normalizeModelName = (modelName) => String(modelName || '').replace(/^models\//, '').trim();

const buildGeminiContents = (messages) =>
  messages
    .map((message) => {
      const text = normalizeMessageText(message?.content).trim();
      if (!text) return null;

      return {
        role: message?.role === 'assistant' ? 'model' : 'user',
        parts: [{ text }],
      };
    })
    .filter(Boolean);

const extractGeminiText = (data) =>
  data?.candidates?.[0]?.content?.parts
    ?.map((part) => (typeof part?.text === 'string' ? part.text : ''))
    .filter(Boolean)
    .join('\n')
    .trim() || '';

const buildAttemptPlan = () => {
  const configuredModel = normalizeModelName(DEFAULT_GEMINI_MODEL);
  const configuredVersion = String(DEFAULT_GEMINI_API_VERSION || 'v1').trim();

  const models = [configuredModel, ...GEMINI_FALLBACK_MODELS].filter(
    (model, index, arr) => model && arr.indexOf(model) === index
  );
  const versions = [configuredVersion, ...GEMINI_FALLBACK_API_VERSIONS].filter(
    (version, index, arr) => version && arr.indexOf(version) === index
  );

  const attempts = [];
  versions.forEach((version) => {
    models.forEach((model) => {
      attempts.push({ version, model });
    });
  });
  return attempts;
};

const parseProviderError = (data, fallbackMessage = 'Gemini provider error') =>
  data?.error?.message || data?.message || fallbackMessage;

const shouldTryAnotherModel = (status, message) =>
  status === 404
  || /not found|not supported|unsupported|for api version/i.test(String(message || ''));

const buildInlineSystemPromptContents = (systemPrompt, contents) => [
  {
    role: 'user',
    parts: [{ text: `[System instructions]\n${systemPrompt}` }],
  },
  ...contents,
];

const callGemini = async ({ apiKey, version, model, systemPrompt, contents }) => {
  const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`;
  const contentsWithPrompt = buildInlineSystemPromptContents(systemPrompt, contents);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: contentsWithPrompt,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    }),
  });

  let data = {};
  try {
    data = await response.json();
  } catch (_error) {
    data = {};
  }

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
};

// AI proxy - keeps Gemini API key server-side
const aiChat = async (req, res, next) => {
  try {
    const { messages, context } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: 'messages must be a non-empty array' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'GEMINI_API_KEY is not configured' });
    }

    const contents = buildGeminiContents(messages);
    if (contents.length === 0) {
      return res.status(400).json({ message: 'messages must contain text content' });
    }

    const systemPrompt = `You are an AI study assistant for Internix, a smart internship management platform.
The current user is ${req.user.name} (role: ${req.user.role}).
${context ? `Context: ${context}` : ''}
Help students with their internship tasks, learning materials, and career advice.
Be concise, friendly, and practical. Respond in 2-4 sentences unless more detail is needed.`;

    const attempts = buildAttemptPlan();
    let lastError = 'Gemini provider error';

    for (const attempt of attempts) {
      const result = await callGemini({
        apiKey: process.env.GEMINI_API_KEY,
        version: attempt.version,
        model: attempt.model,
        systemPrompt,
        contents,
      });

      if (result.ok) {
        const reply = extractGeminiText(result.data);
        if (reply) {
          return res.json({ reply });
        }
        lastError = 'Gemini returned an empty response';
        continue;
      }

      const providerMessage = parseProviderError(result.data);
      lastError = providerMessage;

      if (!shouldTryAnotherModel(result.status, providerMessage)) {
        return res.status(502).json({ message: providerMessage });
      }
    }

    return res.status(502).json({
      message: `${lastError}. Update GEMINI_MODEL/GEMINI_API_VERSION in backend .env.`,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { aiChat };
