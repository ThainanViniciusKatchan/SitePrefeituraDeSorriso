(function() {
const overlay = document.getElementById('copyModalOverlay');
const closeBtn = document.getElementById('copyModalClose');


function openModal() {
overlay.classList.add('is-open');
overlay.setAttribute('aria-hidden', 'false');
}
function closeModal() {
overlay.classList.remove('is-open');
overlay.setAttribute('aria-hidden', 'true');
}


// Fechar com click fora e com ESC
overlay.addEventListener('click', (e) => {
if (e.target === overlay) closeModal();
});
document.addEventListener('keydown', (e) => {
if (e.key === 'Escape') closeModal();
});
closeBtn.addEventListener('click', closeModal);


// 1) Mais confiável: escuta o evento de cópia (menu, clique direito, botão, etc.)
document.addEventListener('copy', () => {
openModal();
});


// 2) Fallback: atalho de teclado (Ctrl/⌘ + C)
document.addEventListener('keydown', (e) => {
const isCopyShortcut = (e.ctrlKey || e.metaKey) && (e.key && e.key.toLowerCase() === 'c');
if (isCopyShortcut) {
// não impedimos a cópia — apenas mostramos o aviso
openModal();
}
}, true);
})();