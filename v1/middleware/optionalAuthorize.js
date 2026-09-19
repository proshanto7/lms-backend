import jwt from "jsonwebtoken";

/**
 * Like authorize, but doesn't block if no token is present.
 * Sets req.user if a valid token exists, otherwise leaves it undefined.
 */
export const optionalAuthorize = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = req.cookies?.accessToken || (authHeader?.startsWith("Bearer ") && authHeader.split(" ")[1]);

  if (!token) return next();

  jwt.verify(token, process.env.PRIVATE_KEY, (err, decoded) => {
    if (!err) req.user = decoded;
    next();
  });
};