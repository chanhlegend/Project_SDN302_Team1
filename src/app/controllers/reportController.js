const Report = require('../models/Report');
const User = require('../models/User');

class ReportController {

    static async reportSeller(req, res) {
        try {
            const { reporterId, sellerId, reason, details } = req.body;

            if (!reporterId || !sellerId || !reason) {
                return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
            }

            if (reporterId === sellerId) {
                return res.status(400).json({ message: "Bạn không thể báo cáo chính mình" });
            }

            const seller = await User.findById(sellerId);
            if (!seller) {
                return res.status(404).json({ message: "Người bán hàng không tồn tại" });
            }

            const newReport = new Report({ reporterId, sellerId, reason, details });
            await newReport.save();

            return res.status(201).json({ message: "Báo cáo đã được gửi thành công", data: newReport });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    }

    static async getReports(req, res) {
        try {
            const reports = await Report.find()
                .populate('reporterId', 'username email')
                .populate('sellerId', 'username email');
            return res.status(200).json({ message: "Danh sách báo cáo", data: reports });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    }

    static async updateReportStatus(req, res) {
        console.log("alooo");
        try {
            const { reportId } = req.params;
            console.log(reportId);
            const { status } = req.body;

            if (!['pending', 'reviewed', 'resolved'].includes(status)) {
                return res.status(400).json({ message: "Trạng thái không hợp lệ" });
            }

            const updatedReport = await Report.findByIdAndUpdate(reportId, { status }, { new: true });
            if (!updatedReport) {
                return res.status(404).json({ message: "Không tìm thấy báo cáo" });
            }

            return res.status(200).json({ message: "Cập nhật trạng thái thành công", data: updatedReport });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    }
}

module.exports = ReportController;
