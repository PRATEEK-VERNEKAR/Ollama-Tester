const express = require('express')
const axios = require("axios")
const Redis = require("ioredis")

const app = express()
const redis = new Redis()
const port = 3003;

app.use(express.json())

app.post("/server3", async (req, res) => {
    const { requestId, data } = req.body;
    const newData = data *3;
    console.log("Server3 data",newData)

    // await redis.hset(requestId,"flow","Server3 -> Server4","data",newData);

    let existingflow = await redis.hget(requestId,"flow");
    await redis.hset(requestId,"flow",`${existingflow} -> Server3`,"data-S3",newData);

    try{
        const response =  await axios.post("http://localhost:300/server4", {requestId,data:newData})
        res.send(response.data)
    }
    catch(error){
        console.log(error)
        console.log(Object.keys(error))
        console.log(Object.keys(error.message))
        res.status(500).send("Error in Server3")

    }
});

app.listen(port,()=>{console.log("Server2 is running on port 3003")})