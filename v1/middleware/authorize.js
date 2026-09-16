import jwt from "jsonwebtoken";
import { apiResponse } from "../utils/apiResponse.js";

export const authorize = (req, res, next) => {
  const authHeader = req.headers.authorization;

  const hasCookieToken = Boolean(req.cookies?.accessToken);
  const hasBearerToken = authHeader?.startsWith("Bearer ");

  if (!hasCookieToken && !hasBearerToken) {
    return apiResponse(res, 401, "invalid token type");
  }

  const token = hasCookieToken ? req.cookies.accessToken : authHeader.split(" ")[1];

  if (!token) {
    return apiResponse(res, 401, "invalid token type");
  }

  jwt.verify(token, process.env.PRIVATE_KEY, (err, decoded) => {
    if (err) return apiResponse(res, 401, err.message);

    req.user = decoded;

    // only verified user can access
    if (!decoded.safeData?.verify) {
      return apiResponse(res, 401, "user not verified");
    }

    next();
  });
};