from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__, static_folder='.')
CORS(app)

BASE = os.path.dirname(os.path.abspath(__file__))

# -------------------------------
# SAFE ENCODER FUNCTION
# -------------------------------
def safe_encode(le, value, fallback_list):
    try:
        if hasattr(le, "classes_") and value in le.classes_:
            return le.transform([value])[0]
        elif value in fallback_list:
            return fallback_list.index(value)
        else:
            return 0
    except:
        return 0


# -------------------------------
# LOAD MODEL + ARTIFACTS
# -------------------------------
try:
    print("Loading model files from:", BASE)
    print("Files:", os.listdir(BASE))

    model         = joblib.load(os.path.join(BASE, 'car_price_model.pkl'))
    le_fuel       = joblib.load(os.path.join(BASE, 'le_fuel.pkl'))
    le_seller     = joblib.load(os.path.join(BASE, 'le_seller.pkl'))
    le_trans      = joblib.load(os.path.join(BASE, 'le_trans.pkl'))
    feature_cols  = joblib.load(os.path.join(BASE, 'feature_cols.pkl'))
    label_classes = joblib.load(os.path.join(BASE, 'label_classes.pkl'))

    print("All model artifacts loaded successfully")

except Exception as e:
    print("Model load error:", e)

    model = None
    le_fuel = le_seller = le_trans = None

    # fallback classes
    label_classes = {
        'fuel': ['Diesel', 'Petrol', 'CNG'],
        'seller': ['Dealer', 'Individual', 'Trustmark Dealer'],
        'transmission': ['Automatic', 'Manual']
    }

    feature_cols = [
        'present_price',
        'kms_driven',
        'car_age',
        'fuel_encoded',
        'seller_encoded',
        'trans_encoded',
        'owner'
    ]


# -------------------------------
# ROUTES
# -------------------------------
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')


@app.route('/api/options', methods=['GET'])
def get_options():
    return jsonify({'success': True, 'options': label_classes})


@app.route('/api/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({
            'success': False,
            'error': 'Model not loaded. Run notebook first.'
        }), 500

    try:
        d = request.get_json()
        print("Incoming data:", d)

        # -----------------------
        # INPUT PARSING
        # -----------------------
        present_price = float(d.get('present_price', 0))
        kms_driven    = float(d.get('kms_driven', 0))
        car_age       = int(d.get('car_age', 0))
        owner         = int(d.get('owner', 0))

        fuel_type     = d.get('fuel_type', 'Petrol')
        seller_type   = d.get('seller_type', 'Dealer')
        transmission  = d.get('transmission', 'Manual')

        # -----------------------
        # SAFE ENCODING
        # -----------------------
        fuel_enc = safe_encode(le_fuel, fuel_type, label_classes['fuel'])
        seller_enc = safe_encode(le_seller, seller_type, label_classes['seller'])
        trans_enc = safe_encode(le_trans, transmission, label_classes['transmission'])

        # -----------------------
        # FEATURE VECTOR
        # -----------------------
        col_map = {
            'present_price': present_price,
            'kms_driven': kms_driven,
            'car_age': car_age,
            'fuel_encoded': fuel_enc,
            'seller_encoded': seller_enc,
            'trans_encoded': trans_enc,
            'owner': owner
        }

        features = np.array([[col_map[c] for c in feature_cols]])

        # -----------------------
        # PREDICTION
        # -----------------------
        predicted = round(float(model.predict(features)[0]), 2)

        if predicted < 3:
            segment = 'Budget'
        elif predicted < 8:
            segment = 'Mid-Range'
        elif predicted < 20:
            segment = 'Premium'
        else:
            segment = 'Luxury'

        return jsonify({
            'success': True,
            'predicted_price': predicted,
            'segment': segment,
            'present_price': present_price,
            'depreciation_pct': round((1 - predicted / present_price) * 100, 1) if present_price > 0 else 0
        })

    except Exception as e:
        print("ERROR:", e)
        return jsonify({'success': False, 'error': str(e)}), 400


# -------------------------------
# RUN SERVER
# -------------------------------
if __name__ == '__main__':
    print("Flask running on http://localhost:5000")
    app.run(debug=True, port=5000)