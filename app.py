from flask import Flask, render_template, request, jsonify
import json, os

app = Flask(__name__)
DATA_FILE = 'data.json'

def load_data():
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'w') as f:
            json.dump([], f)
    with open(DATA_FILE, 'r') as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=4)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/data', methods=['GET'])
def get_data():
    data = load_data()
    return jsonify(data)

@app.route('/add', methods=['POST'])
def add_transaction():
    new_data = request.json
    data = load_data()
    data.append(new_data)
    save_data(data)
    return jsonify({"status": "success", "message": "Transaksi berhasil disimpan!"})

if __name__ == '__main__':
    app.run(debug=True)

