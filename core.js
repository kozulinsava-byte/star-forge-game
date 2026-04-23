// ========== CORE МОДУЛЬ: ЛОГИКА ИГРЫ ==========
import { CONFIG_ITEMS, CONFIG_GEODES, CONFIG_EXPEDITIONS, LEVELS, DEFAULT_STATE } from './config.js';
import { showToast, getGeodeStageImage, updateProfileUI, updateCollectionProgress, renderCurrentTab, renderExpeditionsTab, renderImageToElement, closeModal, showRewardPopup } from './ui.js';

// Проверка, запущены ли мы в Telegram
const isTelegram = !!window.Telegram?.WebApp;
const tg = window.Telegram?.WebApp;

// БЕЗОПАСНАЯ инициализация Telegram WebApp
if (tg) {
  try {
    tg.ready();
    tg.expand();
    
    // Эти методы могут не поддерживаться в старых версиях
    try { tg.setHeaderColor('#000000'); } catch(e) {}
    try { tg.setBackgroundColor('#000000'); } catch(e) {}
    
    // Настраиваем MainButton
    try {
      tg.MainButton.setText('ПРОДОЛЖИТЬ');
      tg.MainButton.hide();
    } catch(e) {}
  } catch(e) {
    console.warn('[StarForge] Telegram init error:', e);
  }
}

// Состояние игрока
export let playerState = {
  expeditions: {},
  geodes: {},
  ingots: {},
  discoveredSpecialGeodes: {},
  collectedArtifacts: {},
  minedStats: {},
  player: {},
  echoCooldowns: {},
  expeditionBonuses: {}
};

// Серийные номера для коллекционных слитков
const collectibleSerials = {};
let nextSerial = 1;

// Инициализация ingots и minedStats
Object.keys(CONFIG_ITEMS).forEach((k) => {
  DEFAULT_STATE.ingots[k] = 0;
  DEFAULT_STATE.minedStats[k] = 0;
});

// Флаг защиты от двойного открытия
let isOpeningGeode = false;

// ---------- ЗАГОТОВКА ДЛЯ УВЕДОМЛЕНИЙ БОТА ----------
export function sendBotNotification(message) {
  console.log('[StarForge Bot Notification]', message);
}

// ---------- EVENTS MANAGER ----------
export const eventsManager = {
  activeEvent: null,
  eventEndTime: null,
  
  getActiveEvent() {
    if (this.activeEvent && this.eventEndTime && Date.now() < this.eventEndTime) {
      return this.activeEvent;
    }
    return null;
  },
  
  getTimeLeft() {
    if (!this.eventEndTime) return '';
    const diff = Math.max(0, this.eventEndTime - Date.now());
    const m = Math.floor(diff / 60000);
    const s = Math.ceil((diff % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, '0')}`;
  },
  
  triggerEvent(eventId) {
    const events = {
      'mine_boost': { name: 'Обвал в Шахтах', description: 'Вся добыча в Шахтах удвоена! +100% XP', icon: '⛰️', xpMultiplier: 2 },
      'rich_vein': { name: 'Богатая жила', description: 'Шанс найти особую жеоду увеличен на 50%', icon: '💎', specialChanceBoost: 1.5 }
    };
    this.activeEvent = events[eventId] || events.mine_boost;
    this.eventEndTime = Date.now() + 3600000;
    showToast(`Ивент начался: ${this.activeEvent.name}!`, this.activeEvent.icon);
    saveGame();
    
    sendBotNotification(`🚀 Ивент "${this.activeEvent.name}" начался!`);
  }
};

// ---------- DEV-MENU ФУНКЦИИ ----------
export function devGiveXP() {
  playerState.player.xp += 1000000;
  while (playerState.player.level < LEVELS.length - 1 && playerState.player.xp >= LEVELS[playerState.player.level]) {
    playerState.player.level++;
  }
  updateProfileUI();
  updateCollectionProgress();
}

export function devGiveGeodes() {
  Object.keys(CONFIG_GEODES).forEach(geodeId => {
    playerState.geodes[geodeId] = (playerState.geodes[geodeId] || 0) + 10;
  });
}

export function devUnlockLocations() {
  playerState.player.level = Math.max(playerState.player.level, 10);
  updateProfileUI();
}

export function devResetGeodes() {
  Object.keys(CONFIG_GEODES).forEach(geodeId => {
    playerState.geodes[geodeId] = 10;
  });
}

// ---------- УТИЛИТЫ ----------
export function getSerialForCollectible(ingotId) {
  if (!collectibleSerials[ingotId]) {
    collectibleSerials[ingotId] = String(nextSerial++).padStart(3, '0');
  }
  return collectibleSerials[ingotId];
}

export function isLocationCompleted(locId) {
  const special = CONFIG_GEODES[`special_${locId}`];
  if (!special) return false;
  return special.possibleIngots.every((ingId) => playerState.ingots[ingId] > 0);
}

export function getExpeditionTimeLeft(expId) {
  const exp = playerState.expeditions[expId];
  if (!exp || !exp.active || !exp.endTime) return null;
  return Math.max(0, exp.endTime - Date.now());
}

export function addXP(amount) {
  const activeEvent = eventsManager.getActiveEvent();
  if (activeEvent?.xpMultiplier) {
    amount = Math.floor(amount * activeEvent.xpMultiplier);
  }
  playerState.player.xp += amount;
  while (playerState.player.level < LEVELS.length - 1 && playerState.player.xp >= LEVELS[playerState.player.level]) {
    playerState.player.level++;
    showToast(`🎉 Уровень ${playerState.player.level}!`, '⬆️');
    
    sendBotNotification(`⭐ Игрок достиг ${playerState.player.level} уровня!`);
  }
  updateProfileUI();
  updateCollectionProgress();
  saveGame();
}

export function sellIngot(ingotId) {
  const ingot = CONFIG_ITEMS[ingotId];
  if (ingot.isCollectible) {
    showToast('Коллекционные артефакты нельзя сдавать!', '⚠️');
    return;
  }
  if (playerState.ingots[ingotId] <= 0) {
    showToast('Нет слитков для сдачи!', '⚠️');
    return;
  }
  const count = playerState.ingots[ingotId];
  const xpEarned = ingot.sellValue * count;
  playerState.ingots[ingotId] = 0;
  addXP(xpEarned);
  saveGame();
  showToast(`Сдано ${count} ${ingot.name}! +${xpEarned} XP`, '💰');
  renderCurrentTab();
}

// ---------- УТИЛИЗАЦИЯ ОСОБЫХ ЖЕОД ----------
export function exchangeSpecialGeodeForXP(geodeId) {
  if (playerState.geodes[geodeId] <= 0) {
    showToast('Нет такой жеоды!', '⚠️');
    return;
  }
  
  const g = CONFIG_GEODES[geodeId];
  if (!g.isSpecial) return;
  
  const loc = g.location;
  const completed = isLocationCompleted(loc);
  
  if (!completed) {
    showToast('Сначала соберите все артефакты локации!', '⚠️');
    return;
  }
  
  playerState.geodes[geodeId]--;
  const xpGained = 800;
  addXP(xpGained);
  saveGame();
  showToast(`Жеода изучена! +${xpGained} XP`, '📚');
  renderCurrentTab();
}

// ---------- МИНИ-ИГРА "АКТИВНАЯ РАЗВЕДКА" ----------
let activeSignalGame = {
  active: false,
  expId: null,
  bonusType: null,
  points: [],
  collected: 0,
  totalPoints: 8,
  timer: 10,
  timerInterval: null,
  timeoutId: null
};

export function startSignalGame(expId, bonusType) {
  if (activeSignalGame.active) {
    cleanupSignalGame();
  }
  
  activeSignalGame.active = true;
  activeSignalGame.expId = expId;
  activeSignalGame.bonusType = bonusType;
  activeSignalGame.collected = 0;
  activeSignalGame.timer = 10;
  activeSignalGame.points = [];
  
  const overlay = document.getElementById('signalGameOverlay');
  const timerEl = document.getElementById('signalTimer');
  const counterEl = document.getElementById('signalCounter');
  const area = document.getElementById('signalGameArea');
  
  overlay.classList.add('active');
  timerEl.textContent = '10';
  counterEl.textContent = `Сигналов: 0 / 8`;
  area.innerHTML = '';
  
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      if (!activeSignalGame.active) return;
      createSignalPoint(area);
    }, i * 480);
  }
  
  activeSignalGame.timerInterval = setInterval(() => {
    if (!activeSignalGame.active) return;
    activeSignalGame.timer--;
    timerEl.textContent = activeSignalGame.timer;
    
    if (activeSignalGame.timer <= 0) {
      signalGameFail();
    }
  }, 1000);
  
  activeSignalGame.timeoutId = setTimeout(() => {
    if (activeSignalGame.active) {
      signalGameFail();
    }
  }, 10000);
}

function createSignalPoint(area) {
  if (!activeSignalGame.active) return;
  
  const point = document.createElement('div');
  point.className = 'signal-point';
  
  const x = Math.random() * (area.clientWidth - 60) + 30;
  const y = Math.random() * (area.clientHeight - 60) + 30;
  
  point.style.left = x + 'px';
  point.style.top = y + 'px';
  
  point.addEventListener('click', () => {
    if (!activeSignalGame.active) return;
    point.remove();
    activeSignalGame.collected++;
    document.getElementById('signalCounter').textContent = `Сигналов: ${activeSignalGame.collected} / 8`;
    
    if (activeSignalGame.collected >= 8) {
      signalGameSuccess();
    }
  });
  
  area.appendChild(point);
  activeSignalGame.points.push(point);
  
  setTimeout(() => {
    if (point.parentNode) {
      point.remove();
      activeSignalGame.points = activeSignalGame.points.filter(p => p !== point);
    }
  }, 2500);
}

function signalGameSuccess() {
  if (!activeSignalGame.active) return;
  
  const { expId, bonusType } = activeSignalGame;
  
  if (bonusType === 'echo') {
    applyEchoBonus(expId);
  } else if (bonusType === 'scan') {
    applyScanBonus(expId);
  }
  
  cleanupSignalGame();
  document.getElementById('signalGameOverlay').classList.remove('active');
  showToast('✅ Все сигналы пойманы! Бонус применён!', '📡');
}

function signalGameFail() {
  if (!activeSignalGame.active) return;
  
  const { expId } = activeSignalGame;
  
  playerState.echoCooldowns[expId] = Date.now() + 30000;
  saveGame();
  
  cleanupSignalGame();
  document.getElementById('signalGameOverlay').classList.remove('active');
  showToast('❌ Сбой системы... Разведка ушла на перезарядку', '📡');
}

function cleanupSignalGame() {
  if (activeSignalGame.timerInterval) {
    clearInterval(activeSignalGame.timerInterval);
  }
  if (activeSignalGame.timeoutId) {
    clearTimeout(activeSignalGame.timeoutId);
  }
  activeSignalGame.points.forEach(p => p.remove());
  activeSignalGame.active = false;
  activeSignalGame.expId = null;
  activeSignalGame.bonusType = null;
  activeSignalGame.points = [];
}

function applyEchoBonus(expId) {
  const exp = playerState.expeditions[expId];
  if (!exp || !exp.active) return;
  
  const reduction = Math.floor((exp.endTime - Date.now()) * 0.15);
  exp.endTime -= reduction;
  playerState.expeditionBonuses[expId] = 'echo';
  
  saveGame();
  showToast(`Время экспедиции сокращено на ${Math.floor(reduction / 1000)}с!`, '📡');
}

function applyScanBonus(expId) {
  const exp = playerState.expeditions[expId];
  if (!exp || !exp.active) return;
  
  exp.scanUsed = true;
  exp.specialChanceBoost = 1.2;
  playerState.expeditionBonuses[expId] = 'scan';
  
  saveGame();
  showToast('Глубинное сканирование активировано! +20% к шансу особой жеоды', '🔬');
}

// ---------- СИСТЕМА СОХРАНЕНИЙ (LOCALSTORAGE + TELEGRAM CLOUD STORAGE) ----------
export function saveGame() {
  const saveData = JSON.stringify({
    playerState,
    collectibleSerials,
    nextSerial,
    activeEvent: eventsManager.activeEvent,
    eventEndTime: eventsManager.eventEndTime
  });
  
  // Всегда сохраняем в localStorage как резерв
  try {
    localStorage.setItem('starforge_tg_v1', saveData);
  } catch (e) {}
  
  // Если мы в Telegram — пробуем сохранить в CloudStorage (может не поддерживаться)
  if (isTelegram && tg.CloudStorage) {
    try {
      tg.CloudStorage.setItem('starforge_save', saveData, (error) => {
        if (!error) {
          console.log('[StarForge] Saved to Telegram CloudStorage');
        }
      });
    } catch(e) {
      console.warn('[StarForge] CloudStorage not supported, using localStorage only');
    }
  }
}

function loadGame() {
  // Сначала пробуем загрузить из localStorage (быстрый старт)
  try {
    const localData = localStorage.getItem('starforge_tg_v1');
    if (localData) {
      applySaveData(JSON.parse(localData));
    }
  } catch (e) {}
  
  // Если мы в Telegram — пробуем загрузить из CloudStorage (может не поддерживаться)
  if (isTelegram && tg.CloudStorage) {
    try {
      tg.CloudStorage.getItem('starforge_save', (error, cloudData) => {
        if (!error && cloudData) {
          try {
            applySaveData(JSON.parse(cloudData));
            localStorage.setItem('starforge_tg_v1', cloudData);
            console.log('[StarForge] Loaded from Telegram CloudStorage');
            renderCurrentTab();
          } catch (e) {}
        }
      });
    } catch(e) {
      console.warn('[StarForge] CloudStorage not supported, using localStorage only');
    }
  }
}

function applySaveData(data) {
  if (data.playerState) {
    Object.assign(playerState, data.playerState);
    if (!playerState.echoCooldowns) playerState.echoCooldowns = {};
    if (!playerState.expeditionBonuses) playerState.expeditionBonuses = {};
  }
  if (data.collectibleSerials) Object.assign(collectibleSerials, data.collectibleSerials);
  if (data.nextSerial) nextSerial = data.nextSerial;
  if (data.activeEvent) eventsManager.activeEvent = data.activeEvent;
  if (data.eventEndTime) eventsManager.eventEndTime = data.eventEndTime;
}

export const saveToLocalStorage = saveGame;

export function initializeState() {
  playerState = JSON.parse(JSON.stringify(DEFAULT_STATE));
  playerState.echoCooldowns = {};
  playerState.expeditionBonuses = {};
  loadGame();
}

// ---------- ЭКСПЕДИЦИИ ----------
function getRandomDropFromExpedition(expId) {
  const exp = CONFIG_EXPEDITIONS[expId];
  if (!exp) return { geodeId: 'mine', isSpecial: false };
  
  const playerExp = playerState.expeditions[expId];
  let specialChance = exp.specialGeodeChance;
  
  if (playerExp?.scanUsed && playerExp?.specialChanceBoost) {
    specialChance *= playerExp.specialChanceBoost;
  }
  
  const activeEvent = eventsManager.getActiveEvent();
  if (activeEvent?.specialChanceBoost) {
    specialChance *= activeEvent.specialChanceBoost;
  }
  
  if (!isLocationCompleted(expId)) {
    const rand = Math.random();
    if (rand < specialChance) {
      return { geodeId: exp.specialGeodeId, isSpecial: true };
    }
  }
  return { geodeId: expId, isSpecial: false };
}

function checkCompletedExpeditions() {
  let changed = false;
  const now = Date.now();
  for (let k in playerState.expeditions) {
    const exp = playerState.expeditions[k];
    if (exp && exp.active && exp.endTime && now >= exp.endTime) {
      exp.active = false;
      exp.endTime = null;
      exp.scanUsed = false;
      exp.specialChanceBoost = null;
      delete playerState.expeditionBonuses[k];
      
      const drop = getRandomDropFromExpedition(k);
      if (drop.isSpecial) {
        if (!playerState.discoveredSpecialGeodes[k]) playerState.discoveredSpecialGeodes[k] = true;
        playerState.geodes[drop.geodeId] = (playerState.geodes[drop.geodeId] || 0) + 1;
        showToast(`Найдена особая жеода: ${CONFIG_GEODES[drop.geodeId].name}!`, CONFIG_GEODES[drop.geodeId].icon);
        
        sendBotNotification(`💎 Игрок нашёл особую жеоду: ${CONFIG_GEODES[drop.geodeId].name}!`);
      } else {
        playerState.geodes[drop.geodeId] = (playerState.geodes[drop.geodeId] || 0) + 1;
        showToast(`Экспедиция завершена! +1 ${CONFIG_GEODES[drop.geodeId].name}`, CONFIG_GEODES[drop.geodeId].icon);
      }
      changed = true;
    }
  }
  if (changed) {
    saveGame();
    renderCurrentTab();
  }
}

let globalTimerInterval = null;
export function startGlobalTimer() {
  if (globalTimerInterval) clearInterval(globalTimerInterval);
  globalTimerInterval = setInterval(() => {
    checkCompletedExpeditions();
    updateExpeditionTimers();
  }, 500);
}

function updateExpeditionTimers() {
  const now = Date.now();
  for (let k in CONFIG_EXPEDITIONS) {
    const exp = playerState.expeditions[k];
    const el = document.getElementById(`timer-${k}`);
    if (el && exp && exp.active && exp.endTime) {
      const diff = Math.max(0, exp.endTime - now);
      const m = Math.floor(diff / 60000);
      const s = Math.ceil((diff % 60000) / 1000);
      el.textContent = `⏳ ${m}:${s.toString().padStart(2, '0')}`;
    }
  }
}

export function startExpedition(expId) {
  const exp = playerState.expeditions[expId];
  if (!exp || exp.active) return;
  exp.active = true;
  exp.endTime = Date.now() + CONFIG_EXPEDITIONS[expId].timer * 1000;
  exp.scanUsed = false;
  exp.specialChanceBoost = null;
  delete playerState.expeditionBonuses[expId];
  saveGame();
  renderExpeditionsTab();
  showToast(`Экспедиция началась!`, CONFIG_EXPEDITIONS[expId].fallbackIcon);
  
  sendBotNotification(`⛏️ Игрок отправился в экспедицию: ${CONFIG_EXPEDITIONS[expId].name}`);
}

// ---------- ЧАСТИЦЫ И ТРЯСКА ----------
function createParticles(x, y) {
  const container = document.getElementById('app');
  const particleCount = 12;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    const angle = (i / particleCount) * Math.PI * 2;
    const distance = 40 + Math.random() * 60;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.setProperty('--tx', tx + 'px');
    particle.style.setProperty('--ty', ty + 'px');
    particle.style.background = `radial-gradient(circle, var(--particle-color), transparent)`;
    
    container.appendChild(particle);
    
    setTimeout(() => {
      particle.remove();
    }, 800);
  }
}

function createEliteParticles() {
  const container = document.getElementById('app');
  const particleCount = 16;
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'elite-particle';
    
    particle.style.left = centerX + 'px';
    particle.style.top = centerY + 'px';
    particle.style.animationDelay = (i * 0.1) + 's';
    
    container.appendChild(particle);
    
    setTimeout(() => {
      particle.remove();
    }, 2500);
  }
}

function triggerScreenShake() {
  const app = document.getElementById('app');
  app.classList.add('screen-shake');
  setTimeout(() => {
    app.classList.remove('screen-shake');
  }, 120);
}

// ---------- АНИМАЦИЯ ДЛЯ КОЛЛЕКЦИОНОК ----------
function showCollectibleAnimation(ingot) {
  const flash = document.createElement('div');
  flash.className = 'collectible-flash';
  document.body.appendChild(flash);
  
  createEliteParticles();
  
  const appear = document.createElement('div');
  appear.className = 'collectible-appear';
  
  const icon = document.createElement('div');
  icon.className = 'collectible-appear-icon';
  icon.textContent = ingot.icon;
  icon.style.color = ingot.fallbackColor;
  
  const text = document.createElement('div');
  text.className = 'collectible-appear-text';
  text.textContent = ingot.name;
  
  appear.appendChild(icon);
  appear.appendChild(text);
  document.body.appendChild(appear);
  
  setTimeout(() => {
    flash.remove();
    appear.remove();
  }, 2500);
  
  sendBotNotification(`🏆 Игрок получил коллекционный артефакт: ${ingot.name} ${ingot.icon}!`);
}

// ---------- КОНВЕЙЕР (СИНХРОНИЗИРОВАННЫЙ) ----------
const conveyorOverlay = document.getElementById('conveyorOverlay');
const conveyorTrack = document.getElementById('conveyorTrack');
const conveyorTitle = document.getElementById('conveyorTitle');

let conveyorState = {
  geodeId: null,
  isOpen: false,
  resultIngot: null,
  items: [],
  trackItems: [],
  timeoutId: null
};

const ITEM_WIDTH = 96;
const VISIBLE_ITEMS = 3;

function preloadConveyorImages(items) {
  items.forEach(item => {
    const img = new Image();
    img.src = item.imagePath;
  });
}

function cleanupConveyor() {
  if (conveyorState.timeoutId) {
    clearTimeout(conveyorState.timeoutId);
    conveyorState.timeoutId = null;
  }
  conveyorOverlay.classList.remove('active');
  conveyorState.isOpen = false;
}

export function initRoulette(geodeId) {
  const g = CONFIG_GEODES[geodeId];
  if (!g || g.isSpecial) return;
  
  const rand = Math.random();
  let cum = 0;
  let droppedId = g.lootTable[0].ingotId;
  for (let e of g.lootTable) {
    cum += e.chance;
    if (rand < cum) {
      droppedId = e.ingotId;
      break;
    }
  }
  
  const resultIngot = CONFIG_ITEMS[droppedId];
  const items = g.lootTable.map(e => CONFIG_ITEMS[e.ingotId]);
  
  preloadConveyorImages(items);
  
  const totalLength = 30;
  const trackItems = [];
  for (let i = 0; i < totalLength; i++) {
    trackItems.push(items[i % items.length]);
  }
  
  const targetSlot = 19;
  trackItems[targetSlot] = resultIngot;
  
  conveyorState.geodeId = geodeId;
  conveyorState.isOpen = true;
  conveyorState.resultIngot = resultIngot;
  conveyorState.items = items;
  conveyorState.trackItems = trackItems;
  
  conveyorTrack.innerHTML = '';
  trackItems.forEach((item, index) => {
    const itemEl = document.createElement('div');
    itemEl.className = 'conveyor-item';
    itemEl.innerHTML = `
      <div class="conveyor-item-icon" id="conv-${index}"></div>
      <div class="conveyor-item-name">${item.name}</div>
    `;
    conveyorTrack.appendChild(itemEl);
  });
  
  trackItems.forEach((item, index) => {
    const el = document.getElementById(`conv-${index}`);
    if (el) {
      renderImageToElement(el, item.imagePath, item.icon, item.fallbackColor);
    }
  });
  
  conveyorTitle.textContent = `Анализ ${g.name}...`;
  conveyorOverlay.classList.add('active');
  
  const stopPosition = -(targetSlot * ITEM_WIDTH) + (VISIBLE_ITEMS * ITEM_WIDTH / 2) - ITEM_WIDTH / 2;
  
  conveyorTrack.style.transition = 'none';
  conveyorTrack.style.transform = 'translateX(0)';
  conveyorTrack.offsetHeight;
  
  setTimeout(() => {
    conveyorTrack.style.transition = 'transform 4.5s cubic-bezier(0.2, 0, 0.1, 1)';
    conveyorTrack.style.transform = `translateX(${stopPosition}px)`;
  }, 50);
  
  conveyorState.timeoutId = setTimeout(() => {
    stopRoulette();
  }, 4550);
}

function stopRoulette() {
  if (!conveyorState.isOpen) {
    return;
  }
  
  const resultIngot = conveyorState.resultIngot;
  const g = CONFIG_GEODES[conveyorState.geodeId];
  
  let xpGained = g.xpValue + (resultIngot?.xpValue || 0);
  let isFirstDiscovery = false;
  
  if (playerState.minedStats[resultIngot.id] === 0) {
    isFirstDiscovery = true;
    xpGained = Math.floor(xpGained * 3);
    showToast(`🎉 ПЕРВОЕ ОТКРЫТИЕ! +${xpGained} XP`, '🌟');
  }
  
  playerState.ingots[resultIngot.id] = (playerState.ingots[resultIngot.id] || 0) + 1;
  playerState.minedStats[resultIngot.id] = (playerState.minedStats[resultIngot.id] || 0) + 1;
  playerState.player.totalIngots++;
  
  addXP(xpGained);
  saveGame();
  
  cleanupConveyor();
  isOpeningGeode = false;
  
  setTimeout(() => {
    showRewardPopup(resultIngot);
    renderCurrentTab();
  }, 100);
}

// ---------- КУЗНИЦА (BRAWL STARS) ----------
let brawlState = {
  geodeId: null,
  isSpecial: false,
  tapsRemaining: 10,
  isOpen: false
};

const brawlOverlay = document.getElementById('brawlOverlay');
const brawlGeode = document.getElementById('brawlGeode');
const brawlCounter = document.getElementById('brawlCounter');
const brawlResult = document.getElementById('brawlResult');
const brawlResultIcon = document.getElementById('brawlResultIcon');
const brawlResultName = document.getElementById('brawlResultName');
const brawlResultRarity = document.getElementById('brawlResultRarity');
const brawlCloseBtn = document.getElementById('brawlCloseBtn');

export function openBrawlOverlay(geodeId, isSpecial) {
  if (isOpeningGeode) {
    return;
  }
  
  if (playerState.geodes[geodeId] <= 0) {
    showToast('Нет такой жеоды!', '⚠️');
    return;
  }
  
  if (isSpecial) {
    const g = CONFIG_GEODES[geodeId];
    const completed = isLocationCompleted(g.location);
    if (completed) {
      showToast('Все артефакты собраны! Используйте "Изучить" для обмена на XP.', '📚');
      return;
    }
  }
  
  isOpeningGeode = true;
  
  brawlState.geodeId = geodeId;
  brawlState.isSpecial = isSpecial;
  brawlState.tapsRemaining = 10;
  brawlState.isOpen = true;

  brawlCounter.textContent = '10';
  brawlResult.classList.remove('show');
  brawlCloseBtn.style.display = 'none';
  brawlGeode.style.display = 'flex';
  brawlGeode.classList.remove('explode-animation');
  
  if (isSpecial) {
    brawlGeode.classList.add('special-geode');
  } else {
    brawlGeode.classList.remove('special-geode');
  }
  
  document.querySelector('.brawl-hint').style.display = 'block';
  brawlCounter.style.display = 'block';

  const stage = getGeodeStageImage(geodeId, 10);
  renderImageToElement(brawlGeode, stage.imagePath, stage.fallbackIcon, '#8B7355');
  brawlOverlay.classList.add('active');
}

function closeBrawlOverlay() {
  brawlOverlay.classList.remove('active');
  brawlState.isOpen = false;
  isOpeningGeode = false;
  renderCurrentTab();
}

function handleBrawlTap(e) {
  if (!brawlState.isOpen || brawlState.tapsRemaining <= 0) return;
  
  const rect = brawlGeode.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  createParticles(centerX, centerY);
  triggerScreenShake();
  
  brawlGeode.classList.add('shake-animation');
  setTimeout(() => brawlGeode.classList.remove('shake-animation'), 300);
  
  brawlState.tapsRemaining--;
  brawlCounter.textContent = brawlState.tapsRemaining;
  const stage = getGeodeStageImage(brawlState.geodeId, brawlState.tapsRemaining);
  renderImageToElement(brawlGeode, stage.imagePath, stage.fallbackIcon, '#8B7355');
  
  if (brawlState.tapsRemaining <= 0) finishBrawlOpening();
}

function finishBrawlOpening() {
  const geodeId = brawlState.geodeId;
  const isSpecial = brawlState.isSpecial;
  
  if (playerState.geodes[geodeId] > 0) {
    playerState.geodes[geodeId]--;
  }
  playerState.player.totalOpened++;

  let droppedIngot = null;
  let xpGained = 0;

  if (isSpecial) {
    const g = CONFIG_GEODES[geodeId];
    const loc = g.location;
    const available = g.possibleIngots.filter((ingId) => !playerState.collectedArtifacts[loc].includes(ingId));
    const picked = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : g.possibleIngots[0];
    droppedIngot = CONFIG_ITEMS[picked];
    
    playerState.ingots[picked] = (playerState.ingots[picked] || 0) + 1;
    playerState.minedStats[picked] = (playerState.minedStats[picked] || 0) + 1;
    if (!playerState.collectedArtifacts[loc].includes(picked)) {
      playerState.collectedArtifacts[loc].push(picked);
      playerState.player.totalArtifacts++;
    }
    if (!playerState.discoveredSpecialGeodes[loc]) playerState.discoveredSpecialGeodes[loc] = true;
    xpGained = droppedIngot.xpValue;
    
    addXP(xpGained);
    saveGame();
    
    const isFirstCollectible = droppedIngot.isCollectible && playerState.ingots[droppedIngot.id] === 1;
    if (droppedIngot.isCollectible && isFirstCollectible) {
      showCollectibleAnimation(droppedIngot);
    }
    
    brawlGeode.classList.add('explode-animation');
    brawlGeode.classList.remove('special-geode');
    document.querySelector('.brawl-hint').style.display = 'none';
    brawlCounter.style.display = 'none';
    
    setTimeout(() => {
      brawlGeode.style.display = 'none';
      renderImageToElement(brawlResultIcon, droppedIngot.imagePath, droppedIngot.icon, droppedIngot.fallbackColor);
      brawlResultName.textContent = droppedIngot.name;
      brawlResultRarity.textContent = droppedIngot.rarity;
      brawlResultRarity.style.color = droppedIngot.rarityClass === 'collectible' ? '#FF64FF' : 
                                      (droppedIngot.rarityClass === 'legendary' ? '#FFD700' : '#fff');
      brawlResult.classList.add('show');
      brawlCloseBtn.style.display = 'block';
      isOpeningGeode = false;
      renderCurrentTab();
    }, 500);
    
  } else {
    brawlGeode.classList.add('explode-animation');
    document.querySelector('.brawl-hint').style.display = 'none';
    brawlCounter.style.display = 'none';
    
    setTimeout(() => {
      brawlOverlay.classList.remove('active');
      brawlState.isOpen = false;
      initRoulette(geodeId);
    }, 500);
  }
}

brawlGeode.addEventListener('click', handleBrawlTap);
brawlCloseBtn.addEventListener('click', closeBrawlOverlay);