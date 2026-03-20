const API = 'http://localhost:5000';

Chart.defaults.color = '#7a8096';
Chart.defaults.borderColor = 'rgba(255,255,255,0.05)';
Chart.defaults.font.family = 'JetBrains Mono';
Chart.defaults.font.size = 11;

function renderFuelChart() {
  new Chart(document.getElementById('fuelChart'), {
    type: 'bar',
    data: {
      labels: ['Diesel', 'Petrol', 'CNG', 'LPG'],
      datasets: [{
        label: 'Avg Selling Price (Lakhs)',
        data: [7.8, 5.2, 3.6, 2.9],
        backgroundColor: ['rgba(255,107,43,0.8)','rgba(77,184,255,0.8)','rgba(62,255,160,0.7)','rgba(192,132,252,0.7)'],
        borderRadius: 6, borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, title: { display: true, text: 'Avg Price (Lakhs)', color: '#7a8096' } },
        x: { grid: { display: false } }
      }
    }
  });
}

function renderTransChart() {
  new Chart(document.getElementById('transChart'), {
    type: 'doughnut',
    data: {
      labels: ['Manual', 'Automatic'],
      datasets: [{
        data: [4.2, 9.8],
        backgroundColor: ['rgba(77,184,255,0.8)', 'rgba(255,107,43,0.8)'],
        borderColor: '#0f1116', borderWidth: 3,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom', labels: { padding: 16 } },
        tooltip: { callbacks: { label: ctx => ` Avg ₹${ctx.raw}L` } }
      }
    }
  });
}

function renderImportanceChart() {
  new Chart(document.getElementById('importanceChart'), {
    type: 'bar',
    data: {
      labels: ['Present Price', 'Car Age', 'KMs Driven', 'Fuel Type', 'Transmission', 'Seller Type', 'Owner Count'],
      datasets: [{
        label: 'Importance Score',
        data: [0.612, 0.158, 0.094, 0.062, 0.038, 0.022, 0.014],
        backgroundColor: (ctx) => ctx.dataIndex === 0 ? 'rgba(255,107,43,0.85)' : 'rgba(77,184,255,0.65)',
        borderRadius: 6, borderSkipped: false
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, title: { display: true, text: 'Importance', color: '#7a8096' } },
        y: { grid: { display: false } }
      }
    }
  });
}

function renderAgeChart() {
  const ages = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
  const prices = ages.map(a => Math.max(0.8, 8.5 * Math.pow(0.83, a)).toFixed(2));
  new Chart(document.getElementById('ageChart'), {
    type: 'line',
    data: {
      labels: ages.map(a => a + 'yr'),
      datasets: [{
        label: 'Estimated Price (₹L)',
        data: prices,
        borderColor: '#ff6b2b', backgroundColor: 'rgba(255,107,43,0.08)',
        borderWidth: 2.5, fill: true, tension: 0.4,
        pointRadius: 4, pointBackgroundColor: '#ff6b2b'
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, title: { display: true, text: 'Approx Price (Lakhs)', color: '#7a8096' } },
        x: { grid: { display: false } }
      }
    }
  });
}

async function runPredict() {
  const presentPrice = parseFloat(document.getElementById('presentPrice').value);
  const kmsDriven    = parseFloat(document.getElementById('kmsDriven').value);
  const carAge       = parseInt(document.getElementById('carAge').value);
  const owner        = parseInt(document.getElementById('owner').value);
  const fuelType     = document.getElementById('fuelType').value;
  const sellerType   = document.getElementById('sellerType').value;
  const transmission = document.getElementById('transmission').value;

  if (!presentPrice || !kmsDriven || isNaN(carAge)) {
    showToast('Please fill all required fields');
    return;
  }

  const btn = document.getElementById('predictBtn');
  document.getElementById('btnLabel').classList.add('hidden');
  document.getElementById('btnSpin').classList.remove('hidden');
  btn.disabled = true;

  try {
    const res = await fetch(`${API}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ present_price: presentPrice, kms_driven: kmsDriven, car_age: carAge, owner, fuel_type: fuelType, seller_type: sellerType, transmission })
    });
    const data = await res.json();
    if (data.success) showResult(data);
    else showToast('API error: ' + data.error);
  } catch {
    simulateResult(presentPrice, kmsDriven, carAge, owner, fuelType, transmission);
  } finally {
    document.getElementById('btnLabel').classList.remove('hidden');
    document.getElementById('btnSpin').classList.add('hidden');
    btn.disabled = false;
  }
}

function showResult(data) {
  document.getElementById('resultPlaceholder').classList.add('hidden');
  const content = document.getElementById('resultContent');
  content.classList.remove('hidden');

  document.getElementById('resultPrice').textContent   = '₹' + data.predicted_price.toFixed(2) + 'L';
  document.getElementById('resultSegment').textContent = '— ' + data.segment + ' Segment —';
  document.getElementById('metaPresent').textContent   = '₹' + data.present_price + 'L';
  document.getElementById('metaDeprec').textContent    = data.depreciation_pct + '% lost';
  document.getElementById('metaSegment').textContent   = data.segment;

  const retained = 100 - data.depreciation_pct;
  document.getElementById('deprBar').style.width = Math.max(2, retained) + '%';

  const note = data.segment === 'Budget' ? 'Good for budget buyers. High depreciation zone.'
             : data.segment === 'Mid-Range' ? 'Sweet spot for value-conscious buyers.'
             : data.segment === 'Premium' ? 'Well-maintained or low-mileage premium vehicle.'
             : 'Luxury segment — consider certification and warranty.';
  document.getElementById('resultNote').textContent = note;

  if (data.flask_offline) {
    document.getElementById('resultNote').textContent = '⚠️ Demo mode — start Flask for real ML predictions. ' + note;
  }
}

function simulateResult(present, kms, age, owner, fuel, trans) {
  let base = present;
  base -= age * 0.14 * present;
  base -= (kms / 100000) * 0.08 * present;
  base -= owner * 0.07 * present;
  if (fuel === 'Diesel') base *= 1.12;
  if (fuel === 'CNG') base *= 0.88;
  if (trans === 'Automatic') base *= 1.15;
  base = Math.max(0.3, base + (Math.random() * 0.4 - 0.2));

  const segment = base < 3 ? 'Budget' : base < 8 ? 'Mid-Range' : base < 20 ? 'Premium' : 'Luxury';
  showResult({
    predicted_price: parseFloat(base.toFixed(2)),
    segment,
    present_price: present,
    depreciation_pct: parseFloat(((1 - base / present) * 100).toFixed(1)),
    flask_offline: true
  });
}

function showToast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  Object.assign(t.style, {
    position:'fixed', bottom:'2rem', right:'2rem', zIndex:'9999',
    background:'#15171e', color:'#f0f1f5', border:'1px solid rgba(255,255,255,0.1)',
    borderRadius:'10px', padding:'.75rem 1.25rem',
    fontFamily:'JetBrains Mono, monospace', fontSize:'12px'
  });
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

document.addEventListener('DOMContentLoaded', () => {
  renderFuelChart();
  renderTransChart();
  renderImportanceChart();
  renderAgeChart();
});
