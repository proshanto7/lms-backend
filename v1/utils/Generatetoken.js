import jwt from "jsonwebtoken";

/**
 * Generate a signed JWT.
 * Payload shape MUST match what authorize.js / authorizeRole.js expect:
 *   decoded.safeData.verify  -> boolean, used in authorize.js
 *   decoded.safeData.role    -> string,  used in authorizeRole.js
 *
 * Requires PRIVATE_KEY and JWT_EXPIRES_IN in your .env file.
 */
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      safeData: {
        role: user.role,
        verify: user.isVerified,
      },
    },
    process.env.PRIVATE_KEY,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

/**
 * Attach JWT as an httpOnly "accessToken" cookie (matches authorize.js)
 * and also return it in the response body via apiResponse.
 */
export const sendTokenResponse = (apiResponse, user, statusCode, res, message = "Success") => {
  const token = generateToken(user);

  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  res.cookie("accessToken", token, cookieOptions);

  return apiResponse(res, statusCode, message, { user, token });
};