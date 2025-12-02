// BUSCAR NOTÍCIAS
let todasAsNoticias = [];

async function fetchNewsData(newsUrl) {
    const proxyUrl = `https://cors.eu.org/${newsUrl}`;
    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error(`Erro de rede: ${response.statusText}`);
        const htmlText = await response.text();
        if (!htmlText) throw new Error("Proxy não retornou conteúdo.");

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');

        const tituloMetaTag = doc.querySelector('meta[property="og:title"]');
        const titulo = tituloMetaTag ? tituloMetaTag.getAttribute('content') : 'Título não encontrado';

        const imagemMetaTag = doc.querySelector('meta[property="og:image"]');
        const imageUrl = imagemMetaTag ? imagemMetaTag.getAttribute('content') : 'https://placehold.co/600x400/e2e8f0/334155?text=Imagem+N%C3%A3o+Dispon%C3%ADvel';

        return { success: true, title: titulo, imageUrl: imageUrl, link: newsUrl };
    } catch (error) {
        console.error(`Falha ao buscar ${newsUrl}:`, error);
        return { success: false };
    }
}

function renderizarNoticias() {
    const container = document.getElementById('news-feed-container');
    if (!container) return;

    container.innerHTML = '';

    if (todasAsNoticias.length === 0) {
        container.innerHTML = '<p class="col-span-full text-center text-red-500">Não foi possível carregar as notícias no momento.</p>';
        return;
    }

    todasAsNoticias.forEach((dadosDaNoticia) => {
        const cardLink = document.createElement('a');
        cardLink.href = dadosDaNoticia.link;
        cardLink.target = '_blank';
        cardLink.rel = 'noopener noreferrer';
        cardLink.className = 'card-noticia';

        cardLink.innerHTML = `
                    <img src="${dadosDaNoticia.imageUrl}" alt="${dadosDaNoticia.title}" class="card-noticia-image">
                    <div class="card-noticia-content">
                        <h3>${dadosDaNoticia.title}</h3>
                    </div>
                `;
        container.appendChild(cardLink);
    });
}

async function initNewsFeed() {
    const urlsDasNoticias = [
        "https://site.sorriso.mt.gov.br/noticia/municipio-oficializa-comite-de-gestao-de-crise-da-saude-683881843b019",
        "https://site.sorriso.mt.gov.br/noticia/servidores-participarao-de-curso-sobre-processo-administrativo-disciplinar-689de5a3699f9",
        "https://site.sorriso.mt.gov.br/noticia/sorriso-fatura-prata-na-2-edicao-do-premio-cidades-inovadoras-68c02b0b8d339",
    ];

    const promessasDeBusca = urlsDasNoticias.map(url => fetchNewsData(url));
    const resultados = await Promise.all(promessasDeBusca);

    todasAsNoticias = resultados.filter(resultado => resultado.success);
    renderizarNoticias();
}

// MENU LATERAL MOBILE
const menuToggle = document.getElementById('menu-toggle');
const closeBtn = document.getElementById('close-btn');
const sidenav = document.getElementById('mySidenav');

function openNav() {
    if (sidenav) sidenav.style.width = "250px";
}

function closeNav() {
    if (sidenav) sidenav.style.width = "0";
}

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        if (!sidenav.style.width || sidenav.style.width === "0px") {
            openNav();
        } else {
            closeNav();
        }
    });
}

if (closeBtn) closeBtn.addEventListener('click', closeNav);

if (sidenav) {
    const sidenavLinks = sidenav.querySelectorAll('a');
    sidenavLinks.forEach(link => {
        if (link.id !== 'close-btn') {
            link.addEventListener('click', closeNav);
        }
    });
}

// BOTÃO VOLTAR AO TOPO
const backToTopButton = document.getElementById("backToTopBtn");

window.onscroll = function () {
    if (backToTopButton) {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            backToTopButton.style.display = "block";
        } else {
            backToTopButton.style.display = "none";
        }
    }
};

if (backToTopButton) {
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}


// INICIALIZAÇÃO QUANDO O DOCUMENTO ESTIVER PRONTO
document.addEventListener('DOMContentLoaded', initNewsFeed);

// BLOQUEAR O USO DO MAPA
document.addEventListener('DOMContentLoaded', () => {
    const allMapWrappers = document.querySelectorAll('.map-wrapper');

    allMapWrappers.forEach(wrapper => {
        const overlay = wrapper.querySelector('.map-overlay-cover');

        if (overlay) {
            overlay.addEventListener('click', () => {
                overlay.classList.add('is-inactive');
            });
        }

        wrapper.addEventListener('mouseleave', () => {
            if (overlay) {
                overlay.classList.remove('is-inactive');
            }
        });
    });
});