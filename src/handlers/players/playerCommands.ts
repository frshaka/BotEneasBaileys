// File: BOTENEASBAILEYS/src/handlers/players/playerCommands.ts
import { WASocket, proto } from '@whiskeysockets/baileys';
import { logger } from '../../utils/logger';
import prisma from '../../config/database';

export async function handlePlayerCommands(
    sock: WASocket,
    message: proto.IWebMessageInfo,
    textMessage: string
) {
    const command = textMessage.split(' ')[0].toLowerCase();
    const args = textMessage.split(' ').slice(1);

    switch(command) {
        case '!addplayer':
            await handleAddPlayer(sock, message, args);
            break;
        case '!inativaid':
            await handleDeactivateById(sock, message, args);
            break;
        case '!inativatel':
            await handleDeactivateByPhone(sock, message, args);
            break;
        case '!ativaid':
            await handleActivateById(sock, message, args);
            break;
        case '!ativatel':
            await handleActivateByPhone(sock, message, args);
            break;
    }
}

async function handleAddPlayer(
    sock: WASocket,
    message: proto.IWebMessageInfo,
    args: string[]
) {
    if (args.length < 4) {
        await sock.sendMessage(message.key.remoteJid!, {
            text: 'Erro: Comando inválido. Use !addplayer <ID> <Nick> <Nome> <Telefone>'
        });
        return;
    }

    const [id, nick, name, phone] = args;

    try {
        const player = await prisma.player.create({
            data: {
                id: parseInt(id),
                nick,
                name,
                phone
            }
        });

        await sock.sendMessage(message.key.remoteJid!, {
            text: `Jogador ${player.name} (${player.nick}) adicionado com sucesso!`
        });
    } catch (error) {
        logger.error('Erro ao adicionar jogador:', error);
        await sock.sendMessage(message.key.remoteJid!, {
            text: 'Erro ao adicionar jogador. Verifique se o telefone já está cadastrado ou se os dados estão corretos.'
        });
    }
}

async function handleDeactivateById(
    sock: WASocket,
    message: proto.IWebMessageInfo,
    args: string[]
) {
    if (args.length < 1) {
        await sock.sendMessage(message.key.remoteJid!, {
            text: 'Erro: Comando inválido. Use !inativaid <ID>'
        });
        return;
    }

    const [id] = args;

    try {
        const player = await prisma.player.update({
            where: { id: parseInt(id) },
            data: { isActive: false }
        });

        await sock.sendMessage(message.key.remoteJid!, {
            text: `Jogador ${player.name} (${player.nick}) foi inativado com sucesso!`
        });
    } catch (error) {
        logger.error('Erro ao inativar jogador:', error);
        await sock.sendMessage(message.key.remoteJid!, {
            text: 'Erro ao inativar jogador. Verifique se o ID está correto.'
        });
    }
}

async function handleDeactivateByPhone(
    sock: WASocket,
    message: proto.IWebMessageInfo,
    args: string[]
) {
    if (args.length < 1) {
        await sock.sendMessage(message.key.remoteJid!, {
            text: 'Erro: Comando inválido. Use !inativatel <Telefone>'
        });
        return;
    }

    const [phone] = args;

    try {
        const player = await prisma.player.update({
            where: { phone },
            data: { isActive: false }
        });

        await sock.sendMessage(message.key.remoteJid!, {
            text: `Jogador ${player.name} (${player.nick}) foi inativado com sucesso!`
        });
    } catch (error) {
        logger.error('Erro ao inativar jogador:', error);
        await sock.sendMessage(message.key.remoteJid!, {
            text: 'Erro ao inativar jogador. Verifique se o telefone está correto.'
        });
    }
}

async function handleActivateById(
    sock: WASocket,
    message: proto.IWebMessageInfo,
    args: string[]
) {
    if (args.length < 1) {
        await sock.sendMessage(message.key.remoteJid!, {
            text: 'Erro: Comando inválido. Use !ativaid <ID>'
        });
        return;
    }

    const [id] = args;

    try {
        const player = await prisma.player.update({
            where: { id: parseInt(id) },
            data: { isActive: true }
        });

        await sock.sendMessage(message.key.remoteJid!, {
            text: `Jogador ${player.name} (${player.nick}) foi ativado com sucesso!`
        });
    } catch (error) {
        logger.error('Erro ao ativar jogador:', error);
        await sock.sendMessage(message.key.remoteJid!, {
            text: 'Erro ao ativar jogador. Verifique se o ID está correto.'
        });
    }
}

async function handleActivateByPhone(
    sock: WASocket,
    message: proto.IWebMessageInfo,
    args: string[]
) {
    if (args.length < 1) {
        await sock.sendMessage(message.key.remoteJid!, {
            text: 'Erro: Comando inválido. Use !ativatel <Telefone>'
        });
        return;
    }

    const [phone] = args;

    try {
        const player = await prisma.player.update({
            where: { phone },
            data: { isActive: true }
        });

        await sock.sendMessage(message.key.remoteJid!, {
            text: `Jogador ${player.name} (${player.nick}) foi ativado com sucesso!`
        });
    } catch (error) {
        logger.error('Erro ao ativar jogador:', error);
        await sock.sendMessage(message.key.remoteJid!, {
            text: 'Erro ao ativar jogador. Verifique se o telefone está correto.'
        });
    }
}