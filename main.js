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

// ---------- ПРЕЛОАДЕР С ПРИНУДИТЕЛЬНЫМ РЕНДЕРИНГОМ ----------
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

    // Создаём скрытый контейнер для принудительного рендеринга
    const renderContainer = document.createElement('div');
    renderContainer.style.cssText = 'position: fixed; left: -9999px; top: -9999px; width: 1px; height: 1px; overflow: hidden; pointer-events: none; z-index: -1;';
    document.body.appendChild(renderContainer);

    function updateProgress() {
        loadedCount++;
        const percent = Math.floor((loadedCount / totalImages) * 100);
        preloaderBar.style.width = percent + '%';
        preloaderPercent.textContent = percent + '%';

        if (loadedCount >= totalImages) {
            preloaderText.textContent = 'Загрузка завершена!';
            // Удаляем скрытый контейнер
            setTimeout(() => {
                renderContainer.remove();
            }, 100);
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
        img.onload = function () {
            // Принудительно рендерим картинку в DOM для кэширования
            const clonedImg = this.cloneNode();
            clonedImg.style.width = '1px';
            clonedImg.style.height = '1px';
            renderContainer.appendChild(clonedImg);
            // Удаляем через секунду, кэш уже сохранён
            setTimeout(() => {
                if (clonedImg.parentNode) clonedImg.remove();
            }, 1000);

            updateProgress();
        };
        img.onerror = function () {
            updateProgress();
        };
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