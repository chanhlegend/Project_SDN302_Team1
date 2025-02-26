const User = require('../models/User');

class UserController {
    // Thêm người dùng mới
    async addUser(req, res, next) {
        try {
            const newUser = new User({
                username: 'john_doe',
                password: 'securepassword123',
                name: 'John Doe',
                dob: new Date('1990-01-01'),
                role: 'user',
                avatar: 'https://example.com/avatar.jpg',
                address: '123 Main St, Anytown, USA',
                phone: '123-456-7890',
                email: 'john.doe@example.com',
                status: 'active',
                evaluate: [
                    { star: 5, evaluaterId: 'eval123' },
                    { star: 4, evaluaterId: 'eval456' }
                ],
                followers: [
                    { followerId: 'follower123' },
                    { followerId: 'follower456' }
                ]
            });
            await newUser.save();
            res.send('User added successfully');
        } catch (error) {
            next(error);
        }
    }

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
}

module.exports = new UserController();
