const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get token from the Authorization header
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided, authorization denied' });
  }

  const token = authHeader.split(' ')[1]; // Expecting "Bearer <token>"
  if (!token) {
    return res.status(401).json({ error: 'Token format invalid, authorization denied' });
  }

  try {
    // Verify token using your secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user data to request
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};