import { z } from 'zod';

const envSchema = z.object({
    POSTGRES_HOST: z.string(),
    POSTGRES_PORT: z.string().default('5432'),
    POSTGRES_USER: z.string(),
    POSTGRES_PASSWORD: z.string().optional(),
    POSTGRES_DATABASE: z.string(),
    POSTGRES_SSL: z.enum(['true', 'false']).default('false'),
    POSTGRES_VERIFY: z.enum(['true', 'false']).default('false'),
    POSTGRES_SEND_RECEIVE_TIMEOUT: z.string().default('60'),
    POSTGRES_CONNECT_TIMEOUT: z.string().default('60'),
    LLM_API_KEY: z.string().optional(),
    LLM_API_URL: z.string().url().default('https://api.openai.com/v1'),
    LLM_MODEL: z.string().default('gpt-4o')
});

const env = envSchema.parse(process.env);

export default {
    db: {
        host: env.POSTGRES_HOST,
        port: Number(env.POSTGRES_PORT),
        user: env.POSTGRES_USER,
        password: env.POSTGRES_PASSWORD,
        database: env.POSTGRES_DATABASE,
        ssl: env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: env.POSTGRES_VERIFY === 'true' } : false,
        statementTimeout: Number(env.POSTGRES_SEND_RECEIVE_TIMEOUT) * 1000,
        connectionTimeoutMillis: Number(env.POSTGRES_CONNECT_TIMEOUT) * 1000
    },
    openai: {
        apiKey: env.LLM_API_KEY,
        basePath: env.LLM_API_URL,
        model: env.LLM_MODEL
    },
    app: {
        name: 'postgres-mcp',
        version: '1.0.0'
    }
};
