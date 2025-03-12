const express = require('express')
const axios = require("axios")
const Redis = require("ioredis")

const app = express()
const redis = new Redis()
const port = 3001;

app.use(express.json())

app.post("/server1", async (req, res) => {
    let flowchecker = false;

    try{

        const { requestId, requestData } = req.body;
    
        const newData = requestData.data *2;
        
        let existingflow = await redis.hget(requestId,"flow")
        
        await redis.hset(requestId,"flow",`${existingflow} -> Server1`,"data-S1",newData);

        flowchecker=true;
        const response =  await axios.post("http://localhost:3002/server2", {requestId,data:newData})
        res.send(response.data)
    }
    catch(error){
        console.log(error.message)

    
        if(flowchecker){
            return res.status(500).send(error.response?.data)
        }
        res.status(500).send("Error in Server1")


    }
});

app.listen(port,()=>{console.log("Server1 is running on port 3001")})