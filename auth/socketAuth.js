import jwt from 'jsonwebtoken';

export const validateSocket = (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Unauthorized: Token missing"));
    }

    const validateUser = jwt.verify(token, process.env.SECRET); // may throw

    socket.user = validateUser?.user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new Error("Token expired"));
    }
    return next(new Error("Invalid token"));
  }
};
