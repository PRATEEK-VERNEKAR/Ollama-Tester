const express=require('express')
const axios=require('axios')
const Redis = require("ioredis")

const app = express()
const redis = new Redis()
const port = 5000;

app.get("/start",async (req,res)=>{
    const requestId = `req-${Date.now()}`;
    const requestData = {requestId,data:10};

    let existingflow = await redis.hget(requestId,"flow") || "Master"


    await redis.hset(requestId,"flow",`${existingflow}`,"data",requestData.data);
    try{
        const response = await axios.post("http://localhost:3001/server1",{requestId,requestData});
        res.send(response.data)
    }
    catch(error){
        console.log(Object.keys(error))
        console.log(error.response.data)
        console.log(error.message)
        
        res.status(500).send({requestId,requestData:error?.response?.data? error.response.data : error.message})
    }
})

async function analyzeFlow(requestId){
    const flow=await redis.hget(requestId,"flow");
    const expectedFlow = "Master -> Server1 -> Server2 -> Server3 -> Server4";

    const response = await axios.post("http://localhost:11434/api/generate",{
        model:"granite-code:8b",
        prompt:`Analyze this request flow: ${flow}, Expected flow: ${expectedFlow}. Identify discrepancies and suggest corrections.`,
        stream:false,
    })

    return response.data;
}

app.get("/analyze/:requestId",async (req,res)=>{
    const requestId = req.params.requestId;
    const analysis = await analyzeFlow(requestId);
    res.send(analysis);
})

app.listen(port,()=>{console.log("Master is running on port 5000")})