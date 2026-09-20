// Upload direto para GitHub via API REST
// Uso: node upload_github.js SEU_TOKEN_GITHUB NOME_DO_REPO
// Exemplo: node upload_github.js ghp_xxxx novelas-vip

const https = require('https');
const fs = require('fs');
const path = require('path');

const TOKEN = process.argv[2];
const REPO = process.argv[3] || 'novelinhas';
const OWNER = '999lifetrip';

if (!TOKEN) {
  console.error('Uso: node upload_github.js SEU_TOKEN_GITHUB [NOME_DO_REPO]');
  console.error('Crie um token em: https://github.com/settings/tokens (marque "repo")');
  process.exit(1);
}

const BASE_DIR = path.join(__dirname);

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (file === '.git' || file === 'node_modules' || file === 'upload_github.js') return;
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.relative(BASE_DIR, fullPath).replace(/\\/g, '/'));
    }
  });
  return arrayOfFiles;
}

function apiRequest(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.github.com',
      path: urlPath,
      method,
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'novelas-vip-upload',
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    }, res => {
      let out = '';
      res.on('data', c => out += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(out) }); }
        catch { resolve({ status: res.statusCode, body: out }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function uploadFile(relPath) {
  const fullPath = path.join(BASE_DIR, relPath);
  const content = fs.readFileSync(fullPath).toString('base64');
  const getRes = await apiRequest('GET', `/repos/${OWNER}/${REPO}/contents/${relPath}`);
  const sha = getRes.body && getRes.body.sha ? getRes.body.sha : undefined;

  const res = await apiRequest('PUT', `/repos/${OWNER}/${REPO}/contents/${relPath}`, {
    message: `Upload ${relPath}`,
    content,
    ...(sha ? { sha } : {})
  });

  if (res.status === 200 || res.status === 201) {
    console.log(`✅ [${res.status}] ${relPath}`);
  } else {
    console.error(`❌ [${res.status}] ${relPath}:`, res.body && res.body.message);
  }
}

async function main() {
  const files = getAllFiles(BASE_DIR);
  console.log(`Iniciando upload de ${files.length} arquivos para ${OWNER}/${REPO}...`);
  for (const f of files) {
    await uploadFile(f);
  }
  console.log('\n🎉 Upload finalizado com sucesso!');
}

main().catch(console.error);
