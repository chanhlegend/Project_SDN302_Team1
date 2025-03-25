const mongoose = require('mongoose');
const RegistrationForm = require('../models/RegistrationForm');
const User = require('../models/User');
const Notification = require('../models/Notification');
// Lấy danh sách tất cả RegistrationForms
const getAllRegistrationForms = async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');}
    try {
        const forms = await RegistrationForm.find()
            .populate('userId', 'username name email role')
            .sort({ createdAt: -1 });
        res.render('registrationList', { forms });
    } catch (error) {
        console.error('Error fetching registration forms:', error);
        res.status(500).send('Server Error');
    }
};

const approveRegistration = async (req, res) => {
    const { formId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(formId)) {
        return res.status(400).send('Invalid form ID');
    }

    try {
        const form = await RegistrationForm.findById(formId);
        if (!form) {
            return res.status(404).send('Registration form not found');
        }

        const updatedUser = await User.findByIdAndUpdate(
            form.userId,
            { role: 'seller' },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).send('User not found');
        }
        const io = req.app.get('io');

        const notification = new Notification({
            userId: form.userId, 
            title: 'Yêu cầu được phê duyệt',
            message: 'Yêu cầu đăng ký làm người bán của bạn đã được phê duyệt. Bạn giờ đây là seller!',
        });

        await notification.save();

        io.to(form.userId.toString()).emit('notification', {
            title: notification.title,
            message: notification.message,
            createdAt: notification.createdAt,
        });

        await RegistrationForm.findByIdAndDelete(formId);

       
        res.redirect('/registration');
    } catch (error) {
        console.error('Error in approveRegistration:', error);
        res.status(500).send('Error approving registration');
    }
};

const rejectRegistration = async (req, res) => {
    const { formId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(formId)) {
        return res.status(400).send('Invalid form ID');
    }

    try {
        const form = await RegistrationForm.findById(formId);
        if (!form) {
            return res.status(404).send('Registration form not found');
        }

        await RegistrationForm.findByIdAndDelete(formId);

        res.redirect('/registration');
    } catch (error) {
        console.error('Error in rejectRegistration:', error);
        res.status(500).send('Error rejecting registration');
    }
};

module.exports = {
    getAllRegistrationForms,
    approveRegistration,
    rejectRegistration
};