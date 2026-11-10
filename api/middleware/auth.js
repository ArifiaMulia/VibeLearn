const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/jwtSecret');
const tokenRevocation = require('../services/tokenRevocation');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  if (tokenRevocation.isRevoked(token)) return res.sendStatus(401);
  jwt.verify(token, jwtSecret, { algorithms: ['HS256'] }, (err, user) => {
    if (err) return res.sendStatus(401);
    req.user = user;
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
};

module.exports = authenticateToken;
