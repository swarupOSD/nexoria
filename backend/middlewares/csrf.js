import { csrfSync } from 'csrf-sync';

const {
  csrfSynchronisedProtection,
  generateToken,
} = csrfSync({
  getTokenFromRequest: (req) => {
    return req.headers['x-csrf-token'];
  },
  cookieName: 'csrf-token',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
});

export const csrfProtection = csrfSynchronisedProtection;

export const csrfTokenRoute = (req, res) => {
  const token = generateToken(req, true);
  res.json({ success: true, csrfToken: token });
};
