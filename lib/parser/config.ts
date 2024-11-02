export const PARSER_CONFIG = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  MAX_BATCH_SIZE: 3,
  SUPPORTED_MODELS: [
    "gpt-4-vision-preview",
    "claude-3-opus-20240229",
    "claude-3-sonnet-20240229"
  ] as const
}

if (!PARSER_CONFIG.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required")
}
