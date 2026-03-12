import jwt from 'jsonwebtoken';
import type { RequestHandler } from 'express';

const ACCESS_JWT_SECRET = process.env.ACCESS_JWT_SECRET;
if (!ACCESS_JWT_SECRET) {
  console.log('ACCESS_JWT_SECRET is not defined in environment variables!');
  process.exit(1);
}

const authenticateOptional: RequestHandler = (req, _res, next) => {
  // optioal, so that unauthenticated users can still use the AI chat (blind chat)
  const authHeader = req.header('authorization');
  const accessToken = authHeader && authHeader.split(' ')[1];

  if (!accessToken) {
    // No token — continue as anonymous (unregistered/blind chat)
    req.user = undefined;
    return next();
  }

  try {
    const decoded = jwt.verify(accessToken, ACCESS_JWT_SECRET) as jwt.JwtPayload;

    if (!decoded.sub) {
      // Token invalid — treat as anonymous
      req.user = undefined;
      console.warn('Invalid token, continuing as anonymous');
      return next();
    }

    const user = {
      id: decoded.sub,
      roles: decoded.roles || []
    };

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.warn('Expired token, continuing as anonymous');
    } else {
      console.warn('Invalid token, continuing as anonymous');
    }
    req.user = undefined;
    next();
  }
};

const authenticateRequired: RequestHandler = (req, res, next) => {
  // required, so that only authenticated users can upload documents and see their summaries
  const authHeader = req.header('authorization');
  const accessToken = authHeader && authHeader.split(' ')[1];

  if (!accessToken) {
    // No token — reject the request
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(accessToken, ACCESS_JWT_SECRET) as jwt.JwtPayload;

    if (!decoded.sub) {
      // Token invalid — reject the request
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = {
      id: decoded.sub,
      roles: decoded.roles || []
    };

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    } else {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
};

export default authenticateOptional;
export { authenticateRequired };
