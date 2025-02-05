from flask import Flask, jsonify, render_template
import requests
import threading

app = Flask(__name__)

data_cache = {}

def fetch_data():
    global data_cache
    try:
        response = requests.get('http://127.0.0.1:8081/get-data')
        data_cache = response.json()
    except Exception as e:
        data_cache = {'error': str(e)}
    # Schedule the next fetch in 15 minutes
    threading.Timer(900, fetch_data).start()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get-data', methods=['GET'])
def get_data():
    return jsonify(data_cache)

if __name__ == '__main__':
    # Start the first fetch
    fetch_data()
    app.run(host='localhost', port=7000,use_reloader=True)