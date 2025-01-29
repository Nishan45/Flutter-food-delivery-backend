const { default: axios } = require("axios");
const { config } = require("dotenv");
const { set } = require("mongoose");

const data={
    userId:"userId",
    itemsId:["669d3e014f3972eaa8f0042f"],
    itemsName:["pizza"],
    itemsCount:[2],
    plateTypes:["half"],
    paymentMode: "offline",
    paymentStatus: "pending",
    address: "Library",
    totalPrice:1000,

}
const AuthStr={
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImhlbCIsImlhdCI6MTcyMTg0NzkyMywiZXhwIjoxNzIxODQ5NzIzfQ.02xxX0ElnaFp10YEiFZh_l-JmINka6RdVQp1L8uxcDc'
  }
const head={headers:{"Authorization":`Bearer ${AuthStr.token}`}}

const send=async()=>{
    /*const date=new Date();
    const userId="userId";
    const itemId="669d3e420d85f818d62b14fe";

    try{
        for(var i=0;i<20;i++){
        await axios.post(`http://localhost:3000/MakeOrder`,data).then(res=>{
        console.log(res.data);
        })}
    }catch (e){
        console.log(e);

    }*/
   const username="1111111111";
   const password="123456";
   let config = {
    headers: {
      'authorization': 
      'Bearer '+
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IjExMTExMTExMTEiLCJpYXQiOjE3Mzc0NzI4OTcsImV4cCI6MTczNzQ3Mjk1N30.tflLzIc6og5fjqbJ4Rp7Yb2A84S2P4lvklGf6RWO5O0'
  }
}

       await axios.get(`http://localhost:3000/auth`,config).then(res=>{
            console.log(res.data);
            })
        /*await axios.post(`http://localhost:3000/login`,{
            username:username,password:password
        }).then(res=>{
                console.log(res.data);
                })*/
}
send()
function generatePin () {
    min = 0,
    max = 9999;
    return ("0" + (Math.floor(Math.random() * (max - min + 1)) + min)).slice(-6);
}




 