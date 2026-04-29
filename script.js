// ============================================================
//  Age Calculator — JavaScript
// ============================================================

// ── Today's date (shared reference) ──────────────────────────
const now = new Date();

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// ── Display today's date in the card ─────────────────────────
function showTodayLine() {
  const todayLine = document.getElementById('todayLine');
  todayLine.innerHTML =
    `Today is <strong>${MONTH_NAMES[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}</strong>`;
}

// ── Helpers ───────────────────────────────────────────────────

/**
 * Returns the number of days in a given month/year.
 * Using day=0 of the next month gives the last day of the current month.
 * @param {number} m - month (1–12)
 * @param {number} y - full year
 */
function daysInMonth(m, y) {
  return new Date(y, m, 0).getDate();
}

/** Set the error message text */
function setError(msg) {
  document.getElementById('errorMsg').textContent = msg;
}

/** Clear the error message */
function clearError() {
  setError('');
}

/**
 * Mark specific input fields as invalid (red border).
 * @param {string[]} ids - array of field IDs to mark invalid
 */
function markInvalid(ids) {
  ['day', 'month', 'year'].forEach(id => {
    document.getElementById(id).classList.toggle('invalid', ids.includes(id));
  });
}

/**
 * Animate a numeric display from its current value to a target value.
 * Uses a cubic ease-out for a natural feel.
 * @param {HTMLElement} el       - element whose textContent is updated
 * @param {number}      target   - final number
 * @param {number}      duration - animation duration in ms
 */
function animateNumber(el, target, duration = 600) {
  const start = parseInt(el.textContent) || 0;
  if (start === target) { el.textContent = target; return; }

  const step = (timestamp) => {
    if (!step.startTime) step.startTime = timestamp;
    const progress = Math.min((timestamp - step.startTime) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);   // cubic ease-out
    el.textContent = Math.round(start + (target - start) * eased);
    if (progress < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
}

// ── Main calculation ──────────────────────────────────────────
function calculate() {
  clearError();
  markInvalid([]);

  // Read raw input values
  const dayVal   = document.getElementById('day').value.trim();
  const monthVal = document.getElementById('month').value.trim();
  const yearVal  = document.getElementById('year').value.trim();

  // 1. Presence check
  if (!dayVal || !monthVal || !yearVal) {
    const missing = [];
    if (!dayVal)   missing.push('day');
    if (!monthVal) missing.push('month');
    if (!yearVal)  missing.push('year');
    markInvalid(missing);
    setError('Please fill in all fields.');
    return;
  }

  const d = parseInt(dayVal, 10);
  const m = parseInt(monthVal, 10);
  const y = parseInt(yearVal, 10);

  // 2. Month range check
  if (m < 1 || m > 12) {
    markInvalid(['month']);
    setError('Month must be between 1 and 12.');
    return;
  }

  // 3. Day range check (accounts for month length & leap years)
  const maxDays = daysInMonth(m, y);
  if (d < 1 || d > maxDays) {
    markInvalid(['day']);
    setError(`Day must be between 1 and ${maxDays} for that month.`);
    return;
  }

  // 4. Year range check
  if (y < 1 || y > now.getFullYear()) {
    markInvalid(['year']);
    setError(`Year must be between 1 and ${now.getFullYear()}.`);
    return;
  }

  // 5. Future-date check
  const dob = new Date(y, m - 1, d);
  if (dob > now) {
    markInvalid(['day', 'month', 'year']);
    setError('Date of birth cannot be in the future.');
    return;
  }

  // ── Age Calculation ─────────────────────────────────────────
  let years   = now.getFullYear() - dob.getFullYear();
  let months2 = now.getMonth()    - dob.getMonth();
  let days2   = now.getDate()     - dob.getDate();

  // If days are negative, borrow from the previous month
  if (days2 < 0) {
    months2--;
    days2 += daysInMonth(now.getMonth(), now.getFullYear());
  }

  // If months are negative, borrow from the previous year
  if (months2 < 0) {
    years--;
    months2 += 12;
  }

  // ── Extra statistics ────────────────────────────────────────
  const totalDays   = Math.floor((now - dob) / 86400000);
  const totalWeeks  = Math.floor(totalDays / 7);
  const totalMonths = years * 12 + months2;

  // Days until next birthday
  const nextBday = new Date(now.getFullYear(), m - 1, d);
  if (nextBday <= now) nextBday.setFullYear(nextBday.getFullYear() + 1);
  const daysToNext = Math.ceil((nextBday - now) / 86400000);

  // ── Reveal result UI ────────────────────────────────────────
  document.getElementById('divider').classList.add('visible');
  document.getElementById('result').classList.add('visible');
  document.getElementById('extra').classList.add('visible');
  document.getElementById('resetRow').classList.add('visible');

  // Animate the three main counters
  animateNumber(document.getElementById('resYears'),  years);
  animateNumber(document.getElementById('resMonths'), months2);
  animateNumber(document.getElementById('resDays'),   days2);

  // Populate the extra info panel
  document.getElementById('extra').innerHTML =
    `<span>${totalDays.toLocaleString()}</span> total days &nbsp;·&nbsp; ` +
    `<span>${totalWeeks.toLocaleString()}</span> weeks &nbsp;·&nbsp; ` +
    `<span>${totalMonths.toLocaleString()}</span> total months<br>` +
    `Next birthday in <span>${daysToNext}</span> day${daysToNext !== 1 ? 's' : ''}`;
}

// ── Reset ─────────────────────────────────────────────────────
function reset() {
  // Clear inputs and invalid states
  ['day', 'month', 'year'].forEach(id => {
    document.getElementById(id).value = '';
    document.getElementById(id).classList.remove('invalid');
  });

  clearError();

  // Hide result sections
  ['result', 'divider', 'extra', 'resetRow'].forEach(id => {
    document.getElementById(id).classList.remove('visible');
  });

  // Reset display text
  document.getElementById('resYears').textContent  = '—';
  document.getElementById('resMonths').textContent = '—';
  document.getElementById('resDays').textContent   = '—';
  document.getElementById('extra').innerHTML = '';

  // Return focus to first field
  document.getElementById('day').focus();
}

// ── Event Listeners ───────────────────────────────────────────

// Allow Enter key to trigger calculation from any input
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') calculate();
});

// ── Init ──────────────────────────────────────────────────────
showTodayLine();
document.getElementById('day').focus();
