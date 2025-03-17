const User = require("../models/User");
const Evaluate = require("../models/Evaluate");

const addEvaluate = async (req, res) => {
    try {

        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: "Bạn chưa đăng nhập" });
        }

        const evaluaterId = req.session.user._id;
        const { evaluatedId, star, comment } = req.body;

        if (!evaluaterId) {
            return res.status(401).json({ success: false, message: "Người dùng chưa đăng nhập" });
        }

        const evaluaterExist = await User.findById(evaluaterId);
        if (!evaluaterExist) {
            return res.status(404).json({ success: false, message: "Người đánh giá không tồn tại" });
        }

        const evaluatedExist = await User.findById(evaluatedId);
        if (!evaluatedExist) {
            return res.status(404).json({ success: false, message: "Người được đánh giá không tồn tại" });
        }

        if (evaluatedExist.role !== "seller") {
            return res.status(403).json({ success: false, message: "Bạn không thể đánh giá người khác" });
        }


        const newEvaluate = new Evaluate({
            evaluaterId,
            evaluatedId,
            star,
            comment,
        });

        // Lưu đánh giá vào cơ sở dữ liệu
        await newEvaluate.save();

        return res.status(201).json({
            success: true,
            message: "Đánh giá đã được thêm thành công",
            evaluate: newEvaluate,
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    }
};

const getEvaluatesByEvaluatedId = async (req, res) => {
    try {
        const { evaluatedId } = req.params;

        // Tìm tất cả đánh giá của người được đánh giá
        const evaluates = await Evaluate.find({ evaluatedId })
            .populate("evaluaterId", "username name email") // Lấy thông tin người đánh giá
            .populate("evaluatedId", "username name email"); // Lấy thông tin người được đánh giá

        if (!evaluates || evaluates.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đánh giá nào cho người này" });
        }

        res.status(200).json({ success: true, evaluates });

    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    }
};


module.exports = { addEvaluate, getEvaluatesByEvaluatedId };
