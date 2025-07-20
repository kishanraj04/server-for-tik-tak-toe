import cloudinary from "../../config/cloudinary.js";
import streamifier from "streamifier";
import { User } from "../model/user.model.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const SignUp = async (req, res, next) => {
  try {
    const { name, password } = req.body;

    const isExistUser = await User.findOne({ name });

    if (isExistUser) {
      return res.status(200).json({ message: "user exist", success: false });
    }

    let avatarUrl = "";
    if (req.file) {
      const streamUpload = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "avatars" },
            (error, result) => {
              if (result) {
                resolve(result);
              } else {
                reject(error);
              }
            }
          );
          streamifier.createReadStream(fileBuffer).pipe(stream);
        });
      };

      const result = await streamUpload(req.file.buffer);
      avatarUrl = result.secure_url;
    }

    // Save user to DB (pseudo-code)
    const user = {
      name,
      password,
      avatar: avatarUrl,
    };

    await User.create(user);

    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.log("err from user sing up  cont...", err?.message);
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { name, password } = req?.body;
    console.log(name , password);
    const isExistUser = await User.findOne({ name: name }).select("+password");
    if (!isExistUser) {
      res.status(401); 
      return next(new Error("Invalid credentials"));
    }
    
    const isCorrectPass = await bcrypt.compare(password,isExistUser?.password)
    console.log(isCorrectPass);
    if(!isCorrectPass){
       res.status(401); 
      return next(new Error("Invalid credentials"));
    }
    
    const token = jwt.sign({user:isExistUser},process.env?.SECRET,{expiresIn:"1d"})

    res.cookie("token",token,{
      httpOnly:true,
      secure:true,
      sameSite:"none",
      maxAge:1 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({
      success:true,
      message:"login success",
      user:isExistUser
    })

  } catch (error) {
    next(new Error(error.message))
  }
};

export const directUserLogin = async (req, res, next) => {
  try {
    const cookie = req?.cookies?.token;
    if (!cookie) {
      return res.status(401).json({ success: false, message: "Unauthorized Access" });
    }

    const user = jwt.verify(cookie, process.env.SECRET);
    return res.status(200).json({
      success: true,
      message: "Valid user",
      loginUser: user?.user,
      token: cookie,
    });
  } catch (error) {
    console.error("Direct login error:", error.message);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};


export const handleLogout = async (req, res, next) => {
  try {
    const token = req?.cookies?.token;
    if (!token) return res.status(400).json({ success: false, message: "No token found" });

    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return res.status(200).json({ success: true, message: "User logged out" });
  } catch (error) {
    return next(error);
  }
};

export const searchUser = async(req,res,next)=>{
  try {
    const {name} = req?.params
    const users =await User.find({name:{$regex:name,$options:"i"}})
    console.log(users?.length);
    if(users?.length==0){
      return res.status(404).json({success:false,message:"Not Found"})
    }
    return res.status(200).json({success:true,friends:users})
  } catch (error) {
    console.log("search user ",error?.message);
    return next(new Error(error?.message))
  }
}