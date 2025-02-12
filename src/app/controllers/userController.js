const User = require('../models/User');
const { mutipleMongoeseToObject, mongoeseToObject } = require('../../util/Mongoese');

const sampleUser = {
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
};

module.exports = sampleUser;

class userController {
    addUser(req, res, next) {
       const newUser = new User(sampleUser);
       newUser.save()
           .then(() => res.send('User added successfully'))
           .catch(next);
    }
}

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
            console.log(updateData);
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