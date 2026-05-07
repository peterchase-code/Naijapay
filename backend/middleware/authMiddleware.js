const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.headers['x-auth-token']) {
      token = req.headers['x-auth-token'];
    }
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('+password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found. Token invalid.' 
      });
    }
    
    if (user.isBanned) {
      return res.status(403).json({ 
        success: false, 
        message: 'Your account has been banned. Contact support.' 
      });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'Your account is inactive. Contact support.' 
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token.' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired. Please login again.' 
      });
    }
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication error.', 
      error: error.message 
    });
  }
};

module.exports = authMiddleware;
