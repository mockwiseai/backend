import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { config } from '../config/config';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, loginType = 'custom' } = req.body;

    // Validate loginType
    if (!loginType || (loginType !== 'custom' && loginType !== 'oauth')) {
      res.status(400).json({
        success: false,
        message: 'Invalid login type. Must be "custom" or "oauth".',
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(404).json({
        success: false,
        message: 'User already exists',
      });
      return;
    }

    // Create user
    const user = new User({
      name,
      email,
      loginType,
      ...(loginType === 'custom' && { password }), // Include password only if custom
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, config.jwtSecret, {
      expiresIn: '24h',
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        token,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message || 'Unknown error occurred',
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, loginType = 'custom' } = req.body;

    // Validate loginType
    if (!loginType || (loginType !== 'custom' && loginType !== 'oauth')) {
      res.status(400).json({
        success: false,
        message: 'Invalid login type. Must be "custom" or "oauth".',
      });
      return;
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Check loginType
    if (loginType === 'custom') {
      // Validate password for custom login
      if (!password) {
        res.status(400).json({
          success: false,
          message: 'Password is required for custom login',
        });
        return;
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
        return;
      }
    } else if (user.loginType !== 'oauth') {
      // Ensure loginType in DB matches request
      res.status(400).json({
        success: false,
        message: 'Invalid login type for this account',
      });
      return;
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, config.jwtSecret, {
      expiresIn: '24h',
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        token,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message || 'Unknown error occurred',
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error during logout',
      error: error.message || 'Unknown error occurred',
    });
  }
};

export const getProfile = async (req: any, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error getting profile',
      error: error.message || 'Unknown error occurred',
    });
  }
};