// ========== MAIN ÌÎÄÓËÜ: ÈÍÈÖÈÀËÈÇÀÖÈß ==========
import { initializeState, startGlobalTimer } from './core.js';
import { setActiveTab, closeShowcase, closeModal } from './ui.js';

// Èíèöèàëèçàöèÿ Telegram WebApp
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#000000');
    tg.setBackgroundColor('#000000');
}

// Ïðèâÿçêà ñîáûòèé
document.getElementById('showcaseClose').addEventListener('click', closeShowcase);
document.getElementById('showcaseOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('showcaseOverlay')) closeShowcase();
});
document.addEventListener('closeModal', closeModal);

// Çàïóñê ïðèëîæåíèÿ
function initializeApp() {
    initializeState();
    startGlobalTimer();

    document.querySelectorAll('.tab-item').forEach((t) =>
        t.addEventListener('click', () => setActiveTab(t.dataset.tab))
    );

    setActiveTab('expeditions');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}