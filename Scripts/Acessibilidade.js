
(function () {
    const root = document.documentElement;
    const btnTheme = document.getElementById('toggleTheme');
    const defaultFontSize = 16; // base em px

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
        if (action === 'speak') {
            const text = document.getElementById('conteudo-exemplo')?.innerText.trim();
            if (!text) return;
            // Use SpeechSynthesis se disponível
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const utter = new SpeechSynthesisUtterance(text);
                utter.lang = 'pt-BR';
                window.speechSynthesis.speak(utter);
            } else {
                alert('Narração não suportada neste navegador.');
            }
        }

        localStorage.setItem('acessState', JSON.stringify(state));
    });

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