import { WASocket, proto } from '@whiskeysockets/baileys';
import { logger } from '../../utils/logger';
import prisma from '../../config/database';
import { isGroupAdmin } from '../../utils/helpers';
import { setupGvGAlerts, sendCustomAlert } from './alerts';
import { GVG_SCHEDULES } from '../../utils/gvg';

export async function setupGvGCommands(sock: WASocket, gvgGroupId: string) {
    // Configura os alertas automáticos
    setupGvGAlerts(sock, gvgGroupId);

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type === 'notify') {
            for (const message of messages) {
                if (!message.key.fromMe) {
                    const chat = message.key.remoteJid;
                    const textMessage = message.message?.conversation || 
                                      message.message?.extendedTextMessage?.text || '';

                    // Só processa comandos em grupos
                    if (!chat?.endsWith('@g.us')) continue;

                    const command = textMessage.split(' ')[0].toLowerCase();
                    const args = textMessage.split(' ').slice(1);

                    try {
                        switch(command) {
                            case '!alertagvg':
                                await handleCustomAlert(sock, message, chat, args);
                                break;

                            case '!horarios':
                                await handleSchedules(sock, message, chat);
                                break;
                        }
                    } catch (error) {
                        logger.error('Erro ao processar comando GvG:', error);
                        await sock.sendMessage(chat, {
                            text: '❌ Erro ao processar comando. Por favor, tente novamente.'
                        });
                    }
                }
            }
        }
    });
}

async function handleCustomAlert(sock: WASocket, message: proto.IWebMessageInfo, chat: string, args: string[]) {
    try {
        // Verifica se é admin
        const groupMetadata = await sock.groupMetadata(chat);
        if (!isGroupAdmin(message.key.participant || '', groupMetadata)) {
            await sock.sendMessage(chat, {
                text: '❌ Apenas administradores podem enviar alertas.'
            });
            return;
        }

        if (args.length === 0) {
            await sock.sendMessage(chat, {
                text: 'ℹ️ Uso: !alertagvg <mensagem>'
            });
            return;
        }

        const alertMessage = args.join(' ');

        // Primeiro envia o alerta
        await sendCustomAlert(sock, chat, alertMessage);

        // Depois deleta a mensagem original
        await sock.sendMessage(chat, { 
            delete: message.key 
        });

    } catch (error) {
        logger.error('Erro ao enviar alerta customizado:', error);
        throw error;
    }
}

async function handleSchedules(sock: WASocket, message: proto.IWebMessageInfo, chat: string) {
    try {
        const scheduleMessage = `📅 *Horários de GvG*

*Grupo C*
Início: ${GVG_SCHEDULES.GROUP_C.START}
Aviso: ${GVG_SCHEDULES.GROUP_C.WARNING}
Fim: ${GVG_SCHEDULES.GROUP_C.END}

*Grupo B*
Início: ${GVG_SCHEDULES.GROUP_B.START}
Aviso: ${GVG_SCHEDULES.GROUP_B.WARNING}
Fim: ${GVG_SCHEDULES.GROUP_B.END}

*Grupo A*
Início: ${GVG_SCHEDULES.GROUP_A.START}
Aviso: ${GVG_SCHEDULES.GROUP_A.WARNING}
Fim: ${GVG_SCHEDULES.GROUP_A.END}`;

        await sock.sendMessage(chat, {
            text: scheduleMessage
        });

        // Deleta a mensagem original
        await sock.sendMessage(chat, { 
            delete: message.key 
        });

    } catch (error) {
        logger.error('Erro ao mostrar horários:', error);
        throw error;
    }
}