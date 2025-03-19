const User = require("../models/User");
const Evaluate = require("../models/Evaluate");
const Product = require("../models/Product");

const addEvaluate = async (req, res) => {
    try {

        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: "Bạn chưa đăng nhập" });
        }

        const evaluaterId = req.session.user._id;
        const { evaluatedId, star, comment , productId } = req.body;

        if (!evaluaterId) {
            return res.status(401).json({ success: false, message: "Người dùng chưa đăng nhập" });
        }

        const evaluaterExist = await User.findById(evaluaterId);
        if (!evaluaterExist) {
            return res.status(404).json({ success: false, message: "Người đánh giá không tồn tại" });
        }

        const productExist = await Product.findById(productId);
        if(!productExist){
            return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại" });
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
            productId,
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

        const evaluates = await Evaluate.find({ evaluatedId })
            .populate("evaluaterId", "username name avatar email") 
            .populate("evaluatedId", "username name avatar email")
            .populate({
                path: "productId",
                select: "productName image",
                populate: {
                    path: "image",
                    select: "url" 
                }
            });

        if (!evaluates || evaluates.length === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đánh giá nào cho người này" });
        }

        res.status(200).json({ success: true, evaluates });

    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
    }
};

const checkIfEvaluated = async (req , res) => {
    try {
        const { productId  } = req.body;
        const evaluaterId = req.session.user._id;

        if(!productId || !evaluaterId){
            return res.status(400).json({ success: false , message: "Thiếu thông tin" });
        }

        const productExist = await Product.findById(productId);
        if(!productExist){
            return res.status(404).json({ success: false , message: "Sản phẩm không tồn tại" });
        }

        const evaluaterExist = await User.findById(evaluaterId);
        if(!evaluaterExist){
            return res.status(404).json({ success: false , message: "Người dùng không tồn tại" });
        }

        const evaluateExist = await Evaluate.findOne({ productId , evaluaterId });
        if(evaluateExist){
            return res.status(200).json({ success: true , message: "Đã đánh giá sản phẩm này" , isEvaluated : true , evaluate : evaluateExist });
        }

        return res.status(200).json({ success: true , isEvaluated : false , message: "Chưa đánh giá sản phẩm này" });
    } catch (error) {
        res.status(500).json({ success: false , message: "Lỗi server" , error: error.message});
    }
}

module.exports = { addEvaluate, getEvaluatesByEvaluatedId ,checkIfEvaluated };
