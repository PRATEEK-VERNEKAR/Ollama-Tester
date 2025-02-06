const express = require('express')
const app = express()


app.use(express.json())


app.post("/server4",async (req,res)=>{
    const array = req.body.array;

    array.push(4)
    console.log(array)

    if(false){

        array.push(5)
    }
    res.json({message:"Array received",array})
})

app.listen(3003,()=>{
    console.log("Server4 is running")
})