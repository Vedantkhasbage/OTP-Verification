const Router=require("express");
const userRouter=Router();
const {z}=require("zod");
const bcrypt=require("bcrypt");
const {usermodel}=require("../db/database");
const jwt=require("jsonwebtoken");
const JWT_USER_KEY=process.env.JWT_USER_KEY;
const otpgenerator=require("otp-generator");
const { otpmodel } = require("../db/database");
const sendemail=require("../util/sendotp");


 userRouter.post('/signUp', async function(req,res){
    const requireddata=z.object({
        email:z.string().min(5).max(100).email(),
        password:z.string().min(5).max(100),
        firstname:z.string().min(5).max(100),
        lastname:z.string().min(5).max(100)
    })

    const checkInputtype=requireddata.safeParse(req.body);
    if(!checkInputtype.success){
        res.json({
            message:"Invalid type"
        })
        return;
    }

    const {email,password,firstname,lastname}=req.body;
      const hashedpassword=  await bcrypt.hash(password,5);

   const userCreated=await usermodel.create({
        email:email,
        password:hashedpassword,
        firstname:firstname,
        lastname:lastname
     })

     const otp=otpgenerator.generate(6,{
        digits:true,upperCaseAlphabets:false,specialChars:false,lowerCaseAlphabets:false
     })

        const response=await otpmodel.create({
            email:email,
            otp:otp
        })

     await sendemail(userCreated.email,"OTP-VERIFICATION",otp);
               
     res.json({
        message:"OTP Send to Your email successfully"
     })
 })

 userRouter.post("/verifyOTP",async(req,res)=>{
             const {email,otp}=req.body;

             const FindUserFromDB=await usermodel.findOne({
                email:email
             })

             if(!FindUserFromDB){
                res.json({
                 message:"User not exist"
                })
                return;
              }

             const FindUserWithOTP=await otpmodel.findOne({
               otp:otp
             })

             if(!FindUserWithOTP){
               res.json({
                message:"INVALID OTP!!"
               })
               return;
             }
             const verifyUserTrue=await usermodel.updateOne({
                  email:email,
                  verified:true
             })

             await otpmodel.findByIdAndDelete({
                _id:FindUserWithOTP._id
             })

             res.json({
                message:"Verified Successfully!!!"
             })
 })

  userRouter.post('/signIn', async function(req,res){
    const requireddata=z.object({
        email:z.string().min(5).max(100).email(),
        password:z.string().min(5).max(100),
    })

    const checkInputtype=requireddata.safeParse(req.body);
    if(!checkInputtype.success){
        res.json({
            message:"Invalid type"
        })
        return;
    }

    const {email,password}=req.body;
         const checkUserExistOrNot=await usermodel.findOne({
            email:email,
         })

         if(!checkUserExistOrNot){
            res.json({
                message:"Sorry user not exists"
            }) 
            return;
         }

         const findUser=await bcrypt.compare(password,checkUserExistOrNot.password);
        
           if(!findUser){
            res.status(404).send({
                message:"user not foun"
            })
            return;
           }
         
        
         if(findUser){
               const token=jwt.sign({
                 id:checkUserExistOrNot._id
               },JWT_USER_KEY)
               res.json({
                token:token
               })
         } else{
            res.json({
                message:"User Not exist"
            })
         }
  })






  module.exports={
    userRouter:userRouter
}