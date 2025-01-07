const jwt = require("jsonwebtoken");

module.exports.authMiddleware = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Authorization header missing or invalid" });
  }

  const token = authorization.split(' ')[1]; // Properly split the token

  if (!token) {
    return res.status(401).json({ error: "Please login first" });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET); // No need for await
    req.role = decodedToken.role;
    req.id = decodedToken.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token. Please login" });
  }
};

