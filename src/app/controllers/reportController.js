const Report = require("../models/Report");
const User = require("../models/User");
const cloudinary = require("cloudinary").v2;

class ReportController {
  static async reportSeller(req, res) {
    try {
      const reporterId = req.session.user?._id;
      const { sellerId, reason, details } = req.body;
      const file = req.file;

      console.log("[DEBUG] Request:", {
        reporterId,
        sellerId,
        reason,
        file: !!file,
      });

      // Validate
      if (!reporterId) throw new Error("Phiên đăng nhập hết hạn");
      if (!sellerId || !reason) throw new Error("Thiếu trường bắt buộc");

      // Upload ảnh
      let evidenceUrl = null;
      if (file) {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "reports" },
            (error, result) => (error ? reject(error) : resolve(result))
          );
          uploadStream.end(file.buffer);
        });
        evidenceUrl = result.secure_url;
      }

      // Tạo báo cáo
      const reportData = {
        reporterId,
        sellerId,
        reason: reason === "other" ? details : reason,
        details: reason === "other" ? null : details,
        evidenceUrl,
        status: "pending",
      };

      console.log("[DEBUG] Report Data:", reportData);

      const newReport = new Report(reportData);
      await newReport.save();

      return res.status(201).json({
        success: true,
        data: newReport,
      });
    } catch (error) {
      console.error("[ERROR] Report Error:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getReports(req, res) {
    try {
      const reports = await Report.find()
        .populate("reporterId", "username email")
        .populate("sellerId", "username email");
      return res
        .status(200)
        .json({ message: "Danh sách báo cáo", data: reports });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Lỗi server", error: error.message });
    }
  }

  static async updateReportStatus(req, res) {
    console.log("alooo");
    try {
      const { reportId } = req.params;
      console.log(reportId);
      const { status } = req.body;

      if (!["pending", "reviewed", "resolved"].includes(status)) {
        return res.status(400).json({ message: "Trạng thái không hợp lệ" });
      }

      const updatedReport = await Report.findByIdAndUpdate(
        reportId,
        { status },
        { new: true }
      );
      if (!updatedReport) {
        return res.status(404).json({ message: "Không tìm thấy báo cáo" });
      }

      return res.status(200).json({
        message: "Cập nhật trạng thái thành công",
        data: updatedReport,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Lỗi server", error: error.message });
    }
  }
}

module.exports = ReportController;
