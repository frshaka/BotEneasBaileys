// File: BOTENEASBAILEYS/src/config/env.ts
import { config } from 'dotenv';
import { join } from 'path';
import { logger } from '../utils/logger';

// Carrega as variáveis de ambiente do arquivo .env
const result = config({ path: join(process.cwd(), '.env') });

if (result.error) {
    logger.error('Erro ao carregar arquivo .env:', result.error);
    throw new Error('Falha ao carregar variáveis de ambiente');
}

// Valida as variáveis necessárias
const requiredEnvVars = [
    'NODE_ENV',
    'PORT',
    'DATABASE_URL',
    'OPENAI_API_KEY',
    'GOOGLE_DRIVE_ROOT_FOLDER'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    logger.error('Variáveis de ambiente ausentes:', missingEnvVars);
    throw new Error(`Variáveis de ambiente necessárias não encontradas: ${missingEnvVars.join(', ')}`);
}

// Exporta as variáveis tipadas
export const env = {
    NODE_ENV: process.env.NODE_ENV as 'development' | 'production',
    PORT: parseInt(process.env.PORT || '8000', 10),
    DATABASE_URL: process.env.DATABASE_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GOOGLE_DRIVE_ROOT_FOLDER: process.env.GOOGLE_DRIVE_ROOT_FOLDER,
} as const;