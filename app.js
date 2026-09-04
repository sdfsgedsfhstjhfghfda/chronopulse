/**
 * ChronoPulse - Professional Precision Stopwatch, Timer, Live Clock & Global 1v1 VS Arena
 * Worldwide Real-Time Multiplayer Sync via Public Global Cloud Relay + BroadcastChannel
 */

/* ==========================================================================
   0. GÜVENLİK VE KOD KORUMA KATMANI (ANTI-INSPECT & DEVTOOLS BLOCKER)
   ========================================================================== */
(function initCodeProtection() {
  // 1. Sağ tık (Context Menu) Engelleme
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });

  // 2. Kısayol Tuş Kombinasyonlarını Engelleme (F12, Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+S)
  document.addEventListener('keydown', (e) => {
    // F12 tuşu
    if (e.keyCode === 123 || e.key === 'F12') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+Shift+I (İncele), Ctrl+Shift+J (Konsol), Ctrl+Shift+C (Öğe Seç)
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+U (Kaynağı Görüntüle), Ctrl+S (Sayfayı Kaydet)
    if (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, true);

  // 3. Konsol Güvenlik Uyarısı
  try {
    const warningTitle = 'font-size: 32px; font-weight: 900; color: #ef4444; text-shadow: 0 0 10px rgba(239,68,68,0.8);';
    const warningBody = 'font-size: 13px; font-weight: bold; color: #cbd5e1;';
    console.log('%c⚠️ DİKKAT!', warningTitle);
    console.log('%cChronoPulse kodları fikri mülkiyet koruması altındadır. Kodların kopyalanması, tersine mühendislik yapılması veya yetkisiz çoğaltılması yasaktır.', warningBody);
  } catch (err) {}
})();

// Initialize Lucide Icons
lucide.createIcons();

/* ==========================================================================
   1. SOUND ENGINE (Web Audio API)
   ========================================================================== */
class SoundEngine {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBeep(freq = 440, type = 'sine', duration = 0.08, gainVal = 0.15) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  playStart() {
    this.playBeep(587.33, 'sine', 0.1, 0.2);
    setTimeout(() => this.playBeep(880, 'triangle', 0.15, 0.2), 60);
  }

  playStop() {
    this.playBeep(440, 'sine', 0.1, 0.2);
  }

  playMegaVictory() {
    if (!this.enabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playBeep(freq, 'triangle', 0.35, 0.3);
      }, idx * 100);
    });
  }

  playVictory() {
    if (!this.enabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playBeep(freq, 'triangle', 0.25, 0.25);
      }, idx * 100);
    });
  }

  playGood() {
    if (!this.enabled) return;
    const notes = [440, 554.37, 659.25];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playBeep(freq, 'sine', 0.2, 0.2);
      }, idx * 80);
    });
  }

  playTimerAlarm() {
    if (!this.enabled) return;
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        this.playBeep(987.77, 'square', 0.12, 0.2);
        setTimeout(() => this.playBeep(1318.51, 'square', 0.18, 0.2), 120);
      }, i * 350);
    }
  }

  playChallengeInvite() {
    if (!this.enabled) return;
    this.playBeep(523.25, 'triangle', 0.15, 0.3);
    setTimeout(() => this.playBeep(659.25, 'triangle', 0.15, 0.3), 120);
    setTimeout(() => this.playBeep(783.99, 'triangle', 0.25, 0.35), 240);
  }
}

const sounds = new SoundEngine();

const soundToggleBtn = document.getElementById('soundToggleBtn');
const soundIcon = document.getElementById('soundIcon');
soundToggleBtn.addEventListener('click', () => {
  sounds.enabled = !sounds.enabled;
  if (sounds.enabled) {
    soundIcon.setAttribute('data-lucide', 'volume-2');
    soundToggleBtn.classList.remove('opacity-50');
  } else {
    soundIcon.setAttribute('data-lucide', 'volume-x');
    soundToggleBtn.classList.add('opacity-50');
  }
  lucide.createIcons();
});

const fullscreenBtn = document.getElementById('fullscreenBtn');
if (fullscreenBtn) {
  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });
}

/* ==========================================================================
   2. TAB NAVIGATION
   ========================================================================== */
const navTabs = document.querySelectorAll('.nav-tab');
const tabContents = document.querySelectorAll('.tab-content');

navTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    navTabs.forEach(t => {
      t.classList.remove('active', 'text-slate-100');
      t.classList.add('text-slate-400');
    });
    tabContents.forEach(c => c.classList.add('hidden'));

    tab.classList.add('active', 'text-slate-100');
    tab.classList.remove('text-slate-400');
    const targetId = tab.getAttribute('data-target');
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      targetEl.classList.remove('hidden');
    }
    sounds.playBeep(400, 'sine', 0.05, 0.05);
  });
});

/* ==========================================================================
   3. KRONOMETRE & HEDEF MODU (STRICT 2-DIGIT 00.00.00 ENGINE)
   ========================================================================== */
let swIsRunning = false;
let swStartTime = 0;
let swElapsedTime = 0;
let swRafId = null;
let historyLaps = [];

const swPart1 = document.getElementById('swPart1');
const swPart2 = document.getElementById('swPart2');
const swPart3 = document.getElementById('swPart3');

const mainActionBtn = document.getElementById('mainActionBtn');
const btnIcon = document.getElementById('btnIcon');
const btnText = document.getElementById('btnText');
const lapBtn = document.getElementById('lapBtn');
const resetBtn = document.getElementById('resetBtn');

const targetMainValue = document.getElementById('targetMainValue');
const targetDotSeparator = document.getElementById('targetDotSeparator');
const targetSubValue = document.getElementById('targetSubValue');
const unitBtns = document.querySelectorAll('.unit-btn');
const activeTargetLabel = document.getElementById('activeTargetLabel');
const chronoGlow = document.getElementById('chronoGlow');

const resultCard = document.getElementById('resultCard');
const resultTitle = document.getElementById('resultTitle');
const resultDesc = document.getElementById('resultDesc');
const resultBadgeIcon = document.getElementById('resultBadgeIcon');
const rankBadge = document.getElementById('rankBadge');
const resTarget = document.getElementById('resTarget');
const resActual = document.getElementById('resActual');
const resDiff = document.getElementById('resDiff');

const lapsContainer = document.getElementById('lapsContainer');
const lapsList = document.getElementById('lapsList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

let currentUnit = 'second';

function updateTargetLabel() {
  const mainVal = Math.max(0, parseInt(targetMainValue.value) || 0);
  const subVal = Math.max(0, parseInt(targetSubValue.value) || 0);
  
  targetMainValue.value = mainVal;
  targetSubValue.value = String(subVal).padStart(2, '0');

  let formattedTarget = '';

  if (currentUnit === 'second') {
    targetDotSeparator.classList.remove('hidden');
    targetSubValue.classList.remove('hidden');
    targetSubValue.max = '99';
    targetSubValue.placeholder = 'ms';

    const m = String(Math.floor(mainVal / 60)).padStart(2, '0');
    const s = String(mainVal % 60).padStart(2, '0');
    const ms = String(subVal % 100).padStart(2, '0');
    formattedTarget = `${m}.${s}.${ms} (${mainVal}.${ms} Saniye)`;

  } else if (currentUnit === 'millisecond') {
    targetDotSeparator.classList.add('hidden');
    targetSubValue.classList.add('hidden');

    const s = String(Math.floor(mainVal / 100)).padStart(2, '0');
    const ms = String(mainVal % 100).padStart(2, '0');
    formattedTarget = `00.${s}.${ms} (${mainVal} Milisaniye)`;

  } else if (currentUnit === 'hour') {
    targetDotSeparator.classList.remove('hidden');
    targetSubValue.classList.remove('hidden');
    targetSubValue.max = '59';
    targetSubValue.placeholder = 'dk';

    const h = String(mainVal).padStart(2, '0');
    const m = String(subVal % 60).padStart(2, '0');
    formattedTarget = `${h}.${m}.00 (${mainVal}.${m} Saat)`;
  }

  activeTargetLabel.textContent = formattedTarget;
}

unitBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    unitBtns.forEach(b => {
      b.classList.remove('active', 'bg-brand-500', 'text-slate-950');
      b.classList.add('text-slate-400');
    });
    btn.classList.add('active', 'bg-brand-500', 'text-slate-950');
    btn.classList.remove('text-slate-400');
    currentUnit = btn.getAttribute('data-unit');
    updateTargetLabel();
    sounds.playBeep(500, 'sine', 0.04, 0.1);
  });
});

targetMainValue.addEventListener('input', updateTargetLabel);
targetSubValue.addEventListener('input', updateTargetLabel);

function get2DigitTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const seconds = totalSeconds % 60;
  const ms2 = Math.floor((ms % 1000) / 10);

  return {
    m: minutes,
    s: seconds,
    ms2: ms2,
    strM: String(minutes).padStart(2, '0'),
    strS: String(seconds).padStart(2, '0'),
    strMs: String(ms2).padStart(2, '0'),
    formatted: `${String(minutes).padStart(2, '0')}.${String(seconds).padStart(2, '0')}.${String(ms2).padStart(2, '0')}`
  };
}

function renderStopwatch(timeMs) {
  const { strM, strS, strMs } = get2DigitTime(timeMs);
  swPart1.textContent = strM;
  swPart2.textContent = strS;
  swPart3.textContent = strMs;
}

function updateStopwatch() {
  swElapsedTime = performance.now() - swStartTime;
  renderStopwatch(swElapsedTime);
  swRafId = requestAnimationFrame(updateStopwatch);
}

function startStopwatch() {
  if (swIsRunning) return;
  sounds.init();
  sounds.playStart();

  swIsRunning = true;
  swStartTime = performance.now() - swElapsedTime;
  swRafId = requestAnimationFrame(updateStopwatch);

  mainActionBtn.classList.add('running');
  btnText.textContent = 'DURDUR';
  btnIcon.setAttribute('data-lucide', 'square');
  lapBtn.disabled = false;
  chronoGlow.classList.remove('bg-brand-500/5');
  chronoGlow.classList.add('bg-red-500/15');

  resultCard.classList.add('hidden');
  lucide.createIcons();
}

function evaluateResult(elapsedMs) {
  const mainVal = Math.max(0, parseInt(targetMainValue.value) || 0);
  const subVal = Math.max(0, parseInt(targetSubValue.value) || 0);
  const { m, s, ms2, formatted } = get2DigitTime(elapsedMs);

  let targetFormatted = '';
  let actualFormatted = formatted;
  let diff = 0;
  let unitSuffix = 'ms';
  let diffText = '';
  let rank = '';
  let title = '';
  let desc = '';
  let badgeClass = '';
  let borderClass = '';
  let icon = '';

  if (currentUnit === 'second') {
    const actualUnits = (m * 60 + s) * 100 + ms2;
    const targetUnits = mainVal * 100 + (subVal % 100);
    const rawDiff = actualUnits - targetUnits;
    diff = Math.abs(rawDiff);
    unitSuffix = 'ms';

    const tm = String(Math.floor(mainVal / 60)).padStart(2, '0');
    const ts = String(mainVal % 60).padStart(2, '0');
    const tms = String(subVal % 100).padStart(2, '0');
    targetFormatted = `${tm}.${ts}.${tms}`;

    const sign = rawDiff >= 0 ? '+' : '-';
    diffText = `${sign}${diff} ms`;

  } else if (currentUnit === 'millisecond') {
    const actualUnits = (m * 60 + s) * 100 + ms2;
    const targetUnits = mainVal;
    const rawDiff = actualUnits - targetUnits;
    diff = Math.abs(rawDiff);
    unitSuffix = 'ms';

    const ts = String(Math.floor(mainVal / 100)).padStart(2, '0');
    const tms = String(mainVal % 100).padStart(2, '0');
    targetFormatted = `00.${ts}.${tms}`;

    const sign = rawDiff >= 0 ? '+' : '-';
    diffText = `${sign}${diff} ms`;

  } else if (currentUnit === 'hour') {
    const actualSeconds = m * 60 + s;
    const targetSeconds = mainVal * 3600 + (subVal % 60) * 60;
    const rawDiff = actualSeconds - targetSeconds;
    diff = Math.abs(rawDiff);
    unitSuffix = 'sn';

    const th = String(mainVal).padStart(2, '0');
    const tm = String(subVal % 60).padStart(2, '0');
    targetFormatted = `${th}.${tm}.00`;

    const sign = rawDiff >= 0 ? '+' : '-';
    diffText = `${sign}${diff} sn`;
  }

  if (diff === 0) {
    rank = 'EFSANEVİ (0 FARK)';
    title = 'BETTER THAN TİMİ??';
    desc = `👑 İNANILMAZ REKOR! Tam 0 ${unitSuffix} farkla durdurdun! Resmi olarak TİMİ'den daha iyisin!`;
    badgeClass = 'badge-better';
    borderClass = 'border-better';
    icon = '🏆';
    sounds.playMegaVictory();
    triggerMegaConfetti();
  } else if (diff >= 1 && diff <= 4) {
    rank = 'MÜKEMMEL';
    title = 'TİMİ';
    desc = `👑 Kusursuz zamanlama! Fark sadece ${diff} ${unitSuffix}. Sen bir TİMİ'sin!`;
    badgeClass = 'badge-timi';
    borderClass = 'border-timi';
    icon = '👑';
    sounds.playVictory();
    triggerConfetti();
  } else if (diff >= 5 && diff <= 10) {
    rank = 'HARİKA';
    title = 'REALLY GOOD';
    desc = `⚡ Çok iyi refleks! Fark sadece ${diff} ${unitSuffix}.`;
    badgeClass = 'badge-good';
    borderClass = 'border-good';
    icon = '⚡';
    sounds.playGood();
  } else if (diff >= 11 && diff <= 15) {
    rank = 'ORTA';
    title = 'NORMAL';
    desc = `🎯 Fena değil! ${diff} ${unitSuffix} fark ile ortalama bir skor.`;
    badgeClass = 'badge-normal';
    borderClass = 'border-normal';
    icon = '🎯';
    sounds.playBeep(440, 'sine', 0.15, 0.15);
  } else {
    rank = 'GELİŞTİRİLEBİLİR';
    title = 'THİS REALLY BAD';
    desc = `⚠️ Hedefin ${diff} ${unitSuffix} uzağındasın. TİMİ'yi geçmek için tekrar dene!`;
    badgeClass = 'badge-bad';
    borderClass = 'border-bad';
    icon = '⚠️';
    sounds.playBeep(220, 'sawtooth', 0.25, 0.2);
  }

  resultTitle.textContent = title;
  resultDesc.textContent = desc;
  rankBadge.textContent = rank;
  resultBadgeIcon.textContent = icon;
  resTarget.textContent = targetFormatted;
  resActual.textContent = actualFormatted;
  resDiff.textContent = diffText;

  resultCard.className = `bg-cyber-card/95 border-2 rounded-2xl p-6 sm:p-8 shadow-2xl transition-all animate-bounceIn relative overflow-hidden ${borderClass}`;
  rankBadge.className = `text-[10px] font-black px-2 py-0.5 rounded-full border ${badgeClass}`;

  resultCard.classList.remove('hidden');

  addHistoryItem(title, targetFormatted, actualFormatted, diffText, badgeClass);
}

function stopStopwatch() {
  if (!swIsRunning) return;
  cancelAnimationFrame(swRafId);
  swIsRunning = false;
  sounds.playStop();

  const finalElapsed = performance.now() - swStartTime;
  swElapsedTime = finalElapsed;
  renderStopwatch(finalElapsed);

  mainActionBtn.classList.remove('running');
  btnText.textContent = 'BAŞLA';
  btnIcon.setAttribute('data-lucide', 'play');
  lapBtn.disabled = true;
  chronoGlow.classList.remove('bg-red-500/15');
  chronoGlow.classList.add('bg-brand-500/5');
  lucide.createIcons();

  evaluateResult(finalElapsed);
}

function resetStopwatch() {
  cancelAnimationFrame(swRafId);
  swIsRunning = false;
  swStartTime = 0;
  swElapsedTime = 0;

  renderStopwatch(0);

  mainActionBtn.classList.remove('running');
  btnText.textContent = 'BAŞLA';
  btnIcon.setAttribute('data-lucide', 'play');
  lapBtn.disabled = true;
  chronoGlow.className = 'absolute w-72 h-72 rounded-full bg-brand-500/5 blur-3xl pointer-events-none transition-all duration-700';

  resultCard.classList.add('hidden');
  lucide.createIcons();
  sounds.playBeep(330, 'sine', 0.08, 0.1);
}

function addHistoryItem(title, target, actual, diff, badgeClass) {
  lapsContainer.classList.remove('hidden');
  const record = {
    id: Date.now(),
    index: historyLaps.length + 1,
    title,
    target,
    actual,
    diff,
    badgeClass
  };
  historyLaps.unshift(record);

  const item = document.createElement('div');
  item.className = 'flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm animate-fadeIn';
  item.innerHTML = `
    <div class="flex items-center space-x-3">
      <span class="font-mono text-slate-500 font-bold">#${record.index}</span>
      <span class="font-bold px-2 py-0.5 rounded border text-[10px] ${badgeClass}">${title}</span>
      <span class="text-slate-300">Hedef: <strong class="font-mono text-white">${target}</strong></span>
    </div>
    <div class="flex items-center space-x-4">
      <span class="text-slate-400">Durdurulan: <span class="font-mono text-white font-semibold">${actual}</span></span>
      <span class="font-mono font-bold text-brand-glow">${diff}</span>
    </div>
  `;
  lapsList.prepend(item);
}

lapBtn.addEventListener('click', () => {
  if (!swIsRunning) return;
  const current = performance.now() - swStartTime;
  const formatted = get2DigitTime(current).formatted;
  
  lapsContainer.classList.remove('hidden');
  const item = document.createElement('div');
  item.className = 'flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm animate-fadeIn';
  item.innerHTML = `
    <div class="flex items-center space-x-3">
      <span class="font-mono text-brand-400 font-bold">TUR ${lapsList.children.length + 1}</span>
    </div>
    <div class="font-mono font-bold text-white text-sm">
      ${formatted}
    </div>
  `;
  lapsList.prepend(item);
  sounds.playBeep(600, 'sine', 0.05, 0.1);
});

clearHistoryBtn.addEventListener('click', () => {
  historyLaps = [];
  lapsList.innerHTML = '';
  lapsContainer.classList.add('hidden');
});

function triggerConfetti() {
  if (typeof confetti === 'function') {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  }
}

function triggerMegaConfetti() {
  if (typeof confetti === 'function') {
    const count = 200;
    const defaults = { origin: { y: 0.7 } };
    function fire(particleRatio, opts) {
      confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
    }
    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }
}

mainActionBtn.addEventListener('click', () => {
  if (!swIsRunning) {
    startStopwatch();
  } else {
    stopStopwatch();
  }
});

resetBtn.addEventListener('click', resetStopwatch);

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      return;
    }
    e.preventDefault();
    
    if (isArenaActive) {
      handleArenaAction();
      return;
    }

    const stopwatchTab = document.getElementById('tab-stopwatch');
    if (!stopwatchTab.classList.contains('hidden')) {
      if (!swIsRunning) {
        startStopwatch();
      } else {
        stopStopwatch();
      }
    }
  }
});


/* ==========================================================================
   4. ZAMANLAYICI & CANLI TÜRKİYE SAATİ
   ========================================================================== */
let timerTotalSeconds = 300;
let timerRemainingSeconds = 300;
let timerInterval = null;
let timerIsRunning = false;

const timerDigits = document.getElementById('timerDigits');
const timerStatusLabel = document.getElementById('timerStatusLabel');
const timerProgressRing = document.getElementById('timerProgressRing');
const timerToggleBtn = document.getElementById('timerToggleBtn');
const timerPlayIcon = document.getElementById('timerPlayIcon');
const timerBtnText = document.getElementById('timerBtnText');
const timerResetBtn = document.getElementById('timerResetBtn');

const timerHoursInput = document.getElementById('timerHoursInput');
const timerMinsInput = document.getElementById('timerMinsInput');
const timerSecsInput = document.getElementById('timerSecsInput');
const presetBtns = document.querySelectorAll('.timer-preset-btn');

const ringCircumference = 2 * Math.PI * 115;
timerProgressRing.style.strokeDasharray = `${ringCircumference} ${ringCircumference}`;
timerProgressRing.style.strokeDashoffset = '0';

function updateTimerDisplay() {
  const h = Math.floor(timerRemainingSeconds / 3600);
  const m = Math.floor((timerRemainingSeconds % 3600) / 60);
  const s = timerRemainingSeconds % 60;
  timerDigits.textContent = `${String(h).padStart(2, '0')}.${String(m).padStart(2, '0')}.${String(s).padStart(2, '0')}`;

  if (timerTotalSeconds > 0) {
    const progress = (timerTotalSeconds - timerRemainingSeconds) / timerTotalSeconds;
    const offset = ringCircumference * progress;
    timerProgressRing.style.strokeDashoffset = offset;
  } else {
    timerProgressRing.style.strokeDashoffset = '0';
  }
}

function getTimerInputSeconds() {
  const h = parseInt(timerHoursInput.value) || 0;
  const m = parseInt(timerMinsInput.value) || 0;
  const s = parseInt(timerSecsInput.value) || 0;
  return (h * 3600) + (m * 60) + s;
}

function setTimerFromInputs() {
  const total = getTimerInputSeconds();
  timerTotalSeconds = total > 0 ? total : 300;
  timerRemainingSeconds = timerTotalSeconds;
  updateTimerDisplay();
}

[timerHoursInput, timerMinsInput, timerSecsInput].forEach(inp => {
  inp.addEventListener('input', () => {
    if (!timerIsRunning) setTimerFromInputs();
  });
});

presetBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (timerIsRunning) return;
    const mins = parseInt(btn.getAttribute('data-mins')) || 5;
    timerHoursInput.value = 0;
    timerMinsInput.value = mins;
    timerSecsInput.value = 0;
    setTimerFromInputs();
    sounds.playBeep(480, 'sine', 0.05, 0.1);
  });
});

function startTimer() {
  if (timerRemainingSeconds <= 0) setTimerFromInputs();
  if (timerRemainingSeconds <= 0) return;

  sounds.init();
  sounds.playStart();
  timerIsRunning = true;

  timerBtnText.textContent = 'DURAKLAT';
  timerPlayIcon.setAttribute('data-lucide', 'pause');
  timerStatusLabel.textContent = 'SAYIYOR...';
  timerStatusLabel.className = 'text-xs font-semibold text-cyber-neonBlue mt-2 uppercase tracking-widest animate-pulse';

  timerInterval = setInterval(() => {
    timerRemainingSeconds--;
    updateTimerDisplay();

    if (timerRemainingSeconds <= 0) {
      clearInterval(timerInterval);
      timerIsRunning = false;
      timerStatusLabel.textContent = 'SÜRE DOLDU!';
      timerStatusLabel.className = 'text-xs font-bold text-red-400 mt-2 uppercase tracking-widest animate-bounce';
      timerBtnText.textContent = 'BAŞLAT';
      timerPlayIcon.setAttribute('data-lucide', 'play');
      sounds.playTimerAlarm();
      triggerConfetti();
      lucide.createIcons();
    }
  }, 1000);

  lucide.createIcons();
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerIsRunning = false;
  timerBtnText.textContent = 'DEVAM ET';
  timerPlayIcon.setAttribute('data-lucide', 'play');
  timerStatusLabel.textContent = 'DURAKLATILDI';
  timerStatusLabel.className = 'text-xs font-semibold text-amber-400 mt-2 uppercase tracking-widest';
  lucide.createIcons();
}

function resetTimer() {
  clearInterval(timerInterval);
  timerIsRunning = false;
  setTimerFromInputs();
  timerBtnText.textContent = 'BAŞLAT';
  timerPlayIcon.setAttribute('data-lucide', 'play');
  timerStatusLabel.textContent = 'HAZIR';
  timerStatusLabel.className = 'text-xs font-semibold text-slate-400 mt-2 uppercase tracking-widest';
  lucide.createIcons();
  sounds.playBeep(330, 'sine', 0.08, 0.1);
}

timerToggleBtn.addEventListener('click', () => {
  if (!timerIsRunning) startTimer();
  else pauseTimer();
});
timerResetBtn.addEventListener('click', resetTimer);
setTimerFromInputs();

// Live Turkey Clock
const clockHours = document.getElementById('clockHours');
const clockMinutes = document.getElementById('clockMinutes');
const clockSeconds = document.getElementById('clockSeconds');
const clockDate = document.getElementById('clockDate');
const clockWeekDay = document.getElementById('clockWeekDay');
const analogHour = document.getElementById('analogHour');
const analogMin = document.getElementById('analogMin');
const analogSec = document.getElementById('analogSec');

function updateTurkeyClock() {
  const now = new Date();
  const trOptions = { timeZone: 'Europe/Istanbul', hour12: false };
  const formatterTime = new Intl.DateTimeFormat('tr-TR', {
    ...trOptions,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const parts = formatterTime.formatToParts(now);
  let h = '00', m = '00', s = '00';
  parts.forEach(p => {
    if (p.type === 'hour') h = p.value;
    if (p.type === 'minute') m = p.value;
    if (p.type === 'second') s = p.value;
  });

  clockHours.textContent = h;
  clockMinutes.textContent = m;
  clockSeconds.textContent = s;

  const formatterDate = new Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Istanbul', day: 'numeric', month: 'long', year: 'numeric' });
  clockDate.textContent = formatterDate.format(now);
  const formatterDay = new Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Istanbul', weekday: 'long' });
  clockWeekDay.textContent = formatterDay.format(now);

  const numH = parseInt(h, 10) % 12;
  const numM = parseInt(m, 10);
  const numS = parseInt(s, 10);
  analogSec.style.transform = `translateX(-50%) rotate(${numS * 6}deg)`;
  analogMin.style.transform = `translateX(-50%) rotate(${numM * 6 + (numS * 0.1)}deg)`;
  analogHour.style.transform = `translateX(-50%) rotate(${(numH * 30) + (numM * 0.5)}deg)`;
}

setInterval(updateTurkeyClock, 1000);
updateTurkeyClock();
updateTargetLabel();


/* ==========================================================================
   5. ⚔️ GLOBAL 1v1 VS ARENA - WORLDWIDE CLOUD REAL-TIME ENGINE
   ========================================================================== */

function getHighEntropyRandom() {
  try {
    const arr = new Uint32Array(2);
    window.crypto.getRandomValues(arr);
    return (arr[0] * 4294967296 + arr[1]) / (4294967296 * 4294967296);
  } catch (e) {
    return Math.random();
  }
}

function generateRandomVsTarget() {
  const rand = getHighEntropyRandom();
  const isPureMs = rand < 0.15;

  if (isPureMs) {
    // 3 ms ile 99 ms arasında tam rastgele
    const ms = Math.floor(getHighEntropyRandom() * (99 - 3 + 1)) + 3;
    return {
      unit: 'millisecond',
      main: ms,
      sub: 0
    };
  } else {
    // 2 saniyeden 22 saniyeye kadar çok geniş ve çeşitli aralık (örn: 2.37, 4.81, 7.15, 11.44, 15.89, 18.02 vb.)
    const sec = Math.floor(getHighEntropyRandom() * (22 - 2 + 1)) + 2;
    let ms = 0;
    if (getHighEntropyRandom() > 0.10) {
      ms = Math.floor(getHighEntropyRandom() * 99) + 1;
    }
    return {
      unit: 'second',
      main: sec,
      sub: ms
    };
  }
}

function generateRandomGuessDuration() {
  const categoryRoll = getHighEntropyRandom(); // 0.00 - 1.00 arası dağılım

  if (categoryRoll < 0.20) {
    // 1. KATEGORİ: SAF MİLİSANİYE DURMALARI (10 ms - 99 ms arası - 10 milisaniyenin altında asla olmayacak!)
    const ms = Math.floor(getHighEntropyRandom() * (99 - 10 + 1)) + 10;
    return ms * 10; // 100 ms ile 990 ms arası (0.10 sn - 0.99 sn)
  } else if (categoryRoll < 0.45) {
    // 2. KATEGORİ: ÇOK KISA / ANI DURMALAR (1.00 sn - 2.99 sn arası, örn: 1.00, 1.25, 1.50, 1.82, 2.30 vb.)
    const sec = Math.floor(getHighEntropyRandom() * (2 - 1 + 1)) + 1; // 1 veya 2 sn
    const ms = Math.floor(getHighEntropyRandom() * 100);
    return (sec * 100 + ms) * 10;
  } else if (categoryRoll < 0.78) {
    // 3. KATEGORİ: ORTA SÜRELİ DURMALAR (3.00 sn - 8.99 sn arası, örn: 3.40, 4.15, 5.50, 6.78, 7.90 vb.)
    const sec = Math.floor(getHighEntropyRandom() * (8 - 3 + 1)) + 3; // 3 - 8 sn
    const ms = Math.floor(getHighEntropyRandom() * 100);
    return (sec * 100 + ms) * 10;
  } else {
    // 4. KATEGORİ: UZUN SÜRELİ DAYANIKLILIK DURMALARI (9.00 sn - 22.99 sn arası)
    const sec = Math.floor(getHighEntropyRandom() * (22 - 9 + 1)) + 9; // 9 - 22 sn
    const ms = Math.floor(getHighEntropyRandom() * 100);
    return (sec * 100 + ms) * 10;
  }
}

const myClientId = 'usr_' + Math.random().toString(36).substring(2, 9);
let currentUsername = localStorage.getItem('chrono_username') || '';

// DOM Elements
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('usernameInput');
const userProfileBtn = document.getElementById('userProfileBtn');
const headerUsername = document.getElementById('headerUsername');

const vsModal = document.getElementById('vsModal');
const openVsModalBtn = document.getElementById('openVsModalBtn');
const closeVsModalBtn = document.getElementById('closeVsModalBtn');
const playerSearchInput = document.getElementById('playerSearchInput');
const playersList = document.getElementById('playersList');
const currentUsernameLabel = document.getElementById('currentUsernameLabel');

const incomingInviteModal = document.getElementById('incomingInviteModal');
const inviteSenderName = document.getElementById('inviteSenderName');
const acceptInviteBtn = document.getElementById('acceptInviteBtn');
const declineInviteBtn = document.getElementById('declineInviteBtn');

// Mode Selection Modal Elements
const modeSelectModal = document.getElementById('modeSelectModal');
const selectTimiModeBtn = document.getElementById('selectTimiModeBtn');
const selectNormalModeBtn = document.getElementById('selectNormalModeBtn');
const selectGuessModeBtn = document.getElementById('selectGuessModeBtn');
const modeStatusText = document.getElementById('modeStatusText');

// Arena Modal Elements
const vsArenaModal = document.getElementById('vsArenaModal');
const arenaActiveModeBadge = document.getElementById('arenaActiveModeBadge');
const arenaTargetContainer = document.getElementById('arenaTargetContainer');
const arenaTargetLabel = document.getElementById('arenaTargetLabel');
const arenaCountdownOverlay = document.getElementById('arenaCountdownOverlay');
const arenaCountdownNumber = document.getElementById('arenaCountdownNumber');
const arenaPrepOverlay = document.getElementById('arenaPrepOverlay');
const prepCountdownNumber = document.getElementById('prepCountdownNumber');

// Standard Mode Elements (Timi / Normal)
const arenaStandardSection = document.getElementById('arenaStandardSection');
const arenaP1Name = document.getElementById('arenaP1Name');
const arenaP2Name = document.getElementById('arenaP2Name');
const arenaP1Time = document.getElementById('arenaP1Time');
const arenaP2Time = document.getElementById('arenaP2Time');
const arenaP1Diff = document.getElementById('arenaP1Diff');
const arenaP2Diff = document.getElementById('arenaP2Diff');
const arenaAutoStartNotice = document.getElementById('arenaAutoStartNotice');
const arenaAutoStartTimer = document.getElementById('arenaAutoStartTimer');
const arenaActionBtn = document.getElementById('arenaActionBtn');
const arenaBtnIcon = document.getElementById('arenaBtnIcon');
const arenaBtnText = document.getElementById('arenaBtnText');

// Guess Mode Elements (TAHMİN ET)
const arenaGuessSection = document.getElementById('arenaGuessSection');
const guessP1Header = document.getElementById('guessP1Header');
const guessP2Header = document.getElementById('guessP2Header');
const guessMysteryDisplay = document.getElementById('guessMysteryDisplay');
const guessStatusNotice = document.getElementById('guessStatusNotice');
const guessInputBox = document.getElementById('guessInputBox');
const guessInputSec = document.getElementById('guessInputSec');
const guessInputMs = document.getElementById('guessInputMs');
const guessSubmitBtn = document.getElementById('guessSubmitBtn');
const guessWaitingMessage = document.getElementById('guessWaitingMessage');

// Robot Elements
const robotPhysicalBtn = document.getElementById('robotPhysicalBtn');
const robotBtnLabel = document.getElementById('robotBtnLabel');
const robotStatusNotice = document.getElementById('robotStatusNotice');
const robotArmContainer = document.getElementById('robotArmContainer');

// Winner Banner
const arenaWinnerBanner = document.getElementById('arenaWinnerBanner');
const arenaWinnerTitle = document.getElementById('arenaWinnerTitle');
const arenaWinnerDesc = document.getElementById('arenaWinnerDesc');
const arenaP1AccuracyLabel = document.getElementById('arenaP1AccuracyLabel');
const arenaP2AccuracyLabel = document.getElementById('arenaP2AccuracyLabel');
const arenaP1Accuracy = document.getElementById('arenaP1Accuracy');
const arenaP2Accuracy = document.getElementById('arenaP2Accuracy');
const arenaRematchBtn = document.getElementById('arenaRematchBtn');
const arenaExitBtn = document.getElementById('arenaExitBtn');

let activePlayersMap = new Map();
let currentInvite = null;
let currentMatch = null;
let isArenaActive = false;
let arenaStartTime = 0;
let arenaElapsedTime = 0;
let arenaRafId = null;
let arenaStopped = false;
let arenaRunning = false;
let currentArenaMode = 'normal'; // 'timi', 'normal' veya 'guess'
let myModeChoice = null;
let opponentModeChoice = null;
let pendingModeMatch = null;
let arenaAutoStartInterval = null;
let arenaAutoStartRemaining = 10;

// Guess Mode State
let guessStopDurationMs = 0;
let guessTimeoutId = null;
let guessHasStopped = false;
let myGuess = null;
let opponentGuess = null;

// Hybrid Realtime Channel: BroadcastChannel (local) + Global MQTT Cloud WebSocket Broker
const vsChannel = new BroadcastChannel('chrono_pulse_vs_channel');
const MQTT_TOPIC = 'chronopulse/global/vs_matchmaking/v1';
let mqttClient = null;

try {
  if (typeof mqtt !== 'undefined') {
    // Public Global WebSocket Broker for Worldwide Cross-Device & Cross-Network multiplayer
    mqttClient = mqtt.connect('wss://broker.emqx.io:8084/mqtt', {
      clientId: 'cp_' + myClientId,
      keepalive: 30,
      clean: true
    });

    mqttClient.on('connect', () => {
      console.log('Connected to Global Realtime Cloud Broker');
      mqttClient.subscribe(MQTT_TOPIC);
      if (currentUsername) {
        broadcast({ type: 'PING_PRESENCE', username: currentUsername });
      }
    });

    mqttClient.on('message', (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        handleRealtimeMessage(data);
      } catch (e) {}
    });
  }
} catch (e) {
  console.warn('MQTT init notice:', e);
}

function broadcast(msg) {
  const payload = { ...msg, senderId: myClientId, timestamp: Date.now() };
  
  // 1. Broadcast locally across tabs
  try {
    vsChannel.postMessage(payload);
    localStorage.setItem('chrono_realtime_event', JSON.stringify({ ...payload, _rand: Math.random() }));
  } catch (e) {}

  // 2. Broadcast globally over the internet to other computers & phones
  if (mqttClient && mqttClient.connected) {
    try {
      mqttClient.publish(MQTT_TOPIC, JSON.stringify(payload));
    } catch (e) {}
  }
}

function handleRealtimeMessage(data) {
  if (!data || data.senderId === myClientId) return;

  switch (data.type) {
    case 'PING_PRESENCE':
      if (data.username && data.username.toLowerCase() !== currentUsername.toLowerCase()) {
        activePlayersMap.set(data.username, {
          id: data.senderId,
          username: data.username,
          lastSeen: Date.now()
        });
        renderPlayersList();
      }
      break;

    case 'INVITE_SEND':
      if (currentUsername && data.targetUser.toLowerCase() === currentUsername.toLowerCase()) {
        currentInvite = data;
        inviteSenderName.textContent = data.fromUsername;
        incomingInviteModal.classList.remove('hidden');
        sounds.playChallengeInvite();
        lucide.createIcons();
      }
      break;

    case 'INVITE_DECLINED':
      if (data.toUser && data.toUser.toLowerCase() === currentUsername.toLowerCase()) {
        alert(`❌ ${data.fromUsername} davetinizi reddetti.`);
        renderPlayersList();
      }
      break;

    case 'INVITE_ACCEPTED':
      if (data.toUser && data.toUser.toLowerCase() === currentUsername.toLowerCase()) {
        openModeSelectionModal(data.matchId, currentUsername, data.fromUsername, data.targetTime, data.guessDurationMs);
      }
      break;

    case 'MODE_SELECT':
      if (pendingModeMatch && pendingModeMatch.matchId === data.matchId) {
        opponentModeChoice = data.mode;
        evaluateModeResolution();
      }
      break;

    case 'GUESS_SUBMIT':
      if (currentMatch && currentMatch.matchId === data.matchId) {
        opponentGuess = data.guess;
        checkGuessOutcome();
      }
      break;

    case 'ARENA_STOP':
      if (currentMatch && currentMatch.matchId === data.matchId) {
        currentMatch.p2Result = data.result;
        arenaP2Time.textContent = data.result.formatted;
        arenaP2Diff.textContent = `Fark: ${data.result.diffText}`;
        checkArenaOutcome();
      }
      break;

    case 'ARENA_REMATCH':
      if (currentMatch && currentMatch.matchId === data.matchId) {
        openModeSelectionModal(data.newMatchId, currentMatch.p1, currentMatch.p2, data.targetTime, data.guessDurationMs);
      }
      break;
  }
}

vsChannel.onmessage = (e) => handleRealtimeMessage(e.data);

window.addEventListener('storage', (e) => {
  if (e.key === 'chrono_realtime_event' && e.newValue) {
    try {
      handleRealtimeMessage(JSON.parse(e.newValue));
    } catch (err) {}
  }
});

setInterval(() => {
  if (currentUsername) {
    broadcast({ type: 'PING_PRESENCE', username: currentUsername });
  }
  const now = Date.now();
  for (let [uname, p] of activePlayersMap.entries()) {
    if (now - p.lastSeen > 8000) {
      activePlayersMap.delete(uname);
    }
  }
  renderPlayersList();
}, 2500);

function updateHeaderUser() {
  if (currentUsername) {
    headerUsername.textContent = currentUsername;
    currentUsernameLabel.textContent = currentUsername;
  } else {
    headerUsername.textContent = 'Giriş Yap';
    currentUsernameLabel.textContent = '--';
  }
}

userProfileBtn.addEventListener('click', () => {
  usernameInput.value = currentUsername;
  loginModal.classList.remove('hidden');
});

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const uname = usernameInput.value.trim();
  if (uname) {
    currentUsername = uname;
    localStorage.setItem('chrono_username', currentUsername);
    updateHeaderUser();
    loginModal.classList.add('hidden');
    broadcast({ type: 'PING_PRESENCE', username: currentUsername });
    sounds.playBeep(660, 'sine', 0.1, 0.2);
  }
});

if (!currentUsername) {
  setTimeout(() => {
    loginModal.classList.remove('hidden');
  }, 600);
} else {
  updateHeaderUser();
  broadcast({ type: 'PING_PRESENCE', username: currentUsername });
}

openVsModalBtn.addEventListener('click', () => {
  if (!currentUsername) {
    loginModal.classList.remove('hidden');
    return;
  }
  vsModal.classList.remove('hidden');
  broadcast({ type: 'PING_PRESENCE', username: currentUsername });
  renderPlayersList();
});

closeVsModalBtn.addEventListener('click', () => {
  vsModal.classList.add('hidden');
});

function renderPlayersList() {
  if (!playersList) return;
  const filter = (playerSearchInput.value || '').toLowerCase();
  playersList.innerHTML = '';

  let count = 0;
  for (let [uname, player] of activePlayersMap.entries()) {
    if (uname.toLowerCase() === currentUsername.toLowerCase()) continue;
    if (filter && !uname.toLowerCase().includes(filter)) continue;

    count++;
    const item = document.createElement('div');
    item.className = 'flex items-center justify-between p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 transition-all';
    item.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center font-black text-purple-400 font-mono text-sm">
          ${uname.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <span class="font-bold text-white font-mono text-sm block">${uname}</span>
          <span class="text-[10px] text-emerald-400 font-semibold flex items-center space-x-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Çevrimiçi (Dünya Geneli)</span>
          </span>
        </div>
      </div>
      <button class="invite-btn px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 font-bold text-xs text-white shadow-md shadow-purple-500/20 transition-all active:scale-95 flex items-center space-x-1.5" data-user="${uname}">
        <i data-lucide="swords" class="w-3.5 h-3.5"></i>
        <span>DAVET ET</span>
      </button>
    `;
    playersList.appendChild(item);
  }

  if (count === 0) {
    playersList.innerHTML = `
      <div class="text-center py-8 text-slate-500 text-xs">
        <i data-lucide="globe" class="w-8 h-8 mx-auto mb-2 opacity-40 text-purple-400"></i>
        <span>Şu an aktif başka oyuncu aranıyor... Başka bir cihazdan veya sekmeden siteye girildiğinde anında burada görünecektir!</span>
      </div>
    `;
  }

  document.querySelectorAll('.invite-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetUser = btn.getAttribute('data-user');
      btn.disabled = true;
      btn.innerHTML = '<span>Gönderildi...</span>';
      
      const randomTarget = generateRandomVsTarget();
      const randomGuessDuration = generateRandomGuessDuration();

      broadcast({
        type: 'INVITE_SEND',
        fromUsername: currentUsername,
        targetUser: targetUser,
        targetTime: randomTarget,
        guessDurationMs: randomGuessDuration
      });
      sounds.playBeep(520, 'sine', 0.1, 0.2);
    });
  });

  lucide.createIcons();
}

playerSearchInput.addEventListener('input', renderPlayersList);

acceptInviteBtn.addEventListener('click', () => {
  if (!currentInvite) return;
  incomingInviteModal.classList.add('hidden');

  const matchId = 'match_' + Date.now();
  broadcast({
    type: 'INVITE_ACCEPTED',
    fromUsername: currentUsername,
    toUser: currentInvite.fromUsername,
    targetTime: currentInvite.targetTime,
    guessDurationMs: currentInvite.guessDurationMs,
    matchId: matchId
  });

  openModeSelectionModal(matchId, currentUsername, currentInvite.fromUsername, currentInvite.targetTime, currentInvite.guessDurationMs);
  currentInvite = null;
});

declineInviteBtn.addEventListener('click', () => {
  if (!currentInvite) return;
  incomingInviteModal.classList.add('hidden');

  broadcast({
    type: 'INVITE_DECLINED',
    fromUsername: currentUsername,
    toUser: currentInvite.fromUsername
  });
  currentInvite = null;
  sounds.playBeep(220, 'sine', 0.1, 0.2);
});

/* ==========================================================================
   OYUN MODU SEÇİMİ (TİMİ MOD / NORMAL MOD / TAHMİN ET)
   ========================================================================== */

function openModeSelectionModal(matchId, p1, p2, targetTime, guessDurationMs) {
  vsModal.classList.add('hidden');
  incomingInviteModal.classList.add('hidden');
  vsArenaModal.classList.add('hidden');
  modeSelectModal.classList.remove('hidden');

  myModeChoice = null;
  opponentModeChoice = null;
  pendingModeMatch = {
    matchId,
    p1,
    p2,
    targetTime,
    guessDurationMs: guessDurationMs || generateRandomGuessDuration()
  };

  modeStatusText.textContent = 'Oyun modunu seçin (TİMİ MOD, NORMAL MOD veya TAHMİN ET)...';
  modeStatusText.className = 'mt-5 text-xs font-semibold text-slate-400 animate-pulse';

  selectTimiModeBtn.disabled = false;
  selectNormalModeBtn.disabled = false;
  selectGuessModeBtn.disabled = false;

  selectTimiModeBtn.classList.remove('ring-4', 'ring-amber-400', 'opacity-50');
  selectNormalModeBtn.classList.remove('ring-4', 'ring-brand-500', 'opacity-50');
  selectGuessModeBtn.classList.remove('ring-4', 'ring-purple-500', 'opacity-50');

  sounds.playChallengeInvite();
}

function chooseMode(mode) {
  if (myModeChoice || !pendingModeMatch) return;
  myModeChoice = mode;
  sounds.playBeep(550, 'triangle', 0.1, 0.2);

  if (mode === 'timi') {
    selectTimiModeBtn.classList.add('ring-4', 'ring-amber-400');
    selectNormalModeBtn.classList.add('opacity-50');
    selectGuessModeBtn.classList.add('opacity-50');
  } else if (mode === 'normal') {
    selectNormalModeBtn.classList.add('ring-4', 'ring-brand-500');
    selectTimiModeBtn.classList.add('opacity-50');
    selectGuessModeBtn.classList.add('opacity-50');
  } else if (mode === 'guess') {
    selectGuessModeBtn.classList.add('ring-4', 'ring-purple-500');
    selectTimiModeBtn.classList.add('opacity-50');
    selectNormalModeBtn.classList.add('opacity-50');
  }

  broadcast({
    type: 'MODE_SELECT',
    matchId: pendingModeMatch.matchId,
    fromUsername: currentUsername,
    mode: mode
  });

  evaluateModeResolution();
}

selectTimiModeBtn.addEventListener('click', () => chooseMode('timi'));
selectNormalModeBtn.addEventListener('click', () => chooseMode('normal'));
selectGuessModeBtn.addEventListener('click', () => chooseMode('guess'));

function getModeTitle(m) {
  if (m === 'timi') return 'TİMİ MOD (NO LOOK)';
  if (m === 'normal') return 'NORMAL MOD (LOOK)';
  if (m === 'guess') return 'TAHMİN ET (Rastgele Durur)';
  return m;
}

function evaluateModeResolution() {
  if (!pendingModeMatch) return;

  if (myModeChoice && !opponentModeChoice) {
    modeStatusText.textContent = `Seçiminiz: ${getModeTitle(myModeChoice)}. Rakibin seçimi bekleniyor...`;
    return;
  }

  if (!myModeChoice && opponentModeChoice) {
    modeStatusText.textContent = 'Rakip seçimini yaptı! Lütfen siz de bir mod seçin...';
    return;
  }

  if (myModeChoice && opponentModeChoice) {
    selectTimiModeBtn.disabled = true;
    selectNormalModeBtn.disabled = true;
    selectGuessModeBtn.disabled = true;

    let finalMode = '';
    let resolutionReason = '';

    if (myModeChoice === opponentModeChoice) {
      finalMode = myModeChoice;
      resolutionReason = `İki oyuncu da aynı modu seçti: ${getModeTitle(finalMode)}!`;
    } else {
      // İki oyuncu farklı seçim yaptı: Her iki tarafta da aynı sonucu veren deterministik rastgele seçim (seçilen iki mod arasından)
      const sumCodes = pendingModeMatch.matchId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const chosenPool = [myModeChoice, opponentModeChoice];
      finalMode = chosenPool[sumCodes % chosenPool.length];
      resolutionReason = `Farklı modlar seçildi! Sistem rastgele belirledi: ${getModeTitle(finalMode)}!`;
    }

    modeStatusText.textContent = `${resolutionReason} Arena başlatılıyor...`;
    modeStatusText.className = 'mt-5 text-xs font-bold text-amber-300 animate-bounce';

    const matchToLaunch = pendingModeMatch;
    setTimeout(() => {
      modeSelectModal.classList.add('hidden');
      launchArenaMatch(
        matchToLaunch.matchId,
        matchToLaunch.p1,
        matchToLaunch.p2,
        matchToLaunch.targetTime,
        finalMode,
        matchToLaunch.guessDurationMs
      );
      pendingModeMatch = null;
    }, 1500);
  }
}

/* ==========================================================================
   1v1 ARENA MOTORU (STANDART & TAHMİN ET MODLARI)
   ========================================================================== */

function launchArenaMatch(matchId, p1, p2, targetTime, chosenMode, incomingGuessDurationMs) {
  isArenaActive = true;
  arenaStopped = false;
  arenaRunning = false;
  currentArenaMode = chosenMode || 'normal';
  arenaWinnerBanner.classList.add('hidden');

  currentMatch = {
    matchId: matchId,
    p1: p1,
    p2: p2,
    targetTime: targetTime,
    mode: currentArenaMode,
    p1Result: null,
    p2Result: null
  };

  // UI Modu Ayarı
  if (currentArenaMode === 'guess') {
    // TAHMİN ET MODU
    arenaActiveModeBadge.textContent = '🧠 TAHMİN ET (Rastgele Durur)';
    arenaActiveModeBadge.className = 'text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/40';

    arenaTargetContainer.classList.add('hidden');
    arenaStandardSection.classList.add('hidden');
    arenaGuessSection.classList.remove('hidden');

    guessP1Header.textContent = p1;
    guessP2Header.textContent = p2;
    guessMysteryDisplay.textContent = '??.??.??';
    guessStatusNotice.textContent = '⏳ Sayaç gizlice sayıyor... İçinden dikkatle say!';
    guessStatusNotice.className = 'text-xs sm:text-sm font-semibold text-slate-300 mt-2 animate-pulse';

    guessInputBox.classList.add('hidden');
    guessWaitingMessage.classList.add('hidden');
    guessInputSec.value = '';
    guessInputMs.value = '';
    guessSubmitBtn.disabled = false;

    myGuess = null;
    opponentGuess = null;
    guessHasStopped = false;
    if (guessTimeoutId) clearTimeout(guessTimeoutId);

    if (robotPhysicalBtn) {
      robotPhysicalBtn.className = 'w-16 h-16 rounded-full bg-gradient-to-b from-red-500 via-red-600 to-red-800 border-2 border-red-400 shadow-[0_6px_0_#7f1d1d,0_10px_20px_rgba(239,68,68,0.5)] flex flex-col items-center justify-center font-black text-[11px] text-white uppercase tracking-wider select-none transform transition-all duration-150';
      robotPhysicalBtn.style.transform = 'translateY(0px)';
      robotBtnLabel.textContent = 'START';
      robotStatusNotice.textContent = 'Robot bekleniyor...';
      robotStatusNotice.className = 'text-[10px] text-amber-400 font-bold mt-3 text-center animate-pulse';
    }
    if (robotArmContainer) {
      robotArmContainer.style.top = '-240px';
      robotArmContainer.style.opacity = '0';
    }

    // Rastgele durma zamanı: İki oyuncuya da senkronize iletilen süre (veya yüksek entropili üretim)
    guessStopDurationMs = incomingGuessDurationMs || generateRandomGuessDuration();

  } else {
    // STANDART MODLAR (TİMİ / NORMAL)
    if (currentArenaMode === 'timi') {
      arenaActiveModeBadge.textContent = '🙈 TİMİ MOD (NO LOOK)';
      arenaActiveModeBadge.className = 'text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40';
    } else {
      arenaActiveModeBadge.textContent = '👁️ NORMAL MOD (LOOK)';
      arenaActiveModeBadge.className = 'text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/40';
    }

    arenaTargetContainer.classList.remove('hidden');
    arenaStandardSection.classList.remove('hidden');
    arenaGuessSection.classList.add('hidden');

    // Hedef Zaman Formatlama
    let tFormatted = '';
    if (targetTime.unit === 'second') {
      const tm = String(Math.floor(targetTime.main / 60)).padStart(2, '0');
      const ts = String(targetTime.main % 60).padStart(2, '0');
      const tms = String(targetTime.sub % 100).padStart(2, '0');
      tFormatted = `${tm}.${ts}.${tms} (${targetTime.main}.${tms} Saniye)`;
    } else if (targetTime.unit === 'millisecond') {
      tFormatted = `00.00.${String(targetTime.main % 100).padStart(2, '0')} (${targetTime.main} Milisaniye)`;
    }
    arenaTargetLabel.textContent = tFormatted;

    arenaP1Name.textContent = p1;
    arenaP2Name.textContent = p2;
    arenaP1Time.textContent = '00.00.00';
    arenaP2Time.textContent = '00.00.00';
    arenaP1Diff.textContent = 'Hazırlanıyor...';
    arenaP2Diff.textContent = 'Hazırlanıyor...';

    arenaActionBtn.disabled = true;
    arenaActionBtn.className = 'w-full py-5 rounded-2xl font-black text-xl tracking-wider uppercase flex items-center justify-center space-x-3 transition-all transform active:scale-95 shadow-xl select-none bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:brightness-110';
    arenaBtnText.textContent = 'BAŞLAT';
    arenaBtnIcon.setAttribute('data-lucide', 'play');

    arenaAutoStartNotice.classList.add('hidden');
    if (arenaAutoStartInterval) clearInterval(arenaAutoStartInterval);
  }

  vsArenaModal.classList.remove('hidden');
  lucide.createIcons();

  // 1. AŞAMA: 3 Saniyelik Eşleşme Geri Sayımı
  arenaCountdownOverlay.classList.remove('hidden');
  arenaPrepOverlay.classList.add('hidden');
  let count = 3;
  arenaCountdownNumber.textContent = count;
  arenaCountdownNumber.className = 'text-8xl sm:text-9xl font-black text-amber-400 animate-bounce';
  sounds.playBeep(440, 'triangle', 0.15, 0.3);

  const cInterval = setInterval(() => {
    count--;
    if (count > 0) {
      arenaCountdownNumber.textContent = count;
      sounds.playBeep(440, 'triangle', 0.15, 0.3);
    } else {
      clearInterval(cInterval);
      arenaCountdownOverlay.classList.add('hidden');
      // 2. AŞAMA: ÖZEL HAZIRLIK SAYACINI BAŞLAT!
      startPrepCountdown();
    }
  }, 1000);
}

/* --- 2. AŞAMA: ÖZEL HAZIRLIK SAYACI (3.. 2.. 1.. -> DİREKT BAŞLAMA) --- */

function startPrepCountdown() {
  arenaPrepOverlay.classList.remove('hidden');
  let prepCount = 3;
  prepCountdownNumber.textContent = prepCount;
  sounds.playBeep(700, 'square', 0.12, 0.3);

  const pInterval = setInterval(() => {
    prepCount--;
    if (prepCount > 0) {
      prepCountdownNumber.textContent = prepCount;
      sounds.playBeep(700 + (3 - prepCount) * 120, 'square', 0.12, 0.3);
    } else if (prepCount === 0) {
      prepCountdownNumber.textContent = 'GO! ⚡';
      sounds.playStart();
    } else {
      clearInterval(pInterval);
      arenaPrepOverlay.classList.add('hidden');

      // KULLANICI KURALI: "o hazırlık sayacı biterbitmez direk başlasın sayaç"
      if (currentArenaMode === 'guess') {
        guessStatusNotice.textContent = '🤖 Robot butona uzanıyor...';
        animateRobotPress(() => {
          startGuessModeRunning();
        });
      } else {
        startArenaRunning();
      }
    }
  }, 1000);
}

/* --- 🤖 ROBOT ELİ ANİMASYONU VE BUTONA BASIŞ --- */

function animateRobotPress(onPressed) {
  if (!robotArmContainer || !robotPhysicalBtn) {
    if (onPressed) onPressed();
    return;
  }

  // Buton Başlangıç Hazırlığı
  robotPhysicalBtn.className = 'w-16 h-16 rounded-full bg-gradient-to-b from-red-500 via-red-600 to-red-800 border-2 border-red-400 shadow-[0_6px_0_#7f1d1d,0_10px_20px_rgba(239,68,68,0.5)] flex flex-col items-center justify-center font-black text-[11px] text-white uppercase tracking-wider select-none transform transition-all duration-150';
  robotPhysicalBtn.style.transform = 'translateY(0px)';
  robotBtnLabel.textContent = 'START';
  robotStatusNotice.textContent = '🤖 Robot butona uzanıyor...';
  robotStatusNotice.className = 'text-[10px] text-amber-400 font-bold mt-3 text-center animate-pulse';

  // 1. Adım: Robot kolu sahneye iner (Butonun hemen üstüne yaklaşır)
  robotArmContainer.style.opacity = '1';
  robotArmContainer.style.top = '-50px';
  sounds.playBeep(480, 'triangle', 0.12, 0.25);

  // 2. Adım: Hedefe kilitlenme ve aşağı sert basış
  setTimeout(() => {
    robotStatusNotice.textContent = '🎯 Butona basılıyor!';
    robotStatusNotice.className = 'text-[10px] text-red-400 font-black mt-3 text-center animate-bounce';
    
    // Parmak butona gömülür (İniş)
    robotArmContainer.style.top = '10px';

    setTimeout(() => {
      // 3. Adım: Butona tam basılma anı (TIK!)
      robotPhysicalBtn.style.transform = 'translateY(6px)';
      robotPhysicalBtn.className = 'w-16 h-16 rounded-full bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-700 border-2 border-emerald-300 shadow-[0_1px_0_#064e3b,0_0_25px_rgba(16,185,129,0.9)] flex flex-col items-center justify-center font-black text-[11px] text-white uppercase tracking-wider select-none';
      robotBtnLabel.textContent = 'ACTIVE';
      robotStatusNotice.textContent = '⚡ BAŞLATILDI!';
      robotStatusNotice.className = 'text-[10px] text-emerald-400 font-black mt-3 text-center';

      // Mekanik Tık / Hidrolik Ses
      sounds.playBeep(260, 'square', 0.08, 0.4);
      sounds.playStart();

      guessStatusNotice.textContent = '⏳ Sayaç başladı! İçinden dikkatle say!';
      guessStatusNotice.className = 'text-xs sm:text-sm font-semibold text-purple-300 mt-2 animate-pulse';

      // SAYAÇ TAM O BASIŞ ANINDA DİREKT BAŞLAR!
      if (onPressed) onPressed();

      // 4. Adım: Robot kolu yukarı çekilir
      setTimeout(() => {
        robotArmContainer.style.top = '-260px';
        robotArmContainer.style.opacity = '0';
      }, 500);

    }, 200);

  }, 650);
}

/* --- TAHMİN ET MODU AKIŞI --- */

function startGuessModeRunning() {
  guessHasStopped = false;
  arenaStartTime = performance.now();

  // Gizli sayaç rastgele zamanda kendiliğinden durur!
  guessTimeoutId = setTimeout(() => {
    triggerGuessStop();
  }, guessStopDurationMs);
}

function triggerGuessStop() {
  guessHasStopped = true;
  sounds.playStop();
  sounds.playBeep(700, 'sawtooth', 0.25, 0.3);

  // Robot Butonunu Durduruldu Haline Getir
  if (robotPhysicalBtn) {
    robotPhysicalBtn.className = 'w-16 h-16 rounded-full bg-gradient-to-b from-slate-700 to-slate-900 border-2 border-slate-600 shadow-inner flex flex-col items-center justify-center font-black text-[11px] text-slate-400 uppercase tracking-wider select-none';
    robotBtnLabel.textContent = 'STOP';
    robotStatusNotice.textContent = '🛑 Sayaç durdu!';
    robotStatusNotice.className = 'text-[10px] text-slate-400 font-bold mt-3 text-center';
  }

  guessMysteryDisplay.textContent = 'STOP! 🛑';
  guessStatusNotice.textContent = '🛑 SAYAÇ DURDU! Şimdi saydığın süreyi aşağıya yaz:';
  guessStatusNotice.className = 'text-xs sm:text-sm font-black text-amber-300 mt-2 animate-bounce';

  guessInputBox.classList.remove('hidden');
  guessInputSec.focus();
  lucide.createIcons();
}

guessSubmitBtn.addEventListener('click', () => {
  if (myGuess) return;

  const sec = Math.max(0, parseInt(guessInputSec.value) || 0);
  const ms = Math.max(0, parseInt(guessInputMs.value) || 0);
  const totalCentis = (sec * 100) + (ms % 100);

  const secStr = String(sec).padStart(2, '0');
  const msStr = String(ms % 100).padStart(2, '0');
  const formatted = `${secStr}.${msStr}`;

  myGuess = {
    sec: sec,
    ms: ms % 100,
    totalCentis: totalCentis,
    formatted: `${formatted} sn`
  };

  guessSubmitBtn.disabled = true;
  guessWaitingMessage.classList.remove('hidden');
  sounds.playBeep(600, 'sine', 0.1, 0.2);

  broadcast({
    type: 'GUESS_SUBMIT',
    matchId: currentMatch.matchId,
    fromUsername: currentUsername,
    guess: myGuess
  });

  checkGuessOutcome();
});

function checkGuessOutcome() {
  if (!myGuess || !opponentGuess || !currentMatch) return;

  const actualCentis = Math.round(guessStopDurationMs / 10);
  const actM = String(Math.floor(actualCentis / 6000)).padStart(2, '0');
  const actS = String(Math.floor((actualCentis % 6000) / 100)).padStart(2, '0');
  const actMs = String(actualCentis % 100).padStart(2, '0');
  
  let actualFormatted = '';
  if (actualCentis < 100) {
    actualFormatted = `00.00.${actMs} (${actualCentis} Milisaniye)`;
  } else {
    actualFormatted = `${actS}.${actMs} Saniye`;
  }

  // Süreyi Ortaya Çıkar!
  guessMysteryDisplay.textContent = `${actM}.${actS}.${actMs}`;
  guessStatusNotice.textContent = `🎯 Gerçek Durma Süresi: ${actualFormatted}`;
  guessStatusNotice.className = 'text-sm font-black text-brand-glow mt-2';

  const p1Diff = Math.abs(myGuess.totalCentis - actualCentis);
  const p2Diff = Math.abs(opponentGuess.totalCentis - actualCentis);

  arenaWinnerBanner.classList.remove('hidden');
  arenaP1AccuracyLabel.textContent = `${currentMatch.p1} TAHMİNİ: ${myGuess.formatted}`;
  arenaP2AccuracyLabel.textContent = `${currentMatch.p2} TAHMİNİ: ${opponentGuess.formatted}`;

  arenaP1Accuracy.textContent = `Fark: ${p1Diff} ms`;
  arenaP2Accuracy.textContent = `Fark: ${p2Diff} ms`;

  if (p1Diff < p2Diff) {
    arenaWinnerTitle.textContent = `🏆 ${currentMatch.p1} KAZANDI!`;
    arenaWinnerTitle.className = 'text-2xl sm:text-3xl font-black text-yellow-400 drop-shadow-lg';
    arenaWinnerDesc.textContent = `Tebrikler! ${myGuess.formatted} tahmininizle gerçek süreye (${actualFormatted}) daha çok yaklaştınız! (Fark: ${p1Diff} ms vs ${p2Diff} ms)`;
    sounds.playMegaVictory();
    triggerMegaConfetti();
  } else if (p2Diff < p1Diff) {
    arenaWinnerTitle.textContent = `💀 ${currentMatch.p2} KAZANDI!`;
    arenaWinnerTitle.className = 'text-2xl sm:text-3xl font-black text-rose-400 drop-shadow-lg';
    arenaWinnerDesc.textContent = `Rakip ${opponentGuess.formatted} tahminiyle gerçek süreye (${actualFormatted}) daha yakın çıktı! (Rakip farkı: ${p2Diff} ms, Sizin farkınız: ${p1Diff} ms)`;
    sounds.playBeep(220, 'sawtooth', 0.3, 0.2);
  } else {
    arenaWinnerTitle.textContent = `🤝 BERABERE!`;
    arenaWinnerTitle.className = 'text-2xl sm:text-3xl font-black text-cyber-neonBlue drop-shadow-lg';
    arenaWinnerDesc.textContent = `İnanılmaz! İki oyuncu da hedefe tam ${p1Diff} ms yakınlıkta tahmin yaptı!`;
    sounds.playGood();
  }
}

/* --- STANDART 1v1 MODLARI (TİMİ / NORMAL) AKIŞI --- */

function setupArenaReadyState() {
  arenaActionBtn.disabled = false;
  arenaBtnText.textContent = 'BAŞLAT';
  arenaBtnIcon.setAttribute('data-lucide', 'play');
  arenaP1Diff.textContent = 'Başlatmayı bekliyor...';
  lucide.createIcons();

  // 10 Saniye Otomatik Başlama Kuralı
  arenaAutoStartNotice.classList.remove('hidden');
  arenaAutoStartRemaining = 10;
  arenaAutoStartTimer.textContent = arenaAutoStartRemaining;

  if (arenaAutoStartInterval) clearInterval(arenaAutoStartInterval);
  arenaAutoStartInterval = setInterval(() => {
    arenaAutoStartRemaining--;
    arenaAutoStartTimer.textContent = arenaAutoStartRemaining;
    if (arenaAutoStartRemaining <= 0) {
      clearInterval(arenaAutoStartInterval);
      startArenaRunning();
    }
  }, 1000);
}

function startArenaRunning() {
  if (arenaRunning || arenaStopped) return;
  if (arenaAutoStartInterval) clearInterval(arenaAutoStartInterval);
  arenaAutoStartNotice.classList.add('hidden');

  arenaRunning = true;
  arenaStartTime = performance.now();
  arenaActionBtn.disabled = false;
  arenaBtnText.textContent = 'DURDUR';
  arenaBtnIcon.setAttribute('data-lucide', 'square');
  arenaActionBtn.className = 'w-full py-5 rounded-2xl font-black text-xl tracking-wider uppercase flex items-center justify-center space-x-3 transition-all transform active:scale-95 shadow-xl select-none bg-gradient-to-r from-red-500 to-rose-600 text-white hover:brightness-110';
  arenaP1Diff.textContent = currentArenaMode === 'timi' ? 'Sayıyor (İçinden Say!)...' : 'Sayıyor...';
  sounds.playStart();
  lucide.createIcons();

  arenaRafId = requestAnimationFrame(updateArenaTimer);
}

function updateArenaTimer() {
  if (!arenaRunning || arenaStopped) return;
  arenaElapsedTime = performance.now() - arenaStartTime;
  const { formatted } = get2DigitTime(arenaElapsedTime);

  // TİMİ MOD (NO LOOK) Kontrolü: Kullanıcı saniyeyi göremez, ??.??.?? gösterilir!
  if (currentArenaMode === 'timi') {
    arenaP1Time.textContent = '??.??.??';
  } else {
    arenaP1Time.textContent = formatted;
  }

  arenaRafId = requestAnimationFrame(updateArenaTimer);
}

function handleArenaAction() {
  if (!isArenaActive || currentArenaMode === 'guess') return;

  // Kullanıcı henüz başlatmadıysa (10 sn bekleme süresindeyse): BAŞLAT
  if (!arenaRunning && !arenaStopped) {
    startArenaRunning();
    return;
  }

  // Kronometre çalışıyorsa: DURDUR
  if (arenaRunning && !arenaStopped) {
    arenaStopped = true;
    arenaRunning = false;
    cancelAnimationFrame(arenaRafId);
    if (arenaAutoStartInterval) clearInterval(arenaAutoStartInterval);

    arenaActionBtn.disabled = true;
    arenaActionBtn.className = 'w-full py-5 rounded-2xl font-black text-xl tracking-wider uppercase flex items-center justify-center space-x-3 shadow-xl select-none bg-slate-800 text-slate-500 cursor-not-allowed';
    arenaBtnText.textContent = 'DURDURULDU';
    arenaBtnIcon.setAttribute('data-lucide', 'check');
    lucide.createIcons();
    sounds.playStop();

    const finalElapsed = performance.now() - arenaStartTime;
    const { m, s, ms2, formatted } = get2DigitTime(finalElapsed);

    // TİMİ modunda bile durdurulduğu an gerçek süre ortaya çıkar!
    arenaP1Time.textContent = formatted;

    const target = currentMatch.targetTime;
    let diff = 0;
    let diffText = '';
    let targetCentiseconds = 0;

    if (target.unit === 'second') {
      const actualUnits = (m * 60 + s) * 100 + ms2;
      const targetUnits = target.main * 100 + (target.sub % 100);
      targetCentiseconds = targetUnits;
      const rawDiff = actualUnits - targetUnits;
      diff = Math.abs(rawDiff);
      const sign = rawDiff >= 0 ? '+' : '-';
      diffText = `${sign}${diff} ms`;
    } else if (target.unit === 'millisecond') {
      const actualUnits = (m * 60 + s) * 100 + ms2;
      const targetUnits = target.main;
      targetCentiseconds = targetUnits;
      const rawDiff = actualUnits - targetUnits;
      diff = Math.abs(rawDiff);
      const sign = rawDiff >= 0 ? '+' : '-';
      diffText = `${sign}${diff} ms`;
    }

    arenaP1Diff.textContent = `Fark: ${diffText}`;

    // Başarı Oranı (%) Hesaplama
    const baseUnits = Math.max(targetCentiseconds, 10);
    const accuracy = Math.max(0, 100 - ((diff / baseUnits) * 100)).toFixed(1);

    currentMatch.p1Result = {
      elapsed: finalElapsed,
      formatted: formatted,
      diff: diff,
      diffText: diffText,
      accuracy: accuracy
    };

    broadcast({
      type: 'ARENA_STOP',
      matchId: currentMatch.matchId,
      result: currentMatch.p1Result
    });

    checkArenaOutcome();
  }
}

arenaActionBtn.addEventListener('click', handleArenaAction);

function checkArenaOutcome() {
  if (!currentMatch || !currentMatch.p1Result || !currentMatch.p2Result) return;

  cancelAnimationFrame(arenaRafId);
  const p1 = currentMatch.p1Result;
  const p2 = currentMatch.p2Result;

  arenaWinnerBanner.classList.remove('hidden');

  arenaP1AccuracyLabel.textContent = 'Sizin Başarı Oranınız';
  arenaP2AccuracyLabel.textContent = 'Rakip Başarı Oranı';
  arenaP1Accuracy.textContent = `%${p1.accuracy}`;
  arenaP2Accuracy.textContent = `%${p2.accuracy}`;

  if (p1.diff < p2.diff) {
    arenaWinnerTitle.textContent = `🏆 ${currentMatch.p1} KAZANDI!`;
    arenaWinnerTitle.className = 'text-2xl sm:text-3xl font-black text-yellow-400 drop-shadow-lg';
    arenaWinnerDesc.textContent = `Tebrikler! Hedefe ${p1.diff} ms farkla (${p1.accuracy}% başarı) daha çok yaklaştınız (Rakip: ${p2.diff} ms, %${p2.accuracy}).`;
    sounds.playMegaVictory();
    triggerMegaConfetti();
  } else if (p2.diff < p1.diff) {
    arenaWinnerTitle.textContent = `💀 ${currentMatch.p2} KAZANDI!`;
    arenaWinnerTitle.className = 'text-2xl sm:text-3xl font-black text-rose-400 drop-shadow-lg';
    arenaWinnerDesc.textContent = `Rakip ${p2.diff} ms farkla (${p2.accuracy}% başarı) kazandı (Siz: ${p1.diff} ms, %${p1.accuracy}).`;
    sounds.playBeep(220, 'sawtooth', 0.3, 0.2);
  } else {
    arenaWinnerTitle.textContent = `🤝 BERABERE!`;
    arenaWinnerTitle.className = 'text-2xl sm:text-3xl font-black text-cyber-neonBlue drop-shadow-lg';
    arenaWinnerDesc.textContent = `İki oyuncu da tam olarak ${p1.diff} ms fark (%${p1.accuracy}) ile durdurdu!`;
    sounds.playGood();
  }
}

arenaExitBtn.addEventListener('click', () => {
  cancelAnimationFrame(arenaRafId);
  if (arenaAutoStartInterval) clearInterval(arenaAutoStartInterval);
  if (guessTimeoutId) clearTimeout(guessTimeoutId);
  isArenaActive = false;
  vsArenaModal.classList.add('hidden');
});

arenaRematchBtn.addEventListener('click', () => {
  const newMatchId = 'match_' + Date.now();
  const newRandomTarget = generateRandomVsTarget();
  const newGuessDuration = generateRandomGuessDuration();
  broadcast({
    type: 'ARENA_REMATCH',
    matchId: currentMatch.matchId,
    newMatchId: newMatchId,
    targetTime: newRandomTarget,
    guessDurationMs: newGuessDuration
  });
  openModeSelectionModal(newMatchId, currentMatch.p1, currentMatch.p2, newRandomTarget, newGuessDuration);
});
