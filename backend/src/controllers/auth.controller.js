const authService = require("../services/auth.service");

const login = async (req, res) => {

    try {
        const { email, password } = req.body;

        // VALIDATION
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and Password are required",
            });
        }
        // CALL SERVICE
        const result = await authService.loginUser(email, password);
        // RESPONSE
        return res.status(result.statusCode).json(result);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

module.exports = {
    login,
};