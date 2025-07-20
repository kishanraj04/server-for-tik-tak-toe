import mongoose from "mongoose";
import bcrypt from 'bcrypt'
const user = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select:false
  },
  avatar: {
    type: String,
    required: true,
  },
});


user.pre('save',async function(next){
   if(!this.isModified("password")) return next()

    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password,salt)
      next()
    } catch (error) {
      next(error?.message)
    }
})

export const User = mongoose.model("User", user);
