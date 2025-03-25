const User = require('../models/User');
const { mongoeseToObject } = require('../../util/Mongoese');
const mongoose = require('mongoose');
const Category = require('../models/Category');
class UserProfileController {
    getUserProfile(req, res, next) {
        const userId = req.params.id;
        
        User.findById(userId)
            .then(user => {
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                res.render('profileUser', { user: mongoeseToObject(user) });
            })
            .catch(next);
    }

    viewUserProfile(req, res, next) {
        const userId = req.params.id;
        
        Promise.all([
            User.findById(userId),
            Category.find() // Hoặc Category.find({ userId }) nếu danh mục liên quan đến user
        ])
        .then(([user, categories]) => {
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
    
            if (req.xhr || req.headers["accept"].includes("application/json")) {
                return res.json({ user, categories }); 
            }
            
            res.render('viewProfile', { 
                user: mongoeseToObject(user),
                categories, 
                messages: req.flash()
            });
        })
        .catch(next);
    }

    async getUserInfo(req, res, next) {
        console.log("Session: ", req.session);
        try {
            const userId = req.session.user ? req.session.user._id : null; // Lấy từ session
            const categories = await Category.find().sort({ createdAt: -1 });
            if (!userId) {
                return res.status(401).send('Bạn cần đăng nhập để xem thông tin người dùng');
            }
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).send('ID người dùng không hợp lệ');
            }
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).send('Người dùng không tồn tại');
            }
            console.log('User info:', user);
            res.render('userInfo', { user, userId, categories }); // Truyền userId để dùng trong EJS
        } catch (err) {
            console.error('Error:', err);
            next(err);
        }
    }
    // Hiển thị trang Edit Profile
    async editUserProfile(req, res, next) {
        try {
            const userId = req.session.user ? req.session.user._id : null; // Lấy từ session
            const categories = await Category.find().sort({ createdAt: -1 });
            if (!userId) {
                return res.status(401).send('Bạn cần đăng nhập để chỉnh sửa thông tin');
            }

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).send('Người dùng không tồn tại');
            }

            console.log('User to edit:', user);
            res.render('editUserProfile', { user: mongoeseToObject(user), categories });
        } catch (err) {
            console.error('Error:', err);
            next(err);
        }
    }

    // Xử lý cập nhật profile của người dùng hiện tại
    async updateUserProfile(req, res, next) {
        try {
            const userId = req.session.user ? req.session.user._id : null;
            if (!userId) {
                return res.status(401).send('Bạn cần đăng nhập để chỉnh sửa thông tin');
            }
    
            const { name, phone, email, dob, gender, address, newAvatarUrl } = req.body;
    
            // Tạo object để cập nhật, chỉ thêm các trường có giá trị
            const updateData = {};
            if (name) updateData.name = name;
            if (phone) updateData.phone = phone;
            if (email) updateData.email = email;
            if (dob) updateData.dob = new Date(dob);
            if (gender !== undefined) updateData.gender = gender === 'true'; // Chuyển thành boolean
            if (address) updateData.address = address;
            if (newAvatarUrl) updateData.avatar = newAvatarUrl; // Chỉ cập nhật avatar nếu có URL mới
    
            // Cập nhật thông tin người dùng
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { $set: updateData }, // Sử dụng $set để chỉ cập nhật các trường được cung cấp
                { new: true, runValidators: true }
            );
    
            if (!updatedUser) {
                return res.status(404).send('Không thể cập nhật người dùng');
            }
    
            // Cập nhật session và đảm bảo lưu thay đổi
            if (req.session.user) {
                req.session.user = updatedUser;
                await req.session.save(); // Đảm bảo session được lưu
            }
    
            console.log('Updated user:', updatedUser);
            res.redirect('/user/users/userProfile');
        } catch (err) {
            console.error('Error:', err);
            next(err);
        }
    }
}

module.exports = new UserProfileController();