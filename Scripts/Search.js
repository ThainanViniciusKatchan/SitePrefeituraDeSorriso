(function () {
    // remove acentos e deixa minúsculo
    const norm = s => (s || '').toString().normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

    // Procura os elemntos pelo ID
    const input = document.getElementById('busca-texto');
    const campo = document.getElementById('busca-campo');
    const btnBuscar = document.getElementById('btn-buscar');

    // detecta tabelas na página
    const tabela = document.getElementById('tabela-despesas');
    const hasTable = !!tabela;
    const servicos = Array.from(document.querySelectorAll('.servico'));

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    function escapeHtml(text) {
        return (text || '').replace(/[&<>"]/g, function (m) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]); });
    }

    function highlightHtml(text, term) {
        if (!term) return escapeHtml(text);
        const re = new RegExp(escapeRegExp(term), 'ig');
        // Mantém acentuação na substituição (regex usa term crú)
        return escapeHtml(text).replace(re, match => `<mark class="search-hit">${match}</mark>`);
    }

    // Função para pesquisar serviços
    function pesquisarServicos(qRaw, campoSel) {
        const q = norm(qRaw);
        let anyVisible = false;

        // Mostra os itens do tópico ativo e oculta os demais
        const topicos = Array.from(document.querySelectorAll('.servicos__topico'));

        const topicoAtivoEl = document.querySelector('.servicos__topico--ativo');
        const topicoAtivo = topicoAtivoEl ? (topicoAtivoEl.dataset.topico || '') : '';

        // atualiza lista dinâmicamente
        const servicosList = Array.from(document.querySelectorAll('.servico'));

        // Pesquisa do filtro Tudo
        if (campoSel === 'Tudo') {

            // oculta os tópicos quando a pesquisa for filtrada por tudo
            topicos.forEach(t => t.style.display = 'none');

            servicosList.forEach(el => {
                const nomeEl = el.querySelector('.servico__nome');
                const nomeTxt = nomeEl ? (nomeEl.textContent || '') : '';

                // se pesquisa vazia mostra tudo
                const match = !q || norm(nomeTxt).includes(q);

                if (match) {
                    el.classList.remove('oculto');
                    if (nomeEl) nomeEl.innerHTML = highlightHtml(nomeTxt, qRaw);
                    anyVisible = true;
                } else {
                    el.classList.add('oculto');
                    if (nomeEl) nomeEl.innerHTML = escapeHtml(nomeTxt);
                }
            });

            return anyVisible;
        }

        // se não for tudo, rótulos de tópico ficam visíveis
        topicos.forEach(t => t.style.display = '');

        // Se o filtro for igual a tópico, irá pesquisar dentro do tópico ativo
        if (campoSel === 'Tópico') {
            // se não tiver tópico ativo não mostrara nenhum serviço
            if (!topicoAtivo) {
                servicosList.forEach(s => s.classList.add('oculto'));
                return false;
            }

            servicosList.forEach(el => {
                const nomeEl = el.querySelector('.servico__nome');
                const nomeTxt = nomeEl ? (nomeEl.textContent || '') : '';
                const top = el.dataset.topico || '';

                // somente pesquisar dentro do tópico ativo
                if (top === topicoAtivo) {
                    const match = !q || norm(nomeTxt).includes(q);
                    if (match) {
                        el.classList.remove('oculto');
                        if (nomeEl) nomeEl.innerHTML = highlightHtml(nomeTxt, qRaw);
                        anyVisible = true;
                    } else {
                        el.classList.add('oculto');
                        if (nomeEl) nomeEl.innerHTML = escapeHtml(nomeTxt);
                    }
                } else {
                    // oculta os itens fora do tópico ativo
                    el.classList.add('oculto');
                    if (nomeEl) nomeEl.innerHTML = escapeHtml(nomeTxt);
                }
            });

            return anyVisible;
        }

        // Se o Select for igual a Nome, a pesquisa irá acontecer sobre os nomes dos itens, mostrando tudo que contem aquela palavra
        servicosList.forEach(el => {
            const nomeEl = el.querySelector('.servico__nome');
            const nomeTxt = nomeEl ? (nomeEl.textContent || '') : '';
            const match = !q || norm(nomeTxt).includes(q);

            if (match) {
                el.classList.remove('oculto');
                if (nomeEl) nomeEl.innerHTML = highlightHtml(nomeTxt, qRaw);
                anyVisible = true;
            } else {
                el.classList.add('oculto');
                if (nomeEl) nomeEl.innerHTML = escapeHtml(nomeTxt);
            }
        });

        // esconde rótulos de tópicos que não tenham serviços visíveis
        topicos.forEach(t => {
            const tKey = t.dataset.topico || '';
            const hasVis = servicosList.some(s => !s.classList.contains('oculto') && (s.dataset.topico || '') === tKey);
            t.style.display = hasVis ? '' : 'none';
        });

        return anyVisible;
    }


    // Se existir uma tabela na página a pesquisa irá ocorrer aqui
    function pesquisarTabela(qRaw, campoSel) {
        const q = norm(qRaw);
        const COL = {
            NUM: 0, ANO: 1, DATA: 2, TIPO: 3, ORGAO: 4, ELEMENTO: 5, CLASSIF: 6, CNPJ: 7, FAV: 8, VALOR: 9, DETALHE: 10
        };
        let anyVisible = false;
        const rows = Array.from(tabela.tBodies[0].rows);

        rows.forEach(tr => {
            const cells = tr.cells;
            let show = false;

            if (!q) {
                show = true;
                Array.from(cells).forEach(c => c.innerHTML = escapeHtml(c.textContent || ''));
            } else {
                if (campoSel === 'Tudo') {
                    // concatena as colunas relevantes
                    const textAll = [COL.NUM, COL.FAV, COL.VALOR, COL.ORGAO, COL.ELEMENTO, COL.CLASSIF].map(i => (cells[i]?.textContent || '')).join(' | ');
                    show = norm(textAll).includes(q);
                    Array.from(cells).forEach(c => {
                        if (norm(c.textContent || '').includes(q)) c.innerHTML = highlightHtml(c.textContent || '', qRaw);
                        else c.innerHTML = escapeHtml(c.textContent || '');
                    });
                } else if (campoSel === 'Nome') {
                    const c = cells[COL.FAV];
                    show = c && norm(c.textContent || '').includes(q);
                    Array.from(cells).forEach(cel => cel.innerHTML = escapeHtml(cel.textContent || ''));
                    if (show) c.innerHTML = highlightHtml(c.textContent || '', qRaw);
                } else if (campoSel === 'Tópico') {
                    // aqui usamos ELEMENTO/CLASSIF como "tópico/despesa"
                    const combined = (cells[COL.ELEMENTO]?.textContent || '') + ' ' + (cells[COL.CLASSIF]?.textContent || '');
                    show = norm(combined).includes(q);
                    Array.from(cells).forEach(cel => cel.innerHTML = escapeHtml(cel.textContent || ''));
                    if (show) {
                        if (norm(cells[COL.ELEMENTO].textContent || '').includes(q)) cells[COL.ELEMENTO].innerHTML = highlightHtml(cells[COL.ELEMENTO].textContent || '', qRaw);
                        if (norm(cells[COL.CLASSIF].textContent || '').includes(q)) cells[COL.CLASSIF].innerHTML = highlightHtml(cells[COL.CLASSIF].textContent || '', qRaw);
                    }
                }
            }

            tr.style.display = show ? '' : 'none';
            if (show) anyVisible = true;
        });

        return anyVisible;
    }

    // Realiza a pesquisa dependendo do filtro selecionado
    function pesquisar() {
        const qRaw = input.value.trim();
        const campoSel = campo.value;

        if (hasTable) {
            pesquisarTabela(qRaw, campoSel);
        } else {
            pesquisarServicos(qRaw, campoSel);
        }

        // Controla a pesqusia no portal transparência, ocultando os blocos que não contem mais itens e os que não contem itens correpondentes a pesquisa
        const Outros = document.getElementById('Outros');
        const passiva = document.getElementById('Passiva');
        const Ativa = document.getElementById('Ativa');
        if (Outros || passiva) { // Verifica se tem itens nos blocos
            const servicosOutros = Array.from(Outros.querySelectorAll('.servico'));
            const servicosPassiva = Array.from(passiva.querySelectorAll('.servico'));
            const servicosAtiva = Array.from(Ativa.querySelectorAll('.servico'));

            const visiveisOutros = servicosOutros.filter( // Oculta os itens Outros
                s => s.style.display !== 'none' && !s.classList.contains('oculto')
            ).length;

            const visiveispassiva = servicosPassiva.filter( // Oculta os itens Passiva
                s => s.style.display !== 'none' && !s.classList.contains('oculto')
            ).length;

            const visiveisAtiva = servicosAtiva.filter( // Oculta os itens Ativa
                s => s.style.display !== 'none' && !s.classList.contains('oculto')
            ).length;

            // Muda o display para none ocultando os blocos sem nada
            Outros.style.display = visiveisOutros > 0 ? '' : 'none';
            passiva.style.display = visiveispassiva > 0 ? '' : 'none';
            Ativa.style.display = visiveisAtiva > 0 ? '' : 'none';
        }

        // se não houver resultados some com os blocos vazios
        if (Outros || passiva || Ativa) {
            Outros.style.display = qtdVisiveis > 0 ? '' : 'none';
            passiva.style.display = qtdVisiveis > 0 ? '' : 'none';
            Ativa.style.display = qtdVisiveis > 0 ? '' : 'none';
        }


    }

    // Executa os eventos de pesquisa
    btnBuscar.addEventListener('click', (e) => { e.preventDefault(); pesquisar(); });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); pesquisar(); } });
    input.addEventListener('input', () => pesquisar());
})();