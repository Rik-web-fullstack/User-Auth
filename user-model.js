const mongoose=require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/myapp')
const userSchema=new mongoose.Schema({
    name:String,
    email:String,
    phone:String,
    password:String
})
let users=mongoose.model("user",userSchema)
module.exports=users;