import { WASocket, proto } from '@whiskeysockets/baileys';
import { logger } from '../utils/logger';
import { handlePlayerCommands } from './players/playerCommands';
import { handleGroupCommands } from './groups/groupCommands';
import { handleGPTCommands } from './gpt/gptCommands';

export function setupMessageHandler(sock: WASocket) {
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if(type === 'notify') {
            for (const message of messages) {
                if(!message.key.fromMe) {
                    const textMessage = message.message?.conversation || 
                                      message.message?.extendedTextMessage?.text || '';
                    
                    logger.info(`Nova mensagem recebida: ${textMessage}`);
                    
                    // Comandos básicos
                    if (textMessage.toLowerCase() === '!ping') {
                        await sock.sendMessage(message.key.remoteJid!, {
                            text: 'pong'
                        });
                    }
                    // Comando de ajuda
                    else if (textMessage.toLowerCase() === '!ajuda') {
                        const helpMessage = `🤖 *BOT ENEAS - Comandos Disponíveis*

*Comandos Gerais:*
!ping - Testa se o bot está online
!ajuda - Mostra esta mensagem de ajuda
!guild - Mostra informações da guild

*Comandos de IA:*
!gpt <pergunta> - Faz uma pergunta para a IA
!loj <pergunta> - Faz uma pergunta sobre o Saint Seiya LOJ

*Comandos de Grupo:*
!todos - Marca todos os membros do grupo
!aviso <mensagem> - Envia uma menção silenciosa seguida da mensagem

*Comandos de Players:*
!addplayer <ID> <Nick> <Nome> <Telefone> - Adiciona um novo jogador
!inativaid <ID> - Inativa um jogador pelo ID
!inativatel <Telefone> - Inativa um jogador pelo telefone
!ativaid <ID> - Ativa um jogador pelo ID
!ativatel <Telefone> - Ativa um jogador pelo telefone`;

                        await sock.sendMessage(message.key.remoteJid!, {
                            text: helpMessage
                        });
                    }
                    // Comandos de players
                    else if (textMessage.startsWith('!addplayer') || 
                             textMessage.startsWith('!inativaid') ||
                             textMessage.startsWith('!inativatel') ||
                             textMessage.startsWith('!ativaid') ||
                             textMessage.startsWith('!ativatel')) {
                        await handlePlayerCommands(sock, message, textMessage);
                    }
                    // Comandos de grupo
                    else if (textMessage.startsWith('!todos') ||
                             textMessage.startsWith('!aviso') ||
                             textMessage.startsWith('!guild')) {
                        await handleGroupCommands(sock, message, textMessage);
                    }
                    // Comandos GPT
                    else if (textMessage.startsWith('!gpt') ||
                             textMessage.startsWith('!loj')) {
                        await handleGPTCommands(sock, message, textMessage);
                    }
                }
            }
        }
    });
}