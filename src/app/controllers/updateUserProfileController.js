const User = require('../models/User');


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

module.exports = new updateUserProfileController;