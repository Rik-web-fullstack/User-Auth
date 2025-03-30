const express=require('express')
const app=express() 
const path=require('path')
const admin = require('./firebase');
const userModel=require("./user-model.js")   
const mongoose=require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/myapp')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const cookieParser=require('cookie-parser')
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,"public")))
app.set("view engine","ejs")

app.get("/",async(req,res)=>{
    res.render("sign-up")
})
app.post("/create",async(req,res)=>{
    let{name,email,phone,password}=req.body;
    bcrypt.genSalt(10,(err,Salt)=>{
        bcrypt.hash(password,Salt,async(err,hash)=>{
            let created_user=await userModel.create({
                name,
                email,
                phone,
                password:hash
            })
            let token=jwt.sign({email},"store")
            res.cookie("token",token)
            res.redirect("/login")
        })
    })
})
app.get("/login",async(req,res)=>{
    res.render("login")
})
app.post("/login",async(req,res)=>{
    let check_user=await userModel.findOne({email:req.body.email})
    if(!check_user){
        res.status(400).send("User not exists")
    }
    bcrypt.compare(req.body.password,check_user.password,(err,result)=>{
        if(err){
            res.status(400).send("Comparison Error")
        }
        if(result){
            let token=jwt.sign({email:check_user.email},"store")
            res.cookie("token",token)
            res.redirect("/profile")
        }
        else{
            res.status(400).send("Something wrong")
        }
    })
})
app.get("/login_otp",async(req,res)=>{
    res.render("login_otp")
})
app.post("/verify_otp", async (req, res) => {
    const { phone, otp } = req.body;

    try {
        // Verify OTP using Firebase
        const decodedToken = await admin.auth().verifyIdToken(otp);
        const phoneNumber = decodedToken.phone_number;

        if (phoneNumber !== phone) {
            return res.status(400).send("OTP verification failed");
        }

        // Check if user exists in DB
        let user = await userModel.findOne({ phone });
        if (!user) {
            user = await userModel.create({ phone });
        }

        res.cookie("token", otp); // Store session token
        res.redirect("/profile");
    } catch (error) {
        res.status(400).send("Invalid OTP");
    }
});

app.get("/profile",async(req,res)=>{
    res.render("profile")
})
app.listen(3000);
