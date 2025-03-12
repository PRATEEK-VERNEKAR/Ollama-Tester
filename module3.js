const express = require('express');
const axios = require("axios");
const Redis = require("ioredis");

const app = express();
const redis = new Redis();
const port = 3003;

app.use(express.json());

app.post("/server3", async (req, res) => {
    let flowchecker = false;

    try {
        const { requestId, data } = req.body;
        const newData = data * 3;

        let existingFlow = await redis.hget(requestId, "flow");
        await redis.hset(requestId, "flow", `${existingFlow} -> Server3`, "data-S3", newData);

        flowchecker = true;
        const response = await axios.post("http://localhost:3004/server4", { requestId, data: newData });
        res.send(response.data);
    } catch (error) {
        console.log(error?.response?.data);
        if (flowchecker) {
            return res.status(500).send(error?.response?.data);
        }
        res.status(500).send("Error in Server3");
    }
});

app.listen(port, () => { console.log("Server3 is running on port 3003") });