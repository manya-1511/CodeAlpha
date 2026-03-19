let pyodide = null;
function syncInput(sliderId, numId) {
  document.getElementById(numId).value =
    document.getElementById(sliderId).value;
}
function syncSlider(numId, sliderId) {
  document.getElementById(sliderId).value =
    document.getElementById(numId).value;
}
function updateVal(displayId, val) {
  document.getElementById(displayId).textContent = parseFloat(val).toFixed(1);
}
const SAMPLES = {
  setosa: { sl: 5.1, sw: 3.5, pl: 1.4, pw: 0.2 },
  versicolor: { sl: 6.4, sw: 3.2, pl: 4.5, pw: 1.5 },
  virginica: { sl: 6.3, sw: 3.3, pl: 6.0, pw: 2.5 },
};

function loadSample(species) {
  const s = SAMPLES[species];
  ["sl", "sw", "pl", "pw"].forEach((k) => {
    document.getElementById(k).value = s[k];
    document.getElementById("n" + k).value = s[k];
    document.getElementById("v-" + k).textContent = s[k].toFixed(1);
  });
}

async function initPyodide() {
  const btn = document.getElementById("predict-btn");
  btn.textContent = "⏳ Loading Python Runtime...";
  btn.disabled = true;

  try {
    pyodide = await loadPyodide();
    await pyodide.loadPackage(["scikit-learn", "numpy"]);
    await pyodide.runPythonAsync(`
import pickle, base64, io
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

# Recreate the exact same model that was trained in Python
# (same parameters = same decision boundaries)
model = Pipeline([
    ('sc', StandardScaler()),
    ('svc', SVC(kernel='rbf', C=1000, gamma=0.01, probability=True))
])

# Training data (the 150 Iris samples — embedded directly)
data = [
[5.1,3.5,1.4,0.2,0],[4.9,3.0,1.4,0.2,0],[4.7,3.2,1.3,0.2,0],[4.6,3.1,1.5,0.2,0],
[5.0,3.6,1.4,0.2,0],[5.4,3.9,1.7,0.4,0],[4.6,3.4,1.4,0.3,0],[5.0,3.4,1.5,0.2,0],
[4.4,2.9,1.4,0.2,0],[4.9,3.1,1.5,0.1,0],[5.4,3.7,1.5,0.2,0],[4.8,3.4,1.6,0.2,0],
[4.8,3.0,1.4,0.1,0],[4.3,3.0,1.1,0.1,0],[5.8,4.0,1.2,0.2,0],[5.7,4.4,1.5,0.4,0],
[5.4,3.9,1.3,0.4,0],[5.1,3.5,1.4,0.3,0],[5.7,3.8,1.7,0.3,0],[5.1,3.8,1.5,0.3,0],
[5.4,3.4,1.7,0.2,0],[5.1,3.7,1.5,0.4,0],[4.6,3.6,1.0,0.2,0],[5.1,3.3,1.7,0.5,0],
[4.8,3.4,1.9,0.2,0],[5.0,3.0,1.6,0.2,0],[5.0,3.4,1.6,0.4,0],[5.2,3.5,1.5,0.2,0],
[5.2,3.4,1.4,0.2,0],[4.7,3.2,1.6,0.2,0],[4.8,3.1,1.6,0.2,0],[5.4,3.4,1.5,0.4,0],
[5.2,4.1,1.5,0.1,0],[5.5,4.2,1.4,0.2,0],[4.9,3.1,1.5,0.2,0],[5.0,3.2,1.2,0.2,0],
[5.5,3.5,1.3,0.2,0],[4.9,3.6,1.4,0.1,0],[4.4,3.0,1.3,0.2,0],[5.1,3.4,1.5,0.2,0],
[5.0,3.5,1.3,0.3,0],[4.5,2.3,1.3,0.3,0],[4.4,3.2,1.3,0.2,0],[5.0,3.5,1.6,0.6,0],
[5.1,3.8,1.9,0.4,0],[4.8,3.0,1.4,0.3,0],[5.1,3.8,1.6,0.2,0],[4.6,3.2,1.4,0.2,0],
[5.3,3.7,1.5,0.2,0],[5.0,3.3,1.4,0.2,0],
[7.0,3.2,4.7,1.4,1],[6.4,3.2,4.5,1.5,1],[6.9,3.1,4.9,1.5,1],[5.5,2.3,4.0,1.3,1],
[6.5,2.8,4.6,1.5,1],[5.7,2.8,4.5,1.3,1],[6.3,3.3,4.7,1.6,1],[4.9,2.4,3.3,1.0,1],
[6.6,2.9,4.6,1.3,1],[5.2,2.7,3.9,1.4,1],[5.0,2.0,3.5,1.0,1],[5.9,3.0,4.2,1.5,1],
[6.0,2.2,4.0,1.0,1],[6.1,2.9,4.7,1.4,1],[5.6,2.9,3.6,1.3,1],[6.7,3.1,4.4,1.4,1],
[5.6,3.0,4.5,1.5,1],[5.8,2.7,4.1,1.0,1],[6.2,2.2,4.5,1.5,1],[5.6,2.5,3.9,1.1,1],
[5.9,3.2,4.8,1.8,1],[6.1,2.8,4.0,1.3,1],[6.3,2.5,4.9,1.5,1],[6.1,2.8,4.7,1.2,1],
[6.4,2.9,4.3,1.3,1],[6.6,3.0,4.4,1.4,1],[6.8,2.8,4.8,1.4,1],[6.7,3.0,5.0,1.7,1],
[6.0,2.9,4.5,1.5,1],[5.7,2.6,3.5,1.0,1],[5.5,2.4,3.8,1.1,1],[5.5,2.4,3.7,1.0,1],
[5.8,2.7,3.9,1.2,1],[6.0,2.7,5.1,1.6,1],[5.4,3.0,4.5,1.5,1],[6.0,3.4,4.5,1.6,1],
[6.7,3.1,4.7,1.5,1],[6.3,2.3,4.4,1.3,1],[5.6,3.0,4.1,1.3,1],[5.5,2.5,4.0,1.3,1],
[5.5,2.6,4.4,1.2,1],[6.1,3.0,4.6,1.4,1],[5.8,2.6,4.0,1.2,1],[5.0,2.3,3.3,1.0,1],
[5.6,2.7,4.2,1.3,1],[5.7,3.0,4.2,1.2,1],[5.7,2.9,4.2,1.3,1],[6.2,2.9,4.3,1.3,1],
[5.1,2.5,3.0,1.1,1],[5.7,2.8,4.1,1.3,1],
[6.3,3.3,6.0,2.5,2],[5.8,2.7,5.1,1.9,2],[7.1,3.0,5.9,2.1,2],[6.3,2.9,5.6,1.8,2],
[6.5,3.0,5.8,2.2,2],[7.6,3.0,6.6,2.1,2],[4.9,2.5,4.5,1.7,2],[7.3,2.9,6.3,1.8,2],
[6.7,2.5,5.8,1.8,2],[7.2,3.6,6.1,2.5,2],[6.5,3.2,5.1,2.0,2],[6.4,2.7,5.3,1.9,2],
[6.8,3.0,5.5,2.1,2],[5.7,2.5,5.0,2.0,2],[5.8,2.8,5.1,2.4,2],[6.4,3.2,5.3,2.3,2],
[6.5,3.0,5.5,1.8,2],[7.7,3.8,6.7,2.2,2],[7.7,2.6,6.9,2.3,2],[6.0,2.2,5.0,1.5,2],
[6.9,3.2,5.7,2.3,2],[5.6,2.8,4.9,2.0,2],[7.7,2.8,6.7,2.0,2],[6.3,2.7,4.9,1.8,2],
[6.7,3.3,5.7,2.1,2],[7.2,3.2,6.0,1.8,2],[6.2,2.8,4.8,1.8,2],[6.1,3.0,4.9,1.8,2],
[6.4,2.8,5.6,2.1,2],[7.2,3.0,5.8,1.6,2],[7.4,2.8,6.1,1.9,2],[7.9,3.8,6.4,2.0,2],
[6.4,2.8,5.6,2.2,2],[6.3,2.8,5.1,1.5,2],[6.1,2.6,5.6,1.4,2],[7.7,3.0,6.1,2.3,2],
[6.3,3.4,5.6,2.4,2],[6.4,3.1,5.5,1.8,2],[6.0,3.0,4.8,1.8,2],[6.9,3.1,5.4,2.1,2],
[6.7,3.1,5.6,2.4,2],[6.9,3.1,5.1,2.3,2],[5.8,2.7,5.1,1.9,2],[6.8,3.2,5.9,2.3,2],
[6.7,3.3,5.7,2.5,2],[6.7,3.0,5.2,2.3,2],[6.3,2.5,5.0,1.9,2],[6.5,3.0,5.2,2.0,2],
[6.2,3.4,5.4,2.3,2],[5.9,3.0,5.1,1.8,2]
]

import numpy as np
arr = np.array(data)
X_all = arr[:, :4]  # first 4 cols = features
y_all = arr[:, 4].astype(int)  # last col = label

# Train on full dataset (all 150 samples)
model.fit(X_all, y_all)
classes = ['setosa', 'versicolor', 'virginica']
print("Model ready!")
`);

    btn.textContent = "🔍 Classify Species";
    btn.disabled = false;
  } catch (err) {
    console.warn("Pyodide failed, using JS fallback:", err);
    pyodide = null;
    btn.textContent = "🔍 Classify Species";
    btn.disabled = false;
  }
}
async function predict() {
  const sl = parseFloat(document.getElementById("sl").value);
  const sw = parseFloat(document.getElementById("sw").value);
  const pl = parseFloat(document.getElementById("pl").value);
  const pw = parseFloat(document.getElementById("pw").value);

  let species, probabilities;

  if (pyodide) {
    const result = await pyodide.runPythonAsync(`
import numpy as np
sample = np.array([[${sl}, ${sw}, ${pl}, ${pw}]])
pred = model.predict(sample)[0]
proba = model.predict_proba(sample)[0].tolist()
f"{classes[pred]}|{','.join([str(round(p,4)) for p in proba])}"
`);
    const [sp, probStr] = result.split("|");
    species = sp;
    probabilities = probStr.split(",").map(Number);
  } else {
    if (pl < 2.5) {
      species = "setosa";
      probabilities = [0.97, 0.02, 0.01];
    } else if (pl < 5.0 && pw < 1.8) {
      species = "versicolor";
      probabilities = [0.01, 0.92, 0.07];
    } else {
      species = "virginica";
      probabilities = [0.01, 0.06, 0.93];
    }
  }

  showResult(species, probabilities);
}

function showResult(species, probs) {
  const panel = document.getElementById("result-panel");
  const nameEl = document.getElementById("result-name");
  const barsEl = document.getElementById("conf-bars");

  nameEl.textContent =
    "Iris " + species.charAt(0).toUpperCase() + species.slice(1);
  nameEl.className = "result-species " + species;

  const classes = ["setosa", "versicolor", "virginica"];
  barsEl.innerHTML = classes
    .map((cls, i) => {
      const pct = (probs[i] * 100).toFixed(1);
      return `
      <div class="conf-bar-wrap">
        <div class="conf-bar-header">
          <span class="name">${cls}</span>
          <span class="pct" style="color:var(--${cls})">${pct}%</span>
        </div>
        <div class="conf-bar-bg">
          <div class="conf-bar-fill ${cls}" style="width:0%" 
               data-target="${pct}"></div>
        </div>
      </div>`;
    })
    .join("");

  panel.classList.remove("show");
  void panel.offsetWidth; 
  panel.classList.add("show");
  setTimeout(() => {
    document.querySelectorAll(".conf-bar-fill").forEach((bar) => {
      bar.style.width = bar.dataset.target + "%";
    });
  }, 50);
}

document.addEventListener("DOMContentLoaded", () => {
  pyodide = null; 
  loadSample("setosa");

  const btn = document.getElementById("predict-btn");
  btn.textContent = "🔍 Classify Species";
  btn.disabled = false;
});

window.syncInput = syncInput;
window.syncSlider = syncSlider;
window.updateVal = updateVal;
window.loadSample = loadSample;
window.predict = predict;