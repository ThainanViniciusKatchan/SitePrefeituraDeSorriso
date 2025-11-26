// Integração com Open-Meteo (Gratuito)
// Coordenadas de Sorriso - MT
const LAT = -12.5425;
const LON = -55.7214;
const API_URL = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&daily=weather_code,temperature_2m_max,temperature_2m_min&current=temperature_2m&timezone=America%2FCuiaba`;

const weatherMap = {
    0: '☀️', // Céu limpo
    1: '🌤️', // Principalmente limpo
    2: '⛅', // Parcialmente nublado
    3: '☁️', // Encoberto
    45: '🌫️', // Nevoeiro
    48: '🌫️', // Nevoeiro com geada
    51: '🌦️', // Chuvisco leve
    53: '🌦️', // Chuvisco moderado
    55: '🌦️', // Chuvisco denso
    61: '🌧️', // Chuva leve
    63: '🌧️', // Chuva moderada
    65: '🌧️', // Chuva forte
    80: '🌦️', // Pancadas de chuva leves
    81: '🌧️', // Pancadas de chuva moderadas
    82: '⛈️', // Pancadas de chuva violentas
    95: '⛈️', // Tempestade
    96: '⛈️', // Tempestade com granizo leve
    99: '⛈️', // Tempestade com granizo forte
};

function getIcon(code) {
    return weatherMap[code] || '❓';
}

function getDayName(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[date.getDay()];
}

async function fetchWeather() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        updateDOM(data);
    } catch (error) {
        console.error('Erro ao buscar clima:', error);
    }
}

function updateDOM(data) {
    // Atualizar Temperatura Atual
    if (data.current && data.current.temperature_2m) {
        const currentTempEl = document.querySelector('.clima-atual__temperatura');
        if (currentTempEl) {
            currentTempEl.textContent = `${Math.round(data.current.temperature_2m)}°C`;
        }
    }

    const days = document.querySelectorAll('.previsao-dia');
    const daily = data.daily;

    days.forEach((dayEl, index) => {
        if (index > 2) return; // Apenas 3 dias

        const max = Math.round(daily.temperature_2m_max[index]);
        const min = Math.round(daily.temperature_2m_min[index]);
        const code = daily.weather_code[index];
        const time = daily.time[index];

        // Atualizar Ícone
        const iconEl = dayEl.querySelector('.previsao-dia__icone');
        if (iconEl) iconEl.textContent = getIcon(code);

        // Atualizar Temperatura
        const tempEl = dayEl.querySelector('.previsao-dia__temperatura');
        if (tempEl) tempEl.textContent = `${max}°C / ${min}°C`;

        // Atualizar Título (apenas para o 3º dia, pois Hoje e Amanhã são fixos)
        if (index === 2) {
            const titleEl = dayEl.querySelector('.previsao-dia__titulo');
            if (titleEl) titleEl.textContent = getDayName(time);
        }
    });

    // Atualizar horário
    const updateEl = document.querySelector('.previsao-atualizacao');
    if (updateEl) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        updateEl.textContent = `Atualizado: ${timeString}`;
    }
}

// Iniciar
document.addEventListener('DOMContentLoaded', fetchWeather);
