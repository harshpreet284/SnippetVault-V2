import jwt from 'jsonwebtoken';

/**
 * protect — authentication middleware
 *
 * Reads the 'token' httpOnly cookie, verifies the JWT, and attaches
 * the authenticated user's identity to req.user.
 *
 * req.user shape: { id: <userId string> }
 *
 * The userId comes from the JWT payload — never from a client-supplied
 * request body or query parameter (PROJECT_RULES.md §5, API_SPEC.md §6).
 *
 * This middleware is synchronous: jwt.verify() is a sync call, so no
 * DB hit occurs on every protected request. Only /auth/me fetches from DB.
 */
export const protect = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach minimum identity — only what downstream handlers need
    req.user = { id: decoded.userId };
    next();
  } catch {
    // Catches: TokenExpiredError, JsonWebTokenError, NotBeforeError
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session. Please log in again.',
    });
  }
};
