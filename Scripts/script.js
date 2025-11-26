// Função para filtrar serviços por tópico
function filtrarServicos(topico) {
  // Remove a classe ativa de todos os tópicos
  document.querySelectorAll('.servicos__topico').forEach(t => {
    t.classList.remove('servicos__topico--ativo');
  });

  // Adiciona a classe ativa ao tópico clicado
  event.target.classList.add('servicos__topico--ativo');

  // Oculta todos os serviços
  document.querySelectorAll('.servico').forEach(servico => {
    servico.classList.add('oculto');
  });

  // Mostra apenas os serviços do tópico selecionado
  document.querySelectorAll(`.servico[data-topico="${topico}"]`).forEach(servico => {
    servico.classList.remove('oculto');
  });
}

// Função para filtrar documentos por tópico
function filtrarDocumentos(topico) {
  // Remove a classe ativa de todos os tópicos
  document.querySelectorAll('.documentos__topico').forEach(t => {
    t.classList.remove('documentos__topico--ativo');
  });

  // Adiciona a classe ativa ao tópico clicado
  event.target.classList.add('documentos__topico--ativo');

  // Oculta todos os documentos
  document.querySelectorAll('.documento').forEach(documento => {
    documento.classList.add('oculto');
  });

  // Mostra apenas os documentos do tópico selecionado
  document.querySelectorAll(`.documento[data-doc-topico="${topico}"]`).forEach(documento => {
    documento.classList.remove('oculto');
  });
}

// Adiciona eventos de clique aos tópicos de serviços
document.querySelectorAll('.servicos__topico').forEach(topico => {
  topico.addEventListener('click', function () {
    filtrarServicos(this.getAttribute('data-topico'));
  });
});

// Adiciona eventos de clique aos tópicos de documentos
document.querySelectorAll('.documentos__topico').forEach(topico => {
  topico.addEventListener('click', function () {
    filtrarDocumentos(this.getAttribute('data-doc-topico'));
  });
});

// Modal de Novidades
(function () {
  // --------------------- CONFIG ---------------------
  const DEFAULT_VERSION = '1';
  const STORAGE_KEY = 'sbm_seen_version';

  // If you want to pass a new version from outside, set window.SITE_BANNER_PAYLOAD = { version: '2' }
  const payload = (window.SITE_BANNER_PAYLOAD && typeof window.SITE_BANNER_PAYLOAD === 'object') ? window.SITE_BANNER_PAYLOAD : {};
  const BANNER_VERSION = payload.version || DEFAULT_VERSION;

  const modal = document.getElementById('site-banner-modal');
  if (!modal) return;
  const slidesEl = modal.querySelector('.sbm-slides');
  const dotsEl = modal.querySelector('.sbm-dots');
  const prevBtn = modal.querySelector('.sbm-prev');
  const nextBtn = modal.querySelector('.sbm-next');
  const closeBtn = modal.querySelector('.sbm-close');
  const hideCheckbox = modal.querySelector('#sbm-hide-forever');
  let slides = Array.from(slidesEl.children || []);

  // If HTML didn't include slides, create default placeholders (keeps backwards compatibility)
  if (slides.length === 0) {
    const placeholders = [
      '<li role="option" aria-selected="false"><a href="#"><img src="https://via.placeholder.com/1200x600?text=Banner+1" alt="Banner 1"></a></li>',
      '<li role="option" aria-selected="false"><a href="#"><img src="https://via.placeholder.com/1200x600?text=Banner+2" alt="Banner 2"></a></li>'
    ];
    slidesEl.innerHTML = placeholders.join('');
    slides = Array.from(slidesEl.children);
  }

  // build dots from existing slides
  slides.forEach((li, i) => {
    li.setAttribute('role', 'option');
    li.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    li.tabIndex = -1;

    const dot = document.createElement('button');
    dot.className = 'sbm-dot';
    dot.type = 'button';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    dot.dataset.index = i;
    dot.title = 'Ir para banner ' + (i + 1);
    dot.addEventListener('click', () => goTo(Number(dot.dataset.index)));
    dotsEl.appendChild(dot);
  });

  const dots = Array.from(dotsEl.children);
  let current = 0;
  let lastFocused = null;

  function updateUI() {
    const offset = -current * 100;
    slidesEl.style.transform = `translateX(${offset}%)`;
    slides.forEach((s, i) => {
      s.setAttribute('aria-hidden', i === current ? 'false' : 'true');
      s.setAttribute('aria-selected', i === current ? 'true' : 'false');
    });
    dots.forEach((d, i) => d.setAttribute('aria-selected', i === current ? 'true' : 'false'));
  }

  function goTo(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    current = index;
    slides[current].focus && slides[current].focus();
    updateUI();
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // keyboard navigation
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
    if (e.key === 'Escape') { e.preventDefault(); closeModal(); }
  });

  // fechar
  closeBtn.addEventListener('click', () => closeModal());
  modal.querySelector('[data-close]').addEventListener('click', () => closeModal());

  function closeModal() {
    const hideForever = hideCheckbox.checked;
    if (hideForever) {
      try { localStorage.setItem(STORAGE_KEY, BANNER_VERSION); } catch (e) { /* storage bloqueado */ }
    }
    modal.classList.add('sbm-hidden');
    modal.setAttribute('aria-hidden', 'true');
    if (lastFocused) lastFocused.focus();
  }

  function openModal() {
    lastFocused = document.activeElement;
    modal.classList.remove('sbm-hidden');
    modal.setAttribute('aria-hidden', 'false');
    current = 0;
    updateUI();
    // focus first slide to announce to screen readers
    slides[0].focus && slides[0].focus();
  }

  // Show only if version changed
  const seenVersion = (() => { try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; } })();
  const shouldShow = seenVersion !== BANNER_VERSION;
  if (shouldShow) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', openModal);
    else openModal();
  }

  // Expose API
  window.SITE_BANNER_MODAL = window.SITE_BANNER_MODAL || {};
  window.SITE_BANNER_MODAL.open = openModal;
  window.SITE_BANNER_MODAL.close = closeModal;
  window.SITE_BANNER_MODAL.version = BANNER_VERSION;
  window.SITE_BANNER_MODAL.slides = slides.map(s => s.dataset.bannerId || null);

})();

