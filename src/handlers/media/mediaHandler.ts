// File: BOTENEASBAILEYS/src/handlers/media/mediaHandler.ts
import { WASocket, downloadMediaMessage, proto } from '@whiskeysockets/baileys';
import { logger } from '../../utils/logger';
import { driveService } from '../../services/drive';
import prisma from '../../config/database';
import fs from 'fs';
import path from 'path';

export async function setupMediaHandler(sock: WASocket) {
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type === 'notify') {
            for (const message of messages) {
                try {
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
    const tempDir = path.join(process.cwd(), 'temp');
    let tempFilePath: string | null = null;

    try {
        // Verifica se é chat privado
        if (chat.endsWith('@g.us')) {
            return;
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

        // Cria diretório temporário se não existir
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Download da imagem
        logger.info('Baixando imagem...');
        const mediaBuffer = await downloadMediaMessage(message, 'buffer', {});
        
        if (!mediaBuffer) {
            throw new Error('Falha ao baixar imagem - Buffer vazio');
        }

        // Salva temporariamente
        const timestamp = new Date().toISOString().replace(/[:.]/g, '');
        const fileName = `${player.nick}_${timestamp}.jpg`;
        tempFilePath = path.join(tempDir, fileName);
        
        fs.writeFileSync(tempFilePath, mediaBuffer as Buffer);
        logger.info(`Arquivo temporário criado: ${tempFilePath}`);

        // Encontra ou cria pasta do jogador
        const folderName = `${player.nick}_${player.id}`;
        logger.info(`Criando/buscando pasta para ${player.nick}`);
        const folderId = await driveService.findOrCreateFolder(folderName);

        // Upload da imagem
        logger.info('Iniciando upload da imagem...');
        const base64Data = (mediaBuffer as Buffer).toString('base64');
        await driveService.uploadFile(base64Data, fileName, folderId);

        // Confirma o salvamento
        await sock.sendMessage(chat, {
            text: '✅ Imagem salva com sucesso!'
        });

    } catch (error) {
        logger.error('Erro detalhado ao processar imagem:', error);
        let errorMessage = '❌ Erro ao salvar imagem. ';
        
        if (error instanceof Error) {
            errorMessage += error.message;
            logger.error('Stack:', error.stack);
        }

        await sock.sendMessage(chat, {
            text: errorMessage
        });
    } finally {
        // Limpa arquivos temporários
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            try {
                fs.unlinkSync(tempFilePath);
                logger.info('Arquivo temporário removido');
            } catch (error) {
                logger.error('Erro ao remover arquivo temporário:', error);
            }
        }
    }
}

async function findPlayerByPhone(phone: string): Promise<any> {
    try {
        const lastEightDigits = phone.slice(-8);
        logger.info(`Buscando jogador pelo telefone: *****${lastEightDigits}`);
        
        const player = await prisma.player.findFirst({
            where: {
                phone: {
                    endsWith: lastEightDigits
                },
                isActive: true
            }
        });

        if (player) {
            logger.info(`Jogador encontrado: ${player.nick}`);
        } else {
            logger.info('Jogador não encontrado');
        }

        return player;
    } catch (error) {
        logger.error('Erro ao buscar jogador:', error);
        return null;
    }
}