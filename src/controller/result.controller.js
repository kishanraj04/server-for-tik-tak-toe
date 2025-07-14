import { Result } from "../model/result.model.js"

import moment from "moment"; // for formatting date
import { User } from "../model/user.model.js";

export const getProfile = async (req, res) => {
  try {
    const loginUserId = req?.user?.user?._id;

    // Get the user profile info
    const user = await User.findById(loginUserId).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    // Get all wins and losses
    const wins = await Result.find({ winner: loginUserId })
      .populate("winner")
      .populate("looser")
      .lean();

    const losses = await Result.find({ looser: loginUserId })
      .populate("winner")
      .populate("looser")
      .lean();

    const totalGames = wins.length + losses.length;

    const history = [
      ...wins.map((match) => ({
        opponent: match.looser.name,
        opponentAvatar: match.looser.avatar,
        result: "Win",
        date: moment(match._id.getTimestamp()).format("YYYY-MM-DD"),
      })),
      ...losses.map((match) => ({
        opponent: match.winner.name,
        opponentAvatar: match.winner.avatar,
        result: "Lose",
        date: moment(match._id.getTimestamp()).format("YYYY-MM-DD"),
      })),
    ];

    // Optional: sort by date descending
    history.sort((a, b) => new Date(b.date) - new Date(a.date));

    const profile = {
      name: user.name,
      avatar: user.avatar,
      totalGames,
      wins: wins.length,
      losses: losses.length,
      history,
    };

    res.status(200).json(profile);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
