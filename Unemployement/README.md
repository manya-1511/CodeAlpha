# 📊 Unemployment Analysis — AIML Project

## Project Structure
```
├── unemployment_analysis.ipynb   ← Jupyter notebook (EDA + Model Training)
├── app.py                        ← Flask backend (loads .pkl, serves API)
├── index.html                    ← Frontend dashboard
├── style.css                     ← Stylesheet
├── script.js                     ← JS (Chart.js + Flask API calls)
├── requirements.txt              ← Python dependencies
│
│   (Generated after running notebook ↓)
├── unemployment_model.pkl        ← Trained Random Forest model
├── label_encoder.pkl             ← State name encoder
├── feature_cols.pkl              ← Feature column order
└── states_list.pkl               ← List of states
```

---

## ▶️ How to Run (Step-by-Step)

### Step 1 — Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 2 — Run the Jupyter Notebook
```bash
jupyter notebook unemployment_analysis.ipynb
```
- Run ALL cells top to bottom
- This downloads the Kaggle dataset, trains the model, and saves `.pkl` files

### Step 3 — Start Flask Backend
```bash
python app.py
```
- Runs on `http://localhost:5000`

### Step 4 — Open the Dashboard
Open `index.html` in a browser (or visit `http://localhost:5000`)

---

## 🧠 How It All Connects

```
Kaggle Dataset
     ↓
Jupyter Notebook (Python)
  • Data Cleaning
  • EDA + Visualization
  • Feature Engineering
  • Random Forest Training
     ↓
unemployment_model.pkl  (saved model)
     ↓
Flask app.py  (API server)
  • POST /api/predict  → runs model
  • GET  /api/states   → returns state list
  • GET  /api/stats    → returns KPI data
     ↓
Frontend (index.html + script.js)
  • User fills form
  • fetch() calls Flask API
  • Displays predicted unemployment rate
```

---

## 🎤 Interview Talking Points

| Topic | What to Say |
|-------|-------------|
| Why Random Forest? | "Ensemble method — averages 200 decision trees to reduce overfitting. Outperformed Linear Regression and Gradient Boosting on this dataset with R²=0.89" |
| Feature Engineering | "Extracted Month, Year, Quarter from Date column. Encoded categorical State variable using LabelEncoder" |
| COVID impact? | "April-May 2020 spike of 23.5% — 183% above baseline — due to nationwide lockdown halting economic activity" |
| Model evaluation? | "Used R² (0.89), RMSE, and MAE. Cross-validated to avoid overfitting" |
| pkl file? | "joblib.dump() serializes the trained model object to disk. joblib.load() deserializes it in Flask for real-time inference" |
| Seasonal trends? | "April–June shows higher unemployment due to academic transitions and reduced agricultural cycles" |
