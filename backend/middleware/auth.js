import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "MYSECRETKEY";

export function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
}

export function requireHost(req, res, next) {
    if (req.user?.role !== "host") {
        return res.status(403).json({ success: false, message: "Host access only" });
    }
    next();
}

export function requireUser(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    next();
}
