"""
app.py — Flask Backend for Unemployment Analysis
Loads the trained .pkl model and serves predictions via REST API
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__, static_folder='.')
CORS(app)  # Allow frontend to call this API

# ── Load saved model artifacts ──
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

try:
    model = joblib.load(os.path.join(BASE_DIR, 'unemployment_model.pkl'))
    le = joblib.load(os.path.join(BASE_DIR, 'label_encoder.pkl'))
    feature_cols = joblib.load(os.path.join(BASE_DIR, 'feature_cols.pkl'))
    states_list = joblib.load(os.path.join(BASE_DIR, 'states_list.pkl'))
    print("✅ All model artifacts loaded successfully!")
except Exception as e:
    print(f"⚠️ Could not load model: {e}")
    print("   Run the Jupyter notebook first to generate .pkl files")
    model = None
    le = None
    states_list = []
    feature_cols = ['State_Encoded', 'Month', 'Year', 'Quarter', 'Labour_Participation_Rate']


@app.route('/')
def serve_frontend():
    """Serve the main HTML dashboard"""
    return send_from_directory('.', 'index.html')


@app.route('/api/states', methods=['GET'])
def get_states():
    """Return list of all states for the frontend dropdown"""
    return jsonify({
        'success': True,
        'states': states_list
    })


@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Predict unemployment rate given:
    - state: string (e.g., "Maharashtra")
    - month: int (1–12)
    - year: int (e.g., 2024)
    - labour_participation_rate: float (e.g., 43.5)
    """
    if model is None:
        return jsonify({'success': False, 'error': 'Model not loaded. Run Jupyter notebook first.'}), 500

    try:
        data = request.get_json()

        state = data.get('state')
        month = int(data.get('month'))
        year = int(data.get('year'))
        lpr = float(data.get('labour_participation_rate', 43.0))

        # Determine quarter from month
        quarter = (month - 1) // 3 + 1

        # Encode state name to number
        state_encoded = le.transform([state])[0]

        # Build feature vector in correct order
        features = np.array([[state_encoded, month, year, quarter, lpr]])

        # Predict
        prediction = model.predict(features)[0]
        prediction = round(float(prediction), 2)

        # Determine risk level
        if prediction < 8:
            risk = 'Low'
            color = '#2ECC71'
        elif prediction < 15:
            risk = 'Moderate'
            color = '#F39C12'
        elif prediction < 25:
            risk = 'High'
            color = '#E74C3C'
        else:
            risk = 'Critical'
            color = '#8E44AD'

        return jsonify({
            'success': True,
            'prediction': prediction,
            'state': state,
            'month': month,
            'year': year,
            'quarter': quarter,
            'risk_level': risk,
            'risk_color': color,
            'interpretation': f"Predicted unemployment rate of {prediction}% indicates {risk.lower()} unemployment pressure in {state}."
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400


@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Return hardcoded stats for dashboard display (from EDA)"""
    return jsonify({
        'success': True,
        'stats': {
            'pre_covid_avg': 8.3,
            'covid_peak_avg': 23.5,
            'post_covid_avg': 11.8,
            'national_avg': 11.2,
            'highest_state': 'Tripura',
            'lowest_state': 'Gujarat',
            'data_period': '2019–2021'
        }
    })


if __name__ == '__main__':
    print("\n🚀 Starting Flask server on http://localhost:5000")
    print("📊 Open index.html or visit http://localhost:5000\n")
    app.run(debug=True, port=5000)
