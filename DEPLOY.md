# Novelinhas VIP — Deploy no Coolify (Hostinger)

Este guia ensina como subir o site das Novelinhas no subdomínio **`novelas.omelhorvendedoronline.com.br`** no seu Coolify, mantendo o CRM e outros serviços 100% intocados e independentes.

---

## Passo 1: Apontar o DNS na Hostinger

1. Acesse o painel da **Hostinger** (hPanel).
2. Vá em **Domínios** ➔ selecione `omelhorvendedoronline.com.br`.
3. No menu lateral, clique em **DNS / Gerenciamento de DNS**.
4. Adicione um novo registro **Tipo A**:
   - **Tipo**: `A`
   - **Nome**: `novelas`
   - **Aponta para (IP)**: *(Digite o mesmo endereço IP da sua VPS Coolify onde já está o CRM)*
   - **TTL**: `300` (ou padrão)
5. Clique em **Adicionar Registro**.

---

## Passo 2: Criar a Aplicação no Coolify

1. Acesse o painel do seu **Coolify**.
2. Vá no seu **Projeto** (ou crie um novo chamado `Novelinhas VIP`).
3. Clique em **+ New Resource** ➔ **Application**.
4. Escolha a origem:
   - **Opção recomendada**: **Public/Private GitHub Repository** (conectando ao repositório das novelinhas).
   - O Coolify vai detectar o `Dockerfile` automaticamente na raiz.
5. Em **Configuration**:
   - **Domains**: `https://novelas.omelhorvendedoronline.com.br`
   - **Ports Exposes**: `80`
6. Clique em **Deploy**!

O Coolify vai:
- Construir a imagem Docker ultra-leve em Nginx.
- Configurar o roteamento no Traefik/Caddy.
- Gerar o certificado SSL HTTPS (Let's Encrypt) automaticamente.
- Colocar o site no ar em segundos!

---

## Estrutura dos Arquivos da Aplicação

```
novelas-coolify/
├── Dockerfile          ← Configurado em Nginx Alpine ultra-rápido
├── nginx.conf          ← Compressão Gzip e cache de imagens ativo
├── .dockerignore       ← Ignora arquivos desnecessários
├── DEPLOY.md           ← Este guia de deploy
├── index.html          ← Estrutura do portal com checkout limpo
├── style.css           ← Estilos modernos com responsividade total
├── app.js              ← Lógica de reprodução e desbloqueio VIP seguro
├── catalog.js          ← Catálogo completo (+200 produções)
├── chat-agent.js       ← Atendimento humanizado da Dona Sirlene
├── dona_sirlene.jpg    ← Foto oficial da Dona Sirlene
└── covers/             ← 40 capas originais das produções
```
