import OpenAI from 'openai';

export default function createOpenAIClient({ apiKey, basePath }) {
    return new OpenAI({ apiKey, basePath });
}
