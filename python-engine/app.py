from flask import Flask, jsonify, request
from modules.forecast_model import forecast_sales
from modules.inventory_model import calculate_eoq
from modules.pricing_model import analyze_pricing_from_csv

app = Flask(__name__)

@app.route('/forecast', methods=['GET'])
def forecast():
    csv_url = request.args.get("csv_url")
    try:
        result = forecast_sales(csv_url)
        if isinstance(result, tuple):
            return jsonify(result[0]), result[1]
        return jsonify(result)
    except Exception as e:
        print("❌ Forecast Error:", e)
        return jsonify({"error": str(e)}), 500

@app.route('/inventory', methods=['GET'])
def inventory():
    try:
        eoq = calculate_eoq(500, 100, 2)
        return jsonify({"EOQ": eoq})
    except Exception as e:
        print("❌ Inventory Error:", e)
        return jsonify({"error": str(e)}), 500

@app.route('/pricing', methods=['GET'])
def pricing():
    csv_url = request.args.get('csv_url')
    units = int(request.args.get('units', 120))
    month = int(request.args.get('month', 6))

    if not csv_url:
        return jsonify({"error": "Missing csv_url"}), 400

    try:
        result = analyze_pricing_from_csv(csv_url, units, month)
        return jsonify(result)
    except Exception as e:
        print("❌ Pricing Error:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port)
