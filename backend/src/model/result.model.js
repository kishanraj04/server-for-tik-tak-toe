import mongoose from "mongoose";

const resultSchema = mongoose.Schema({
  winner: {
    type: mongoose.Types.ObjectId,
    ref: 'User'
  },
  looser: {
    type: mongoose.Types.ObjectId,
    ref: 'User'
  }
});

export const Result = mongoose.model("Result", resultSchema);
