/**
 * script.js — Frontend Logic for Unemployment Analysis Dashboard
 * Connects HTML ↔ Flask backend via fetch() API calls
 * Charts powered by Chart.js
 */

const API_BASE = 'http://localhost:5000'; // Flask backend URL

// ─────────────────────────────────────────
// CHART DEFAULTS (dark theme setup)
// ─────────────────────────────────────────
Chart.defaults.color = '#8890a4';
Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';
Chart.defaults.font.family = 'DM Mono, monospace';
Chart.defaults.font.size = 11;

// ─────────────────────────────────────────
// 1. TREND CHART — National Unemployment Over Time
// ─────────────────────────────────────────
function renderTrendChart() {
  const labels = [
    'Jan 19','Feb 19','Mar 19','Apr 19','May 19','Jun 19','Jul 19','Aug 19','Sep 19','Oct 19','Nov 19','Dec 19',
    'Jan 20','Feb 20','Mar 20','Apr 20','May 20','Jun 20','Jul 20','Aug 20','Sep 20','Oct 20','Nov 20','Dec 20',
    'Jan 21','Feb 21','Mar 21','Apr 21','May 21','Jun 21'
  ];

  const data = [
    7.8, 8.1, 8.4, 8.9, 7.6, 7.2, 7.5, 7.8, 8.3, 7.9, 8.2, 8.0,
    8.5, 8.8, 9.1, 23.5, 21.8, 18.2, 14.5, 12.8, 11.4, 10.9, 11.2, 10.8,
    11.5, 12.1, 11.8, 12.4, 11.9, 11.6
  ];

  // COVID zone — indices 15–17 (Apr–Jun 2020)
  const covidZone = data.map((v, i) => (i >= 14 && i <= 17) ? v : null);

  const ctx = document.getElementById('trendChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Unemployment Rate (%)',
          data,
          borderColor: '#4db8ff',
          backgroundColor: 'rgba(77,184,255,0.06)',
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#4db8ff',
        },
        {
          label: 'COVID-19 Lockdown',
          data: covidZone,
          borderColor: '#ff4d6d',
          backgroundColor: 'rgba(255,77,109,0.15)',
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: '#ff4d6d',
        }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top' },
        tooltip: { backgroundColor: '#181c24', borderColor: '#2a2f3e', borderWidth: 1 }
      },
      scales: {
        y: {
          title: { display: true, text: 'Unemployment Rate (%)', color: '#8890a4' },
          grid: { color: 'rgba(255,255,255,0.04)' },
          min: 0, max: 30
        },
        x: { grid: { color: 'rgba(255,255,255,0.04)' } }
      }
    }
  });
}

// ─────────────────────────────────────────
// 2. SEASONAL CHART — Monthly Pattern
// ─────────────────────────────────────────
function renderSeasonalChart() {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const values = [8.2, 8.5, 9.1, 11.8, 12.4, 11.6, 10.2, 9.8, 9.4, 9.1, 9.0, 8.8];

  const ctx = document.getElementById('seasonalChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [{
        label: 'Avg Unemployment (%)',
        data: values,
        backgroundColor: values.map(v =>
          v > 11 ? 'rgba(255,77,109,0.75)' :
          v > 9.5 ? 'rgba(243,156,18,0.75)' :
          'rgba(61,255,154,0.55)'
        ),
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, min: 0, max: 15 },
        x: { grid: { display: false } }
      }
    }
  });
}

// ─────────────────────────────────────────
// 3. COVID IMPACT CHART — Comparison Bar
// ─────────────────────────────────────────
function renderCovidChart() {
  const ctx = document.getElementById('covidChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Pre-COVID', 'COVID\nLockdown', 'Post-COVID'],
      datasets: [{
        label: 'Avg Unemployment Rate (%)',
        data: [8.3, 23.5, 11.8],
        backgroundColor: ['rgba(61,255,154,0.7)', 'rgba(255,77,109,0.7)', 'rgba(77,184,255,0.7)'],
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: '#181c24', borderColor: '#2a2f3e', borderWidth: 1 }
      },
      scales: {
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, min: 0, max: 30 },
        x: { grid: { display: false } }
      }
    }
  });
}

// ─────────────────────────────────────────
// 4. POPULATE STATE DROPDOWN from Flask API
// ─────────────────────────────────────────
async function loadStates() {
  try {
    const res = await fetch(`${API_BASE}/api/states`);
    const data = await res.json();

    if (data.success) {
      const select = document.getElementById('stateSelect');
      data.states.forEach(state => {
        const opt = document.createElement('option');
        opt.value = state;
        opt.textContent = state;
        select.appendChild(opt);
      });
    }
  } catch (err) {
    // If Flask server not running, load demo states
    console.warn('Flask API not reachable. Loading demo states.');
    loadDemoStates();
  }
}

function loadDemoStates() {
  const demoStates = [
    'Andhra Pradesh','Assam','Bihar','Chandigarh','Delhi','Goa','Gujarat',
    'Haryana','Himachal Pradesh','Jammu & Kashmir','Jharkhand','Karnataka',
    'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Odisha',
    'Puducherry','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
    'Tripura','Uttar Pradesh','Uttarakhand','West Bengal'
  ];
  const select = document.getElementById('stateSelect');
  demoStates.forEach(state => {
    const opt = document.createElement('option');
    opt.value = state;
    opt.textContent = state;
    select.appendChild(opt);
  });
}

// ─────────────────────────────────────────
// 5. LOAD KPI STATS from Flask API
// ─────────────────────────────────────────
async function loadStats() {
  try {
    const res = await fetch(`${API_BASE}/api/stats`);
    const data = await res.json();
    if (data.success) {
      const s = data.stats;
      document.getElementById('kpi-precovid').textContent  = s.pre_covid_avg + '%';
      document.getElementById('kpi-peak').textContent      = s.covid_peak_avg + '%';
      document.getElementById('kpi-postcovid').textContent = s.post_covid_avg + '%';
      document.getElementById('kpi-national').textContent  = s.national_avg + '%';
    }
  } catch {
    // Already have hardcoded fallback values in HTML
    console.warn('Stats API not reachable. Using defaults.');
  }
}

// ─────────────────────────────────────────
// 6. PREDICT — calls Flask /api/predict
// ─────────────────────────────────────────
async function predict() {
  const state = document.getElementById('stateSelect').value;
  const month = document.getElementById('monthSelect').value;
  const year  = document.getElementById('yearSelect').value;
  const lpr   = document.getElementById('lprSlider').value;

  // Validate
  if (!state) {
    showToast('Please select a state first!');
    return;
  }

  // Show loading
  const btn = document.getElementById('predictBtn');
  document.getElementById('btnText').classList.add('hidden');
  document.getElementById('btnLoader').classList.remove('hidden');
  btn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        state,
        month: parseInt(month),
        year: parseInt(year),
        labour_participation_rate: parseFloat(lpr)
      })
    });

    const data = await res.json();

    if (data.success) {
      displayResult(data);
    } else {
      showToast('Prediction failed: ' + data.error);
    }

  } catch (err) {
    // If Flask not running, show a simulated result for demo
    console.warn('Flask not reachable. Showing simulated result.');
    simulateResult(state, month, year, lpr);
  } finally {
    document.getElementById('btnText').classList.remove('hidden');
    document.getElementById('btnLoader').classList.add('hidden');
    btn.disabled = false;
  }
}

// Display actual result from Flask
function displayResult(data) {
  const box = document.getElementById('resultBox');
  const riskColors = { Low: '#3dff9a', Moderate: '#f39c12', High: '#ff4d6d', Critical: '#c084fc' };

  document.getElementById('resultValue').textContent = data.prediction + '%';
  document.getElementById('resultValue').style.color = riskColors[data.risk_level] || '#d4ff4e';

  const riskEl = document.getElementById('resultRisk');
  riskEl.textContent = data.risk_level + ' Risk';
  riskEl.style.color = riskColors[data.risk_level];
  riskEl.style.border = `1px solid ${riskColors[data.risk_level]}44`;

  document.getElementById('resultInterp').textContent = data.interpretation;

  // Animate bar (max = 40% unemployment)
  const pct = Math.min((data.prediction / 40) * 100, 100);
  document.getElementById('resultBar').style.width = pct + '%';
  document.getElementById('resultBar').style.background = riskColors[data.risk_level];

  box.classList.remove('hidden');
  box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Offline demo fallback (when Flask not running)
function simulateResult(state, month, year, lpr) {
  // Simulate using a simple formula (not the actual ML model)
  const base = 10.5;
  const covidBoost = (parseInt(month) >= 3 && parseInt(month) <= 6 && parseInt(year) == 2020) ? 13 : 0;
  const seasonal   = [0, 0.5, 1.2, 2.8, 3.5, 2.5, 1.0, 0.5, 0, 0, -0.5, -0.3][parseInt(month) - 1];
  const lprEffect  = (43 - parseFloat(lpr)) * 0.15;
  const predicted  = Math.max(2, (base + covidBoost + seasonal + lprEffect + (Math.random() * 2 - 1)).toFixed(2));

  displayResult({
    success: true,
    prediction: parseFloat(predicted),
    state, month: parseInt(month), year: parseInt(year),
    risk_level: predicted < 8 ? 'Low' : predicted < 15 ? 'Moderate' : predicted < 25 ? 'High' : 'Critical',
    risk_color: predicted < 8 ? '#3dff9a' : predicted < 15 ? '#f39c12' : '#ff4d6d',
    interpretation: `⚠️ Demo mode (Flask offline). Estimated unemployment in ${state}: ${predicted}%. Connect Flask backend for ML model predictions.`
  });
}

// Simple toast notification
function showToast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = `
    position:fixed;bottom:2rem;right:2rem;z-index:9999;
    background:#181c24;color:#e8eaf0;border:1px solid rgba(255,255,255,0.1);
    border-radius:10px;padding:.75rem 1.25rem;
    font-family:'DM Mono',monospace;font-size:12px;
    animation:fadeIn .3s ease;
  `;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ─────────────────────────────────────────
// SMOOTH NAV ACTIVE STATES
// ─────────────────────────────────────────
function initNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
}

// ─────────────────────────────────────────
// INIT — run everything on page load
// ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderTrendChart();
  renderSeasonalChart();
  renderCovidChart();
  loadStates();
  loadStats();
  initNavHighlight();

  console.log('%c📊 Unemployment Analysis Dashboard', 'font-size:16px;font-weight:bold;color:#d4ff4e');
  console.log('%cFlask backend: http://localhost:5000', 'color:#8890a4;font-size:12px');
  console.log('%cRun: python app.py in the project folder', 'color:#8890a4;font-size:12px');
});
