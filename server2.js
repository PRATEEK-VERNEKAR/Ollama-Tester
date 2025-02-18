const express = require('express')
const axios = require("axios")
const Redis = require("ioredis")

const app = express()
const redis = new Redis()
const port = 3002;

app.use(express.json())

app.post("/server2", async (req, res) => {
    const { requestId, data } = req.body;
    const newData = data + 5;
    console.log("Server2 data",newData)

    // await redis.hset(requestId,"flow","Server2 -> Server3","data",newData);

    let existingflow = await redis.hget(requestId,"flow");
    await redis.hset(requestId,"flow",`${existingflow} -> Server2`,"data-S2",newData);

    try{
        const response =  await axios.post("http://localhost:3003/server3", {requestId,data:newData})
        res.send(response.data)
    }
    catch(error){
        console.log(error)
        res.status(500).send("Error in Server2")

    }
});

app.listen(port,()=>{console.log("Server2 is running on port 3002")})