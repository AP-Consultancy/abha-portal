const paymentService =
require("../services/payment.service");

exports.managePayment = async (req, res) => {
    try {
        const result =
        await paymentService.managePayment(
            req.body
        );
        return res.status(200).json({
            success: true,
            message:
            "Payment operation completed",
            data: result
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};