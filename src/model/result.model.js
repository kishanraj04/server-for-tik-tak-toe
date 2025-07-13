import mongoose from "mongoose";
const resultSchema = mongoose.Schema({
   winner:{
    type:mongoose.Types.ObjectId,
    res:'User'
   },
   looser:{
    type:mongoose.Types.ObjectId,
    res:'User'
   }
});


export const Result = mongoose.model("Result",resultSchema);
