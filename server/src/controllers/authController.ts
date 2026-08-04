import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import User from '../database/models/User';
import Settings from '../database/models/Settings';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import logToDB from '../utils/dbLogger';
import logger from '../utils/logger';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide email and password' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ success: false, message: 'Please provide a valid email address' });
      return;
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ success: false, message: 'User already exists' });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      email,
      password: hashedPassword,
      role: 'user', // Always user — never trust role from request body
    });

    // Create default settings for the registered user
    await Settings.create({
      userId: user._id,
      screenshotInterval: 10,
      captureMode: 'active_tab',
      aiConfidenceThreshold: 0.7,
    });

    await logToDB('info', `User registered successfully: ${email}`, { userId: user._id });

    const token = generateToken(user._id.toString(), user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error(`Registration error: ${(error as Error).message}`);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Authenticate user and get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide email and password' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    if (user.status === 'suspended') {
      res.status(403).json({ success: false, message: 'Your account is suspended' });
      return;
    }

    const isMatch = await comparePassword(password, user.password || '');
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    await logToDB('info', `User logged in successfully: ${email}`, { userId: user._id });

    const token = generateToken(user._id.toString(), user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error(`Login error: ${(error as Error).message}`);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    logger.error(`Profile fetch error: ${(error as Error).message}`);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
