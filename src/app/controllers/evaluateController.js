const User = require("../models/User");
const Evaluate = require("../models/Evaluate");

const addEvaluate = async (req, res) => {
    try {
        const { evaluaterId, evaluatedId, star, comment } = req.body;

     
        const evaluaterExist = await User.findById(evaluaterId);
        if (!evaluaterExist) {
            return res.status(404).json({ success: false, message: "Người đánh giá không tồn tại" });
        }

     
        const evaluatedExist = await User.findById(evaluatedId);
        
        if (!evaluatedExist) {
            return res.status(404).json({ success: false, message: "Người được đánh giá không tồn tại" });
        }

        if(evaluatedExist.role !== "seller"){
            return res.status(404).json({ success: false, message: "Bạn không thể đánh giá người khác" });
        }
        const newEvaluate = new Evaluate({
            evaluaterId,
            evaluatedId,
            star,
            comment,
        });

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
            .populate("evaluaterId", "username email") // Lấy thông tin người đánh giá
            .populate("evaluatedId", "username email"); // Lấy thông tin người được đánh giá

        if (!evaluates || evaluates.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đánh giá nào cho người này" });
        }

        res.status(200).json({ success: true, evaluates });

    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    }
};


module.exports = { addEvaluate, getEvaluatesByEvaluatedId };
