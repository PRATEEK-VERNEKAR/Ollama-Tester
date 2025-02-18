const express = require('express')
const app = express()
const axios = require('axios')

app.use(express.json())

app.get("/server1",async (req,res)=>{
    const result = await axios.post("http://localhost:3001/server2",{array:[1]});
    const newarr = result.data.array
    newarr.push(8)
    res.json({message: "Array received",array:newarr});
})


app.listen(3000,()=>{
    console.log("Server1 is running")
})