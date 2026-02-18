const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log('\n' + '='.repeat(70));
    console.log('📊 US100 & GOLD - 11 WSKAŹNIKÓW (POPRAWIONE KIERUNKI)');
    console.log('='.repeat(70));
    console.log(`🌐 Serwer: http://localhost:${PORT}`);
    console.log(`📈 US100: RSI, MACD, SMA, ADX, Stoch, CCI, MFI, Williams, ATR, ROC, Volume`);
    console.log(`🏆 ZŁOTO: te same 11 wskaźników`);
    console.log(`✅ WSKAŹNIKI: poprawiona interpretacja kierunków`);
    console.log('='.repeat(70) + '\n');
});