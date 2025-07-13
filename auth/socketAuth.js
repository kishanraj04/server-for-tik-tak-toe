import jwt from 'jsonwebtoken'
export const validateSocket = (socket,next)=>{

     const token = socket.handshake.auth.token;
    //  console.log("🛡️ Token received:", token);
     const validateUser = jwt.verify(token,process.env.SECRET)
    //  console.log(user);
     if (!token ) {
       return next(new Error("Unauthorized"));
     }
     socket.user = validateUser?.user
     next(); 
   
}