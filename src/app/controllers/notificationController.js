const Notification = require('../models/Notification'); // Đảm bảo import model Notification

// Controller để lấy danh sách thông báo của người dùng
exports.getNotifications = async (req, res, next) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ notifications: [] }); // Trả về mảng rỗng nếu chưa đăng nhập
    }

    const userId = req.session.user._id;
    const notifications = await Notification.find({ userId: userId })
      .sort({ createdAt: -1 }) // Sắp xếp theo thời gian mới nhất
      .limit(10); // Giới hạn 10 thông báo

    // Trả về dữ liệu JSON (hoặc render view nếu cần)
    res.json({ notifications: notifications });
  } catch (error) {
    console.error('Lỗi khi lấy thông báo:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy thông báo' });
  }
};