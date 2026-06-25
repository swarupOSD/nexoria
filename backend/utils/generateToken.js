import jwt from 'jsonwebtoken';

export const generateAccessToken = (id, role, email) => {
  return jwt.sign({ _id: id, role, email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
};

export const generateRefreshToken = (id, role, email) => {
  return jwt.sign({ _id: id, role, email }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
};
