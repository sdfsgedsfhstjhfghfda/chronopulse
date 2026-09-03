/**
 * ChronoPulse - Professional Precision Stopwatch, Timer & Live Turkey Clock
 * Format: 00.00.00 | Challenge: YOU BETTER THAN TİMİ?
 */

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
    this.playBeep(587.33, 'sine', 0.1, 0.2); // D5
    setTimeout(() => this.playBeep(880, 'triangle', 0.15, 0.2), 60); // A5
  }

  playStop() {
    this.playBeep(440, 'sine', 0.1, 0.2);
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
}

const sounds = new SoundEngine();

// Sound Toggle
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

// Fullscreen Toggle
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
   3. KRONOMETRE & HEDEF MODU (00.00.00 FORMAT & CALIBRATED TIMING)
   ========================================================================== */
let swIsRunning = false;
let swStartTime = 0;
let swElapsedTime = 0;
let swRafId = null;
let historyLaps = [];

// DOM Elements
const swPart1 = document.getElementById('swPart1');
const swPart2 = document.getElementById('swPart2');
const swPart3 = document.getElementById('swPart3');

const mainActionBtn = document.getElementById('mainActionBtn');
const btnIcon = document.getElementById('btnIcon');
const btnText = document.getElementById('btnText');
const lapBtn = document.getElementById('lapBtn');
const resetBtn = document.getElementById('resetBtn');

const targetValueInput = document.getElementById('targetValue');
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

let currentUnit = 'second'; // 'second', 'millisecond', 'hour'

// Update target label
function updateTargetLabel() {
  const val = Math.max(1, parseInt(targetValueInput.value) || 1);
  targetValueInput.value = val;
  let formattedTarget = '';

  if (currentUnit === 'second') {
    const m = String(Math.floor(val / 60)).padStart(2, '0');
    const s = String(val % 60).padStart(2, '0');
    formattedTarget = `${m}.${s}.00 (${val} Saniye)`;
  } else if (currentUnit === 'millisecond') {
    const s = String(Math.floor(val / 100)).padStart(2, '0');
    const ms = String(val % 100).padStart(2, '0');
    formattedTarget = `00.${s}.${ms} (${val} Milisaniye)`;
  } else if (currentUnit === 'hour') {
    const h = String(val).padStart(2, '0');
    formattedTarget = `${h}.00.00 (${val} Saat)`;
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

targetValueInput.addEventListener('input', updateTargetLabel);

// Format raw ms into components (Dakika . Saniye . Milisaniye 00-99)
function getTimeUnits(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const seconds = totalSeconds % 60;
  const milliUnits = Math.floor((ms % 1000) / 10); // 00-99

  return {
    m: minutes,
    s: seconds,
    msUnit: milliUnits,
    strM: String(minutes).padStart(2, '0'),
    strS: String(seconds).padStart(2, '0'),
    strMs: String(milliUnits).padStart(2, '0'),
    formatted: `${String(minutes).padStart(2, '0')}.${String(seconds).padStart(2, '0')}.${String(milliUnits).padStart(2, '0')}`
  };
}

function renderStopwatch(timeMs) {
  const { strM, strS, strMs } = getTimeUnits(timeMs);
  swPart1.textContent = strM;
  swPart2.textContent = strS;
  swPart3.textContent = strMs;
}

function updateStopwatch() {
  swElapsedTime = performance.now() - swStartTime;
  renderStopwatch(Math.floor(swElapsedTime));
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
  const targetVal = parseFloat(targetValueInput.value) || 1;
  const { m, s, msUnit, formatted } = getTimeUnits(elapsedMs);

  let targetFormatted = '';
  let actualFormatted = formatted;
  let diff = 0;
  let diffText = '';
  let rank = '';
  let title = '';
  let desc = '';
  let badgeClass = '';
  let borderClass = '';
  let icon = '';

  if (currentUnit === 'second') {
    // Target in 00-99 units: targetVal * 100
    // Actual in 00-99 units: (m * 60 + s) * 100 + msUnit
    const actualUnits = (m * 60 + s) * 100 + msUnit;
    const targetUnits = targetVal * 100;
    const rawDiff = actualUnits - targetUnits;
    diff = Math.abs(rawDiff);

    const tm = String(Math.floor(targetVal / 60)).padStart(2, '0');
    const ts = String(targetVal % 60).padStart(2, '0');
    targetFormatted = `${tm}.${ts}.00`;

    const sign = rawDiff >= 0 ? '+' : '-';
    diffText = `${sign}${diff} ms`;

    // Strict evaluation matching user's exact specification
    if (diff < 5) {
      rank = 'MÜKEMMEL';
      title = 'TİMİ';
      desc = `👑 İnanılmaz! Hedefle aranda sadece ${diff} ms fark var. YOU ARE THE REAL TİMİ!`;
      badgeClass = 'badge-timi';
      borderClass = 'border-timi';
      icon = '👑';
      sounds.playVictory();
      triggerConfetti();
    } else if (diff <= 10) {
      rank = 'HARİKA';
      title = 'REALLY GOOD';
      desc = `⚡ Harika refleks! Hedefe sadece ${diff} ms uzaktasın.`;
      badgeClass = 'badge-good';
      borderClass = 'border-good';
      icon = '⚡';
      sounds.playGood();
    } else if (diff <= 15) {
      rank = 'ORTA';
      title = 'NORMAL';
      desc = `🎯 Fena değil! ${diff} ms fark ile normale yakınsın.`;
      badgeClass = 'badge-normal';
      borderClass = 'border-normal';
      icon = '🎯';
      sounds.playBeep(440, 'sine', 0.15, 0.15);
    } else {
      rank = 'GELİŞTİRİLEBİLİR';
      title = 'THİS REALLY BAD';
      desc = `⚠️ Hedefin ${diff} ms uzağındasın. TİMİ olmak için daha hızlı olmalısın!`;
      badgeClass = 'badge-bad';
      borderClass = 'border-bad';
      icon = '⚠️';
      sounds.playBeep(220, 'sawtooth', 0.25, 0.2);
    }

  } else if (currentUnit === 'millisecond') {
    const actualUnits = (m * 60 + s) * 100 + msUnit;
    const targetUnits = targetVal;
    const rawDiff = actualUnits - targetUnits;
    diff = Math.abs(rawDiff);

    const ts = String(Math.floor(targetVal / 100)).padStart(2, '0');
    const tms = String(targetVal % 100).padStart(2, '0');
    targetFormatted = `00.${ts}.${tms}`;

    const sign = rawDiff >= 0 ? '+' : '-';
    diffText = `${sign}${diff} ms`;

    if (diff < 5) {
      rank = 'MÜKEMMEL';
      title = 'TİMİ';
      desc = `👑 Milisaniye ustası! Sadece ${diff} ms fark!`;
      badgeClass = 'badge-timi';
      borderClass = 'border-timi';
      icon = '👑';
      sounds.playVictory();
      triggerConfetti();
    } else if (diff <= 10) {
      rank = 'HARİKA';
      title = 'REALLY GOOD';
      desc = `⚡ Fark sadece ${diff} ms.`;
      badgeClass = 'badge-good';
      borderClass = 'border-good';
      icon = '⚡';
      sounds.playGood();
    } else if (diff <= 15) {
      rank = 'ORTA';
      title = 'NORMAL';
      desc = `🎯 Fark ${diff} ms.`;
      badgeClass = 'badge-normal';
      borderClass = 'border-normal';
      icon = '🎯';
      sounds.playBeep(440, 'sine', 0.15, 0.15);
    } else {
      rank = 'GELİŞTİRİLEBİLİR';
      title = 'THİS REALLY BAD';
      desc = `⚠️ Fark: ${diff} ms. Tekrar dene!`;
      badgeClass = 'badge-bad';
      borderClass = 'border-bad';
      icon = '⚠️';
      sounds.playBeep(220, 'sawtooth', 0.25, 0.2);
    }

  } else if (currentUnit === 'hour') {
    const actualSeconds = Math.floor(elapsedMs / 1000);
    const targetSeconds = targetVal * 3600;
    const rawDiff = actualSeconds - targetSeconds;
    diff = Math.abs(rawDiff);

    targetFormatted = `${String(targetVal).padStart(2, '0')}.00.00`;
    const sign = rawDiff >= 0 ? '+' : '-';
    diffText = `${sign}${diff} sn`;

    // Hour evaluation in seconds: < 5s -> TİMİ, 5-10s -> REALLY GOOD, 10-15s -> NORMAL, >15s -> THİS REALLY BAD
    if (diff < 5) {
      rank = 'MÜKEMMEL';
      title = 'TİMİ';
      desc = `👑 Saat bazında muazzam hassasiyet! Fark sadece ${diff} saniye.`;
      badgeClass = 'badge-timi';
      borderClass = 'border-timi';
      icon = '👑';
      sounds.playVictory();
      triggerConfetti();
    } else if (diff <= 10) {
      rank = 'HARİKA';
      title = 'REALLY GOOD';
      desc = `⚡ Fark sadece ${diff} saniye.`;
      badgeClass = 'badge-good';
      borderClass = 'border-good';
      icon = '⚡';
      sounds.playGood();
    } else if (diff <= 15) {
      rank = 'ORTA';
      title = 'NORMAL';
      desc = `🎯 Fark: ${diff} saniye.`;
      badgeClass = 'badge-normal';
      borderClass = 'border-normal';
      icon = '🎯';
      sounds.playBeep(440, 'sine', 0.15, 0.15);
    } else {
      rank = 'GELİŞTİRİLEBİLİR';
      title = 'THİS REALLY BAD';
      desc = `⚠️ Fark: ${diff} saniye.`;
      badgeClass = 'badge-bad';
      borderClass = 'border-bad';
      icon = '⚠️';
      sounds.playBeep(220, 'sawtooth', 0.25, 0.2);
    }
  }

  // Populate Result Card
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
  renderStopwatch(Math.floor(finalElapsed));

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
  const formatted = getTimeUnits(Math.floor(current)).formatted;
  
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
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
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
   4. ZAMANLAYICI (COUNTDOWN TIMER - 00.00.00 FORMAT)
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
    if (!timerIsRunning) {
      setTimerFromInputs();
    }
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
  if (timerRemainingSeconds <= 0) {
    setTimerFromInputs();
  }
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
  if (!timerIsRunning) {
    startTimer();
  } else {
    pauseTimer();
  }
});

timerResetBtn.addEventListener('click', resetTimer);

setTimerFromInputs();


/* ==========================================================================
   5. SAAT KAÇ? (CANLI TÜRKİYE SAATİ - 00.00.00 FORMAT)
   ========================================================================== */
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

  const formatterDate = new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  clockDate.textContent = formatterDate.format(now);

  const formatterDay = new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    weekday: 'long'
  });
  clockWeekDay.textContent = formatterDay.format(now);

  const numH = parseInt(h, 10) % 12;
  const numM = parseInt(m, 10);
  const numS = parseInt(s, 10);

  const secAngle = numS * 6;
  const minAngle = numM * 6 + (numS * 0.1);
  const hourAngle = (numH * 30) + (numM * 0.5);

  analogSec.style.transform = `translateX(-50%) rotate(${secAngle}deg)`;
  analogMin.style.transform = `translateX(-50%) rotate(${minAngle}deg)`;
  analogHour.style.transform = `translateX(-50%) rotate(${hourAngle}deg)`;
}

setInterval(updateTurkeyClock, 1000);
updateTurkeyClock();

lucide.createIcons();
