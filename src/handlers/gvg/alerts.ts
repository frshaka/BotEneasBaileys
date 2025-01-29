// File: BOTENEASBAILEYS/src/handlers/gvg/alerts.ts
import { WASocket } from '@whiskeysockets/baileys';
import { scheduleJob } from 'node-schedule';
import { logger } from '../../utils/logger';
import { GVG_SCHEDULES, getCurrentRotation, formatGvGMessage } from '../../utils/gvg';

async function sendGvGAlert(sock: WASocket, groupId: string, message: string) {
    try {
        const group = await sock.groupMetadata(groupId);
        const mentions = group.participants.map(p => p.id);

        await sock.sendMessage(groupId, {
            text: `‎${message}`,  // Caractere invisível seguido da mensagem
            mentions
        });

        logger.info('Alerta de GvG enviado com sucesso');
    } catch (error) {
        logger.error('Erro ao enviar alerta de GvG:', error);
        throw error;
    }
}

export function setupGvGAlerts(sock: WASocket, gvgGroupId: string) {
    logger.info('Configurando alertas de GvG');

    // Grupo C
    scheduleJob('0 0 13 * * 1-6', async () => {
        const players = await getCurrentRotation();
        const message = `🗡️ *GvG INICIADA - GRUPO C* 🗡️\n\n${formatGvGMessage(players)}\n\nBoa sorte a todos!`;
        await sendGvGAlert(sock, gvgGroupId, message);
    });

    scheduleJob('0 0 15 * * 1-6', async () => {
        const message = '⚠️ *ATENÇÃO GRUPO C* ⚠️\n\nFaltam 30 minutos para finalizar os ataques!\nQuem ainda não atacou, por favor ataque agora!';
        await sendGvGAlert(sock, gvgGroupId, message);
    });

    // Grupo B
    scheduleJob('0 30 15 * * 1-6', async () => {
        const message = '🗡️ *ATENÇÃO GRUPO B* 🗡️\n\nAtaque Liberado!';
        await sendGvGAlert(sock, gvgGroupId, message);
    });

    scheduleJob('0 30 17 * * 1-6', async () => {
        const message = '⚠️ *ATENÇÃO GRUPO B* ⚠️\n\nFaltam 30 minutos para finalizar os ataques!\nQuem ainda não atacou, por favor ataque agora!';
        await sendGvGAlert(sock, gvgGroupId, message);
    });

    // Grupo A
    scheduleJob('0 0 18 * * 1-6', async () => {
        const message = '🗡️ *ATENÇÃO GRUPO A* 🗡️\n\nAtaque Liberado!';
        await sendGvGAlert(sock, gvgGroupId, message);
    });

    scheduleJob('0 30 19 * * 1-6', async () => {
        const message = '⚠️ *ATENÇÃO GRUPO A* ⚠️\n\nFaltam 30 minutos para finalizar os ataques!\nQuem ainda não atacou, por favor ataque agora!';
        await sendGvGAlert(sock, gvgGroupId, message);
    });

    logger.info('Alertas de GvG configurados com sucesso');
}

export async function sendCustomAlert(sock: WASocket, groupId: string, message: string) {
    try {
        const group = await sock.groupMetadata(groupId);
        const mentions = group.participants.map(p => p.id);

        await sock.sendMessage(groupId, {
            text: `‎${message}`,  // Caractere invisível seguido da mensagem
            mentions
        });

        logger.info('Alerta customizado enviado com sucesso');
    } catch (error) {
        logger.error('Erro ao enviar alerta customizado:', error);
        throw error;
    }
}