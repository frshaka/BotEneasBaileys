// File: BOTENEASBAILEYS/src/tests/checkFolder.ts
import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

async function checkFolder() {
    try {
        console.log('\n=== Verificação de Pasta do Google Drive ===\n');
        
        // 1. Carregar credenciais
        const credentialsPath = path.join(process.cwd(), 'config', 'credentials.json');
        const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
        
        console.log('Credenciais carregadas:', {
            project_id: credentials.project_id,
            client_email: credentials.client_email
        });

        // 2. Configurar autenticação
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/drive.metadata.readonly']
        });

        // 3. Criar cliente
        const drive = google.drive({ version: 'v3', auth });
        
        // 4. Buscar pasta
        const folderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER;
        console.log('\nBuscando pasta:', folderId);

        const file = await drive.files.get({
            fileId: folderId,
            fields: 'id, name, mimeType, capabilities, owners, permissions'
        });

        console.log('\nInformações da pasta:');
        console.log(JSON.stringify(file.data, null, 2));

    } catch (error: any) {
        console.error('\nERRO:');
        console.error('Mensagem:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

checkFolder();