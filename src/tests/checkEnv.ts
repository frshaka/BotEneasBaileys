// File: BOTENEASBAILEYS/src/tests/checkEnv.ts
import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';

function checkEnv() {
    console.log('\n=== Verificação de Variáveis de Ambiente ===\n');

    // 1. Localizar arquivo .env
    const envPath = path.join(process.cwd(), '.env');
    console.log('1. Procurando arquivo .env em:', envPath);
    
    if (!fs.existsSync(envPath)) {
        console.error('❌ Arquivo .env não encontrado!');
        return;
    }
    console.log('✓ Arquivo .env encontrado');

    // 2. Ler conteúdo do arquivo
    console.log('\n2. Conteúdo do arquivo .env:');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    
    envLines.forEach(line => {
        if (line.trim() && !line.startsWith('#')) {
            const [key] = line.split('=');
            // Não mostra o valor, apenas a chave
            console.log(`- ${key.trim()}: [DEFINIDO]`);
        }
    });

    // 3. Carregar variáveis
    console.log('\n3. Carregando variáveis com dotenv...');
    const result = config();
    
    if (result.error) {
        console.error('❌ Erro ao carregar variáveis:', result.error);
        return;
    }
    console.log('✓ Variáveis carregadas');

    // 4. Verificar variáveis específicas
    console.log('\n4. Verificando variáveis necessárias:');
    const requiredVars = [
        'NODE_ENV',
        'PORT',
        'DATABASE_URL',
        'OPENAI_API_KEY',
        'GOOGLE_DRIVE_ROOT_FOLDER'
    ];

    requiredVars.forEach(varName => {
        const value = process.env[varName];
        if (!value) {
            console.log(`❌ ${varName}: NÃO ENCONTRADA`);
        } else {
            // Para variáveis sensíveis, não mostra o valor completo
            if (varName.includes('KEY') || varName.includes('URL')) {
                console.log(`✓ ${varName}: [VALOR SENSÍVEL]`);
            } else {
                console.log(`✓ ${varName}: ${value}`);
            }
        }
    });

    // 5. Mostrar caminho do processo
    console.log('\n5. Informações do processo:');
    console.log('- Diretório atual:', process.cwd());
    console.log('- NODE_ENV:', process.env.NODE_ENV);

    console.log('\n=== Verificação concluída ===\n');
}

// Executar verificação
checkEnv();