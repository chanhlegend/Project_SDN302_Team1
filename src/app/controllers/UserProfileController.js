const User = require('../models/User');
const {  mongoeseToObject } = require('../../util/Mongoese');

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
    
                if (req.xhr || req.headers["accept"].includes("application/json")) {
                    return res.json(user); // Trả về toàn bộ thông tin user
                }
    
                res.render('viewProfile', { 
                    user: mongoeseToObject(user),
                    messages: req.flash()
                });
            })
            .catch(next);
    }
}

module.exports = new UserProfileController;