const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Report = require('../models/Report');
const Image = require('../models/Image');
const bcrypt = require('bcrypt');
const RegistrationForm = require('../models/RegistrationForm');
const { mutipleMongoeseToObject, mongoeseToObject } = require('../../util/Mongoese');

class UserController {

// Hiển thị danh sách người dùng cho admin
async getCustomers(req, res, next) {
    try {
        const users = await User.find({}).lean();
            // Lấy số lượng báo cáo cho từng người dùng
            const usersWithReportCount = await Promise.all(
                users.map(async (user) => {
                    const reportCount = await Report.countDocuments({ sellerId: user._id });
                    return { ...user, reportCount }; // Thêm số lượng báo cáo vào object user
                })
            );

            res.render('customers', { users: usersWithReportCount });
        } catch (error) {
            console.error(error);
            res.status(500).send('Lỗi lấy danh sách người dùng');
        }
    }

    // Hiển thị chi tiết reports của một user dưới dạng JSON
    async getUserReports(req, res, next) {
        try {
            const sellerId = req.params.sellerId;
            const user = await User.findById(sellerId).lean();
            if (!user) {
                return res.status(404).json({ error: 'Người dùng không tồn tại' });
            }

            const reports = await Report.find({ sellerId: sellerId })
                .populate('reporterId', 'name email')
               
                .lean();


            res.json({ reports });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Lỗi khi lấy chi tiết báo cáo' });
        }
    }
    // Ban người dùng
    async banCustomer(req, res) {
        try {
            const userId = req.params.id;

            const user = await User.findByIdAndUpdate(userId, { status: 'banned' }, { new: true });
            if (!user) {
                return res.status(404).send('Người dùng không tồn tại');
            }

            await Product.updateMany(
                { sellerId: userId, status: { $in: ['active', 'non_active'] } },
                { $set: { status: 'rejected' } }
            );

            res.redirect('/user/customers');
        } catch (error) {
            res.status(500).send('Lỗi khi ban người dùng');
        }
    }

    async unbanCustomer(req, res) {
        try {
            const userId = req.params.id;

            const user = await User.findByIdAndUpdate(userId, { status: 'active' }, { new: true });
            if (!user) {
                return res.status(404).send('Người dùng không tồn tại');
            }

            await Product.updateMany(
                { sellerId: userId, status: 'rejected' },
                { $set: { status: 'active' } }
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
        if (!req.session.user) {
            return res.redirect('/login');
        }
        const categories = await Category.find().sort({ createdAt: -1 });
        res.render('menuAccount', { categories });
    }
    async menuSeller(req, res) {
        if(!req.session.user) {
            return res.redirect('/login');
        }
        const categories = await Category.find().sort({ createdAt: -1 });
        res.render('menuSeller', { categories });
    }

    //Hiển thị trang đổi mật khẩu
    async changePassword(req, res, next) {
        if (!req.session.user) {
            return res.redirect('/login');
        }
        const userId = req.session.user._id;
        const user = await
            User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const categories = await Category.find().sort({ createdAt: -1 });
        res.render('changePassword', { categories, user });
    }

    async postChangePassword(req, res, next) {
        if (!req.session.user) {
            return res.redirect('/login');
        }
        const email = req.session.user.email;
        const { oldpassword, newpassword, repassword } = req.body;

        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            const isMatch = await bcrypt.compare(oldpassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Mật khẩu cũ không đúng.' });
            }
            if (newpassword.length <= 6) {
                return res.status(400).json({ message: 'Mật khẩu phải trên 6 kí tự.' });
            }
            if (newpassword !== repassword) {
                return res.status(400).json({ message: 'Mật khẩu không trùng nhau.' });
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newpassword, salt);
            await user.save();
            res.status(200).json({ message: 'Đổi mật khẩu thành công' });
        } catch (error) {
            res.status(500).json({ message: 'Error changing password', error });
        }
    }

    async salesRegistation(req, res) {
        const categories = await Category.find().sort({ createdAt: -1 });
        if (!req.session.user) {
            return res.redirect('/login');
        }
        const user = req.session.user;
        if (user.address == '' || user.phone == '') {
            return res.redirect('/user/users/userProfile'); //edit profile
        }
        res.render('salesRegistration', { categories, user });
    }

    async postSalesRegistation(req, res) {
        if (!req.session.user) {
            return res.redirect('/login');
        }
        const userId = req.session.user._id;

        const registrationForm = await RegistrationForm.find({ userId });
        const categories = await Category.find().sort({ createdAt: -1 });

        if (registrationForm.length > 0) {
            return res.render('menuAccount', { err: 'Đơn đăng kí của bạn đang được duyệt!', categories });
        }

        try {
            const newRegistrationForm = new RegistrationForm({ userId });
            await newRegistrationForm.save();
            res.render('menuAccount', { message: 'Đăng kí thành công!', categories });
        } catch (error) {
            res.status(500).json({ message: 'Error creating registration form', error });
        }
    }
}

module.exports = new UserController;