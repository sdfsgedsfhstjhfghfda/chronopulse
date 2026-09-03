/**
 * ChronoPulse - Professional Precision Stopwatch, Timer, Live Clock & Global 1v1 VS Arena
 * Worldwide Real-Time Multiplayer Sync via Public Global Cloud Relay + BroadcastChannel
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

function generateRandomVsTarget() {
  const isPureMs = Math.random() < 0.20;

  if (isPureMs) {
    const ms = Math.floor(Math.random() * (99 - 3 + 1)) + 3;
    return {
      unit: 'millisecond',
      main: ms,
      sub: 0
    };
  } else {
    const sec = Math.floor(Math.random() * (10 - 3 + 1)) + 3;
    let ms = 0;
    if (Math.random() > 0.35) {
      ms = Math.floor(Math.random() * 100);
    }
    return {
      unit: 'second',
      main: sec,
      sub: ms
    };
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

const vsArenaModal = document.getElementById('vsArenaModal');
const arenaTargetLabel = document.getElementById('arenaTargetLabel');
const arenaCountdownOverlay = document.getElementById('arenaCountdownOverlay');
const arenaCountdownNumber = document.getElementById('arenaCountdownNumber');
const arenaP1Name = document.getElementById('arenaP1Name');
const arenaP2Name = document.getElementById('arenaP2Name');
const arenaP1Time = document.getElementById('arenaP1Time');
const arenaP2Time = document.getElementById('arenaP2Time');
const arenaP1Diff = document.getElementById('arenaP1Diff');
const arenaP2Diff = document.getElementById('arenaP2Diff');
const arenaActionBtn = document.getElementById('arenaActionBtn');
const arenaWinnerBanner = document.getElementById('arenaWinnerBanner');
const arenaWinnerTitle = document.getElementById('arenaWinnerTitle');
const arenaWinnerDesc = document.getElementById('arenaWinnerDesc');
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
        vsModal.classList.add('hidden');
        launchArenaMatch(data.matchId, currentUsername, data.fromUsername, data.targetTime);
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
        launchArenaMatch(data.newMatchId, currentMatch.p1, currentMatch.p2, data.targetTime);
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

      broadcast({
        type: 'INVITE_SEND',
        fromUsername: currentUsername,
        targetUser: targetUser,
        targetTime: randomTarget
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
    matchId: matchId
  });

  launchArenaMatch(matchId, currentUsername, currentInvite.fromUsername, currentInvite.targetTime);
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

function launchArenaMatch(matchId, p1, p2, targetTime) {
  isArenaActive = true;
  arenaStopped = false;
  arenaWinnerBanner.classList.add('hidden');

  currentMatch = {
    matchId: matchId,
    p1: p1,
    p2: p2,
    targetTime: targetTime,
    p1Result: null,
    p2Result: null
  };

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

  vsArenaModal.classList.remove('hidden');

  arenaCountdownOverlay.classList.remove('hidden');
  let count = 3;
  arenaCountdownNumber.textContent = count;
  arenaCountdownNumber.className = 'text-8xl sm:text-9xl font-black text-amber-400 animate-bounce';
  sounds.playBeep(440, 'triangle', 0.15, 0.3);

  const cInterval = setInterval(() => {
    count--;
    if (count > 0) {
      arenaCountdownNumber.textContent = count;
      sounds.playBeep(440, 'triangle', 0.15, 0.3);
    } else if (count === 0) {
      arenaCountdownNumber.textContent = 'BAŞLA!';
      arenaCountdownNumber.className = 'text-7xl sm:text-8xl font-black text-brand-glow animate-pulse';
      sounds.playStart();
    } else {
      clearInterval(cInterval);
      arenaCountdownOverlay.classList.add('hidden');
      startArenaStopwatch();
    }
  }, 1000);
}

function updateArenaTimer() {
  arenaElapsedTime = performance.now() - arenaStartTime;
  const { formatted } = get2DigitTime(arenaElapsedTime);
  if (!arenaStopped) {
    arenaP1Time.textContent = formatted;
  }
  arenaRafId = requestAnimationFrame(updateArenaTimer);
}

function startArenaStopwatch() {
  arenaActionBtn.disabled = false;
  arenaStartTime = performance.now();
  arenaRafId = requestAnimationFrame(updateArenaTimer);
}

function handleArenaAction() {
  if (arenaStopped || !isArenaActive) return;
  arenaStopped = true;
  arenaActionBtn.disabled = true;
  sounds.playStop();

  const finalElapsed = performance.now() - arenaStartTime;
  const { m, s, ms2, formatted } = get2DigitTime(finalElapsed);
  arenaP1Time.textContent = formatted;

  const target = currentMatch.targetTime;
  let diff = 0;
  let diffText = '';

  if (target.unit === 'second') {
    const actualUnits = (m * 60 + s) * 100 + ms2;
    const targetUnits = target.main * 100 + (target.sub % 100);
    const rawDiff = actualUnits - targetUnits;
    diff = Math.abs(rawDiff);
    const sign = rawDiff >= 0 ? '+' : '-';
    diffText = `${sign}${diff} ms`;
  } else if (target.unit === 'millisecond') {
    const actualUnits = (m * 60 + s) * 100 + ms2;
    const targetUnits = target.main;
    const rawDiff = actualUnits - targetUnits;
    diff = Math.abs(rawDiff);
    const sign = rawDiff >= 0 ? '+' : '-';
    diffText = `${sign}${diff} ms`;
  }

  arenaP1Diff.textContent = `Fark: ${diffText}`;

  currentMatch.p1Result = {
    elapsed: finalElapsed,
    formatted: formatted,
    diff: diff,
    diffText: diffText
  };

  broadcast({
    type: 'ARENA_STOP',
    matchId: currentMatch.matchId,
    result: currentMatch.p1Result
  });

  checkArenaOutcome();
}

arenaActionBtn.addEventListener('click', handleArenaAction);

function checkArenaOutcome() {
  if (!currentMatch || !currentMatch.p1Result || !currentMatch.p2Result) return;

  cancelAnimationFrame(arenaRafId);
  const p1Diff = currentMatch.p1Result.diff;
  const p2Diff = currentMatch.p2Result.diff;

  arenaWinnerBanner.classList.remove('hidden');

  if (p1Diff < p2Diff) {
    arenaWinnerTitle.textContent = `🏆 ${currentMatch.p1} KAZANDI!`;
    arenaWinnerTitle.className = 'text-2xl sm:text-3xl font-black text-yellow-400 drop-shadow-lg';
    arenaWinnerDesc.textContent = `Tebrikler! Hedefe ${p1Diff} ms farkla daha çok yaklaştınız (Rakip: ${p2Diff} ms).`;
    sounds.playMegaVictory();
    triggerMegaConfetti();
  } else if (p2Diff < p1Diff) {
    arenaWinnerTitle.textContent = `💀 ${currentMatch.p2} KAZANDI!`;
    arenaWinnerTitle.className = 'text-2xl sm:text-3xl font-black text-rose-400 drop-shadow-lg';
    arenaWinnerDesc.textContent = `Rakip ${p2Diff} ms farkla daha hızlı davrandı (Siz: ${p1Diff} ms).`;
    sounds.playBeep(220, 'sawtooth', 0.3, 0.2);
  } else {
    arenaWinnerTitle.textContent = `🤝 BERABERE!`;
    arenaWinnerTitle.className = 'text-2xl sm:text-3xl font-black text-cyber-neonBlue drop-shadow-lg';
    arenaWinnerDesc.textContent = `İki oyuncu da tam olarak ${p1Diff} ms fark ile durdurdu!`;
    sounds.playGood();
  }
}

arenaExitBtn.addEventListener('click', () => {
  cancelAnimationFrame(arenaRafId);
  isArenaActive = false;
  vsArenaModal.classList.add('hidden');
});

arenaRematchBtn.addEventListener('click', () => {
  const newMatchId = 'match_' + Date.now();
  const newRandomTarget = generateRandomVsTarget();
  broadcast({
    type: 'ARENA_REMATCH',
    matchId: currentMatch.matchId,
    newMatchId: newMatchId,
    targetTime: newRandomTarget
  });
  launchArenaMatch(newMatchId, currentMatch.p1, currentMatch.p2, newRandomTarget);
});
