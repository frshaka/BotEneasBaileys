// File: BOTENEASBAILEYS/src/handlers/groups/groupCommands.ts
import { WASocket, proto } from '@whiskeysockets/baileys';
import { logger } from '../../utils/logger';

/**
 * Handler principal para comandos de grupo
 */
export async function handleGroupCommands(
    sock: WASocket,
    message: proto.IWebMessageInfo,
    textMessage: string
) {
    const command = textMessage.split(' ')[0].toLowerCase();
    const args = textMessage.split(' ').slice(1).join(' ');

    logger.info(`Processando comando de grupo: ${command}`);
    
    // Verifica se a mensagem é de um grupo
    if (!message.key.remoteJid?.endsWith('@g.us')) {
        logger.info('Comando ignorado: não é um grupo');
        return;
    }

    switch(command) {
        case '!todos':
            await handleMentionAll(sock, message);
            break;
        case '!aviso':
            logger.info('Iniciando processamento do comando !aviso');
            await handleGhostMention(sock, message, args);
            break;
        case '!guild':
            await handleGuildInfo(sock, message);
            break;
    }
}

/**
 * Função para mencionar todos os membros do grupo
 */
async function handleMentionAll(sock: WASocket, message: proto.IWebMessageInfo) {
    try {
        const groupMetadata = await sock.groupMetadata(message.key.remoteJid!);
        let mentions = groupMetadata.participants.map(participant => participant.id);
        let mentionText = '';

        for (let participant of groupMetadata.participants) {
            mentionText += `@${participant.id.split('@')[0]} `;
        }

        await sock.sendMessage(message.key.remoteJid!, {
            text: mentionText.trim(),
            mentions: mentions
        });

        // Tenta deletar a mensagem original
        try {
            await sock.sendMessage(message.key.remoteJid!, { 
                delete: message.key 
            });
        } catch (deleteError) {
            logger.error('Erro ao deletar mensagem original:', deleteError);
        }

    } catch (error) {
        logger.error('Erro ao marcar todos:', error);
        await sock.sendMessage(message.key.remoteJid!, {
            text: 'Ocorreu um erro ao marcar todos os membros.'
        });
    }
}

/**
 * Função melhorada para enviar menção silenciosa
 */
async function handleGhostMention(sock: WASocket, message: proto.IWebMessageInfo, text: string) {
    try {
        logger.info('Iniciando comando !aviso');
        
        if (!text) {
            logger.info('Texto vazio, enviando mensagem de erro');
            await sock.sendMessage(message.key.remoteJid!, {
                text: 'É necessário incluir uma mensagem após o comando !aviso'
            });
            return;
        }

        logger.info('Obtendo metadados do grupo');
        const groupMetadata = await sock.groupMetadata(message.key.remoteJid!);
        logger.info(`Grupo encontrado: ${groupMetadata.subject}`);
        
        const mentions = groupMetadata.participants.map(p => p.id);
        logger.info(`Total de participantes: ${mentions.length}`);

        // Envia a mensagem com menções e texto junto
        logger.info('Enviando mensagem com menções');
        await sock.sendMessage(message.key.remoteJid!, {
            text: `‎${text}`, // Caractere invisível seguido do texto
            mentions: mentions
        });

        // Tenta deletar a mensagem original
        logger.info('Tentando deletar mensagem original');
        try {
            await sock.sendMessage(message.key.remoteJid!, { 
                delete: message.key 
            });
            logger.info('Mensagem original deletada com sucesso');
        } catch (deleteError) {
            logger.error('Erro ao deletar mensagem original:', deleteError);
        }

        logger.info('Comando !aviso executado com sucesso');

    } catch (error) {
        logger.error('Erro detalhado ao enviar aviso:', error);
        logger.error('Stack trace:', error.stack);
        
        try {
            await sock.sendMessage(message.key.remoteJid!, {
                text: 'Ocorreu um erro ao enviar o aviso. Por favor, tente novamente.'
            });
        } catch (msgError) {
            logger.error('Erro ao enviar mensagem de erro:', msgError);
        }
    }
}


/**
 * Função para enviar informações da guild
 */
async function handleGuildInfo(sock: WASocket, message: proto.IWebMessageInfo) {
    const guildInfo = `*Informações da Guild*

ID: 37901102

Tag: 气

Web: https://eneasredpill.com/

Comunidade: https://chat.whatsapp.com/HcuJY3SX6pR6zSHLwQIDKn

PDF:  https://rb.gy/i3fgtl

Contatos: https://docs.google.com/spreadsheets/d/1tfMC0wnL6h8YPiEFJQjnJdzNRtdWOYWAGZBbgjqyODk/edit?usp=sharing

Drive: https://drive.google.com/drive/folders/1gpAhAvgykgUQa6PWMaoOhCMevte0BxeD?usp=sharing

Drive dos prints da sua conta: https://drive.google.com/drive/folders/1iivltFz3vx4pymO5bvqs-qntlSdIRUaJ?usp=drive_link

*Finalidade dos grupos:*
• Deepweb: Nenhuma
• GvG: Organização da temporada de GvG
• GvG Arayashiki: Organização da temporada de GvG da guild Arayashiki
• Alpha/Bravo: Organização da temporada de Relics

*Contatos de suporte da EneasRedpill:*
• Email: admin@eneasredpill.com
• Tel: +552198138-9149

*Contatos de suporte da Wanda no SSLOJ:*
• Email: seiyaloj@gmail.com
• Instagram: https://instagram.com/saintseiyaloj.global`;

    try {
        await sock.sendMessage(message.key.remoteJid!, {
            text: guildInfo
        });

        // Tenta deletar a mensagem original
        try {
            await sock.sendMessage(message.key.remoteJid!, { 
                delete: message.key 
            });
        } catch (deleteError) {
            logger.error('Erro ao deletar mensagem original:', deleteError);
        }
    } catch (error) {
        logger.error('Erro ao enviar informações da guild:', error);
        await sock.sendMessage(message.key.remoteJid!, {
            text: 'Ocorreu um erro ao enviar as informações da guild.'
        });
    }
}