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