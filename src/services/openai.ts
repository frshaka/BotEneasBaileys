// File: BOTENEASBAILEYS/src/services/openai.ts
import OpenAI from 'openai';
import { logger } from '../utils/logger';

class OpenAIService {
    private openai: OpenAI;
    private static instance: OpenAIService;

    private constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        logger.info('Iniciando OpenAI Service');
        logger.info('API Key definida:', !!apiKey);

        if (!apiKey) {
            throw new Error('OPENAI_API_KEY não está definida no arquivo .env');
        }

        this.openai = new OpenAI({
            apiKey: apiKey
        });
    }

    public static getInstance(): OpenAIService {
        if (!OpenAIService.instance) {
            OpenAIService.instance = new OpenAIService();
        }
        return OpenAIService.instance;
    }

    async generateResponse(prompt: string, systemPrompt: string = 'Você é um assistente útil.'): Promise<string> {
        try {
            logger.info('Gerando resposta OpenAI');
            logger.info('Prompt:', prompt);
            logger.info('System Prompt:', systemPrompt);

            const completion = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 500
            });

            logger.info('Resposta recebida da OpenAI');

            const response = completion.choices[0]?.message?.content;
            
            if (!response) {
                throw new Error('Resposta vazia da OpenAI');
            }

            logger.info('Resposta processada com sucesso');
            return response;

        } catch (error: any) {
            logger.error('Erro detalhado ao gerar resposta:', {
                error: error.message,
                stack: error.stack,
                response: error.response?.data
            });
            throw error;
        }
    }

    async generateGameResponse(prompt: string): Promise<string> {
        const gameSystemPrompt = `Você é um assistente especializado no jogo Saint Seiya: Legend of Justice (LOJ).
Responda sempre de maneira informal e descontraída, como um jogador falando com outro jogador.
Use gírias e expressões comuns entre gamers, mas mantenha o respeito e não use palavrões.
Foque em dar respostas práticas e diretas, baseadas na mecânica atual do jogo.`;

        return this.generateResponse(prompt, gameSystemPrompt);
    }
}

export const openaiService = OpenAIService.getInstance();