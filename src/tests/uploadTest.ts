// File: BOTENEASBAILEYS/src/tests/uploadTest.ts
import { driveService } from '../services/drive';
import { logger } from '../utils/logger';
import path from 'path';
import fs from 'fs';

async function testUpload() {
    try {
        console.log('\n=== Teste de Upload para o Google Drive ===\n');

        // 1. Criar uma imagem de teste
        console.log('1. Criando imagem de teste...');
        const testImagePath = path.join(process.cwd(), 'temp_test.jpg');
        const testImage = Buffer.from('R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=', 'base64');
        fs.writeFileSync(testImagePath, testImage);
        console.log('✓ Imagem de teste criada');

        // 2. Converter para base64
        console.log('\n2. Convertendo imagem para base64...');
        const imageBase64 = fs.readFileSync(testImagePath, { encoding: 'base64' });
        console.log('✓ Imagem convertida');

        // 3. Criar uma pasta de teste
        console.log('\n3. Criando pasta de teste...');
        const testFolderName = `teste_upload_${Date.now()}`;
        const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER;
        
        if (!rootFolderId) {
            throw new Error('GOOGLE_DRIVE_ROOT_FOLDER não configurado');
        }

        const folderId = await driveService.findOrCreateFolder(testFolderName, rootFolderId);
        console.log(`✓ Pasta criada com ID: ${folderId}`);

        // 4. Fazer upload da imagem
        console.log('\n4. Fazendo upload da imagem...');
        const fileName = `teste_${Date.now()}.jpg`;
        const fileId = await driveService.uploadFile(imageBase64, fileName, folderId);
        console.log(`✓ Arquivo enviado com ID: ${fileId}`);

        // 5. Limpar arquivos temporários
        console.log('\n5. Limpando arquivos temporários...');
        fs.unlinkSync(testImagePath);
        console.log('✓ Arquivos temporários removidos');

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

// Executa o teste
testUpload();