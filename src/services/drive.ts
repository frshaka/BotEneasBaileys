import { google } from 'googleapis';
import { logger } from '../utils/logger';
import path from 'path';
import fs from 'fs';
import { drive_v3 } from 'googleapis/build/src/apis/drive/v3';
import dotenv from 'dotenv';

// Força o carregamento das variáveis de ambiente
dotenv.config();

class GoogleDriveService {
    private static instance: GoogleDriveService;
    private drive: drive_v3.Drive;
    private rootFolderId: string;

    private constructor() {
        try {
            logger.info('Iniciando serviço do Google Drive');

            // Força o carregamento das variáveis de ambiente
            const envPath = path.join(process.cwd(), '.env');
            dotenv.config({ path: envPath });
            
            // Carrega Root Folder ID
            const rootId = process.env.GOOGLE_DRIVE_ROOT_FOLDER;
            logger.info(`GOOGLE_DRIVE_ROOT_FOLDER no ENV: "${rootId}"`);

            if (!rootId) {
                throw new Error('GOOGLE_DRIVE_ROOT_FOLDER não encontrado no .env');
            }

            this.rootFolderId = rootId;

            // Carrega credenciais
            const credentialsPath = path.join(process.cwd(), 'config', 'credentials.json');
            logger.info(`Carregando credenciais de: ${credentialsPath}`);
            
            if (!fs.existsSync(credentialsPath)) {
                throw new Error(`Arquivo de credenciais não encontrado em: ${credentialsPath}`);
            }

            const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
            logger.info('Credenciais carregadas com sucesso');

            const auth = new google.auth.GoogleAuth({
                credentials,
                scopes: ['https://www.googleapis.com/auth/drive.file']
            });

            this.drive = google.drive({ 
                version: 'v3', 
                auth
            });

            logger.info('Serviço do Google Drive iniciado com sucesso');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            logger.error('Erro ao iniciar serviço do Google Drive:', errorMessage);
            throw error;
        }
    }

    public static getInstance(): GoogleDriveService {
        if (!GoogleDriveService.instance) {
            GoogleDriveService.instance = new GoogleDriveService();
        }
        return GoogleDriveService.instance;
    }

    async findOrCreateFolder(folderName: string, parentFolderId?: string): Promise<string> {
        try {
            logger.info(`Procurando pasta: ${folderName}`);

            // Se não foi fornecido parentFolderId, usa o rootFolderId
            const actualParentId = parentFolderId || this.rootFolderId;
            logger.info(`Pasta pai: ${actualParentId}`);

            // Primeiro tenta encontrar a pasta
            const searchResponse = await this.drive.files.list({
                q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and '${actualParentId}' in parents and trashed=false`,
                fields: 'files(id, name)',
                spaces: 'drive'
            });

            // Se encontrou a pasta, retorna o ID
            if (searchResponse.data.files && searchResponse.data.files.length > 0) {
                const foundFolder = searchResponse.data.files[0];
                if (foundFolder.id) {
                    logger.info(`Pasta existente encontrada: ${foundFolder.id}`);
                    return foundFolder.id;
                }
            }

            // Se não encontrou, cria uma nova pasta
            logger.info('Criando nova pasta...');
            const folderMetadata = {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [actualParentId]
            };

            const createResponse = await this.drive.files.create({
                requestBody: folderMetadata,
                fields: 'id'
            });

            const newFolderId = createResponse.data.id;
            if (!newFolderId) {
                throw new Error('Falha ao criar pasta: ID não retornado');
            }

            logger.info(`Nova pasta criada: ${newFolderId}`);
            return newFolderId;
        } catch (error) {
            logger.error('Erro ao criar pasta:', error);
            throw new Error(`Falha ao criar pasta: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }

    async uploadFile(base64Data: string, fileName: string, folderId: string): Promise<string> {
        try {
            logger.info(`Iniciando upload do arquivo: ${fileName}`);

            // Cria o diretório temp se não existir
            const tempDir = path.join(process.cwd(), 'temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            // Cria arquivo temporário
            const tempFilePath = path.join(tempDir, fileName);
            fs.writeFileSync(tempFilePath, Buffer.from(base64Data, 'base64'));

            // Configuração do upload
            const fileMetadata = {
                name: fileName,
                parents: [folderId]
            };

            const media = {
                mimeType: 'image/jpeg',
                body: fs.createReadStream(tempFilePath)
            };

            // Faz o upload
            const response = await this.drive.files.create({
                requestBody: fileMetadata,
                media: media,
                fields: 'id'
            });

            // Remove o arquivo temporário
            fs.unlinkSync(tempFilePath);

            const fileId = response.data.id;
            if (!fileId) {
                throw new Error('Falha ao fazer upload: ID não retornado');
            }

            logger.info(`Upload concluído. ID do arquivo: ${fileId}`);
            return fileId;
        } catch (error) {
            logger.error('Erro ao fazer upload:', error);
            throw new Error(`Falha ao fazer upload: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
}

export const driveService = GoogleDriveService.getInstance();