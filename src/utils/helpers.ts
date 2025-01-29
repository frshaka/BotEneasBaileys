// File: BOTENEASBAILEYS/src/utils/helpers.ts
import { GroupMetadata } from '@whiskeysockets/baileys';

export function isGroupAdmin(participantId: string, groupMetadata: GroupMetadata): boolean {
    const participant = groupMetadata.participants.find(p => p.id === participantId);
    return participant?.admin === 'admin' || participant?.admin === 'superadmin';
}

// Função para delay
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Função para limpar número de telefone
export function cleanPhoneNumber(phone: string): string {
    return phone.replace(/\D/g, '');
}

// Função para formatar data
export function formatDate(date: Date): string {
    return date.toLocaleString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}