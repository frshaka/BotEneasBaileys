// File: BOTENEASBAILEYS/src/tests/envTest.ts
import { config } from 'dotenv';
import { logger } from '../utils/logger';
import path from 'path';

function testEnvVars() {
    // Carrega explicitamente o arquivo .env
    const envPath = path.join(process.cwd(), '.env');
    logger.info('Procurando arquivo .env em:', envPath);
    
    const result = config({ path: envPath });
    
    if (result.error) {
        logger.error('Erro ao carregar .env:', result.error);
        return;
    }

    logger.info('Arquivo .env carregado');
    
    // Lista todas as variáveis de ambiente necessárias
    const vars = {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        DATABASE_URL: process.env.DATABASE_URL,
        GOOGLE_DRIVE_ROOT_FOLDER: process.env.GOOGLE_DRIVE_ROOT_FOLDER
    };

    logger.info('Variáveis de ambiente encontradas:');
    Object.entries(vars).forEach(([key, value]) => {
        logger.info(`${key}: ${value ? 'definida' : 'não definida'}`);
        if (value) {
            // Mostra apenas os primeiros/últimos caracteres de valores sensíveis
            if (key === 'DATABASE_URL') {
                logger.info(`${key}: ${value.substring(0, 10)}...`);
            } else if (key !== 'GOOGLE_DRIVE_ROOT_FOLDER') {
                logger.info(`${key}: ${value}`);
            } else {
                logger.info(`${key}: "${value}"`);  // Mostra o valor exato do GOOGLE_DRIVE_ROOT_FOLDER
            }
        }
    });
}

testEnvVars();