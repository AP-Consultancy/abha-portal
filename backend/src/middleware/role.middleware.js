module.exports = (...roles) => {
     
    return (req, res, next) => {
        const allowedRoles = roles.map((role) => String(role).toUpperCase());
        const userRole = String(req?.user?.role || "").toUpperCase();

        console.log("Allowed Roles:", allowedRoles);
        console.log("User Role:", userRole);
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        next();
    };
};
