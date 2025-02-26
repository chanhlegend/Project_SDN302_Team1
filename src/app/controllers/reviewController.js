const Review = require('../models/Review');
const User = require('../models/User');

class ReviewController {
    async reviewSeller(req, res) {
        try {
            const reviewerId = req.session.userId
            const {  sellerId, rating, comment } = req.body;

            if (!reviewerId || !sellerId || !rating) {
                return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
            }

            if (reviewerId === sellerId) {
                return res.status(400).json({ message: "Bạn không thể tự đánh giá chính mình" });
            }

            if (rating < 1 || rating > 5) {
                return res.status(400).json({ message: "Xếp hạng phải từ 1 đến 5" });
            }

            const seller = await User.findById(sellerId);
            if (!seller) {
                return res.status(404).json({ message: "Người bán hàng không tồn tại" });
            }

            const newReview = new Review({ reviewerId, sellerId, rating, comment });
            await newReview.save();

            return res.status(201).json({ message: "Đánh giá đã được gửi thành công", data: newReview });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    }

    async getSellerReviews(req, res) {
        try {
            const { sellerId } = req.params;
            const reviews = await Review.find({ sellerId })
                .populate('reviewerId', 'username email avatar')
                .sort({ createdAt: -1 });

            return res.status(200).json({ message: "Danh sách đánh giá", data: reviews });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    }
}

module.exports = new ReviewController;
