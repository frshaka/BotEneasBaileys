// File: BOTENEASBAILEYS/src/handlers/gpt/gptCommands.ts
import { WASocket, proto } from '@whiskeysockets/baileys';
import { logger } from '../../utils/logger';
import { openaiService } from '../../services/openai';

export async function handleGPTCommands(
    sock: WASocket,
    message: proto.IWebMessageInfo,
    textMessage: string
) {
    const command = textMessage.split(' ')[0].toLowerCase();
    const prompt = textMessage.split(' ').slice(1).join(' ');

    logger.info('Processando comando GPT:', {
        command,
        prompt,
        chatId: message.key.remoteJid
    });

    try {
        switch(command) {
            case '!gpt':
                await handleGeneralGPT(sock, message, prompt);
                break;
            case '!loj':
                await handleGameGPT(sock, message, prompt);
                break;
        }
    } catch (error) {
        logger.error('Erro ao processar comando GPT:', error);
        
        // Mensagem de erro mais detalhada para debugging
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        
        await sock.sendMessage(message.key.remoteJid!, {
            text: `Erro ao processar sua solicitação: ${errorMessage}`
        });
    }
}

async function handleGeneralGPT(
    sock: WASocket,
    message: proto.IWebMessageInfo,
    prompt: string
) {
    logger.info('Iniciando handleGeneralGPT');

    if (!prompt) {
        await sock.sendMessage(message.key.remoteJid!, {
            text: 'Por favor, forneça uma pergunta ou instrução após o comando !gpt'
        });
        return;
    }

    // Mensagem de processamento
    await sock.sendMessage(message.key.remoteJid!, {
        text: '⌛ Processando sua solicitação...'
    });

    try {
        logger.info('Solicitando resposta da OpenAI');
        const response = await openaiService.generateResponse(prompt);
        
        logger.info('Enviando resposta ao usuário');
        await sock.sendMessage(message.key.remoteJid!, {
            text: response
        });
    } catch (error) {
        logger.error('Erro detalhado em handleGeneralGPT:', error);
        throw error;
    }
}

async function handleGameGPT(
    sock: WASocket,
    message: proto.IWebMessageInfo,
    prompt: string
) {
    logger.info('Iniciando handleGameGPT');

    if (!prompt) {
        await sock.sendMessage(message.key.remoteJid!, {
            text: 'Por favor, forneça uma pergunta ou instrução após o comando !loj'
        });
        return;
    }

    // Mensagem de processamento
    await sock.sendMessage(message.key.remoteJid!, {
        text: '⌛ Processando sua solicitação sobre LOJ...'
    });

    try {
        logger.info('Solicitando resposta da OpenAI para LOJ');
        const response = await openaiService.generateGameResponse(prompt);
        
        logger.info('Enviando resposta ao usuário');
        await sock.sendMessage(message.key.remoteJid!, {
            text: response
        });
    } catch (error) {
        logger.error('Erro detalhado em handleGameGPT:', error);
        throw error;
    }
}