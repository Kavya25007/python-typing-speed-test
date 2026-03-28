/**
 * TypeForge — Typing Speed Test
 * ─────────────────────────────
 * Pure vanilla JS · no libraries · no frameworks
 * Features: real-time WPM, accuracy, char highlighting,
 *           timer modes, personal best, keyboard shortcuts
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════
   WORD BANK
   300+ carefully chosen words — varied lengths, common English
═══════════════════════════════════════════════════════════════ */
const WORD_BANK = [
  // Common short words
  "the","be","to","of","and","in","that","have","it","for","not","on","with",
  "he","as","you","do","at","this","but","his","by","from","they","we","say",
  "her","she","or","an","will","my","one","all","would","there","their",
  // Medium words
  "about","which","when","make","can","like","time","know","take","people",
  "into","year","your","good","some","could","them","see","other","than",
  "then","now","look","only","come","its","over","think","also","back",
  "after","use","two","how","our","work","first","well","way","even","new",
  "want","because","any","these","give","most","tell","very","much","just",
  "those","find","still","between","need","large","often","hand","high","place",
  "hold","turn","move","live","play","write","read","seem","feel","left",
  "keep","never","last","point","city","play","small","number","off","always",
  "next","food","below","around","another","came","done","long","might",
  // Longer, interesting words
  "beautiful","adventure","mountain","journey","discover","knowledge","create",
  "important","together","thinking","remember","question","possible","language",
  "example","process","problem","program","project","quickly","quietly","really",
  "simple","single","social","special","system","things","though","through",
  "already","another","between","central","century","chapter","company",
  "complete","content","country","current","decided","despite","digital",
  "different","energy","enough","entire","exactly","expect","forward","general",
  "getting","growing","history","however","include","instead","involve",
  "looking","machine","market","meaning","message","method","middle","million",
  "minutes","missing","modern","moment","morning","nothing","notice","object",
  "office","opened","outside","parent","pattern","perfect","person","picture",
  "position","present","private","produce","product","purpose","random",
  "reason","receive","recent","record","reduce","remain","report","require",
  "result","return","second","secret","section","sense","sentence","series",
  "service","several","similar","society","someone","something","sometimes",
  "source","station","student","subject","support","surface","target","theory",
  "therefore","thousand","together","tonight","toward","travel","trouble",
  "trying","unless","useful","usually","various","version","village","vision",
  "whether","without","wonder","writing","written","indeed","strong","taking",
  "certainly","community","development","experience","information","international",
  "opportunity","organization","performance","relationship","responsibility",
  "understanding","environment","government","management","technology",
  "achievement","communication","consideration","determination","establishment"
];

/* ═══════════════════════════════════════════════════════════════
   CONFIG
═══════════════════════════════════════════════════════════════ */
const CONFIG = {
  wordCount:          60,     // words in each generated paragraph
  defaultDuration:    60,     // seconds
  wpmUpdateInterval:  250,    // ms between WPM recalculations
  pbKey:             'typeforge_pb', // localStorage key
};

/* ═══════════════════════════════════════════════════════════════
   STATE
═══════════════════════════════════════════════════════════════ */
const State = {
  // Test content
  words:          [],    // array of words
  fullText:       '',    // full paragraph string
  chars:          [],    // flat array of char span elements

  // Typing state
  typed:          '',    // what the user has typed so far
  charIndex:      0,     // current cursor position in fullText
  correctChars:   0,
  incorrectChars: 0,
  totalKeystrokes: 0,

  // Timer
  duration:       60,    // chosen duration in seconds
  timeLeft:       60,
  timerID:        null,
  wpmIntervalID:  null,
  started:        false,
  finished:       false,

  // Tracking
  startTime:      null,
  lastWpm:        0,
};

/* ═══════════════════════════════════════════════════════════════
   DOM REFS
═══════════════════════════════════════════════════════════════ */
const DOM = {
  textDisplay:     document.getElementById('textDisplay'),
  ghostInput:      document.getElementById('ghostInput'),
  focusOverlay:    document.getElementById('focusOverlay'),
  typingSection:   document.getElementById('typingSection'),
  mistakeFlash:    document.getElementById('mistakeFlash'),
  progressFill:    document.getElementById('progressFill'),
  progressWrap:    document.getElementById('progressWrap'),

  // Stats
  wpmVal:          document.getElementById('wpmVal'),
  accVal:          document.getElementById('accVal'),
  timeVal:         document.getElementById('timeVal'),
  charsVal:        document.getElementById('charsVal'),
  statTime:        document.getElementById('statTime'),

  // Controls
  modeBtns:        document.querySelectorAll('.mode-btn'),
  refreshBtn:      document.getElementById('refreshBtn'),
  restartBtn:      document.getElementById('restartBtn'),

  // Results
  resultsOverlay:  document.getElementById('resultsOverlay'),
  finalWpm:        document.getElementById('finalWpm'),
  finalAcc:        document.getElementById('finalAcc'),
  finalChars:      document.getElementById('finalChars'),
  finalErrors:     document.getElementById('finalErrors'),
  finalTime:       document.getElementById('finalTime'),
  finalCorrect:    document.getElementById('finalCorrect'),
  pbBadge:         document.getElementById('pbBadge'),
  resultsRestartBtn: document.getElementById('resultsRestartBtn'),
  resultsNewTextBtn: document.getElementById('resultsNewTextBtn'),
};

/* ═══════════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  newTest();
  bindEvents();
});

/* ═══════════════════════════════════════════════════════════════
   TEXT GENERATION
═══════════════════════════════════════════════════════════════ */

/** Pick CONFIG.wordCount random words from the bank */
function generateWords() {
  const words = [];
  const bank = [...WORD_BANK];
  for (let i = 0; i < CONFIG.wordCount; i++) {
    const idx = Math.floor(Math.random() * bank.length);
    words.push(bank[idx]);
  }
  return words;
}

/**
 * Render the text as individual <span class="char"> elements.
 * Space characters also get spans so cursor placement works correctly.
 */
function renderText(words) {
  State.words    = words;
  State.fullText = words.join(' ');
  State.chars    = [];

  DOM.textDisplay.innerHTML = '';

  for (let i = 0; i < State.fullText.length; i++) {
    const span = document.createElement('span');
    span.classList.add('char', 'pending');
    span.textContent = State.fullText[i];
    DOM.textDisplay.appendChild(span);
    State.chars.push(span);
  }

  // Set cursor on first char
  setCursor(0);
}

/** Move the visual cursor to a given index */
function setCursor(index) {
  // Remove cursor from all
  State.chars.forEach(s => s.classList.remove('cursor'));
  // Add to current
  if (index < State.chars.length) {
    State.chars[index].classList.add('cursor');
    // Scroll into view if needed
    State.chars[index].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

/* ═══════════════════════════════════════════════════════════════
   TYPING LOGIC
═══════════════════════════════════════════════════════════════ */

/** Handle each keystroke on the ghost input */
function handleInput(e) {
  if (State.finished) return;

  const value = DOM.ghostInput.value;

  // Start timer on first character
  if (!State.started && value.length > 0) {
    startTimer();
  }

  // Process the current typed value
  updateCharState(value);
  State.typed = value;

  // Update live stats
  updateLiveStats();

  // Check if paragraph is complete
  if (State.charIndex >= State.fullText.length) {
    endTest();
  }
}

/**
 * Compare typed string against fullText and update char classes.
 * This runs on every keystroke for real-time feedback.
 */
function updateCharState(typed) {
  let correct   = 0;
  let incorrect = 0;

  for (let i = 0; i < State.chars.length; i++) {
    const span = State.chars[i];
    span.classList.remove('cursor', 'correct', 'incorrect', 'pending', 'extra');

    if (i < typed.length) {
      if (typed[i] === State.fullText[i]) {
        span.classList.add('correct');
        correct++;
      } else {
        span.classList.add('incorrect');
        incorrect++;
      }
    } else {
      span.classList.add('pending');
    }
  }

  State.charIndex      = typed.length;
  State.correctChars   = correct;
  State.incorrectChars = incorrect;

  setCursor(typed.length);

  // Update progress bar
  const progress = Math.min(100, (typed.length / State.fullText.length) * 100);
  DOM.progressFill.style.width = progress + '%';
  DOM.progressWrap.setAttribute('aria-valuenow', Math.round(progress));
}

/**
 * Detect when a new key was typed — used for error detection
 * (compare before/after lengths and character match)
 */
function handleKeydown(e) {
  if (State.finished) return;

  // Handle special keys
  if (e.key === 'Escape') { e.preventDefault(); restartTest(); return; }
  if (e.key === 'Tab')    { e.preventDefault(); newTest();     return; }
  if (e.key === 'Enter' && State.finished) { restartTest(); return; }

  // Detect a typing mistake in real-time (before input event fires)
  // We compare the char about to be typed vs expected
  if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
    State.totalKeystrokes++;
    const expected = State.fullText[DOM.ghostInput.value.length];
    if (e.key !== expected) {
      triggerMistakeFeedback();
    }
  }
}

/** Visual + subtle shake feedback on mistakes */
function triggerMistakeFeedback() {
  // Edge flash
  DOM.mistakeFlash.classList.remove('flash');
  void DOM.mistakeFlash.offsetWidth; // force reflow to restart animation
  DOM.mistakeFlash.classList.add('flash');

  // Shake the text box
  DOM.typingSection.classList.remove('shake');
  void DOM.typingSection.offsetWidth;
  DOM.typingSection.classList.add('shake');
  setTimeout(() => DOM.typingSection.classList.remove('shake'), 200);
}

/* ═══════════════════════════════════════════════════════════════
   TIMER
═══════════════════════════════════════════════════════════════ */

function startTimer() {
  State.started   = true;
  State.startTime = Date.now();
  State.timeLeft  = State.duration;

  // Show focus (remove overlay when typing starts)
  DOM.focusOverlay.classList.add('hidden');
  DOM.typingSection.classList.add('focused');

  // Countdown every second
  State.timerID = setInterval(() => {
    State.timeLeft--;
    DOM.timeVal.textContent = State.timeLeft;

    // Urgent flash in last 10 seconds
    if (State.timeLeft <= 10) {
      DOM.statTime.classList.add('urgent');
    }

    if (State.timeLeft <= 0) {
      endTest();
    }
  }, 1000);

  // Recalculate WPM more frequently for smooth display
  State.wpmIntervalID = setInterval(updateLiveStats, CONFIG.wpmUpdateInterval);
}

function stopTimer() {
  clearInterval(State.timerID);
  clearInterval(State.wpmIntervalID);
}

/* ═══════════════════════════════════════════════════════════════
   STATS
═══════════════════════════════════════════════════════════════ */

/** Calculate WPM: (correct chars / 5) / minutes elapsed */
function calcWPM() {
  if (!State.startTime || !State.started) return 0;
  const elapsedMin = (Date.now() - State.startTime) / 60000;
  if (elapsedMin === 0) return 0;
  return Math.round((State.correctChars / 5) / elapsedMin);
}

/** Accuracy = correct chars / total typed chars */
function calcAccuracy() {
  const total = State.correctChars + State.incorrectChars;
  if (total === 0) return 100;
  return Math.round((State.correctChars / total) * 100);
}

/** Update the live stat cards during typing */
function updateLiveStats() {
  const wpm = calcWPM();
  const acc = calcAccuracy();

  // WPM — pop animation when value changes significantly
  if (Math.abs(wpm - State.lastWpm) >= 2) {
    DOM.wpmVal.classList.remove('stat-pop');
    void DOM.wpmVal.offsetWidth;
    DOM.wpmVal.classList.add('stat-pop');
    State.lastWpm = wpm;
  }

  DOM.wpmVal.textContent   = wpm > 0 ? wpm : '—';
  DOM.accVal.textContent   = State.started ? acc + '%' : '—';
  DOM.charsVal.textContent = State.charIndex;
}

/* ═══════════════════════════════════════════════════════════════
   TEST LIFECYCLE
═══════════════════════════════════════════════════════════════ */

/** Fresh test: generate text, reset state, reset UI */
function newTest(keepDuration = false) {
  if (!keepDuration) {
    // Duration already set by mode button or defaults
  }
  resetState();
  const words = generateWords();
  renderText(words);
  resetUI();
  focusInput();
}

/** Restart with same text */
function restartTest() {
  resetState();
  renderText(State.words);
  resetUI();
  focusInput();
}

/** Reset all state variables */
function resetState() {
  stopTimer();
  State.typed           = '';
  State.charIndex       = 0;
  State.correctChars    = 0;
  State.incorrectChars  = 0;
  State.totalKeystrokes = 0;
  State.started         = false;
  State.finished        = false;
  State.startTime       = null;
  State.timeLeft        = State.duration;
  State.lastWpm         = 0;
}

/** Reset all UI elements */
function resetUI() {
  DOM.timeVal.textContent   = State.duration;
  DOM.wpmVal.textContent    = '—';
  DOM.accVal.textContent    = '—';
  DOM.charsVal.textContent  = '0';
  DOM.progressFill.style.width = '0%';
  DOM.progressWrap.setAttribute('aria-valuenow', '0');
  DOM.ghostInput.value      = '';
  DOM.statTime.classList.remove('urgent');
  DOM.focusOverlay.classList.remove('hidden');
  DOM.typingSection.classList.remove('focused');
  DOM.resultsOverlay.hidden = true;
}

/** End the test — show results */
function endTest() {
  if (State.finished) return;
  State.finished = true;
  stopTimer();

  const wpm      = calcWPM();
  const acc      = calcAccuracy();
  const elapsed  = State.duration - State.timeLeft;
  const timeTaken = State.startTime
    ? Math.round((Date.now() - State.startTime) / 1000)
    : elapsed;

  showResults(wpm, acc, timeTaken);
}

/* ═══════════════════════════════════════════════════════════════
   RESULTS
═══════════════════════════════════════════════════════════════ */

function showResults(wpm, acc, timeTaken) {
  // Populate result blocks
  DOM.finalWpm.textContent     = wpm;
  DOM.finalAcc.textContent     = acc + '%';
  DOM.finalChars.textContent   = State.charIndex;
  DOM.finalErrors.textContent  = State.incorrectChars;
  DOM.finalTime.textContent    = timeTaken + 's';
  DOM.finalCorrect.textContent = State.correctChars;

  // Personal best check
  const pb = parseInt(localStorage.getItem(CONFIG.pbKey) || '0', 10);
  if (wpm > pb && wpm > 0) {
    localStorage.setItem(CONFIG.pbKey, wpm);
    DOM.pbBadge.hidden = false;
  } else {
    DOM.pbBadge.hidden = true;
  }

  // Animate number counting up for WPM
  animateCount(DOM.finalWpm, 0, wpm, 800);

  DOM.resultsOverlay.hidden = false;
}

/** Animate a number counting from start to end over duration ms */
function animateCount(el, start, end, duration) {
  const startTime = performance.now();
  function tick(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + (end - start) * eased);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ═══════════════════════════════════════════════════════════════
   FOCUS MANAGEMENT
═══════════════════════════════════════════════════════════════ */

function focusInput() {
  DOM.ghostInput.focus({ preventScroll: true });
}

/* ═══════════════════════════════════════════════════════════════
   EVENT BINDING
═══════════════════════════════════════════════════════════════ */

function bindEvents() {

  // ── Ghost input events (the real typing capture) ──
  DOM.ghostInput.addEventListener('input',   handleInput);
  DOM.ghostInput.addEventListener('keydown', handleKeydown);

  // Prevent paste cheating
  DOM.ghostInput.addEventListener('paste', e => e.preventDefault());

  // ── Focus management ──
  // Clicking anywhere in the typing section focuses the input
  DOM.typingSection.addEventListener('click', focusInput);
  DOM.focusOverlay.addEventListener('click',  focusInput);

  // Re-focus when clicking anywhere on the page body
  document.addEventListener('click', e => {
    if (!State.finished) focusInput();
  });

  // Also focus on any keypress if not in an input already
  document.addEventListener('keydown', e => {
    if (
      e.target === document.body ||
      e.target === DOM.typingSection ||
      e.target === DOM.focusOverlay
    ) {
      if (e.key !== 'Tab' && e.key !== 'Escape') {
        focusInput();
      }
    }
  });

  // Track when input loses focus — show overlay hint
  DOM.ghostInput.addEventListener('blur', () => {
    if (!State.started && !State.finished) {
      // slight delay to avoid flicker when clicking buttons
      setTimeout(() => {
        if (document.activeElement !== DOM.ghostInput) {
          DOM.typingSection.classList.remove('focused');
        }
      }, 100);
    }
  });

  DOM.ghostInput.addEventListener('focus', () => {
    if (!State.finished) {
      DOM.typingSection.classList.add('focused');
      if (State.started) DOM.focusOverlay.classList.add('hidden');
    }
  });

  // ── Mode buttons ──
  DOM.modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      DOM.modeBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      // Update duration and restart
      State.duration = parseInt(btn.dataset.mode, 10);
      newTest(true);
    });
  });

  // ── Control buttons ──
  DOM.refreshBtn.addEventListener('click', () => newTest());
  DOM.restartBtn.addEventListener('click', () => restartTest());

  // ── Results buttons ──
  DOM.resultsRestartBtn.addEventListener('click', () => restartTest());
  DOM.resultsNewTextBtn.addEventListener('click', () => newTest());

  // ── Global keyboard shortcuts ──
  document.addEventListener('keydown', e => {
    if (e.key === 'Tab')    { e.preventDefault(); newTest(); }
    if (e.key === 'Escape') { e.preventDefault(); restartTest(); }
    if (e.key === 'Enter' && State.finished) restartTest();
  });

  // ── Prevent context menu on typing area (keeps it clean) ──
  DOM.typingSection.addEventListener('contextmenu', e => e.preventDefault());
}
