// Breadcrumb Histórico de Cliques
(function () {
    const options = {
        baseLabel: 'Início',
        ROOT_MARKER: '127.0.0.1:3000', // Mudar para a Rota Base do site, se deixar vazio ele fica automático, mas ainda não funciona bem automaticamente
        hideOnHome: true,
        titleMap: {
            'secretarias': 'Secretarias',
            'portal-transparencia': 'Portal Transparência',
            'noticias': 'Notícias',
            'gabinete-do-prefeito': 'Gabinete do Prefeito'
        },
        ignore: ['index.html', 'index.htm'],
        usePageTitleForLast: true
    };

    function getBaseHref() {
        const loc = window.location;
        // 1º Se houver <base href> o script respeita ele
        const baseTag = document.querySelector('base[href]');
        if (baseTag) return new URL(baseTag.getAttribute('href'), loc.origin).pathname;
        // 2º Se for definido um ROOT_MARKER após ele
        if (options.ROOT_MARKER) {
            const i = loc.pathname.indexOf(options.ROOT_MARKER);
            if (i >= 0) return loc.pathname.substring(0, i + options.ROOT_MARKER.length + (options.ROOT_MARKER.endsWith('/') ? 0 : 1));
        }
        // 3º Auto: se http(s), usa a 1ª pasta como base (quando não for arquivo)
        const parts = loc.pathname.split('/').filter(Boolean);
        if (parts.length) {
            const last = parts[parts.length - 1];
            const isFile = /\.(html?|php|asp|aspx)$/i.test(last);
            if (!isFile) return '/' + parts[0] + '/';
        }
        return '/';
    }

    function labelize(segment) {
        const key = decodeURIComponent(segment.toLowerCase());
        if (options.titleMap[key]) return options.titleMap[key];
        const clean = key.replace(/\.(html?|php)$/i, '');
        return clean.replace(/[\-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }

    function separator() {
        const li = document.createElement('li');
        li.className = 'sep';
        li.setAttribute('aria-hidden', 'true');
        li.textContent = '/';
        return li;
    }

    function createCrumb({ href, label, position, isLast }) {
        const li = document.createElement('li');
        li.setAttribute('itemprop', 'itemListElement');
        li.setAttribute('itemscope', '');
        li.setAttribute('itemtype', 'https://schema.org/ListItem');
        if (href && !isLast) {
            const a = document.createElement('a');
            a.href = href;
            a.setAttribute('itemprop', 'item');
            const span = document.createElement('span');
            span.setAttribute('itemprop', 'name');
            span.textContent = label;
            a.appendChild(span);
            li.appendChild(a);
        } else {
            const span = document.createElement('span');
            span.className = 'current';
            span.setAttribute('itemprop', 'name');
            span.textContent = label;
            li.appendChild(span);
        }
        const meta = document.createElement('meta');
        meta.setAttribute('itemprop', 'position');
        meta.content = String(position);
        li.appendChild(meta);
        return li;
    }

    function buildBreadcrumb() {
        const baseHref = getBaseHref().replace(/\/$/, '') || '';
        const nav = document.querySelector('nav.breadcrumb');
        const list = document.getElementById('bc-list');
        list.innerHTML = '';

        const raw = location.pathname.replace(/\/+$/, '/');
        const pathAfterBase = raw.startsWith(baseHref + '/') ? raw.slice(baseHref.length) : raw;
        const parts = pathAfterBase.split('/').filter(Boolean).filter(p => !options.ignore.includes(p));

        if (parts.length === 0 && options.hideOnHome) {
            nav.classList.remove('is-visible');
            return;
        }

        let position = 1;
        list.appendChild(createCrumb({ href: baseHref || '/', label: options.baseLabel, position: position++, isLast: parts.length === 0 }));

        let cumulative = baseHref;
        parts.forEach((seg, idx) => {
            cumulative += '/' + seg;
            const isLast = idx === parts.length - 1;
            const label = (isLast && options.usePageTitleForLast && window.PAGE_TITLE) ? window.PAGE_TITLE : labelize(seg);
            list.appendChild(separator());
            list.appendChild(createCrumb({ href: isLast ? null : (cumulative + '/'), label, position: position++, isLast }));
        });

        const hasDepth = list.querySelectorAll('.sep').length > 0;
        if (hasDepth) nav.classList.add('is-visible');
        else if (!hasDepth && !options.hideOnHome) nav.classList.add('is-visible');
    }

    window.addEventListener('popstate', buildBreadcrumb);
    document.addEventListener('DOMContentLoaded', buildBreadcrumb);
})();