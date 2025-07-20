import { Result } from "../model/result.model.js";
import moment from "moment";
import { User } from "../model/user.model.js";

export const getProfile = async (req, res) => {
  try {
    const loginUserId = req?.user?.user?._id;
   
    // Pagination Setup
    const page = parseInt(req.query.page) || 1;
    console.log(req.query.page);
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Get the user profile
    const user = await User.findById(loginUserId).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch paginated matches (both wins and losses)
    const matchQuery = {
      $or: [
        { winner: loginUserId },
        { looser: loginUserId }
      ]
    };

    const matches = await Result.find(matchQuery)
      .populate("winner")
      .populate("looser")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Total count for pagination
    const totalMatches = await Result.countDocuments(matchQuery);

    const history = matches.map((match) => {
      const isWinner = match.winner._id.toString() === loginUserId.toString();
      const opponent = isWinner ? match.looser : match.winner;

      return {
        opponent: opponent.name,
        opponentAvatar: opponent.avatar,
        result: isWinner ? "Win" : "Lose",
        date: moment(match.createdAt).format("YYYY-MM-DD"),
      };
    });

    // Count total wins/losses (for stats)
    const totalWins = await Result.countDocuments({ winner: loginUserId });
    const totalLosses = await Result.countDocuments({ looser: loginUserId });

    const profile = {
      name: user.name,
      avatar: user.avatar,
      totalGames: totalWins + totalLosses,
      wins: totalWins,
      losses: totalLosses,
      history,
      pageInfo: {
        currentPage: page,
        totalPages: Math.ceil(totalMatches / limit),
        totalMatches,
      },
    };

    res.status(200).json(profile);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
