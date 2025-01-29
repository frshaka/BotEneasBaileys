// File: BOTENEASBAILEYS/src/config/whatsapp.ts
import { 
    default as makeWASocket,
    DisconnectReason,
    useMultiFileAuthState,
    WASocket,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { logger } from '../utils/logger';
import qrcode from 'qrcode-terminal';
import { setupMessageHandler } from '../handlers/messages';

class WhatsAppConnection {
    private sock: WASocket | null = null;
    private isConnected: boolean = false;
    
    async connect(): Promise<WASocket> {
        const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
        const { version } = await fetchLatestBaileysVersion();
        
        const sock = makeWASocket({
            version,
            printQRInTerminal: false,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            logger: logger.child({ level: 'silent' }),
            generateHighQualityLinkPreview: true,
        });

        // Configurar handler de mensagens
        setupMessageHandler(sock);

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                console.clear();
                qrcode.generate(qr, { small: true });
                logger.info('QR Code gerado! Escaneie com seu WhatsApp.');
            }

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
                
                if (shouldReconnect && !this.isConnected) {
                    this.isConnected = false;
                    logger.info('Reconectando ao WhatsApp...');
                    await this.connect();
                }
            } else if (connection === 'open') {
                this.isConnected = true;
                console.clear();
                logger.info('Conexão estabelecida com sucesso!');
                logger.info('Bot pronto para receber comandos!');
            }
        });

        sock.ev.on('creds.update', saveCreds);

        this.sock = sock;
        return sock;
    }

    getSocket(): WASocket | null {
        return this.sock;
    }

    isSocketConnected(): boolean {
        return this.isConnected;
    }
}

export const whatsapp = new WhatsAppConnection();