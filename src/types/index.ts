export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: number;
  isGroup: boolean;
}

export interface BotConfig {
  name: string;
  version: string;
  debugMode: boolean;
}