from flask import Flask,jsonify,request

app = Flask(__name__)

@app.route('/')
def api1():
    return jsonify({"HJOO":"JOIJIO"})

@app.route('/app1toapp2', methods=["POST"])

def api2():
    try:
        status_map=list()
        status_map.append(0)


        data = request.get_json()
        # print(data.key)

        status_map.append(status_map[-1]+1)

        newdata={}
        for key in data.keys():
            newdata[key]=data[key]*data[key]*data[key]

        status_map.append(status_map[-1]+1)
        
        return jsonify({"data": newdata, "status_map": status_map})
    except:
        return jsonify({"status_map":status_map})

if __name__=="__main__":
    app.run(host="localhost",port=8080, use_reloader=True)