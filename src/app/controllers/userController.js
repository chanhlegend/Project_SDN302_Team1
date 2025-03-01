const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { mutipleMongoeseToObject, mongoeseToObject } = require('../../util/Mongoese');

class UserController {

    // Hiển thị danh sách người dùng cho admin
    async getCustomers(req, res, next) {
        try {
            const users = await User.find({});
            console.log('Danh sách người dùng:', users);
            res.render('customers', { users });
        } catch (error) {
            res.status(500).send('Lỗi lấy danh sách người dùng');
        }
    }

    // Ban người dùng
    async banCustomer(req, res) {
        try {
            const userId = req.params.id;

            // Cập nhật trạng thái người dùng thành 'banned'
            const user = await User.findByIdAndUpdate(userId, { status: 'banned' }, { new: true });
            if (!user) {
                return res.status(404).send('Người dùng không tồn tại');
            }

            // Cập nhật trạng thái của tất cả sản phẩm của người dùng thành 'rejected'
            await Product.updateMany(
                { sellerId: userId, status: { $in: ['active', 'non_active'] } },
                { $set: { status: 'rejected' } }
            );

            res.redirect('/user/customers');
        } catch (error) {
            res.status(500).send('Lỗi khi ban người dùng');
        }
    }

    // Bỏ ban người dùng
    async unbanCustomer(req, res) {
        try {
            const userId = req.params.id;

            // Cập nhật trạng thái người dùng thành 'active'
            const user = await User.findByIdAndUpdate(userId, { status: 'active' }, { new: true });
            if (!user) {
                return res.status(404).send('Người dùng không tồn tại');
            }

            // Cập nhật trạng thái của tất cả sản phẩm của người dùng trở lại trạng thái ban đầu
            await Product.updateMany(
                { sellerId: userId, status: 'rejected' },
                { $set: { status: 'active' } } // Hoặc 'non_active' tùy thuộc vào logic của bạn
            );

            res.redirect('/user/customers');
        } catch (error) {
            res.status(500).send('Lỗi khi bỏ ban người dùng');
        }
    }

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
        User.findById(userId)
            .then(user => {
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                res.render('viewProfile', {
                    user: mongoeseToObject(user),
                    messages: req.flash()
                });
            })
            .catch(next);
    }

    async updateUserProfile(req, res, next) {
        try {
            const userId = req.params.id || req.user?._id;
            const updateData = {
                social_title: req.body.social_title,
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                dob: req.body.dob,
            }
            if (req.body.new_password) {
                if (req.body.password) {
                    updateData.password = req.body.new_password
                } else {
                    req.session.message = {
                        type: 'error',
                        content: 'Current password is required to set new password'
                    };
                    return res.redirect(`/user/${userId}`);
                }
            }

            const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

            if (!updatedUser) {
                req.session.message = {
                    type: 'error',
                    content: 'User not found'
                };
                return res.redirect(`/user/${userId}`);
            }

            req.session.message = {
                type: 'success',
                content: 'Profile updated successfully!'
            };
            res.redirect(`/user/${userId}`)
        } catch (error) {
            console.error('Update error:', error);
            req.session.message = {
                type: 'error',
                content: 'Failed to update profile'
            };
            res.redirect(`/user/${userId}`);
        }
    }

    //Hiển thị menu profile
    async menuAccount(req, res) {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.render('menuAccount', { categories });
    }

    //Hiển thị trang đổi mật khẩu
    changePassword(req, res, next) {
        res.render('changePassword')
    }
}

module.exports = new UserController;