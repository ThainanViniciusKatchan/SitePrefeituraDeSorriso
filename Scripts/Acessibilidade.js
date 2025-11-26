(function () {
    const root = document.documentElement;
    const btnTheme = document.getElementById('toggleTheme');
    const defaultFontSize = 16; // em px

    // Flag para ativar o narrador
    let modoNarradorAtivo = false;
    const key = "rtn12p9G";

    // Carrega preferências
    const state = JSON.parse(localStorage.getItem('acessState') || '{}');
    if (state.theme) root.setAttribute('data-theme', state.theme);
    if (state.fontSize) root.style.setProperty('--font-size-base', state.fontSize + 'px');
    btnTheme.setAttribute('aria-pressed', state.theme === 'dark');

    // Alterna entre light/dark
    btnTheme.addEventListener('click', () => {
        const current = root.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        btnTheme.setAttribute('aria-pressed', next === 'dark');
        state.theme = next;
        localStorage.setItem('acessState', JSON.stringify(state));
    });

    // Delegação para os itens do menu de acessibilidade
    document.addEventListener('click', (ev) => {
        const btn = ev.target.closest('[data-action]');
        if (!btn) return;
        const action = btn.getAttribute('data-action');
        if (action === 'contrast') {
            root.setAttribute('data-theme', root.getAttribute('data-theme') === 'contrast' ? 'light' : 'contrast');
            state.theme = root.getAttribute('data-theme');
        }
        if (action === 'daltonic') {
            root.setAttribute('data-theme', root.getAttribute('data-theme') === 'daltonic' ? 'light' : 'daltonic');
            state.theme = root.getAttribute('data-theme');
        }
        if (action === 'reset') {
            root.setAttribute('data-theme', 'light');
            root.style.setProperty('--font-size-base', defaultFontSize + 'px');
            delete state.fontSize; delete state.theme;
            btnTheme.setAttribute('aria-pressed', 'false');
        }
        if (action === 'zoom-in' || action === 'zoom-out') {
            const current = parseInt(getComputedStyle(root).getPropertyValue('--font-size-base')) || defaultFontSize;
            const next = action === 'zoom-in' ? Math.min(current + 2, 24) : Math.max(current - 2, 12);
            root.style.setProperty('--font-size-base', next + 'px');
            state.fontSize = next;
        }

        // Ativa/desativa modo narrador
        if (action === 'speak') {
            modoNarradorAtivo = !modoNarradorAtivo;
            if (modoNarradorAtivo) {
                // Injeta o script se ainda não existir
                if (!document.getElementById('responsive-voice-script')) {
                    const script = document.createElement('script');
                    script.id = 'responsive-voice-script';
                    script.src = 'https://code.responsivevoice.org/responsivevoice.js?key=' + key;
                    script.onload = () => {
                        alert('Modo narrador ativado. Selecione um texto para ouvir.\n'
                            + 'Para acessar a página, clique duas vezes sobre ele.');
                    };
                    script.onerror = () => {
                        alert('Erro ao carregar o narrador. Verifique sua conexão.');
                        modoNarradorAtivo = false;
                    };
                    document.body.appendChild(script);
                } else {
                    alert('Modo narrador ativado. Selecione um texto para ouvir.');
                }
            } else {
                alert('Modo narrador desativado.');
                modoNarradorAtivo = false;
            }
        }
        localStorage.setItem('acessState', JSON.stringify(state));
    });

    // Variáveis para controle do clique duplo
    let lastClickedElement = null;
    let lastClickTime = 0;

    // Listener global de click para interceptar e narrar
    document.addEventListener('click', (e) => {
        if (!modoNarradorAtivo) return;

        // Se for o botão de ativar/desativar o narrador
        if (e.target.closest('[data-action="speak"]')) return;

        const target = e.target;
        const now = Date.now();
        const isDoubleClick = (target === lastClickedElement && (now - lastClickTime < 500));

        if (isDoubleClick) {
            // É um clique duplo: permite a ação padrão
            lastClickedElement = null;
            lastClickTime = 0;
            return;
        }

        // É um clique simplesnarra e bloqueia a ação padrão
        e.preventDefault();
        e.stopPropagation();

        lastClickedElement = target;
        lastClickTime = now;

        // Tenta obter o texto mais relevante
        let textToSpeak = '';

        // Prioridade: aria-label > alt > texto visível > title
        if (target.getAttribute('aria-label')) {
            textToSpeak = target.getAttribute('aria-label');
        } else if (target.getAttribute('alt')) {
            textToSpeak = target.getAttribute('alt');
        } else if (target.innerText && target.innerText.trim().length > 0) {
            textToSpeak = target.innerText;
        } else if (target.title) {
            textToSpeak = target.title;
        }

        // Se clicou em uma imagem sem alt ou container vazio, tenta pegar do pai
        if (!textToSpeak) {
            const parent = target.parentElement;
            if (parent) {
                if (parent.getAttribute('aria-label')) textToSpeak = parent.getAttribute('aria-label');
                else if (parent.innerText) textToSpeak = parent.innerText;
            }
        }

        textToSpeak = textToSpeak ? textToSpeak.trim() : '';

        // Feedback visual borda para marcar o que foi clicado
        const originalOutline = target.style.outline;
        target.style.outline = '3px solid #FFFF00'; // Amarelo alto contraste
        setTimeout(() => {
            target.style.outline = originalOutline;
        }, 2000);

        if (textToSpeak && window.responsiveVoice) {
            responsiveVoice.cancel(); // Para a fala anterior
            responsiveVoice.speak(textToSpeak, "Brazilian Portuguese Female");
        }
    }, true); // UseCapture para garantir que pegamos o evento antes de outros handlers

    // Melhoria de acessibilidade: resumo <details> mudando aria-expanded automaticamente
    document.querySelectorAll('details').forEach(d => {
        const summary = d.querySelector('summary');
        if (summary) {
            d.addEventListener('toggle', () => {
                summary.setAttribute('aria-expanded', d.open ? 'true' : 'false');
            });
        }
    });

    // Keyboard shortcut: Ctrl+Shift+M alterna modo escuro
    window.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'm') {
            btnTheme.click();
        }
    });

})();