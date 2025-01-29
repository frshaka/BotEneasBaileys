// File: BOTENEASBAILEYS/src/index.ts
import { config } from 'dotenv';
import { logger } from './utils/logger';
import { whatsapp } from './config/whatsapp';
import { setupMessageHandler } from './handlers/messages';
import { setupMediaHandler } from './handlers/media/mediaHandler';
import { setupGvGCommands } from './handlers/gvg/gvgCommands';

// Carrega as variáveis de ambiente
config();

// ID do grupo de GvG
const GVG_GROUP_ID = '120363198603699526@g.us'; // Substitua pelo ID do seu grupo

async function startBot() {
    try {
        logger.info('Iniciando BotEneas...');
        
        // Inicia conexão com WhatsApp
        const sock = await whatsapp.connect();

        // Configura os handlers
        setupMessageHandler(sock);
        setupMediaHandler(sock);
        
        // Configura comandos de GvG
        setupGvGCommands(sock, GVG_GROUP_ID);
        
        // Mantém o processo rodando
        process.stdin.resume();

        logger.info('BotEneas iniciado com sucesso!');
    } catch (error) {
        logger.error('Erro ao iniciar o BotEneas:', error);
        process.exit(1);
    }
}

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
    logger.error('Erro não tratado:', error);
});

process.on('unhandledRejection', (error) => {
    logger.error('Promessa rejeitada não tratada:', error);
});

// Inicia o bot
startBot().catch((error) => {
    logger.error('Erro fatal:', error);
    process.exit(1);
});