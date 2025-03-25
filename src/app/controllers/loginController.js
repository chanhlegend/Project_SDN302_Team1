const User = require('../models/User');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: './src/.env' });

class loginController {
    postLogin(req, res, next) {
        const username = req.body.username.trim();
        const password  = req.body.password.trim();
        User.findOne({ username: username })
            .then(user => {
                if (!user) {
                    res.render('login', { err: 'Tên đăng nhập hoặc mật khẩu không đúng!' });
                } else {
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) {
                            return next(err);
                        }
                        if (isMatch) {                           
                            if(user.status === 'banned'){
                                return res.redirect('/login/banned');
                            }
                            req.session.user = user;

                            if(user.role ==='transportation'){
                               return res.redirect('/orderTransportation/orders');
                            }
                            if(user.role ==='admin'){
                              return  res.redirect('/admin/products');
                            }
                            console.log('Session after login:', req.session); // Thêm dòng này để in ra thông tin session

                            console.log('Session after login:', req.session); 

                            res.redirect('/');
                        } else {
                            res.render('login', { err: 'Tên đăng nhập hoặc mật khẩu không đúng!' });
                        }
                    });
                }
            })
            .catch(err => {
                res.json({
                    message: 'failure',
                    data: 'Server error'
                });
            });
    }

    login(req, res, next) {
        if (req.session.user) {
            res.redirect('/');
        } else {
            res.render('login');
        }
    }

    forgotPassword(req, res, next) {
        res.render('forgotPassword');
    }

    postForgotPassword(req, res, next) {
        const { email } = req.body;
        User.findOne({ email: email })
            .then(user => {
                if (!user) {
                    res.render('forgotPassword', { err: 'Email không tồn tại!' });
                } else {
                    // Lấy email người dùng
                    let emailSentTo = email;
                    // Cấu hình nodemailer
                    const transporter = nodemailer.createTransport({
                        host: process.env.EMAIL_HOST,
                        port: process.env.EMAIL_PORT,
                        secure: false,
                        auth: {
                            user: process.env.EMAIL_USER,
                            pass: process.env.EMAIL_PASS,
                        },
                    });

                    // Tạo mã OTP gồm 4 số
                    const otp = Math.floor(1000 + Math.random() * 9000);
                    emailSentTo = email;
                    // Gửi email
                    transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: email,
                        subject: 'OTP Code',
                        text: `Chào mừng bạn đến với nền tảng đồ dùng secondHand ECOHAND\nMã xác nhận của bạn là: ${otp}`,
                    }, (err, info) => {
                        if (err) {
                            console.error(err);
                            return res.send('Error sending OTP, try again.');
                        }
                        res.redirect('/verify');
                    });
                    res.render('verifyOTPForgotPassword', { email, otp });
                }
            })
            .catch(next);
    }

    submitOTP(req, res, next) {
        const { email, otp, otp1, otp2, otp3, otp4 } = req.body;
        const enteredOTP = `${otp1}${otp2}${otp3}${otp4}`;
        if (enteredOTP === otp) {
            res.render('resetPassword', { email });
        } else {
            res.render('verifyOTPForgotPassword', { email, otp, err: 'OTP không chính xác' });
        }
    }

    resetPassword(req, res, next) {
        const { email, newPassword, reNewPassword } = req.body;
        if (newPassword !== reNewPassword) {
            res.render('resetPassword', { email, err: 'Mật khẩu không khớp' });
        } else {
            if (newPassword.length <= 6) {
                res.render('resetPassword', { email, err: 'Mật khẩu phải trên 6 kí tự' });
            } else {
                User.findOne({ email: email })
                    .then(user => {
                        if (!user) {
                            res.render('resetPassword', { email, err: 'Email không tồn tại' });
                        } else {
                            bcrypt.compare(newPassword, user.password, (err, isMatch) => {
                                if (err) {
                                    return next(err);
                                }
                                if (isMatch) {
                                    res.render('resetPassword', { email, err: 'Mật khẩu mới không được giống mật khẩu cũ' });
                                } else {
                                    bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
                                        if (err) {
                                            return next(err);
                                        }
                                        user.password = hashedPassword;
                                        user.save();
                                        res.render('login', { mess: 'Đổi mật khẩu thành công' });
                                    });
                                }
                            });
                        }
                    })
                    .catch(next);
            }
        }
    }

    async bannedUser(req, res) {
        res.render('banned');
    }
}

module.exports = new loginController;