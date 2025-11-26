// Calendário com Eventos, Feriados e Pontos Facultativos
class CalendarioEvento {
    constructor() {
        this.mesAtual = new Date().getMonth();
        this.anoAtual = new Date().getFullYear();
        this.diaAtual = new Date().getDate();

        // Base de dados de eventos (pode ser expandida ou vir de um banco de dados)
        this.eventos = [
            // Feriados Nacionais 2025
            { data: '2025-01-01', nome: 'Confraternização Universal', tipo: 'feriado' },
            { data: '2025-04-18', nome: 'Sexta-feira Santa', tipo: 'feriado' },
            { data: '2025-04-21', nome: 'Tiradentes', tipo: 'feriado' },
            { data: '2025-05-01', nome: 'Dia do Trabalhador', tipo: 'feriado' },
            { data: '2025-06-19', nome: 'Corpus Christi', tipo: 'feriado' },
            { data: '2025-09-07', nome: 'Independência do Brasil', tipo: 'feriado' },
            { data: '2025-10-12', nome: 'Nossa Senhora Aparecida', tipo: 'feriado' },
            { data: '2025-11-02', nome: 'Finados', tipo: 'feriado' },
            { data: '2025-11-15', nome: 'Proclamação da República', tipo: 'feriado' },
            { data: '2025-11-20', nome: 'Consciência Negra', tipo: 'feriado' },
            { data: '2025-12-25', nome: 'Natal', tipo: 'feriado' },

            // Pontos Facultativos 2025
            { data: '2025-03-03', nome: 'Carnaval', tipo: 'facultativo' },
            { data: '2025-03-04', nome: 'Carnaval', tipo: 'facultativo' },
            { data: '2025-03-05', nome: 'Quarta-feira de Cinzas (até 14h)', tipo: 'facultativo' },
            { data: '2025-06-20', nome: 'Corpus Christi (emenda)', tipo: 'facultativo' },
            { data: '2025-10-13', nome: 'Dia do Servidor Público (emenda)', tipo: 'facultativo' },
            { data: '2025-12-24', nome: 'Véspera de Natal', tipo: 'facultativo' },
            { data: '2025-12-31', nome: 'Véspera de Ano Novo', tipo: 'facultativo' },

            // Eventos Municipais (exemplos - podem ser customizados)
            { data: '2025-02-15', nome: 'Aniversário de Sorriso', tipo: 'evento' },
            { data: '2025-06-24', nome: 'Festival de Música', tipo: 'evento' },
            { data: '2025-08-10', nome: 'Feira Agropecuária', tipo: 'evento' },
            { data: '2025-09-20', nome: 'Semana da Pátria', tipo: 'evento' },
            { data: '2025-12-10', nome: 'Festival de Natal', tipo: 'evento' }
        ];

        this.init();
    }

    init() {
        this.renderizarCalendario();
        this.adicionarEventListeners();
        this.renderizarEventosProximos();
    }

    adicionarEventListeners() {
        document.getElementById('calendario-prev').addEventListener('click', () => {
            this.mesAtual--;
            if (this.mesAtual < 0) {
                this.mesAtual = 11;
                this.anoAtual--;
            }
            this.renderizarCalendario();
        });

        document.getElementById('calendario-next').addEventListener('click', () => {
            this.mesAtual++;
            if (this.mesAtual > 11) {
                this.mesAtual = 0;
                this.anoAtual++;
            }
            this.renderizarCalendario();
        });
    }

    renderizarCalendario() {
        const meses = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];

        // Atualizar título
        document.getElementById('calendario-mes-ano').textContent =
            `${meses[this.mesAtual]} ${this.anoAtual}`;

        // Limpar dias do calendário
        const calendarioDias = document.getElementById('calendario-dias');
        calendarioDias.innerHTML = '';

        // Primeiro dia do mês e total de dias
        const primeiroDia = new Date(this.anoAtual, this.mesAtual, 1).getDay();
        const ultimoDia = new Date(this.anoAtual, this.mesAtual + 1, 0).getDate();
        const ultimoDiaMesAnterior = new Date(this.anoAtual, this.mesAtual, 0).getDate();

        // Dias do mês anterior
        for (let i = primeiroDia - 1; i >= 0; i--) {
            const dia = ultimoDiaMesAnterior - i;
            const divDia = this.criarDivDia(dia, 'outro-mes');
            calendarioDias.appendChild(divDia);
        }

        // Dias do mês atual
        for (let dia = 1; dia <= ultimoDia; dia++) {
            const classesDia = this.obterClassesDia(dia);
            const divDia = this.criarDivDia(dia, classesDia);

            // Adicionar tooltip ao passar o mouse
            const eventoNoDia = this.obterEventoDoDia(dia);
            if (eventoNoDia) {
                divDia.title = `${eventoNoDia.nome} (${this.traduzirTipo(eventoNoDia.tipo)})`;
            }

            calendarioDias.appendChild(divDia);
        }

        // Dias do próximo mês para completar a grade
        const totalCelulas = calendarioDias.children.length;
        const celulasRestantes = totalCelulas % 7 === 0 ? 0 : 7 - (totalCelulas % 7);

        for (let dia = 1; dia <= celulasRestantes; dia++) {
            const divDia = this.criarDivDia(dia, 'outro-mes');
            calendarioDias.appendChild(divDia);
        }
    }

    criarDivDia(dia, classes) {
        const divDia = document.createElement('div');
        divDia.className = `calendario-dia ${classes}`;
        divDia.textContent = dia;
        return divDia;
    }

    obterClassesDia(dia) {
        let classes = '';

        // Verificar se é o dia atual
        const hoje = new Date();
        if (dia === this.diaAtual &&
            this.mesAtual === hoje.getMonth() &&
            this.anoAtual === hoje.getFullYear()) {
            classes += 'hoje ';
        }

        // Verificar eventos
        const evento = this.obterEventoDoDia(dia);
        if (evento) {
            if (evento.tipo === 'feriado') {
                classes += 'tem-feriado ';
            } else if (evento.tipo === 'facultativo') {
                classes += 'tem-facultativo ';
            } else if (evento.tipo === 'evento') {
                classes += 'tem-evento ';
            }
        }

        return classes.trim();
    }

    obterEventoDoDia(dia) {
        const dataStr = `${this.anoAtual}-${String(this.mesAtual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        return this.eventos.find(evento => evento.data === dataStr);
    }

    renderizarEventosProximos() {
        const listaEventos = document.getElementById('lista-eventos');
        listaEventos.innerHTML = '';

        // Filtrar eventos futuros e ordenar por data
        const hoje = new Date();
        const eventosFuturos = this.eventos
            .filter(evento => new Date(evento.data) >= hoje)
            .sort((a, b) => new Date(a.data) - new Date(b.data))
            .slice(0, 5); // Mostrar apenas os 5 próximos

        if (eventosFuturos.length === 0) {
            listaEventos.innerHTML = '<li style="border: none;">Nenhum evento próximo</li>';
            return;
        }

        eventosFuturos.forEach(evento => {
            const li = document.createElement('li');
            li.className = evento.tipo;

            const data = new Date(evento.data + 'T00:00:00');
            const dataFormatada = data.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });

            li.innerHTML = `
                <div class="evento-data">${dataFormatada}</div>
                <div class="evento-nome">${evento.nome}</div>
                <span class="evento-tipo ${evento.tipo}">${this.traduzirTipo(evento.tipo)}</span>
            `;

            listaEventos.appendChild(li);
        });
    }

    traduzirTipo(tipo) {
        const tipos = {
            'evento': 'Evento',
            'feriado': 'Feriado',
            'facultativo': 'Ponto Facultativo'
        };
        return tipos[tipo] || tipo;
    }
}

// Inicializar o calendário quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function () {
    // Verificar se os elementos do calendário existem na página
    if (document.getElementById('calendario-dias')) {
        new CalendarioEvento();
    }
});
