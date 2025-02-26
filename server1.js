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
        console.log(req.body)
    
        const newData = requestData.data *2;
        console.log("Server1 data",newData,requestId)
        
        let existingflow = await redis.hget(requestId,"flow")
        
        console.log(existingflow)
        await redis.hset(requestId,"flow",`${existingflow} -> Server1`,"data-S1",newData);
        // return res.send("HI")

        flowchecker=true;
        const response =  await axios.post("http://localhost:3002/server2", {requestId,data:newData})
        res.send(response.data)
    }
    catch(error){
        // console.log(Object.keys(error))
        // console.log(error.response.data)
        console.log(error.message)

    
        if(flowchecker){
            return res.status(500).send(error.response?.data)
        }
        res.status(500).send("Error in Server1")

        // res.status(500).send({errormsg : error?.response?.data? error.response.data : "Error in Server1"})

    }
});

app.listen(port,()=>{console.log("Server1 is running on port 3001")})