const User = require('../models/User')
const nodemailer = require('nodemailer')
require('dotenv').config({ path: './src/.env' });

class registerController {
    register(req, res, next) {
        res.render('register')
    }

    postRegister(req, res, next) {
        const { username, password, email, re_password } = req.body
        User.findOne({ $or: [{ username: username }, { email: email }] })
            .then(user => {
                if (user) {
                    if (user.username === username) {
                        res.render('register', { err: 'Tên đăng nhập đã tồn tại!' })
                    } else if (user.email === email) {
                        res.render('register', { err: 'Email đã tồn tại!' })
                    }
                } else {
                    if (password.length <= 6) {
                        res.render('register', { err: 'Mật khẩu phải trên 6 kí tự!' })
                    } else if (password !== re_password) {
                        res.render('register', { err: 'Mật khẩu không khớp!' })
                    } else {
                        User.create({ username, password, email })
                            .then(() => {
                                // Biến lưu OTP tạm thời
                                let tempOtp = {};
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
                                tempOtp[email] = otp;
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
                                res.render('verifyOTPRegister')
                            })
                    }
                }
            })
            .catch(next)
    }
}

module.exports = new registerController