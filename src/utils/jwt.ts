const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET

export const generateToken = (payload: any) => {
  return jwt.sign({ data: payload }, SECRET, { expiresIn: "1d" });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, SECRET);
};
