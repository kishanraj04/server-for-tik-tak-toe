import jwt from 'jsonwebtoken'
export const isAuthenticated = (req,res,next)=>{

    try {
        
        const token = req.cookies.token
        if(!token){
            return next(new Error("Unauthorized User"))
        }
        const user = jwt.verify(token,process.env.SECRET)
        req.user = user
        next()
    } catch (error) {
        next(new Error(error.message

        ))
    }
}