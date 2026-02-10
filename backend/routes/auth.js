const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
const jwtSecret = process.env.JWT_SECRET;
const adminPasswordHash = adminPassword ? bcrypt.hashSync(adminPassword, 10) : null;

if (!adminEmail || !adminPassword || !jwtSecret) {
  throw new Error("Missing required environment variables: ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET");
}

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        if (email !== adminEmail) {
            return res.status(401).json({ message: "Invalid email", field: "email" });
        }

        const isMatch = await bcrypt.compare(password, adminPasswordHash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password", field: "password" });
        }

        const payload = { role: "ADMIN" };

        const token = jwt.sign(payload, jwtSecret, { expiresIn: process.env.JWT_EXPIRE || "1d" });

        res.json({
            success: true,
            token,
            user: { role: "ADMIN" },
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
