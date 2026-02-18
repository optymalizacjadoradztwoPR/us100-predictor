// Inicjalizacja połączenia Socket.io
const socket = io();
let priceChart = null;

// Elementy DOM
const elements = {
    currentPrice: document.getElementById('currentPrice'),
    priceChange: document.getElementById('priceChange'),
    currentTime: document.getElementById('currentTime'),
    tradingWindow: document.getElementById('tradingWindow'),
    updateInfo: document.getElementById('updateInfo'),
    dataSource: document.getElementById('dataSource'),
    trend: document.getElementById('trend'),
    momentum: document.getElementById('momentum'),
    volatility: document.getElementById('volatility'),
    rsi: document.getElementById('rsi'),
    signalStrength: document.getElementById('signalStrength'),
    direction: document.getElementById('direction'),
    signalValue: document.getElementById('signalValue'),
    meterFill: document.getElementById('meterFill'),
    recommendation: document.getElementById('recommendation'),
    targetPrice: document.getElementById('targetPrice'),
    statMax: document.getElementById('statMax'),
    statMin: document.getElementById('statMin'),
    statAvg: document.getElementById('statAvg'),
    statChange: document.getElementById('statChange'),
    updateIntervalText: document.getElementById('updateIntervalText')
};

// ==================== FUNKCJE CZASU ====================

function updateTime() {
    const now = new Date();
    const options = {
        timeZone: 'Europe/Warsaw',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    };
    
    elements.currentTime.textContent = now.toLocaleString('pl-PL', options);
    
    // Sprawdź okno handlowe
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const isTradingWindow = (hours === 16 && minutes >= 30) || (hours === 17 && minutes === 0);
    
    if (isTradingWindow) {
        elements.tradingWindow.textContent = '🟢 OKNO HANDLOWE AKTYWNE 16:30-17:00';
        elements.tradingWindow.classList.add('active');
    } else {
        elements.tradingWindow.textContent = '🔴 POZA OKNEM HANDLOWYM';
        elements.tradingWindow.classList.remove('active');
    }
}

// Aktualizuj czas co sekundę
setInterval(updateTime, 1000);
updateTime();

// ==================== FUNKCJE WYKRESU ====================

function initChart() {
    const ctx = document.getElementById('priceChart').getContext('2d');
    
    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Cena US100',
                data: [],
                borderColor: '#60a5fa',
                backgroundColor: 'rgba(96, 165, 250, 0.1)',
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: '#60a5fa',
                pointBorderColor: 'white',
                pointBorderWidth: 2,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: '#1a2634',
                    titleColor: '#e0e0e0',
                    bodyColor: '#94a3b8',
                    borderColor: '#374151',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#94a3b8',
                        maxTicksLimit: 10
                    }
                }
            }
        }
    });
}

function updateChart(history) {
    if (!priceChart) {
        initChart();
    }
    
    const labels = history.map((_, index) => `${index + 1}`);
    const prices = history.map(item => item.price);
    
    priceChart.data.labels = labels;
    priceChart.data.datasets[0].data = prices;
    priceChart.update();
    
    // Oblicz statystyki
    if (prices.length > 0) {
        const max = Math.max(...prices);
        const min = Math.min(...prices);
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
        const change = ((prices[prices.length - 1] - prices[0]) / prices[0] * 100).toFixed(2);
        
        elements.statMax.textContent = max.toFixed(2);
        elements.statMin.textContent = min.toFixed(2);
        elements.statAvg.textContent = avg.toFixed(2);
        elements.statChange.textContent = (change > 0 ? '+' : '') + change + '%';
        elements.statChange.style.color = change >= 0 ? '#10b981' : '#ef4444';
    }
}

// ==================== OBSŁUGA SOCKET.IO ====================

socket.on('priceUpdate', (data) => {
    console.log('Otrzymano dane:', data);
    
    // Aktualizuj źródło danych
    if (data.isDemo) {
        elements.dataSource.innerHTML = '🔸 TRYB DEMO (dane symulowane)';
        elements.updateIntervalText.textContent = 'co 10 sekund';
    } else {
        elements.dataSource.innerHTML = '🔹 TRYB RZECZYWISTY (Alpha Vantage)';
        elements.updateIntervalText.textContent = 'co 60 sekund';
    }
    
    // Aktualizuj cenę
    elements.currentPrice.textContent = data.price.toFixed(2);
    
    // Aktualizuj czas ostatniej aktualizacji
    const now = new Date();
    elements.updateInfo.textContent = `Ostatnia aktualizacja: ${now.toLocaleTimeString('pl-PL')}`;
    
    // Oblicz i pokaż zmianę ceny
    if (data.history.length > 1) {
        const previousPrice = data.history[data.history.length - 2].price;
        const change = data.price - previousPrice;
        const changePercent = (change / previousPrice * 100).toFixed(2);
        
        elements.priceChange.textContent = `${change > 0 ? '+' : ''}${change.toFixed(2)} (${change > 0 ? '+' : ''}${changePercent}%)`;
        elements.priceChange.className = 'price-change ' + (change >= 0 ? 'positive' : 'negative');
    }
    
    // Aktualizuj wykres
    updateChart(data.history);
    
    // Aktualizuj predykcję
    if (data.prediction) {
        const p = data.prediction;
        
        elements.trend.textContent = p.trend;
        elements.momentum.textContent = p.momentum;
        elements.volatility.textContent = p.volatility;
        elements.rsi.textContent = p.rsi || '---';
        elements.signalStrength.textContent = p.signalStrength + '%';
        elements.signalValue.textContent = p.signalStrength + '%';
        elements.meterFill.style.width = p.signalStrength + '%';
        
        // Kierunek z odpowiednim kolorem
        let directionText = '---';
        let directionColor = '#94a3b8';
        
        if (p.predictedDirection === 'UP') {
            directionText = 'W GÓRĘ ↑';
            directionColor = '#10b981';
        } else if (p.predictedDirection === 'DOWN') {
            directionText = 'W DÓŁ ↓';
            directionColor = '#ef4444';
        } else if (p.predictedDirection === 'SIDEWAYS') {
            directionText = 'BOCZNY →';
            directionColor = '#f59e0b';
        }
        
        elements.direction.textContent = directionText;
        elements.direction.style.color = directionColor;
        
        // Cena docelowa
        elements.targetPrice.textContent = p.predictedPrice;
        
        // Rekomendacja z odpowiednim stylem
        elements.recommendation.textContent = p.recommendation;
        
        if (p.recommendation.includes('SILNY SYGNAŁ KUPNA')) {
            elements.recommendation.className = 'recommendation strong-buy';
        } else if (p.recommendation.includes('SILNY SYGNAŁ SPRZEDAŻY')) {
            elements.recommendation.className = 'recommendation strong-sell';
        } else {
            elements.recommendation.className = 'recommendation';
        }
    }
});

// Obsługa specjalnych godzin
socket.on('specialTime', (data) => {
    showNotification(data.message);
});

// ==================== POWIADOMIENIA ====================

function showNotification(message) {
    // Sprawdź czy wsparcie dla notyfikacji
    if (Notification.permission === 'granted') {
        new Notification('US100 Predictor', { 
            body: message,
            icon: 'https://cdn-icons-png.flaticon.com/512/545/545872.png'
        });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
    
    // Pokaż tymczasowe powiadomienie na stronie
    const notification = document.createElement('div');
    notification.className = 'temporary-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #1e2a3a;
        color: white;
        padding: 15px 25px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        border-left: 4px solid #60a5fa;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// ==================== OBSŁUGA PRZYCISKÓW ====================

document.getElementById('refreshChart').addEventListener('click', () => {
    if (priceChart) {
        priceChart.update();
    }
});

// ==================== INICJALIZACJA ====================

// Poproś o zgodę na notyfikacje
if (Notification.permission === 'default') {
    Notification.requestPermission();
}

// Dodaj style dla powiadomień
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);