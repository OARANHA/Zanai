export interface ZAIConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export const ZAI_DEFAULT_CONFIG: Partial<ZAIConfig> = {
  baseUrl: 'https://api.z.ai/v1',
  model: 'gpt-4',
  maxTokens: 2000,
  temperature: 0.7,
};

export function getZAIConfig(): ZAIConfig {
  const apiKey = process.env.ZAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('ZAI_API_KEY environment variable is required');
  }

  return {
    apiKey,
    ...ZAI_DEFAULT_CONFIG,
  };
}

export function validateZAIConfig(config: ZAIConfig): boolean {
  return !!config.apiKey;
}