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

// ---------- ПРЕЛОАДЕР (БЫСТРЫЙ) ----------
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

    // Создаём скрытый контейнер для пакетного рендеринга
    const batchContainer = document.createElement('div');
    batchContainer.style.cssText = 'position: fixed; left: -9999px; top: -9999px; width: 1px; height: 1px; overflow: hidden; pointer-events: none; z-index: -1;';
    document.body.appendChild(batchContainer);

    // Рендерим все картинки разом через 2 секунды (когда они уже загружены)
    let batchTimeout;

    function updateProgress() {
        loadedCount++;
        const percent = Math.floor((loadedCount / totalImages) * 100);
        preloaderBar.style.width = percent + '%';
        preloaderPercent.textContent = percent + '%';

        if (loadedCount >= totalImages) {
            preloaderText.textContent = 'Оптимизация...';

            // Пакетный рендеринг всех картинок
            clearTimeout(batchTimeout);
            batchTimeout = setTimeout(() => {
                imagesToPreload.forEach(src => {
                    const img = document.createElement('img');
                    img.src = src;
                    img.style.width = '1px';
                    img.style.height = '1px';
                    batchContainer.appendChild(img);
                });

                // Удаляем контейнер через 2 секунды (кэш уже сохранён)
                setTimeout(() => {
                    batchContainer.remove();
                }, 2000);

                preloaderText.textContent = 'Загрузка завершена!';
                setTimeout(hidePreloader, 200);
            }, 100);
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
    preloaderBar.style.width = '5%';
    preloaderPercent.textContent = '5%';

    // Загружаем картинки параллельно
    imagesToPreload.forEach(src => {
        const img = new Image();
        img.onload = function () {
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

    // Инициализируем игру НЕМЕДЛЕННО, не ждём загрузки
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