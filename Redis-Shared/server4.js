const express = require('express')
const axios = require("axios")
const Redis = require("ioredis")

const app = express()
const redis = new Redis()
const port = 3004;

app.use(express.json())

app.post("/server4", async (req, res) => {
    const { requestId, data } = req.body;
    const newData = data *2;
    console.log("Server4 data",newData) 
    
    // await redis.hset(requestId,"flow","Server4 -> Master","data",newData);

    let existingflow = await redis.hget(requestId,"flow")
    await redis.hset(requestId,"flow",`${existingflow} -> Server4`,"data",newData);

    res.send({requestId,finalData:newData})
});

app.listen(port,()=>{console.log("Server4 is running on port 3004")})