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

// ---------- ASSET MANAGER (PROMISE.ALL) ----------
function startPreloader() {
    const preloaderBar = document.getElementById('preloaderBar');
    const preloaderPercent = document.getElementById('preloaderPercent');
    const preloaderText = document.getElementById('preloaderText');
    const preloader = document.getElementById('preloader');

    // Собираем уникальные пути
    const assetPaths = new Set();

    Object.values(CONFIG_ITEMS).forEach(item => {
        if (item.imagePath) assetPaths.add(item.imagePath);
    });

    Object.values(CONFIG_GEODES).forEach(geode => {
        if (geode.stages) {
            geode.stages.forEach(stage => {
                if (stage.imagePath) assetPaths.add(stage.imagePath);
            });
        }
    });

    Object.values(CONFIG_EXPEDITIONS).forEach(exp => {
        if (exp.imagePath) assetPaths.add(exp.imagePath);
    });

    const pathsArray = [...assetPaths];
    const totalAssets = pathsArray.length;
    let loadedCount = 0;

    function updateProgress() {
        loadedCount++;
        const percent = Math.floor((loadedCount / totalAssets) * 100);
        preloaderBar.style.width = percent + '%';
        preloaderPercent.textContent = percent + '%';
    }

    function hidePreloader() {
        preloader.classList.add('hidden');
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }

    if (totalAssets === 0) {
        hidePreloader();
        return;
    }

    preloaderText.textContent = 'Загрузка ресурсов...';

    // Загружаем ВСЕ картинки параллельно через Promise.all
    const loadPromises = pathsArray.map(src => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                updateProgress();
                resolve({ src, success: true });
            };
            img.onerror = () => {
                updateProgress();
                console.warn('Asset not found:', src);
                resolve({ src, success: false });
            };
            img.src = src;
        });
    });

    Promise.all(loadPromises).then((results) => {
        // Предкэширование: вставляем загруженные картинки в DOM
        const cacheContainer = document.createElement('div');
        cacheContainer.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;';
        results.forEach(({ src, success }) => {
            if (success) {
                const img = document.createElement('img');
                img.src = src;
                cacheContainer.appendChild(img);
            }
        });
        document.body.appendChild(cacheContainer);

        preloaderText.textContent = 'Запуск...';

        // Удаляем кэш-контейнер через 2 секунды
        setTimeout(() => {
            cacheContainer.remove();
        }, 2000);

        // Запускаем игру
        setTimeout(() => {
            initializeGame();
            hidePreloader();
        }, 100);
    });
}

function initializeGame() {
    initializeState();
    startGlobalTimer();

    document.querySelectorAll('.tab-item').forEach((t) =>
        t.addEventListener('click', () => setActiveTab(t.dataset.tab))
    );

    setActiveTab('expeditions');
}

// Запуск
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startPreloader);
} else {
    startPreloader();
}