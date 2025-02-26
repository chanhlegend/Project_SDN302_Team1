const User = require('../models/User');

const { mutipleMongoeseToObject, mongoeseToObject } = require('../../util/Mongoese');


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
}




class updateUserProfileController{
    async updateUserProfile (req, res, next){
        try{
            const userId = req.params.id || req.user?._id;
            const updateData = {
                social_title: req.body.social_title,
                first_name: req.body.first_name,
                last_name:req.body.last_name,
                email: req.body.email,
                dob: req.body.dob,
            }
            if(req.body.new_password){
                if(req.body.password){
                    updateData.password = req.body.new_password
                }else{
                    req.session.message = {
                        type: 'error',
                        content: 'Current password is required to set new password'
                    };
                    return res.redirect(`/user/${userId}`);
                }
            }

            const updatedUser = await User.findByIdAndUpdate(
                userId,
                {$set: updateData},
                {new: true , runValidators: true}
            )

            if(!updatedUser){
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
        }catch (error){
            console.error('Update error:', error);
            req.session.message = {
                type: 'error',
                content: 'Failed to update profile'
            };
        } 
    }
}

module.exports ={ 
    userController: new userController(),
    userProfileController: new UserProfileController(),
    updateUserProfileController: new updateUserProfileController()
}
