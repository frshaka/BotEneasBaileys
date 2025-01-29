// File: BOTENEASBAILEYS/src/utils/gvg.ts
import prisma from '../config/database';
import { logger } from './logger';

export interface GvGPlayer {
    id: number;
    nick: string;
    name: string;
    fixed: boolean;
    rotation: boolean;
    isGvg: boolean;
}

export async function getGvGPlayers(): Promise<GvGPlayer[]> {
    try {
        const players = await prisma.player.findMany({
            where: {
                isActive: true,
                gvg: {
                    some: {
                        isGvg: true
                    }
                }
            },
            include: {
                gvg: true
            }
        });

        return players.map(player => ({
            id: player.id,
            nick: player.nick,
            name: player.name,
            fixed: player.gvg[0]?.fixed || false,
            rotation: player.gvg[0]?.rotation || false,
            isGvg: player.gvg[0]?.isGvg || false
        }));
    } catch (error) {
        logger.error('Erro ao buscar jogadores de GvG:', error);
        throw error;
    }
}

export async function getCurrentRotation(): Promise<GvGPlayer[]> {
    try {
        const allPlayers = await getGvGPlayers();
        
        // Primeiro pega jogadores fixos
        const fixedPlayers = allPlayers.filter(p => p.fixed);
        
        // Depois pega jogadores em rotação
        const rotationPlayers = allPlayers.filter(p => p.rotation);

        // Número de slots disponíveis para rotação
        const availableSlots = 15 - fixedPlayers.length;
        
        // Seleciona jogadores da rotação de forma aleatória
        const selectedRotation = rotationPlayers
            .sort(() => Math.random() - 0.5)
            .slice(0, availableSlots);

        return [...fixedPlayers, ...selectedRotation];
    } catch (error) {
        logger.error('Erro ao gerar rotação:', error);
        throw error;
    }
}

export function formatGvGMessage(players: GvGPlayer[]): string {
    const fixedPlayers = players.filter(p => p.fixed);
    const rotationPlayers = players.filter(p => p.rotation);

    let message = '*Times de GvG*\n\n';
    
    message += '*Time Fixo:*\n';
    fixedPlayers.forEach((p, i) => {
        message += `${i + 1}. ${p.nick}\n`;
    });

    message += '\n*Time Rotação:*\n';
    rotationPlayers.forEach((p, i) => {
        message += `${i + 1}. ${p.nick}\n`;
    });

    return message;
}

export const GVG_SCHEDULES = {
    GROUP_C: {
        START: '13:00',
        WARNING: '15:00',
        END: '15:30'
    },
    GROUP_B: {
        START: '15:30',
        WARNING: '17:30',
        END: '18:00'
    },
    GROUP_A: {
        START: '18:00',
        WARNING: '19:30',
        END: '20:00'
    }
} as const;