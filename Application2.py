from flask import Flask, jsonify
import requests

app = Flask(__name__)

@app.route('/get-data', methods=['GET'])
def get_data():

    try:
        status_map=list()
        status_map.append(0)

        
        post_api_url = 'http://127.0.0.1:8080/app1toapp2'
        
        status_map.append(status_map[-1]+1)

        post_data = {
                        "key1":1,
                        "key2":2,
                        "key3":3,
                        "key4":4,
                        "key5":5,
                        "key6":6,
                        "key7":7,
                        "key8":8,
                        "key9":9,
                        "key10":10
                    }

        status_map.append(status_map[-1]+1)

        response = requests.post(post_api_url, json=post_data)


    
        status_map.append(status_map[-1]+1)

        if response.status_code>=200 and response.status_code<300 and len(response.json().get("status_map"))==3:
            status_map.append(status_map[-1]+1)

        # raise Exception("Some random error")


        return jsonify({"received_data":response.json().get("data"),"status_map1":response.json().get("status_map"),"status_map2":status_map})

    except:

        return jsonify({"status_map":status_map})
    


if __name__ == '__main__':
    app.run(host='localhost', port=8081 , use_reloader=True)