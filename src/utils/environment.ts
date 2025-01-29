// File: BOTENEASBAILEYS/src/utils/environment.ts
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { logger } from './logger';

export class Environment {
    private static instance: Environment;
    private env: { [key: string]: string } = {};

    private constructor() {
        const envPath = path.join(process.cwd(), '.env');
        
        if (!fs.existsSync(envPath)) {
            throw new Error(`Arquivo .env não encontrado em: ${envPath}`);
        }

        logger.info(`Carregando variáveis de ambiente de: ${envPath}`);
        
        // Lê o arquivo .env manualmente
        const envContent = fs.readFileSync(envPath, 'utf8');
        
        // Parse manual do arquivo .env
        envContent.split('\n').forEach(line => {
            line = line.trim();
            if (line && !line.startsWith('#')) {
                const [key, ...valueParts] = line.split('=');
                const value = valueParts.join('=').trim();
                if (key && value) {
                    this.env[key.trim()] = value.replace(/^["'](.*)["']$/, '$1'); // Remove aspas se existirem
                }
            }
        });

        // Também carrega usando dotenv para compatibilidade
        dotenv.config();

        logger.info('Variáveis de ambiente carregadas:', Object.keys(this.env));
    }

    public static getInstance(): Environment {
        if (!Environment.instance) {
            Environment.instance = new Environment();
        }
        return Environment.instance;
    }

    public get(key: string): string {
        // Tenta primeiro do nosso objeto env
        const value = this.env[key];
        if (value) return value;

        // Se não encontrou, tenta do process.env
        const processValue = process.env[key];
        if (processValue) return processValue;

        logger.error(`Variável de ambiente não encontrada: ${key}`);
        throw new Error(`Variável de ambiente não encontrada: ${key}`);
    }

    public getOrDefault(key: string, defaultValue: string): string {
        try {
            return this.get(key);
        } catch {
            return defaultValue;
        }
    }

    public isDefined(key: string): boolean {
        return key in this.env || key in process.env;
    }
}

export const env = Environment.getInstance();