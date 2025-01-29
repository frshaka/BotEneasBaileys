import { proto } from '@adiwajshing/baileys';

export interface WhatsAppMessage {
  key: proto.IMessageKey;
  message: proto.IMessage | null | undefined;
  messageTimestamp?: number | Long | null;
  pushName?: string | null;
  broadcast?: boolean | null;
  status?: proto.WebMessageInfo.Status | null;
}

export interface MessageHandler {
  pattern?: RegExp | string;
  command?: string;
  fromMe?: boolean;
  onlyGroup?: boolean;
  onlyPrivate?: boolean;
  callback: (message: WhatsAppMessage) => Promise<void>;
}

export interface ConnectionState {
  connection: 'close' | 'connecting' | 'open';
  lastDisconnect?: {
    error?: Error;
    date?: Date;
  };
  receivedPendingNotifications?: boolean;
  qr?: string;
}

// Types para helpers de mensagens
export interface SendMessageOptions {
  quoted?: proto.IWebMessageInfo;
  mentions?: string[];
  caption?: string;
  fileName?: string;
  mimetype?: string;
}