            const express = require('express');
const axios = require("axios");
const Redis = require("ioredis");

const app = express();
const redis = new Redis();
const port = 3004;

app.use(express.json());

app.post("/server4", async (req, res) => {
    try {
        const { requestId } = req.body;
        const data = req.body.data || 1; // default value if 'data' is not provided in the request body
        const newData = data * 2;

        let existingFlow = await redis.hget(requestId,"flow");
        await redis.hset(requestId,"flow",existingFlow + " -> Server4");
        await redis.hset(requestId,"data-S4", newData);

        res.status(200).json({ requestId, finalData: newData });
    } catch (err) {
        console.log(err);
        res.status(500).send("Error in server 4");
    }
});

app.listen(port,()=>{console.log("Server4 is running on port 3004")});
