import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { errorResponse } from '../utils/responses';

export const isAuthenticated = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req?.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json(errorResponse('Authentication required'));
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json(errorResponse('Invalid token'));
  }
};
