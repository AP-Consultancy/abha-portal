const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/jwt");
const { pool } = require("../config/db");

const loginUser = async (email, password) => {
console.log("Login Attempt => ", { email, password: "********" });
    try {

        const query = `SELECT fn_login_user($1::TEXT) AS user_data`;
        const result = await pool.query(query, [email]);
        const user = result.rows[0].user_data;

        // USER NOT FOUND
        if (!user) {

            return {
                success: false,
                statusCode: 401,
                message: "Invalid Email or Password",
            };

        }
const a = 10/0
        // PASSWORD CHECK
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password_hash
        );

        // INVALID PASSWORD
        if (!isPasswordValid) {

            return {
                success: false,
                statusCode: 401,
                message: "Invalid Password",
            };

        }

        // GENERATE JWT TOKEN
        const token = generateToken(user);

        return {
            success: true,
            statusCode: 200,
            message: "Login Successful",

            data: {
                token,
                user: {
                    id: user.id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    role: user.role,
                },
            },
        };

    } catch (error) {
        console.error(error);
        throw error;
    }
};

module.exports = {
    loginUser,
};