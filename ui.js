// ========== UI МОДУЛЬ: ОТРИСОВКА ИНТЕРФЕЙСА ==========
import { CONFIG_ITEMS, CONFIG_GEODES, CONFIG_EXPEDITIONS, LEVELS, STATUSES } from './config.js';
import { playerState, getSerialForCollectible, isLocationCompleted, addXP, sellIngot, startExpedition, openBrawlOverlay, eventsManager, saveToLocalStorage, devGiveXP, devGiveGeodes, devUnlockLocations, devResetGeodes, startSignalGame, exchangeSpecialGeodeForXP } from './core.js';

// DOM-элементы
export const mainContent = document.getElementById('mainContent');
const showcaseOverlay = document.getElementById('showcaseOverlay');
const showcaseContent = document.getElementById('showcaseContent');
const modalOverlay = document.getElementById('modalOverlay');
const modalContent = document.getElementById('modalContent');

// Текущие вкладки
export let currentTab = 'expeditions';
export let inventorySubTab = 'geodes';
export let collectionSubTab = 'encyclopedia';

// ID интервала для живого таймера в модалке
let modalTimerInterval = null;

// ---------- ЛОГИКА ПЕРЕКЛЮЧЕНИЯ ТЕМЫ ----------
function initTheme() {
  const savedTheme = localStorage.getItem('starforge_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('starforge_theme', newTheme);
  const btn = document.getElementById('themeProfileBtn');
  if (btn) {
    btn.innerHTML = newTheme === 'dark' ? '🌙 Сменить тему (Светлая)' : '☀️ Сменить тему (Тёмная)';
  }
}

initTheme();

// ---------- УТИЛИТЫ РЕНДЕРИНГА ----------
export function renderImageToElement(el, src, fallbackIcon, fallbackColor) {
  if (!el) return;
  el.innerHTML = '';
  const img = document.createElement('img');
  img.src = src;
  img.alt = '';
  img.onerror = () => {
    img.style.display = 'none';
    const fb = document.createElement('span');
    fb.className = 'fallback-icon';
    fb.textContent = fallbackIcon;
    fb.style.color = fallbackColor || '#FFD700';
    el.appendChild(fb);
  };
  el.appendChild(img);
}

export function renderMysteryPlaceholder(el) {
  if (!el) return;
  el.innerHTML = '<div class="mystery-placeholder">?</div>';
}

export function getGeodeStageImage(geodeId, taps) {
  const g = CONFIG_GEODES[geodeId];
  if (!g) return { imagePath: '', fallbackIcon: '🪨' };
  for (let s of g.stages) {
    if (taps >= s.minTaps && taps <= s.maxTaps) {
      return { imagePath: s.imagePath, fallbackIcon: s.fallbackIcon };
    }
  }
  return { imagePath: g.stages[0].imagePath, fallbackIcon: g.stages[0].fallbackIcon };
}

export function showToast(msg, emoji = '✨') {
  const c = document.getElementById('toastContainer');
  if (!c) return;
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span>${emoji}</span> ${msg}`;
  c.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    setTimeout(() => t.remove(), 300);
  }, 3000);
}

// ---------- REWARD POPUP ----------
export function showRewardPopup(ingot) {
  const overlay = document.getElementById('rewardPopupOverlay');
  const iconEl = document.getElementById('rewardPopupIcon');
  const nameEl = document.getElementById('rewardPopupName');
  const closeBtn = document.getElementById('rewardPopupClose');
  
  renderImageToElement(iconEl, ingot.imagePath, ingot.icon, ingot.fallbackColor);
  nameEl.textContent = ingot.name;
  
  overlay.classList.add('active');
  
  const closeHandler = () => {
    overlay.classList.remove('active');
    closeBtn.removeEventListener('click', closeHandler);
  };
  closeBtn.addEventListener('click', closeHandler);
}

// ---------- SHOWCASE (ПОЛНОЭКРАННЫЙ ПРОСМОТР) ----------
export function openShowcase(ingotId, isMystery = false) {
  const ingot = CONFIG_ITEMS[ingotId];
  if (!ingot) return;
  
  const owned = playerState.ingots[ingotId] > 0;
  const discovered = playerState.minedStats[ingotId] > 0;
  
  let name = ingot.name;
  let desc = ingot.description;
  let rarity = ingot.rarity;
  let rarityClass = ingot.rarityClass;
  let idHtml = '';

  if (!discovered && !ingot.isCollectible) {
    name = 'Неизвестный материал';
    const locationName = CONFIG_EXPEDITIONS[ingot.location]?.name || 'неизвестной локации';
    desc = `Месторождение: ${locationName}`;
    rarity = '???';
    rarityClass = 'common';
    idHtml = `<div class="showcase-id"><span class="showcase-id-label">Статус</span><span class="showcase-id-value" style="color:var(--text-muted);">НЕ ИЗУЧЕН</span></div>`;
  } else if (!owned && ingot.isCollectible) {
    name = 'Неизвестный Артефакт';
    desc = ingot.location === 'mine' ? 'Глубины Шахт скрывают этот секрет.' : ingot.location === 'jungle' ? 'Джунгли ревностно охраняют эту тайну.' : 'Пояс Астероидов хранит это сокровище.';
    rarity = '???';
    rarityClass = 'common';
    idHtml = `<div class="showcase-id"><span class="showcase-id-label">Статус</span><span class="showcase-id-value" style="color:var(--text-muted);">НЕ ОТКРЫТ</span></div>`;
  } else {
    idHtml = ingot.isCollectible
      ? `<div class="showcase-serial"><span class="showcase-serial-label">Серийный номер</span><span class="showcase-serial-value">#${getSerialForCollectible(ingotId)}</span></div>`
      : `<div class="showcase-id"><span class="showcase-id-label">Добыто всего</span><span class="showcase-id-value">${playerState.minedStats[ingotId] || 0} ед.</span></div>`;
  }

  let html = `
    <div class="showcase-image ${ingot.glowClass}" id="showcaseImage"></div>
    <div class="showcase-info">
      <div class="showcase-name">${name}</div>
      <div class="showcase-rarity ${rarityClass}">${rarity}</div>
      ${idHtml}
      <div class="showcase-description">${desc}</div>
      <div class="showcase-count">${owned ? `В наличии: ${playerState.ingots[ingotId]} шт.` : 'Ещё не найден'}</div>
    </div>
  `;
  showcaseContent.innerHTML = html;
  const imgEl = document.getElementById('showcaseImage');
  
  if ((!discovered && !ingot.isCollectible) || (!owned && ingot.isCollectible)) {
    renderMysteryPlaceholder(imgEl);
    showcaseContent.style.opacity = '0.8';
  } else {
    renderImageToElement(imgEl, ingot.imagePath, ingot.icon, ingot.fallbackColor);
    showcaseContent.style.opacity = '1';
  }
  showcaseOverlay.classList.add('active');
}

export function closeShowcase() {
  showcaseOverlay.classList.remove('active');
}

// ---------- МОДАЛЬНЫЕ ОКНА ----------
export function openModal(html) {
  if (modalTimerInterval) {
    clearInterval(modalTimerInterval);
    modalTimerInterval = null;
  }
  modalContent.innerHTML = html;
  modalOverlay.classList.add('active');
  modalOverlay.onclick = (e) => {
    if (e.target === modalOverlay) closeModal();
  };
}

export function closeModal() {
  if (modalTimerInterval) {
    clearInterval(modalTimerInterval);
    modalTimerInterval = null;
  }
  modalOverlay.classList.remove('active');
  modalContent.innerHTML = '';
}

export function showGeodeModal(geodeId) {
  const g = CONFIG_GEODES[geodeId];
  if (!g) return;
  
  let lootHtml = '';
  if (g.isSpecial) {
    lootHtml = `<div style="text-align:center; padding:20px; color:var(--accent-gold);">✨ Гарантированно содержит один из коллекционных артефактов локации ✨</div>`;
  } else {
    g.lootTable.forEach((e) => {
      const ing = CONFIG_ITEMS[e.ingotId];
      lootHtml += `
        <div class="loot-row">
          <div class="loot-left">
            <div class="loot-icon" id="loot-${e.ingotId}"></div>
            <span>${ing.name}</span>
          </div>
          <div class="loot-chance">${Math.round(e.chance * 100)}%</div>
        </div>
      `;
    });
  }

  // ПРОВЕРКА: СОБРАНЫ ЛИ ВСЕ АРТЕФАКТЫ ЛОКАЦИИ ДЛЯ ОСОБОЙ ЖЕОДЫ
  let openButtonText = '🔓 РАСКОЛОТЬ ЖЕОДУ';
  
  if (g.isSpecial) {
    const loc = g.location;
    const completed = isLocationCompleted(loc);
    if (completed) {
      openButtonText = '📚 ИЗУЧИТЬ (Обменять на XP)';
    }
  }

  let html = `
    <div class="modal-header">
      <div class="modal-title">${g.name}</div>
      <button class="modal-close" onclick="document.dispatchEvent(new Event('closeModal'))">✕</button>
    </div>
    <div class="modal-content">
      <div class="modal-icon-large" id="modalGeodeImage"></div>
      <div class="modal-description">${g.description}</div>
      <div class="loot-table">
        <div style="margin-bottom:16px; font-weight:700;">${g.isSpecial ? 'Особая находка' : 'Возможная добыча'}</div>
        ${lootHtml}
      </div>
      <div style="margin:20px 0; color:var(--text-secondary);">В инвентаре: ${playerState.geodes[geodeId] || 0} шт.</div>
      <button class="btn" id="modalOpenGeodeBtn" data-geode="${geodeId}" data-special="${g.isSpecial}">${openButtonText}</button>
    </div>
  `;
  openModal(html);
  setTimeout(() => {
    renderImageToElement(document.getElementById('modalGeodeImage'), g.stages[0].imagePath, g.stages[0].fallbackIcon, '#8B7355');
    if (!g.isSpecial) {
      g.lootTable.forEach((e) => {
        const el = document.getElementById(`loot-${e.ingotId}`);
        if (el) {
          const ing = CONFIG_ITEMS[e.ingotId];
          renderImageToElement(el, ing.imagePath, ing.icon, ing.fallbackColor);
        }
      });
    }
    document.getElementById('modalOpenGeodeBtn').addEventListener('click', function () {
      closeModal();
      const isSpecial = this.dataset.special === 'true';
      const geodeId = this.dataset.geode;
      
      if (isSpecial) {
        const g = CONFIG_GEODES[geodeId];
        const completed = isLocationCompleted(g.location);
        if (completed) {
          exchangeSpecialGeodeForXP(geodeId);
        } else {
          openBrawlOverlay(geodeId, true);
        }
      } else {
        openBrawlOverlay(geodeId, false);
      }
    });
  }, 10);
}

function updateModalExpeditionTimer(expId) {
  const timerEl = document.getElementById('modalExpeditionTimer');
  const actionBtnEl = document.getElementById('modalExpeditionAction');
  if (!timerEl || !actionBtnEl) return;

  const exp = playerState.expeditions[expId];
  if (!exp || !exp.active || !exp.endTime) {
    actionBtnEl.innerHTML = `<button class="btn" id="modalStartExpedition" data-expedition="${expId}">⛏️ ОТПРАВИТЬСЯ</button>`;
    document.getElementById('modalStartExpedition')?.addEventListener('click', function () {
      startExpedition(this.dataset.expedition);
      closeModal();
    });
    return;
  }

  const now = Date.now();
  const diff = Math.max(0, exp.endTime - now);
  
  if (diff <= 0) {
    actionBtnEl.innerHTML = `<button class="btn" id="modalStartExpedition" data-expedition="${expId}">⛏️ ОТПРАВИТЬСЯ</button>`;
    document.getElementById('modalStartExpedition')?.addEventListener('click', function () {
      startExpedition(this.dataset.expedition);
      closeModal();
    });
    return;
  }

  const m = Math.floor(diff / 60000);
  const s = Math.ceil((diff % 60000) / 1000);
  timerEl.textContent = `⏳ Идёт: ${m}:${s.toString().padStart(2, '0')}`;
}

function showScoutChoiceModal(expId) {
  const html = `
    <div class="modal-header">
      <div class="modal-title">📡 Выберите разведку</div>
      <button class="modal-close" onclick="document.dispatchEvent(new Event('closeModal'))">✕</button>
    </div>
    <div class="modal-content">
      <div class="modal-description">Выберите один бонус для текущей экспедиции:</div>
      <button class="btn" id="chooseEcho-${expId}" style="margin-bottom:12px;">📡 Эхо-локатор (-15% времени)</button>
      <button class="btn" id="chooseScan-${expId}">🔬 Глубинное сканирование (+20% шанс Особой)</button>
    </div>
  `;
  
  openModal(html);
  
  document.getElementById(`chooseEcho-${expId}`).addEventListener('click', () => {
    closeModal();
    startSignalGame(expId, 'echo');
  });
  
  document.getElementById(`chooseScan-${expId}`).addEventListener('click', () => {
    closeModal();
    startSignalGame(expId, 'scan');
  });
}

export function showExpeditionInfoModal(expId) {
  const exp = CONFIG_EXPEDITIONS[expId];
  if (!exp) return;
  if (playerState.player.level < exp.requiredLevel) {
    showToast(`Требуется ${exp.requiredLevel} уровень!`, '🔒');
    return;
  }
  const act = playerState.expeditions[expId];
  const isActive = act && act.active;
  const completed = isLocationCompleted(expId);
  const special = CONFIG_GEODES[exp.specialGeodeId];
  const discovered = playerState.discoveredSpecialGeodes[expId];

  let specialText = '';
  if (completed) specialText = '✅ Все артефакты собраны';
  else if (discovered) specialText = `Особая находка: ${special.name} (${Math.round(exp.specialGeodeChance * 100)}%)`;
  else specialText = `Особая находка: ??? (${Math.round(exp.specialGeodeChance * 100)}%)`;

  let timerHtml = '';
  if (isActive && act.endTime) {
    const diff = Math.max(0, act.endTime - Date.now());
    const m = Math.floor(diff / 60000);
    const s = Math.ceil((diff % 60000) / 1000);
    timerHtml = `<div class="timer-badge" id="modalExpeditionTimer">⏳ Идёт: ${m}:${s.toString().padStart(2, '0')}</div>`;
  } else {
    timerHtml = `<div id="modalExpeditionTimer"></div>`;
  }

  let scoutButton = '';
  if (expId !== 'mine' && isActive) {
    const bonusUsed = playerState.expeditionBonuses && playerState.expeditionBonuses[expId] !== undefined;
    const echoCooldown = playerState.echoCooldowns?.[expId] || 0;
    const now = Date.now();
    const onCooldown = echoCooldown > now && !bonusUsed;
    const cooldownRemaining = onCooldown ? Math.ceil((echoCooldown - now) / 1000) : 0;
    
    scoutButton = `
      <div style="margin-top:16px;">
        <button class="btn" id="scoutBtn-${expId}" ${bonusUsed || onCooldown ? 'disabled' : ''}>
          ${bonusUsed ? '✅ Разведка проведена' : (onCooldown ? `⏳ Перезарядка ${cooldownRemaining}с` : '📡 РАЗВЕДКА')}
        </button>
      </div>
    `;
  }

  let actionBtn = '';
  if (isActive) {
    actionBtn = `<div id="modalExpeditionAction">${timerHtml}${scoutButton}</div>`;
  } else {
    actionBtn = `<div id="modalExpeditionAction"><button class="btn" id="modalStartExpedition" data-expedition="${expId}">⛏️ ОТПРАВИТЬСЯ</button></div>`;
  }

  let html = `
    <div class="modal-header">
      <div class="modal-title">${exp.name}</div>
      <button class="modal-close" onclick="document.dispatchEvent(new Event('closeModal'))">✕</button>
    </div>
    <div class="modal-content">
      <div class="modal-icon-large" id="modalExpeditionImage"></div>
      <div class="modal-description">${exp.description || 'Опасная, но прибыльная локация.'}</div>
      <div style="background:rgba(0,0,0,0.2); border-radius:24px; padding:18px; margin-bottom:24px;">
        <div style="display:flex; justify-content:space-between;">
          <span>⏱️ Время</span>
          <span style="color:var(--accent-gold);">${exp.timer} сек</span>
        </div>
        <div style="margin-top:12px; color:${completed ? '#50C878' : 'var(--accent-gold)'};">${specialText}</div>
      </div>
      ${actionBtn}
    </div>
  `;
  openModal(html);
  
  if (isActive) {
    modalTimerInterval = setInterval(() => {
      updateModalExpeditionTimer(expId);
    }, 500);
  }
  
  setTimeout(() => {
    renderImageToElement(document.getElementById('modalExpeditionImage'), exp.imagePath, exp.fallbackIcon, '#FFD700');
    const startBtn = document.getElementById('modalStartExpedition');
    if (startBtn) {
      startBtn.addEventListener('click', function () {
        startExpedition(this.dataset.expedition);
        closeModal();
      });
    }
    
    const scoutBtn = document.getElementById(`scoutBtn-${expId}`);
    if (scoutBtn) {
      scoutBtn.addEventListener('click', () => {
        showScoutChoiceModal(expId);
      });
    }
  }, 10);
}

// ---------- ОБНОВЛЕНИЕ UI ----------
export function updateProfileUI() {
  if (currentTab !== 'profile') return;
  const levelEl = document.getElementById('profileLevel');
  if (levelEl) levelEl.textContent = playerState.player.level;
  const xpFillEl = document.getElementById('xpFill');
  const xpTextEl = document.getElementById('xpText');
  if (xpFillEl && xpTextEl) {
    const currentXP = playerState.player.xp;
    const nextLevelXP = LEVELS[playerState.player.level] || LEVELS[LEVELS.length - 1];
    const prevLevelXP = LEVELS[playerState.player.level - 1] || 0;
    const progress = ((currentXP - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100;
    xpFillEl.style.width = `${Math.min(progress, 100)}%`;
    xpTextEl.textContent = `${currentXP} / ${nextLevelXP} XP`;
  }
  const statusEl = document.getElementById('profileStatus');
  if (statusEl) statusEl.textContent = STATUSES[Math.min(playerState.player.level - 1, STATUSES.length - 1)];
  const totalOpenedEl = document.getElementById('statOpened');
  if (totalOpenedEl) totalOpenedEl.textContent = playerState.player.totalOpened;
  const totalIngotsEl = document.getElementById('statIngots');
  if (totalIngotsEl) totalIngotsEl.textContent = playerState.player.totalIngots;
  const totalArtifactsEl = document.getElementById('statArtifacts');
  if (totalArtifactsEl) totalArtifactsEl.textContent = playerState.player.totalArtifacts;
}

export function updateCollectionProgress() {
  if (currentTab !== 'collection') return;
  const totalRegular = Object.values(CONFIG_ITEMS).filter((i) => !i.isCollectible).length;
  const discovered = Object.values(CONFIG_ITEMS).filter((i) => !i.isCollectible && playerState.minedStats[i.id] > 0).length;
  const percent = (discovered / totalRegular) * 100;
  const fillEl = document.getElementById('collectionProgressFill');
  const textEl = document.getElementById('collectionProgressText');
  if (fillEl) fillEl.style.width = `${percent}%`;
  if (textEl) textEl.textContent = `${discovered}/${totalRegular} открыто`;
}

// ---------- РЕНДЕРИНГ ВКЛАДОК ----------
export function renderProfileTab() {
  const userName = window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || 'Старатель';
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const themeBtnText = currentTheme === 'dark' ? '🌙 Сменить тему (Светлая)' : '☀️ Сменить тему (Тёмная)';
  
  let html = `
    <div class="section-title">👤 Профиль</div>
    <div class="card">
      <div class="profile-header">
        <div class="profile-avatar">👤</div>
        <div class="profile-info">
          <div class="profile-name">${userName}</div>
          <div class="profile-status" id="profileStatus">${STATUSES[Math.min(playerState.player.level - 1, STATUSES.length - 1)]}</div>
          <span class="level-badge" id="profileLevel">${playerState.player.level}</span> уровень
          <button class="dev-menu-btn" id="devMenuBtn">🛠️ DEV</button>
        </div>
      </div>
      <div class="xp-bar-container"><div class="xp-bar-fill" id="xpFill" style="width:0%"></div></div>
      <div class="xp-text" id="xpText">${playerState.player.xp} / ${LEVELS[playerState.player.level] || 15000} XP</div>
      
      <button class="theme-profile-btn" id="themeProfileBtn">${themeBtnText}</button>
      <button class="vip-button" id="vipButton">💎 АКТИВИРОВАТЬ VIP</button>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-value" id="statOpened">${playerState.player.totalOpened}</div><div class="stat-label">Открыто жеод</div></div>
        <div class="stat-card"><div class="stat-value" id="statIngots">${playerState.player.totalIngots}</div><div class="stat-label">Добыто слитков</div></div>
        <div class="stat-card"><div class="stat-value" id="statArtifacts">${playerState.player.totalArtifacts}</div><div class="stat-label">Артефактов</div></div>
      </div>
    </div>
    <div class="card sell-section"><div class="section-title">💰 Сбыт сырья</div>
  `;
  
  const availableIngots = Object.entries(playerState.ingots).filter(([k, v]) => v > 0 && !CONFIG_ITEMS[k].isCollectible);
  if (availableIngots.length === 0) {
    html += '<div class="empty-state">Нет ресурсов для сдачи</div>';
  } else {
    availableIngots.forEach(([k, v]) => {
      const ing = CONFIG_ITEMS[k];
      html += `
        <div class="resource-item">
          <div class="resource-info">
            <div class="resource-icon" id="sell-icon-${k}"></div>
            <div>
              <div class="resource-name">${ing.name}</div>
              <div class="resource-count">${v} шт. (+${ing.sellValue} XP/шт)</div>
            </div>
          </div>
          <button class="sell-btn" data-sell="${k}">Сдать всё</button>
        </div>
      `;
    });
  }
  html += '</div>';
  mainContent.innerHTML = html;

  availableIngots.forEach(([k]) => {
    const el = document.getElementById(`sell-icon-${k}`);
    if (el) {
      const ing = CONFIG_ITEMS[k];
      renderImageToElement(el, ing.imagePath, ing.icon, ing.fallbackColor);
    }
  });
  
  document.getElementById('themeProfileBtn').addEventListener('click', toggleTheme);
  document.querySelectorAll('[data-sell]').forEach((b) => b.addEventListener('click', () => sellIngot(b.dataset.sell)));
  document.getElementById('vipButton').addEventListener('click', () => showToast('Оплата через Crypto Bot скоро будет доступна', '💎'));
  
  // DEV-MENU
  document.getElementById('devMenuBtn').addEventListener('click', () => {
    devGiveXP();
    devGiveGeodes();
    devUnlockLocations();
    devResetGeodes();
    saveToLocalStorage();
    showToast('DEV: XP, жеоды, локации и сброс!', '🛠️');
    setTimeout(() => renderProfileTab(), 100);
  });
  
  updateProfileUI();
}

export function renderExpeditionsTab() {
  let html = '<div class="section-title">⛏️ Экспедиции</div>';
  for (let k in CONFIG_EXPEDITIONS) {
    const exp = CONFIG_EXPEDITIONS[k];
    const act = playerState.expeditions[k] || { active: false };
    const isLocked = playerState.player.level < exp.requiredLevel;
    let timerHtml = '';
    if (isLocked) {
      timerHtml = `<span class="lock-icon">🔒</span> <span style="color:var(--text-muted);">Ур. ${exp.requiredLevel}</span>`;
    } else if (act.active && act.endTime) {
      const diff = Math.max(0, act.endTime - Date.now());
      const m = Math.floor(diff / 60000);
      const s = Math.ceil((diff % 60000) / 1000);
      timerHtml = `<div class="timer-badge" id="timer-${k}">⏳ ${m}:${s.toString().padStart(2, '0')}</div>`;
    } else {
      timerHtml = `<button class="small-btn" data-info-exp="${k}">Подробнее</button>`;
    }
    html += `
      <div class="card">
        <div class="expedition-item ${isLocked ? 'locked' : ''}" data-expedition-click="${k}">
          <div class="expedition-info">
            <div class="expedition-icon" id="expedition-icon-${k}"></div>
            <div class="expedition-text">
              <h3>${exp.name} ${isLocked ? '🔒' : ''}</h3>
              <p>⏱️ ${exp.timer} сек</p>
            </div>
          </div>
          <div class="expedition-action">${timerHtml}</div>
        </div>
      </div>
    `;
  }
  mainContent.innerHTML = html;
  for (let k in CONFIG_EXPEDITIONS) {
    renderImageToElement(document.getElementById(`expedition-icon-${k}`), CONFIG_EXPEDITIONS[k].imagePath, CONFIG_EXPEDITIONS[k].fallbackIcon, '#FFD700');
  }
  document.querySelectorAll('[data-expedition-click]').forEach((el) =>
    el.addEventListener('click', function (e) {
      const key = this.dataset.expeditionClick;
      if (playerState.player.level < CONFIG_EXPEDITIONS[key].requiredLevel) {
        showToast(`Требуется ${CONFIG_EXPEDITIONS[key].requiredLevel} уровень!`, '🔒');
        return;
      }
      if (!e.target.classList.contains('small-btn')) showExpeditionInfoModal(key);
    })
  );
  document.querySelectorAll('[data-info-exp]').forEach((btn) =>
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      showExpeditionInfoModal(btn.dataset.infoExp);
    })
  );
}

export function renderInventoryTab() {
  let html = `
    <div class="section-title">🎒 Инвентарь</div>
    <div class="inventory-subtabs">
      <button class="subtab-btn ${inventorySubTab === 'geodes' ? 'active' : ''}" data-subtab="geodes">🪨 Жеоды</button>
      <button class="subtab-btn ${inventorySubTab === 'ingots' ? 'active' : ''}" data-subtab="ingots">✨ Слитки</button>
    </div>
  `;
  if (inventorySubTab === 'geodes') {
    const items = Object.entries(playerState.geodes).filter(([_, c]) => c > 0);
    if (!items.length) {
      html += '<div class="empty-state">Нет жеод. Отправьте экспедицию.</div>';
    } else {
      html += '<div class="grid-container">';
      items.forEach(([k, c]) => {
        const g = CONFIG_GEODES[k];
        html += `
          <div class="collection-card" data-geode="${k}">
            <div class="card-icon" id="inv-geode-${k}"></div>
            <div class="card-name">${g.name}</div>
            <div class="card-count-badge">${c} шт.</div>
          </div>
        `;
      });
      html += '</div>';
    }
  } else {
    const items = Object.entries(playerState.ingots).filter(([k, c]) => c > 0 && !CONFIG_ITEMS[k].isCollectible);
    if (!items.length) {
      html += '<div class="empty-state">Нет слитков. Откройте жеоды.</div>';
    } else {
      html += '<div class="grid-container">';
      items.forEach(([k, c]) => {
        const ing = CONFIG_ITEMS[k];
        html += `
          <div class="collection-card" data-ingot="${k}">
            <div class="card-icon" id="inv-ingot-${k}"></div>
            <div class="card-name">${ing.name}</div>
            <div class="card-count-badge">${c} шт.</div>
          </div>
        `;
      });
      html += '</div>';
    }
  }
  mainContent.innerHTML = html;

  if (inventorySubTab === 'geodes') {
    for (let k in CONFIG_GEODES) {
      const el = document.getElementById(`inv-geode-${k}`);
      if (el && playerState.geodes[k] > 0) {
        renderImageToElement(el, CONFIG_GEODES[k].stages[0].imagePath, CONFIG_GEODES[k].stages[0].fallbackIcon, '#8B7355');
      }
    }
  } else {
    for (let k in CONFIG_ITEMS) {
      if (CONFIG_ITEMS[k].isCollectible) continue;
      const el = document.getElementById(`inv-ingot-${k}`);
      if (el && playerState.ingots[k] > 0) {
        renderImageToElement(el, CONFIG_ITEMS[k].imagePath, CONFIG_ITEMS[k].icon, CONFIG_ITEMS[k].fallbackColor);
      }
    }
  }

  document.querySelectorAll('[data-subtab]').forEach((b) =>
    b.addEventListener('click', () => {
      inventorySubTab = b.dataset.subtab;
      renderInventoryTab();
    })
  );
  document.querySelectorAll('[data-geode]').forEach((c) => c.addEventListener('click', () => showGeodeModal(c.dataset.geode)));
  document.querySelectorAll('[data-ingot]').forEach((c) => c.addEventListener('click', () => openShowcase(c.dataset.ingot)));
}

export function renderCollectionTab() {
  const totalRegular = Object.values(CONFIG_ITEMS).filter((i) => !i.isCollectible).length;
  const discovered = Object.values(CONFIG_ITEMS).filter((i) => !i.isCollectible && playerState.minedStats[i.id] > 0).length;
  const percent = (discovered / totalRegular) * 100;

  let html = `
    <div class="section-title">📦 Коллекция</div>
    <div class="collection-progress">
      <div class="progress-bar-container">
        <div class="progress-bar-fill" id="collectionProgressFill" style="width:${percent}%"></div>
      </div>
      <div class="progress-text" id="collectionProgressText">${discovered}/${totalRegular} открыто</div>
    </div>
    <div class="inventory-subtabs">
      <button class="subtab-btn ${collectionSubTab === 'encyclopedia' ? 'active' : ''}" data-subtab="encyclopedia">📚 Энциклопедия</button>
      <button class="subtab-btn ${collectionSubTab === 'halloffame' ? 'active' : ''}" data-subtab="halloffame">🏆 Зал Славы</button>
    </div>
  `;

  if (collectionSubTab === 'encyclopedia') {
    const regularIngots = Object.values(CONFIG_ITEMS).filter((i) => !i.isCollectible);
    html += '<div class="grid-container">';
    regularIngots.forEach((ing) => {
      const discovered = playerState.minedStats[ing.id] > 0;
      const cardClass = discovered ? 'collection-card' : 'collection-card silhouette';
      html += `
        <div class="${cardClass}" data-ingot="${ing.id}">
          <div class="card-icon" id="enc-${ing.id}"></div>
          <div class="card-name">${discovered ? ing.name : 'Неизвестный материал'}</div>
          <div class="card-count-badge">${discovered ? `Добыто: ${playerState.minedStats[ing.id]}` : '???'}</div>
        </div>
      `;
    });
    html += '</div>';
    mainContent.innerHTML = html;
    regularIngots.forEach((ing) => {
      const el = document.getElementById(`enc-${ing.id}`);
      if (el) {
        if (playerState.minedStats[ing.id] > 0) {
          renderImageToElement(el, ing.imagePath, ing.icon, ing.fallbackColor);
        } else {
          renderMysteryPlaceholder(el);
        }
      }
    });
  } else {
    const coll = Object.values(CONFIG_ITEMS).filter((i) => i.isCollectible);
    html += '<div class="grid-container">';
    coll.forEach((ing) => {
      const owned = playerState.ingots[ing.id] > 0;
      html += `
        <div class="collection-card ${owned ? '' : 'silhouette'}" data-ingot="${ing.id}">
          <div class="card-icon" id="hall-${ing.id}"></div>
          <div class="card-name">${owned ? ing.name : '???'}</div>
          <div class="card-count-badge">${owned ? '★ Найдено' : 'Неизвестно'}</div>
        </div>
      `;
    });
    html += '</div>';
    mainContent.innerHTML = html;
    coll.forEach((ing) => {
      const el = document.getElementById(`hall-${ing.id}`);
      if (el) {
        if (playerState.ingots[ing.id] > 0) {
          renderImageToElement(el, ing.imagePath, ing.icon, ing.fallbackColor);
        } else {
          renderMysteryPlaceholder(el);
        }
      }
    });
  }

  document.querySelectorAll('[data-subtab]').forEach((b) =>
    b.addEventListener('click', () => {
      collectionSubTab = b.dataset.subtab;
      renderCollectionTab();
    })
  );
  document.querySelectorAll('[data-ingot]').forEach((c) =>
    c.addEventListener('click', () => {
      const ing = CONFIG_ITEMS[c.dataset.ingot];
      openShowcase(c.dataset.ingot, !playerState.minedStats[ing.id] && !ing.isCollectible);
    })
  );
}

export function renderEventsTab() {
  const activeEvent = eventsManager.getActiveEvent();
  let html = '<div class="section-title">📡 Ивенты</div>';
  
  if (activeEvent) {
    html += `
      <div class="card">
        <div class="event-icon">${activeEvent.icon}</div>
        <div class="event-title" style="color:var(--accent-gold);">${activeEvent.name}</div>
        <div class="event-desc">${activeEvent.description}</div>
        <div class="event-desc" style="margin-top:12px;">Осталось: ${eventsManager.getTimeLeft()}</div>
      </div>
    `;
  } else {
    html += `
      <div class="event-placeholder">
        <div class="event-icon">🛰️</div>
        <div class="event-title">Сигналов не обнаружено</div>
        <div class="event-desc">Ожидайте данные со спутника. События появляются случайным образом.</div>
      </div>
    `;
  }
  
  mainContent.innerHTML = html;
}

export function renderCurrentTab() {
  if (currentTab === 'expeditions') renderExpeditionsTab();
  else if (currentTab === 'inventory') renderInventoryTab();
  else if (currentTab === 'collection') renderCollectionTab();
  else if (currentTab === 'events') renderEventsTab();
  else if (currentTab === 'profile') renderProfileTab();
}

export function setActiveTab(tabId) {
  currentTab = tabId;
  document.querySelectorAll('.tab-item').forEach((b) => b.classList.toggle('active', b.dataset.tab === tabId));
  renderCurrentTab();
}