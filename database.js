require('dotenv').config()
const mongoose=require('mongoose')

const mongoURI=process.env.MONGODB_URL;


const mongoToConnect=()=>{
    mongoose.connect(mongoURI).then(()=>{
    console.log('connected')
}).catch((err)=>{
    console.log(err)
})
}

module.exports=mongoToConnect




