const JWT_USER_KEY=process.env.JWT_USER_KEY;
const jwt=require("jsonwebtoken");
console.log(JWT_USER_KEY);
function usermiddleware(req,res,next){
    const token=req.headers.token;
    const verifyUser=jwt.verify(token,JWT_USER_KEY);

    if(verifyUser){
          req.userid=verifyUser.id
        next();
    } else{
          res,json({
            message:"Invalid user"
          }) 
    }   
}

    module.exports={
  usermiddleware:usermiddleware       
}