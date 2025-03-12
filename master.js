const express=require('express')
const axios=require('axios')
const Redis = require("ioredis")
const fs = require("fs")

const app = express()
const redis = new Redis()
const port = 5000;


app.use(express.json())
app.get("/start",async (req,res)=>{
    const requestId = `req-${Date.now()}`;
    const requestData = {requestId,data:10};

    let existingflow = await redis.hget(requestId,"flow") || "Master"

    await redis.hset(requestId,"flow",`${existingflow}`,"data",requestData.data);
    try{
        const response = await axios.post("http://localhost:3001/server1",{requestId,requestData});
        res.send({...response.data,"inputData":10,"message":"Testing Successful"})
    }
    catch(error){
        res.status(500).send({requestId,requestData:error?.response?.data? error.response.data : error.message ,"inputData":10, "message":"Testing Failed"})
    }
})

app.post("/start",async (req,res)=>{
    const {initialVal}=req.body;

    const requestId= `req-${Date.now()}`
    const requestData= {requestId,data:initialVal};

    let existingFlow = await redis.hget(requestId,"flow") || "Master"

    await redis.hset(requestId,"flow",`${existingflow}`,"data",requestData.data);

    try{
        const response = await axios.post("http://localhost:3001/server1",{requestId,requestData});
        res.send(response.data)
    }
    catch(error){
        res.status(500).send({requestId,})
    }
})

async function analyzeFlow(requestId,s1exp,s2exp,s3exp,s4exp,modelType){
    const flow=await redis.hget(requestId,"flow");

    if(!flow){
        return {msg:"\n\nEnter correct requestId"}
    }
    const expectedFlow ="Master -> Server1 -> Server2 -> Server3 -> Server4";
    const inputdata=await redis.hget(requestId,"data");
    const s1obt= await redis.hget(requestId,"data-S1");
    const s2obt= await redis.hget(requestId,"data-S2");
    const s3obt= await redis.hget(requestId,"data-S3");
    const s4obt= await redis.hget(requestId,"data-S4");



    if(flow!==expectedFlow){
        const last=flow[flow.length-1];

        let errorCode=getServerCode(last);


        const flow_response = await axios.post("http://localhost:11434/api/generate",{
            model:`${modelType}` || "granite-code:34b",
            // prompt:`There is problem in this express javascript code, find out all the syntax errors here. Remember that redis is used in this project and it should use functions like hset() and hget() instead of set() or get() . Give the correct code and also give the possible reason for the error.
            // ${errorCode}
            // `,
            prompt:`There might be some syntax errors or semantic errors in the below ExpressJs javascript code, 
            ${errorCode}
            Fix the code and give the correct code
            `,
            stream:false,
            max_tokens:10,
            options:{
                temperature:0.4
            }
        })


        if(last=="r"){
            return {msg:`\n\n Module 1 might not be running or may have some error\n\nUse the following code\n`,code:flow_response.data.response}

        }
        return {msg:`\n\n Module ${parseInt(last)+1} might not be running or may have some error\n\nUse the following code\n`,code:flow_response.data.response}

    }
    else{
        if(s1exp!=s1obt){
            // let errorCode=getServerCode("0");
            // console.log(s1exp,s1obt)

            // const flow_response = await axios.post("http://localhost:11434/api/generate",{
            //     model:`${modelType}` || "granite-code:34b",
            //     prompt:`There is a problem in the multiplication logic of the following code block written in javascript.  

            //             const newData = requestData.data * 3;

            //             If the requestData.data variable is 10, the newData variable should be 20 but it calculated as 30 due to error in multiplication logic.

            //             Find the mistake and correct it and give the correct code block.`,
            //     stream:false,
            //     max_tokens:10,
            //     options:{
            //         temperature:0.4
            //     }
            // })
            // return {msg:"\n\nServer 1 output is incorrect\n\n This might be due to incorrect algorithm implementation",code:flow_response.data.response}
            return {msg:"\n\nServer 1 output is incorrect\n\n This might be due to incorrect algorithm implementation"}
        }
        else if(s2exp!=s2obt){
            return {msg:"\n\nServer 2 output is incorrect\n\n This might be due to incorrect algorithm implementation"}
        }
        else if(s3exp!=s3obt){
            return {msg:"\n\nServer 3 output is incorrect\n\n This might be due to incorrect algorithm implementation"}
        }
        else if(s4exp!=s4obt){
            return {msg:"\n\nServer 4 output is incorrect\n\n This might be due to incorrect algorithm implementation"}
        }
        else{
            return {msg:"\n\nAll server modules are working correctly and the flow is as expected"}
        }
    }

}

function getServerCode(server){
    if(server=="3"){
        const data=fs.readFileSync("module4.js", { encoding: 'utf8', flag: 'r' });
        return data;
    }
    else if(server=="2"){
        const data=fs.readFileSync("module3.js",{encoding: 'utf8', flag: 'r'});
        return data;
    }
    else if(server=="1"){
        const data=fs.readFileSync("module2.js",{encoding: 'utf8', flag: 'r'});
        return data;
    }
    else{
        const data=fs.readFileSync("module1.js",{encoding: 'utf8', flag: 'r'});
        return data;
    }
}



// app.get("/analyze/:requestId/:s1/:s2/:s3/:s4",async (req,res)=>{
//     console.log(req.params)
//     const requestId = req.params.requestId;
//     const analysis = await analyzeFlow(requestId,req.params.s1,req.params.s2,req.params.s3,req.params.s4);
//     console.log(analysis)
//     res.send(analysis);

// })

app.post("/analyze", async (req, res) => {
    console.log(req.body);
    const { requestId,s1exp,s2exp,s3exp,s4exp,modelType } = req.body;


    const analysis = await analyzeFlow(requestId,s1exp,s2exp,s3exp,s4exp,modelType);
    
    console.log(analysis);

    res.send(analysis);
});


app.listen(port,()=>{console.log("Master is running on port 5000")})