const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyJWT = (req, res, next) => {

    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ "message": "you don't have header authHeader" })
    console.log(authHeader);
    const token = authHeader.split(' ')[1];
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) return res.sendStatus(403);
            req.userObj = decoded.userObj;
            next();
        }
    )
}

module.exports = verifyJWT;