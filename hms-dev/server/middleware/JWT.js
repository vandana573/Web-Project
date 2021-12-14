const JWT = require("jsonwebtoken");

module.exports.jwtValidation = async (req, res, next) => {
  if (!req.headers.authorization) {
    res.sendStatus(401);
  } else {
    const exe = req.headers.authorization.split(" ");
    if (!exe) {
      res.sendStatus(401);
    } else {
      JWT.verify(exe[1], process.env.JWT_SECRET, async (err, result) => {
        if (err) {
          res.sendStatus(401);
        } else {
          next();
        }
      });
    }
  }
};

module.exports.signJWT = async (payload) => {
  const opts = {
    expiresIn: "720m",
  };
  const token = JWT.sign(payload, process.env.JWT_SECRET, opts);
  return token;
};
