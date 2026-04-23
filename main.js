// ========== MAIN МОДУЛЬ: ИНИЦИАЛИЗАЦИЯ ==========
import { initializeState, startGlobalTimer } from './core.js';
import { setActiveTab, closeShowcase, closeModal } from './ui.js';
import { CONFIG_ITEMS, CONFIG_GEODES, CONFIG_EXPEDITIONS } from './config.js';

// Инициализация Telegram WebApp
const tg = window.Telegram?.WebApp;
if (tg) {
    try {
        tg.ready();
        tg.expand();
        try { tg.setHeaderColor('#000000'); } catch (e) { }
        try { tg.setBackgroundColor('#000000'); } catch (e) { }
    } catch (e) { }
}

// Привязка событий
document.getElementById('showcaseClose').addEventListener('click', closeShowcase);
document.getElementById('showcaseOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('showcaseOverlay')) closeShowcase();
});
document.addEventListener('closeModal', closeModal);

// ---------- ПРЕЛОАДЕР ----------
function startPreloader() {
    const imagesToPreload = [];

    // Собираем все картинки из конфигов
    Object.values(CONFIG_ITEMS).forEach(item => {
        if (item.imagePath) imagesToPreload.push(item.imagePath);
    });

    Object.values(CONFIG_GEODES).forEach(geode => {
        if (geode.stages) {
            geode.stages.forEach(stage => {
                if (stage.imagePath) imagesToPreload.push(stage.imagePath);
            });
        }
    });

    Object.values(CONFIG_EXPEDITIONS).forEach(exp => {
        if (exp.imagePath) imagesToPreload.push(exp.imagePath);
    });

    const totalImages = imagesToPreload.length;
    let loadedCount = 0;

    const preloaderBar = document.getElementById('preloaderBar');
    const preloaderPercent = document.getElementById('preloaderPercent');
    const preloaderText = document.getElementById('preloaderText');
    const preloader = document.getElementById('preloader');

    function updateProgress() {
        loadedCount++;
        const percent = Math.floor((loadedCount / totalImages) * 100);
        preloaderBar.style.width = percent + '%';
        preloaderPercent.textContent = percent + '%';

        if (loadedCount >= totalImages) {
            preloaderText.textContent = 'Загрузка завершена!';
            setTimeout(hidePreloader, 300);
        }
    }

    function hidePreloader() {
        preloader.classList.add('hidden');
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }

    if (totalImages === 0) {
        hidePreloader();
        return;
    }

    preloaderText.textContent = 'Загрузка ресурсов...';

    imagesToPreload.forEach(src => {
        const img = new Image();
        img.onload = updateProgress;
        img.onerror = updateProgress;
        img.src = src;
    });
}

// Запуск приложения
function initializeApp() {
    // Запускаем прелоадер (импорты уже доступны)
    startPreloader();

    // Инициализируем игру
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