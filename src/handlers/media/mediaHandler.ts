// File: BOTENEASBAILEYS/src/handlers/media/mediaHandler.ts
import { WASocket, downloadMediaMessage, proto } from '@whiskeysockets/baileys';
import { logger } from '../../utils/logger';
import { driveService } from '../../services/drive';
import prisma from '../../config/database';

export async function setupMediaHandler(sock: WASocket) {
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type === 'notify') {
            for (const message of messages) {
                try {
                    // Verifica se é uma imagem e não é uma mensagem enviada pelo bot
                    const isImage = message.message?.imageMessage;
                    const isFromMe = message.key.fromMe;
                    const chat = message.key.remoteJid;

                    if (isImage && !isFromMe && chat) {
                        await handleImageMessage(sock, message, chat);
                    }
                } catch (error) {
                    logger.error('Erro ao processar mídia:', error);
                }
            }
        }
    });
}

async function handleImageMessage(sock: WASocket, message: proto.IWebMessageInfo, chat: string) {
    try {
        // Verifica se é chat privado
        if (chat.endsWith('@g.us')) {
            return; // Ignora mensagens de grupo
        }

        // Envia mensagem inicial
        await sock.sendMessage(chat, { text: '📸 Processando sua imagem...' });

        // Busca o jogador pelo número
        const phone = chat.replace('@s.whatsapp.net', '');
        const player = await findPlayerByPhone(phone);

        if (!player) {
            await sock.sendMessage(chat, {
                text: '❌ Você precisa ser um jogador registrado para enviar imagens.'
            });
            return;
        }

        // Download da imagem
        logger.info('Baixando imagem...');
        const mediaData = await downloadMediaMessage(message, 'base64', {});

        if (!mediaData) {
            throw new Error('Falha ao baixar imagem');
        }

        // Cria nome do arquivo
        const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
        const fileName = `${player.nick}_${timestamp}.jpg`;

        // Encontra ou cria pasta do jogador
        const folderName = `${player.nick}_${player.id}`;
        logger.info(`Criando/buscando pasta para ${player.nick}`);
        const folderId = await driveService.findOrCreateFolder(folderName);

        // Upload da imagem
        logger.info('Iniciando upload da imagem...');
        await driveService.uploadFile(mediaData as string, fileName, folderId);

        // Confirma o salvamento
        await sock.sendMessage(chat, {
            text: '✅ Imagem salva com sucesso no Google Drive!'
        });

    } catch (error) {
        logger.error('Erro ao processar imagem:', error);
        await sock.sendMessage(chat, {
            text: '❌ Desculpe, ocorreu um erro ao salvar sua imagem. Tente novamente mais tarde.'
        });
    }
}

async function findPlayerByPhone(phone: string): Promise<any> {
    try {
        // Pega os últimos 8 dígitos do telefone para comparação
        const lastEightDigits = phone.slice(-8);
        
        const player = await prisma.player.findFirst({
            where: {
                phone: {
                    endsWith: lastEightDigits
                },
                isActive: true // Apenas jogadores ativos
            }
        });

        return player;
    } catch (error) {
        logger.error('Erro ao buscar jogador:', error);
        return null;
    }
}