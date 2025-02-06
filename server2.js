const express = require('express');
const app = express();
const axios = require('axios')

app.use(express.json());

app.post("/server2",async (req,res)=>{
    let newarr;
    try{

        const array = req.body.array;
        
        array.push(2);
        
        const result= await axios.post("http://localhost:3002/server3",{array:array})
        
        newarr=result.data.array;
        

        if(false){

            newarr.push(7);
        }

        // throw Error("Random error")
        
        
        res.json({message: "Array received",array:newarr});
    }
    catch(err){
        res.json({message: "Array received",array:newarr});
    }
})

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
