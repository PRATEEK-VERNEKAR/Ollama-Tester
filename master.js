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
        res.send(response.data)
    }
    catch(error){
        // console.log(Object.keys(error))
        // console.log(error.response.data)
        // console.log(error.message)
        
        res.status(500).send({requestId,requestData:error?.response?.data? error.response.data : error.message})
    }
})

async function analyzeFlow(requestId,s1exp,s2exp,s3exp,s4exp,modelType){
    console.log(requestId,s1exp,s2exp,s3exp,s4exp)
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

    console.log(flow)
    console.log(expectedFlow)
    console.log("inputdata",inputdata)

    if(flow!==expectedFlow){
        const last=flow[flow.length-1];
        console.log(last)

        let errorCode=getServerCode(last);


        const flow_response = await axios.post("http://localhost:11434/api/generate",{
            model:`${modelType}` || "granite-code:34b",
            prompt:`There is problem in this express javascript code, find out all the syntax errors here. Remember that redis is used in this project and it should use functions like hset() and hget() instead of set() or get() . Give the correct code and also give the possible reason for the error.
            ${errorCode}
            `,
            stream:false,
            max_tokens:10,
            options:{
                temperature:0.4
            }
        })

        // return `Server ${parseInt(last)+1} might not be running or may have the following error\n\n`

        if(last=="r"){
            return {msg:`\n\nServer 1 might not be running or may have some error\n\nUse the following code\n`,code:flow_response.data.response}

        }
        return {msg:`\n\nServer ${parseInt(last)+1} might not be running or may have some error\n\nUse the following code\n`,code:flow_response.data.response}

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


    // const flow_response = await axios.post("http://localhost:11434/api/generate",{
    //     model:"granite-code:34b",
    //     prompt:`You are a Software Integration Analyzer. There are 4 api modules each interconnected by sharing data to perform a arithmetic task.
    //     The expected flow is ${expectedFlow} and the obtained flow is ${expectedFlow}. Check if the flow is correct of not
    //     `,
    //     stream:false,
    //     max_tokens:10,
    //     options:{
    //         temperature:0.1
    //     }
    // })

    // if(flow===expectedFlow){
    //     const value_response = await analyzeResults(requestId,s1exp,s2exp,s3exp,s4exp);

    //     const combined = await axios.post("http://localhost:11434/api/generate",{
    //         model:"granite-code:34b",
    //         prompt:`You are a Software Integration Analyzer. There are 4 api modules each interconnected by sharing data to perform a arithmetic task.
    //         I have results from flow analysis and value analysis. Please combine the results and suggest corrections.
    //         1. Flow Analysis: ${flow_response.data.response}
    //         2. Value Analysis: ${value_response}
    //         `,
    //         stream:false,
    //         max_tokens:10,
    //         options:{
    //             temperature:0.2
    //         }
    //     })
    //     return {flow_response : flow_response.data.response , value_response, combined:combined.data.response};
    // }

    // return flow_response.data;


    // if(flow!==expectedFlow){
    //     const server1=server1Analysis()
    //     console.log(server1)
    //     const flow_response = await axios.post("http://localhost:11434/api/generate",{
    //         model:"granite-code:34b",
    //         prompt:`There is problem in this express javascript code, find out all the syntax errors here. Give the correct code.
    //         ${server1}
    //         `,
    //         stream:false,
    //         max_tokens:10,
    //         options:{
    //             temperature:0.1
    //         }
    //     })

    //     return flow_response.data.response;
    // }

}

async function analyzeResults(requestId,s1exp,s2exp,s3exp,s4exp){
    const s1obt= await redis.hget(requestId,"data-S1");
    const s2obt= await redis.hget(requestId,"data-S2");
    const s3obt= await redis.hget(requestId,"data-S3");
    const s4obt= await redis.hget(requestId,"data");

    const response = await axios.post("http://localhost:11434/api/generate",{
        model:"granite-code:34b",
        prompt:`You are a Software Integration Analyzer. There are 4 api modules each interconnected by sharing data to perform a arithmetic task.
                The expected output of server 1 is ${s1exp} and the obtained output of server 1 is ${s1obt}
                The expected output of server 2 is ${s2exp} and the obtained output of server 2 is ${s2obt}
                The expected output of server 3 is ${s3exp} and the obtained output of server 3 is ${s3obt}
                Finally the expected output of server 4 is ${s4exp} and the obtained output of server 4 is ${s4obt}
                Check if all the values are correct or not
                `,
        stream:false,
        max_tokens:10,
        options:{
            temperature:0.2
        }

    })

    return response.data.response
}

function getServerCode(server){
    if(server=="3"){
        const data=fs.readFileSync("server4.js", { encoding: 'utf8', flag: 'r' });
        return data;
    }
    else if(server=="2"){
        const data=fs.readFileSync("server3.js",{encoding: 'utf8', flag: 'r'});
        return data;
    }
    else if(server=="1"){
        const data=fs.readFileSync("server2.js",{encoding: 'utf8', flag: 'r'});
        return data;
    }
    else{
        const data=fs.readFileSync("server1.js",{encoding: 'utf8', flag: 'r'});
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