// File: BOTENEASBAILEYS/src/tests/driveTest.ts
import { env } from '../utils/environment';
import { driveService } from '../services/drive';
import { logger } from '../utils/logger';
import path from 'path';
import fs from 'fs';
import { google } from 'googleapis';

async function testDriveConnection() {
    try {
        console.log('\n=== Iniciando Teste do Google Drive ===\n');
        
        // 1. Verificar arquivo de credenciais
        const credentialsPath = path.join(process.cwd(), 'config', 'credentials.json');
        console.log('1. Verificando credenciais em:', credentialsPath);
        
        if (!fs.existsSync(credentialsPath)) {
            throw new Error(`Arquivo de credenciais não encontrado em ${credentialsPath}`);
        }

        // 2. Carregar e validar credenciais
        console.log('\n2. Carregando credenciais...');
        const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
        console.log('Campos encontrados:', Object.keys(credentials));

        // 3. Verificar campos obrigatórios
        console.log('\n3. Verificando campos obrigatórios...');
        const requiredFields = ['client_email', 'private_key', 'project_id'];
        for (const field of requiredFields) {
            if (!credentials[field]) {
                throw new Error(`Campo obrigatório ausente: ${field}`);
            }
            console.log(`- ${field}: ${field === 'private_key' ? '[PRESENTE]' : credentials[field]}`);
        }

        // 4. Verificar ID da pasta
        console.log('\n4. Verificando ID da pasta...');
        const folderId = env.get('GOOGLE_DRIVE_ROOT_FOLDER');
        console.log('Folder ID:', folderId);

        // 5. Tentar autenticação
        console.log('\n5. Testando autenticação...');
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/drive.file']
        });

        // 6. Criar cliente do Drive
        console.log('\n6. Criando cliente do Drive...');
        const drive = google.drive({ 
            version: 'v3', 
            auth 
        });

        // 7. Tentar acessar a pasta
        console.log('\n7. Tentando acessar a pasta...');
        try {
            const response = await drive.files.get({
                fileId: folderId,
                fields: '*'  // Solicitar todos os campos para debug
            });
            
            console.log('\nInformações da pasta:');
            console.log(JSON.stringify(response.data, null, 2));
            
        } catch (error: any) {
            console.error('\nErro ao acessar pasta:');
            console.error('- Mensagem:', error.message);
            if (error.response) {
                console.error('- Status:', error.response.status);
                console.error('- Data:', JSON.stringify(error.response.data, null, 2));
            }
            if (error.code) {
                console.error('- Código:', error.code);
            }
            throw error;
        }

        console.log('\n=== Teste concluído com sucesso! ===\n');
    } catch (error) {
        console.error('\n❌ ERRO NO TESTE:');
        if (error instanceof Error) {
            console.error('Mensagem:', error.message);
            console.error('Stack:', error.stack);
        } else {
            console.error('Erro desconhecido:', error);
        }
        process.exit(1);
    }
}

// Executar teste
testDriveConnection();