const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
     console.log("HEADERS => ", req.headers);
    if (!authHeader) {
      return res.status(401).json({
        success: false,

        message: "Token missing",
      });
    }
    console.log("AUTH HEADER => ", authHeader);

    const token = authHeader.split(" ")[1];
      console.log("TOKEN => ", token);
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
    );

    req.user = decoded;
  console.log("DECODED USER => ", req.user);
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,

      message: "Unauthorized",
    });
  }
};
