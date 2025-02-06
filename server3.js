const express = require('express');
const app = express();
const axios = require('axios')

app.use(express.json())

app.post("/server3",async (req,res)=>{
    const array = req.body.array;

    array.push(3);

    const result = await axios.post("http://localhost:3003/server4",{array:array})

    const newarr = result.data.array;
    newarr.push(6);
    console.log(newarr)

    res.json({message: "Array received",array:newarr});
})

const PORT = 3002;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
