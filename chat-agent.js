// ═══════════════════════════════════════════════════════════════════════════
// CHAT-AGENT.JS — Dona Sirlene: Agente de Vendas com Liberação de Acesso
// Atendimento Humanizado, Apresentação de Planos, Pix Interativo e Desbloqueio VIP
// ═══════════════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // Configurações Padrão da Dona Sirlene
  const AGENT_CONFIG = {
    name: 'Dona Sirlene',
    role: 'Atendente Oficial • Online agora',
    avatar: 'dona_sirlene.jpg?v=2',
    pixKey: '975.956.249-91',
    pixType: 'CPF',
    pixName: 'Roseli (Assistente)',
    pixBank: 'Mercado Pago',
    whatsappUrl: 'https://wa.me/554195993007?text=Oi%20Dona%20Sirlene,%20vim%20pelo%20chat%20do%20site%20das%20Novelinhas!'
  };

  let chatHistory = [];
  let isChatOpen = false;
  let isWaitingResponse = false;
  let inviteShown = false;

  // ─── CRIAÇÃO DO HTML DO WIDGET DE CHAT ──────────────────────────────────────
  function initChatWidget() {
    // Evita duplicatas
    if (document.getElementById('donaSirleneChatRoot')) return;

    const root = document.createElement('div');
    root.id = 'donaSirleneChatRoot';
    root.className = 'ds-chat-root';

    root.innerHTML = `
      <!-- Backdrop transparente/escuro para fechar ao tocar fora -->
      <div id="dsChatBackdrop" class="ds-chat-backdrop" onclick="closeDonaSirleneChat()"></div>

      <!-- Balão de Convite Proativo -->
      <div id="dsChatInviteBubble" class="ds-chat-invite-bubble" onclick="openDonaSirleneChat()">
        <button class="ds-invite-close" onclick="event.stopPropagation(); dismissInviteBubble()">✕</button>
        <div class="ds-invite-avatar-box">
          <img src="${AGENT_CONFIG.avatar}" alt="Dona Sirlene" class="ds-invite-avatar" />
          <span class="ds-online-pulse"></span>
        </div>
        <div class="ds-invite-text-box">
          <span class="ds-invite-author">Dona Sirlene:</span>
          <p class="ds-invite-msg">🚨 <strong>Promoção VIP por R$ 19,90!</strong> Assista a todas as novelas e doramas sem anúncios e sem mensalidade! Clica aqui que te libero o acesso agora! 🥰👑</p>
        </div>
      </div>

      <!-- Botão Flutuante Redondo / Pílula -->
      <button id="dsFloatingTrigger" class="ds-floating-trigger" onclick="toggleDonaSirleneChat()" aria-label="Abrir Chat com Dona Sirlene">
        <div class="ds-trigger-avatar-wrap">
          <img src="${AGENT_CONFIG.avatar}" alt="Dona Sirlene" class="ds-trigger-avatar" />
          <span class="ds-trigger-badge-dot"></span>
        </div>
        <span class="ds-trigger-text">
          <span class="ds-trigger-name">Dona Sirlene</span>
          <span class="ds-trigger-sub">Atendente VIP • Online</span>
        </span>
        <span class="ds-unread-badge" id="dsUnreadBadge">1</span>
      </button>

      <!-- Janela do Chat (Drawer / Modal) -->
      <div id="dsChatWindow" class="ds-chat-window" aria-hidden="true">
        <!-- Header da Janela -->
        <div class="ds-chat-header">
          <div class="ds-header-user">
            <div class="ds-header-avatar-wrap">
              <img src="${AGENT_CONFIG.avatar}" alt="Dona Sirlene" class="ds-header-avatar" />
              <span class="ds-header-online-dot"></span>
            </div>
            <div class="ds-header-info">
              <h4 class="ds-header-title">${AGENT_CONFIG.name}</h4>
              <p class="ds-header-status">
                <span class="ds-pulse-dot"></span>
                <span>Atendente VIP • Responde na hora</span>
              </p>
            </div>
          </div>
          <div class="ds-header-actions">
            <button class="ds-header-btn" onclick="openWhatsAppFallback()" title="Atendimento no WhatsApp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/>
              </svg>
            </button>
            <button class="ds-header-btn" onclick="closeDonaSirleneChat()" title="Fechar chat">
              ✕
            </button>
          </div>
        </div>

        <!-- Banner de Segurança & Confiança -->
        <div class="ds-chat-security-bar">
          <span>🔒 Atendimento Oficial Novelinhas VIP</span>
          <span class="ds-sec-badge">100% SEGURO</span>
        </div>

        <!-- Área de Mensagens -->
        <div class="ds-chat-messages" id="dsChatMessages">
          <!-- Mensagens renderizadas dinamicamente -->
        </div>

        <!-- Digitando Indicator -->
        <div class="ds-typing-indicator" id="dsTypingIndicator" style="display: none;">
          <div class="ds-typing-dot"></div>
          <div class="ds-typing-dot"></div>
          <div class="ds-typing-dot"></div>
          <span>Dona Sirlene está digitando...</span>
        </div>

        <!-- Pílulas de Resposta Rápida (Quick Replies) -->
        <div class="ds-quick-chips" id="dsQuickChips">
          <button class="ds-chip vip-confirm" onclick="sendQuickReply('Quero o Plano VIP Vitalício (R$ 19,90)! Pode me mandar a chave Pix?')">⭐ Quero o VIP de R$ 19,90 (Chave Pix)</button>
          <button class="ds-chip" onclick="sendQuickReply('Já fiz o Pix! Pode liberar meu Acesso VIP agora?')">✅ Já fiz o Pix! Liberar VIP</button>
          <button class="ds-chip" onclick="openWhatsAppFallback('Oi Dona Sirlene! Vim pelo chat do site!')">📲 Falar no WhatsApp</button>
        </div>

        <!-- Input Footer -->
        <div class="ds-chat-footer">
          <form id="dsChatForm" class="ds-chat-form" onsubmit="handleChatSubmit(event)">
            <input
              type="text"
              id="dsChatInput"
              class="ds-chat-input"
              placeholder="Digite sua mensagem para a Dona Sirlene..."
              autocomplete="off"
            />
            <button type="submit" id="dsChatSendBtn" class="ds-send-btn" aria-label="Enviar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      </div>

      <!-- Canvas de Confetes para Celebração de Liberação VIP -->
      <canvas id="dsConfettiCanvas" class="ds-confetti-canvas"></canvas>
    `;

    document.body.appendChild(root);

    // Carrega histórico ou inicia mensagem de boas-vindas
    loadSavedHistory();

    // Timer para exibir balão proativo após 3.8 segundos se o usuário não abriu
    setTimeout(() => {
      if (!isChatOpen && !inviteShown && !sessionStorage.getItem('ds_invite_dismissed')) {
        showInviteBubble();
      }
    }, 3800);
  }

  // ─── CARREGAMENTO & PERSISTÊNCIA DO HISTÓRICO ────────────────────────────────
  function loadSavedHistory() {
    try {
      const saved = sessionStorage.getItem('ds_chat_history_v2');
      if (saved) {
        chatHistory = JSON.parse(saved);
      }
    } catch (e) {
      chatHistory = [];
    }

    if (chatHistory.length === 0) {
      // Mensagem inicial de fechamento da Dona Sirlene
      addAgentMessage(
        `Oi, meu amor! Que bom que você veio falar comigo! 🥰 Sou a **Dona Sirlene**.\n\nOlha só, eu consegui segurar para você hoje a nossa **Promoção Especial do Acesso VIP Vitalício** de R$ 59,90 por **apenas R$ 19,90 no Pix** (taxa única, sem mensalidade nenhuma!).\n\n👑 **Tudo liberado para você maratonar hoje mesmo:**\n• Mais de **10.000 capítulos** de novelas turcas, mexicanas e doramas dublados em HD\n• Sem anúncios chatos e sem travamentos\n• Liberação imediata e vitalícia no Pix!\n\nQuer que eu já te mande a chave Pix para você liberar seu acesso agora mesmo, querida? É só clicar no botão aqui embaixo! 👇✨`,
        null,
        false
      );
    } else {
      renderAllMessages();
    }
  }

  function saveHistory() {
    try {
      sessionStorage.setItem('ds_chat_history_v2', JSON.stringify(chatHistory.slice(-25)));
    } catch (e) {}
  }

  // ─── GERENCIAMENTO DE ESTADO VISUAL DO CHAT ─────────────────────────────────
  window.toggleDonaSirleneChat = function () {
    if (!document.getElementById('donaSirleneChatRoot')) {
      initChatWidget();
    }
    if (isChatOpen) {
      closeDonaSirleneChat();
    } else {
      openDonaSirleneChat();
    }
  };

  window.openDonaSirleneChat = function (initialMsg) {
    if (!document.getElementById('donaSirleneChatRoot')) {
      initChatWidget();
    }
    const win = document.getElementById('dsChatWindow');
    const trigger = document.getElementById('dsFloatingTrigger');
    const badge = document.getElementById('dsUnreadBadge');
    const backdrop = document.getElementById('dsChatBackdrop');
    if (!win) return;

    isChatOpen = true;
    win.classList.add('active');
    if (trigger) trigger.classList.add('active');
    if (badge) badge.style.display = 'none';
    if (backdrop) backdrop.classList.add('active');

    dismissInviteBubble();

    // Scroll para a última mensagem
    scrollToBottom();

    // Foco no input em desktops
    if (window.innerWidth > 768) {
      const input = document.getElementById('dsChatInput');
      if (input) input.focus();
    }

    if (initialMsg && typeof initialMsg === 'string') {
      sendQuickReply(initialMsg);
    }
  };

  window.closeDonaSirleneChat = function () {
    const win = document.getElementById('dsChatWindow');
    const trigger = document.getElementById('dsFloatingTrigger');
    const backdrop = document.getElementById('dsChatBackdrop');
    if (!win) return;

    isChatOpen = false;
    win.classList.remove('active');
    if (trigger) trigger.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
  };

  function showInviteBubble() {
    if (document.body.classList.contains('player-open') || document.getElementById('playerModal')?.classList.contains('active')) {
      return;
    }
    const bubble = document.getElementById('dsChatInviteBubble');
    if (bubble) {
      inviteShown = true;
      bubble.classList.add('show');
    }
  }

  window.dismissInviteBubble = function () {
    const bubble = document.getElementById('dsChatInviteBubble');
    if (bubble) {
      bubble.classList.remove('show');
      sessionStorage.setItem('ds_invite_dismissed', 'true');
    }
  };

  window.openWhatsAppFallback = function (customMsg) {
    if (customMsg && typeof customMsg === 'string') {
      window.open(`https://wa.me/554195993007?text=${encodeURIComponent(customMsg)}`, '_blank');
    } else {
      window.open(AGENT_CONFIG.whatsappUrl, '_blank');
    }
  };

  // ─── ENVIO E PROCESSAMENTO DE MENSAGENS ──────────────────────────────────────
  window.handleChatSubmit = function (e) {
    if (e) e.preventDefault();
    const input = document.getElementById('dsChatInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text || isWaitingResponse) return;

    input.value = '';
    sendMessage(text);
  };

  window.sendQuickReply = function (text) {
    if (isWaitingResponse) return;
    sendMessage(text);
  };

  async function sendMessage(userText) {
    // Adiciona mensagem do usuário
    addUserMessage(userText);
    showTyping(true);
    isWaitingResponse = true;

    // Detecta intenção direta de liberação de Pix
    const lower = userText.toLowerCase();
    const isDirectPaid = /(já fiz|ja fiz|fiz o pix|tá pago|ta pago|paguei|fiz o pagamento|mandei o pix|comprovante|libera aí|libera ai|liberar meu|libera meu acesso|já realizei|ja realizei)/i.test(lower);

    try {
      const payload = {
        message: userText,
        history: chatHistory.slice(-8),
        currentSeries: window.currentSeries ? window.currentSeries.title : null
      };

      const response = await fetch('/api/novelas/chat-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      showTyping(false);
      if (data && data.reply) {
        addAgentMessage(data.reply, data);

        // Não libera mais automaticamente sem código/comprovante (anti-burla)
        // O desbloqueio só acontece se o usuário fornecer um código VIP válido conferido pela Dona Sirlene
        if (data && data.action === 'unlock_vip' && data.vipCode) {
          if (typeof window.validateAndUnlockWithVipCode === 'function') {
            window.validateAndUnlockWithVipCode(data.vipCode);
          }
        }
      } else {
        fallbackAgentResponse(userText);
      }
    } catch (err) {
      console.warn('[Chat Agente] Falha na requisição:', err);
      showTyping(false);
      isWaitingResponse = false;
      fallbackAgentResponse(userText);
    }
  }

  // ─── RESPOSTAS DA DONA SIRLENE COM CARDS INTERATIVOS ────────────────────────
  function addUserMessage(text) {
    const time = getCurrentTime();
    const msgObj = { sender: 'user', text, time };
    chatHistory.push(msgObj);
    saveHistory();
    renderSingleMessage(msgObj);
    scrollToBottom();
  }

  function addAgentMessage(text, meta, save = true) {
    const time = getCurrentTime();
    const msgObj = { sender: 'agent', text, time, meta };
    if (save) {
      chatHistory.push(msgObj);
      saveHistory();
    }
    renderSingleMessage(msgObj);
    scrollToBottom();
  }

  function renderSingleMessage(msg) {
    const container = document.getElementById('dsChatMessages');
    if (!container) return;

    const div = document.createElement('div');
    div.className = `ds-msg-row ${msg.sender}`;

    const formattedText = formatMarkdown(msg.text);

    if (msg.sender === 'user') {
      div.innerHTML = `
        <div class="ds-bubble user">
          <div class="ds-bubble-content">${formattedText}</div>
          <span class="ds-bubble-time">${msg.time}</span>
        </div>
      `;
    } else {
      let extraCardHtml = '';

      // Card de Pix caso solicitado ou indicado pela IA (sempre o VIP 19,90)
      if (msg.meta && (msg.meta.action === 'show_pix' || msg.meta.action === 'pix')) {
        const amount = msg.meta.pix?.amount || '19,90';
        const planName = 'Plano VIP Vitalício (+10.000 Capítulos Completos)';
        extraCardHtml = renderPixCardHtml(amount, planName);
      }

      // Card de WhatsApp para quem pergunta pelo plano de 10
      if (msg.meta && msg.meta.action === 'whatsapp_only_10') {
        extraCardHtml = `
          <div class="ds-pix-card" style="border-color: rgba(34, 197, 94, 0.4); margin-top: 10px;">
            <div class="ds-pix-badge" style="background: rgba(34, 197, 94, 0.2); color: #22c55e;">📲 ATENDIMENTO EXCLUSIVO WHATSAPP</div>
            <h5 class="ds-pix-plan-name" style="margin-top: 6px;">Plano Básico R$ 10,00</h5>
            <p style="font-size: 0.8rem; color: #94a3b8; margin: 8px 0 12px; line-height: 1.4;">Para tirar dúvidas e contratar o plano básico de R$ 10,00, fale comigo diretamente no WhatsApp:</p>
            <button class="ds-pix-whatsapp-proof-btn" onclick="openWhatsAppFallback('Oi Dona Sirlene! Vim pelo site e quero saber mais sobre o plano de R$ 10')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/>
              </svg>
              <span>📲 FALAR COM DONA SIRLENE NO WHATSAPP</span>
            </button>
          </div>
        `;
      }

      // Card de VIP Ativado com Sucesso
      if (msg.meta && msg.meta.action === 'unlock_vip') {
        extraCardHtml = renderVipUnlockedCardHtml();
      }

      div.innerHTML = `
        <img src="${AGENT_CONFIG.avatar}" alt="Dona Sirlene" class="ds-msg-avatar" />
        <div class="ds-bubble agent">
          <span class="ds-agent-label">Dona Sirlene</span>
          <div class="ds-bubble-content">${formattedText}</div>
          ${extraCardHtml}
          <span class="ds-bubble-time">${msg.time}</span>
        </div>
      `;
    }

    container.appendChild(div);
  }

  function renderAllMessages() {
    const container = document.getElementById('dsChatMessages');
    if (!container) return;
    container.innerHTML = '';
    chatHistory.forEach(msg => renderSingleMessage(msg));
    scrollToBottom();
  }

  // ─── CARDS ESPECIAIS INTERATIVOS NO CHAT ────────────────────────────────────
  function renderPixCardHtml(amount, planTitle) {
    return `
      <div class="ds-pix-card">
        <div class="ds-pix-badge">⚡ PAGAMENTO DIRETO VIA PIX</div>
        <h5 class="ds-pix-plan-name">${planTitle}</h5>
        <div class="ds-pix-price-row">
          <span class="ds-pix-price-label">Valor único:</span>
          <span class="ds-pix-price-val">R$ ${amount}</span>
        </div>

        <div class="ds-pix-copy-section">
          <div class="ds-pix-cpf-badge">🔑 TIPO DE CHAVE: CPF</div>
          <label class="ds-pix-label">Chave Pix (CPF):</label>
          <div class="ds-pix-input-box">
            <input type="text" class="ds-pix-input" id="dsPixKeyField" value="${AGENT_CONFIG.pixKey}" readonly />
            <button class="ds-pix-copy-btn" onclick="copyDsPixKey()">📋 Copiar Chave</button>
          </div>
          <span class="ds-pix-holder">👤 Titular: <strong>${AGENT_CONFIG.pixName}</strong> • ${AGENT_CONFIG.pixBank}</span>
        </div>

        <!-- Anti-Fraude: Envio Obrigatório de Comprovante -->
        <div class="ds-proof-banner">
          <span>🛡️ Envie seu comprovante no WhatsApp para receber seu Código VIP</span>
        </div>

        <button class="ds-pix-whatsapp-proof-btn" onclick="sendProofViaWhatsApp()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/>
          </svg>
          <span>📲 ENVIAR COMPROVANTE NO WHATSAPP</span>
        </button>

        <div class="ds-chat-vip-code-card">
          <label class="ds-chat-vip-code-label">Já recebeu o Código VIP da Dona Sirlene?</label>
          <div class="ds-chat-vip-code-row">
            <input type="text" id="dsChatVipCodeInput" class="ds-chat-vip-code-input" placeholder="DIGITE O CÓDIGO VIP" maxlength="20" onkeyup="if(event.key==='Enter') window.submitVipCodeFromChat()" />
            <button class="ds-chat-vip-code-btn" onclick="window.submitVipCodeFromChat()">🔓 LIBERAR</button>
          </div>
          <div id="dsChatVipCodeMsg" class="ds-chat-vip-code-msg"></div>
        </div>

        <p class="ds-pix-guarantee">🛡️ Liberação segura mediante comprovante oficial</p>
      </div>
    `;
  }

  function renderVipUnlockedCardHtml() {
    return `
      <div class="ds-unlocked-card">
        <div class="ds-unlocked-icon">🎉👑✨</div>
        <h4 class="ds-unlocked-title">ACESSO VIP 100% LIBERADO!</h4>
        <p class="ds-unlocked-sub">Todos os mais de 10.000 capítulos, novelas turcas, doramas e minisséries foram desbloqueados para você!</p>
        <div class="ds-unlocked-features">
          <span>✅ Sem anúncios</span>
          <span>✅ Sem cortes</span>
          <span>✅ Suporte Smart TV</span>
          <span>✅ Acesso Vitalício</span>
        </div>
        <button class="ds-unlocked-btn" onclick="startWatchingNow()">
          🎬 COMEÇAR A ASSISTIR AGORA
        </button>
      </div>
    `;
  }

  window.copyDsPixKey = function () {
    const key = AGENT_CONFIG.pixKey;
    const input = document.getElementById('dsPixKeyField');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(key).then(() => {
        showAgentToast('📋 Chave Pix copiada com sucesso!');
      }).catch(() => {
        fallbackCopy(input, key);
      });
    } else {
      fallbackCopy(input, key);
    }
  };

  function fallbackCopy(input, text) {
    try {
      if (input) {
        input.focus();
        input.select();
        input.setSelectionRange(0, 99999);
      }
      const successful = document.execCommand('copy');
      if (successful) {
        showAgentToast('📋 Chave Pix copiada com sucesso!');
        return;
      }
    } catch (e) {}
    showAgentToast('Chave Pix: ' + text);
  }

  // ─── LIBERAÇÃO SEGURA DE ACESSO VIP COM VALIDAÇÃO (ANTI-BURLA) ─────────────
  window.submitVipCodeFromChat = function () {
    const input = document.getElementById('dsChatVipCodeInput');
    const msgEl = document.getElementById('dsChatVipCodeMsg');
    const code = (input ? input.value : '').trim().toUpperCase();

    const AUTHORIZED_VIP_CODES = [
      'VIP2026',
      'NOVELASVIP',
      'SIRLENE2026',
      'VIP1990',
      'TURCASVIP',
      'DORAMASVIP',
      'ACESSOVIP',
      'DONASIRLENE'
    ];

    if (!code) {
      if (msgEl) {
        msgEl.textContent = '⚠️ Digite o Código VIP fornecido pela Dona Sirlene.';
        msgEl.className = 'ds-chat-vip-code-msg error';
      }
      return;
    }

    if (AUTHORIZED_VIP_CODES.includes(code)) {
      if (msgEl) {
        msgEl.textContent = '✅ Código confirmado com sucesso! Liberando acesso...';
        msgEl.className = 'ds-chat-vip-code-msg success';
      }
      setTimeout(() => {
        triggerVipUnlockDirectly();
        addAgentMessage(
          `Parabéns, meu amor! 🎉 Seu Código VIP **${code}** foi confirmado com sucesso!\n\nSeu **Acesso VIP Vitalício** está 100% liberado! Você já pode curtir todas as novelas sem anúncios! Aproveite muito! 🥰✨`,
          { action: 'unlock_vip' }
        );
      }, 700);
    } else {
      if (msgEl) {
        msgEl.innerHTML = '❌ Código incorreto. Envie o comprovante no WhatsApp da Dona Sirlene para receber seu código oficial.';
        msgEl.className = 'ds-chat-vip-code-msg error';
      }
    }
  };

  function triggerVipUnlockDirectly() {
    try {
      localStorage.setItem('novelinhas_vip', 'true');
      localStorage.setItem('storygrid_vip', 'true');

      // Atualiza funções existentes no app.js
      if (typeof window.checkVipStatus === 'function') window.checkVipStatus();
      if (typeof window.hidePaywall === 'function') window.hidePaywall();
      if (typeof window.closePixModal === 'function') window.closePixModal();
      if (typeof window.renderEpisodesRichList === 'function') window.renderEpisodesRichList();

      // Atualiza visual do botão do header
      const vipText = document.getElementById('vipStatusText');
      if (vipText) vipText.textContent = 'VIP ATIVO';
      const headerVipBtn = document.getElementById('headerVipBtn');
      if (headerVipBtn) {
        headerVipBtn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
        headerVipBtn.style.boxShadow = '0 0 15px rgba(34, 197, 94, 0.4)';
      }

      // Se o player do YouTube estiver travado pelo paywall, despausa
      if (window.ytPlayer && window.ytPlayer.playVideo) {
        window.ytPlayer.playVideo();
      }

      // Solta confetes festivos
      launchConfettiFireworks();

      showAgentToast('🎉 ACESSO VITALÍCIO LIBERADO COM SUCESSO!');
    } catch (e) {
      console.warn('Erro ao liberar VIP:', e);
    }
  }

  window.startWatchingNow = function () {
    closeDonaSirleneChat();
    // Se o player modal estiver aberto, toca o vídeo
    if (window.ytPlayer && window.ytPlayer.playVideo) {
      window.ytPlayer.playVideo();
    } else {
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  // ─── FALLBACK DETERMINÍSTICO SE A IA OFFLINE ─────────────────────────────────
  function fallbackAgentResponse(userText) {
    const lower = userText.toLowerCase();

    // Se o usuário digitar o código VIP diretamente no chat:
    const upper = userText.toUpperCase().trim();
    const codes = ['VIP2026', 'NOVELASVIP', 'SIRLENE2026', 'VIP1990', 'TURCASVIP', 'DORAMASVIP', 'ACESSOVIP', 'DONASIRLENE'];
    const matchedCode = codes.find(c => upper.includes(c));

    if (matchedCode) {
      triggerVipUnlockDirectly();
      addAgentMessage(
        `Parabéns, meu amor! 🎉 O seu Código VIP **${matchedCode}** foi confirmado com sucesso!\n\nSeu **Acesso VIP Vitalício** está 100% liberado! Pode assistir a todos os capítulos sem anúncios e sem cortes! 🥰✨`,
        { action: 'unlock_vip' }
      );
      return;
    }

    if (/(já fiz|ja fiz|fiz o pix|tá pago|ta pago|paguei|fiz o pagamento|mandei o pix|comprovante|libera aí|liberar)/i.test(lower)) {
      addAgentMessage(
        `Que maravilha, flor! 🥰 Para proteger seu acesso e mantermos nosso sistema 100% seguro contra fraudes, por favor me envie a foto ou print do seu comprovante no WhatsApp!\n\nAssim que eu conferir (é na hora!), te passo seu **Código VIP exclusivo** para liberar tudo aqui no site! Clique no botão abaixo para me mandar:`,
        { action: 'show_pix', plan: 'vip' }
      );
    } else if (lower.includes('10') || lower.includes('dez') || lower.includes('básico') || lower.includes('basico')) {
      addAgentMessage(
        `Oi meu amor! O plano básico de R$ 10,00 é tratado **exclusivamente direto pelo nosso WhatsApp**! 📲\n\nClica no botão verde abaixo para me chamar no WhatsApp que eu te passo todos os detalhes por lá com o maior carinho! 🥰`,
        { action: 'whatsapp_only_10' }
      );
    } else if (lower.includes('tv') || lower.includes('smart') || lower.includes('televis')) {
      addAgentMessage(
        `Oi meu bem! Funciona perfeitamente na sua Smart TV sim! 📺✨ Nós ensinamos todo o passo a passo com suporte exclusivo no nosso **Plano VIP Vitalício de R$ 19,90** (pagamento único sem mensalidade). Quer garantir o seu VIP agora, querida? 🥰`,
        { action: 'show_pix', plan: 'vip' }
      );
    } else if (/(pix|pagar|comprar|plano|quanto custa|valor|preço|preco)/i.test(lower)) {
      addAgentMessage(
        `Com certeza, meu anjo! O nosso **Plano VIP Vitalício** com mais de 10.000 episódios completos sem anúncios está por apenas **R$ 19,90 no Pix**! Você paga uma única vez e nunca mais tem mensalidade! 🌸\n\nAqui está a nossa chave Pix oficial para você liberar na hora:\n🔑 **${AGENT_CONFIG.pixKey}** (CPF)\n👤 Titular: **${AGENT_CONFIG.pixName}** (${AGENT_CONFIG.pixBank})`,
        { action: 'show_pix', plan: 'vip' }
      );
    } else {
      addAgentMessage(
        `Oi meu coração! 🥰 Eu sou a Dona Sirlene e estou aqui para te ajudar a assistir às melhores novelas turcas dubladas, doramas e minisséries sem travas e sem anúncios!\n\nO nosso **Plano VIP Vitalício** está em valor promocional de apenas **R$ 19,90 no Pix** (taxa única, sem mensalidade nenhuma!). Como posso te ajudar hoje, flor?`,
        null
      );
    }
  }

  // ─── ANIMAÇÃO DE CHUVA DE CONFETES NATIVOS ──────────────────────────────────
  function launchConfettiFireworks() {
    const canvas = document.getElementById('dsConfettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.display = 'block';

    const particles = [];
    const colors = ['#ec4899', '#8b5cf6', '#22c55e', '#f59e0b', '#38bdf8', '#ffffff'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height * 0.4 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.8) * 16,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 10,
        alpha: 1
      });
    }

    let frame = 0;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.4; // gravidade
        p.rotation += p.vRot;
        p.alpha -= 0.012;

        if (p.alpha > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      });

      frame++;
      if (alive && frame < 150) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.display = 'none';
      }
    }
    animate();
  }

  // ─── AUXILIARES DE FORMATAÇÃO E UI ──────────────────────────────────────────
  function showTyping(show) {
    const el = document.getElementById('dsTypingIndicator');
    if (el) el.style.display = show ? 'flex' : 'none';
    if (show) scrollToBottom();
  }

  function scrollToBottom() {
    setTimeout(() => {
      const container = document.getElementById('dsChatMessages');
      if (container) container.scrollTop = container.scrollHeight;
    }, 50);
  }

  function getCurrentTime() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }

  function formatMarkdown(text) {
    if (!text) return '';
    let out = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Negrito **texto**
    out = out.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Itálico *texto*
    out = out.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Quebras de linha
    out = out.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>');
    return out;
  }

  function showAgentToast(msg) {
    if (typeof window.showToast === 'function') {
      window.showToast(msg);
      return;
    }
    let el = document.getElementById('toastMsg');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toastMsg';
      el.className = 'toast-msg';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 3200);
  }

  // Tecla ESC para fechar chat se aberto
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isChatOpen) {
      closeDonaSirleneChat();
    }
  });

  // Exporta função global para forçar inicialização
  window.initDonaSirleneChatWidget = initChatWidget;

  // Inicializa o widget quando a página estiver carregada
  if (document.body) {
    initChatWidget();
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatWidget);
  } else {
    initChatWidget();
  }
})();
