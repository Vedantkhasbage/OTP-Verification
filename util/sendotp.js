const nodemailer=require("nodemailer");

module.exports=async(email,subject,text)=>{
    try {
        const transfer=nodemailer.createTransport({
            host:process.env.HOST,
            service:process.env.SERVICE,
            port:Number(process.env.EMAIL_PORT),
            secure:Boolean(process.env.SECURE),
            auth:{
                user:process.env.USER,
                pass:process.env.PASS
            }
          })
    
          await transfer.verify();
    
    
        const response=await transfer.sendMail({
            from:process.env.USER,
            to:email,
            subject:subject,
            text:`VERIFY YOUR OTP ${text}`
          })


    } catch (error) {
         console.log(error);
    }
}