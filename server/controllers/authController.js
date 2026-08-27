import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns cookie options appropriate for the current environment.
 *
 * Development  → httpOnly, NOT secure (HTTP localhost), SameSite=Lax
 * Production   → httpOnly, secure (HTTPS), SameSite=None (for cross-origin)
 *
 * @param {boolean} includeMaxAge  Set false when clearing the cookie on logout.
 */
const getCookieOptions = (includeMaxAge = true) => {
  const isProd = process.env.NODE_ENV === 'production';
  const options = {
    httpOnly: true,               // JS cannot access via document.cookie
    secure: isProd,               // HTTPS only in production
    sameSite: isProd ? 'none' : 'lax',
  };
  if (includeMaxAge) {
    options.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  }
  return options;
};

/**
 * Signs a JWT containing only the userId (minimum necessary payload).
 * Secret and expiry are read from environment variables.
 */
const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

/**
 * Returns only the safe public fields for a user document.
 * passwordHash is NEVER included in any response.
 */
const safeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 *
 * 1. Validate required fields.
 * 2. Normalize email (lowercase + trim) — consistent with User model.
 * 3. Reject if email already exists.
 * 4. Hash password with bcrypt (saltRounds: 12).
 * 5. Create user (stores passwordHash only).
 * 6. Issue JWT via httpOnly cookie.
 * 7. Return 201 with safe user object.
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // ── Input validation ─────────────────────────────────────────────────────
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters.',
      });
    }

    // ── Email normalisation (matches User model lowercase:true) ───────────────
    const normalizedEmail = email.toLowerCase().trim();

    // ── Duplicate check ───────────────────────────────────────────────────────
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // ── Password hashing (bcryptjs, saltRounds: 12) ───────────────────────────
    const SALT_ROUNDS = 12;
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // ── Persist user ──────────────────────────────────────────────────────────
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,               // only the hash is stored
    });

    // ── Issue JWT via httpOnly cookie ─────────────────────────────────────────
    const token = signToken(user._id);
    res.cookie('token', token, getCookieOptions());

    return res.status(201).json({
      success: true,
      data: safeUser(user),       // passwordHash is never returned
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 *
 * 1. Validate required fields.
 * 2. Normalize email.
 * 3. Find user by email.
 * 4. Compare password with stored hash.
 * 5. Issue JWT via httpOnly cookie.
 * 6. Return 200 with safe user object.
 *
 * A single generic error message is used for both "user not found" and
 * "wrong password" to prevent email enumeration attacks.
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    // Generic message — do not reveal whether the email exists
    const INVALID_MSG = 'Invalid email or password.';

    if (!user) {
      return res.status(401).json({ success: false, message: INVALID_MSG });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: INVALID_MSG });
    }

    const token = signToken(user._id);
    res.cookie('token', token, getCookieOptions());

    return res.status(200).json({
      success: true,
      data: safeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/logout
 *
 * Clears the httpOnly token cookie.
 * The options must match those used when the cookie was set (minus maxAge).
 */
export const logout = (req, res) => {
  res.clearCookie('token', getCookieOptions(false));
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

/**
 * GET /api/auth/me
 *
 * Requires the protect middleware (req.user.id is available).
 * Fetches fresh user data from the database.
 * Never returns passwordHash.
 */
export const getMe = async (req, res, next) => {
  try {
    // req.user.id is set by the protect middleware from the verified JWT
    const user = await User.findById(req.user.id);

    if (!user) {
      // User was deleted after the token was issued
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: safeUser(user),
    });
  } catch (err) {
    next(err);
  }
};
