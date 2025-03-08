const User = require('../models/User');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: './src/.env' });

class registerController {
    register(req, res, next) {
        res.render('register');
    }

    postRegister(req, res, next) {
        const { username, password, email, re_password } = req.body;
        User.findOne({ $or: [{ username: username }, { email: email }] })
            .then(user => {
                if (user) {
                    if (user.username === username) {
                        res.render('register', { err: 'Tên đăng nhập đã tồn tại!' });
                    } else if (user.email === email) {
                        res.render('register', { err: 'Email đã tồn tại!' });
                    }
                } else {
                    if (password.length <= 6) {
                        res.render('register', { err: 'Mật khẩu phải trên 6 kí tự!' });
                    } else if (password !== re_password) {
                        res.render('register', { err: 'Mật khẩu không khớp!' });
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
                        res.render('verifyOTPRegister', { username, email, otp, password });
                    }
                }
            })
            .catch(next);
    }

    verifyOTP(req, res, next) {
        const { email, otp, otp1, otp2, otp3, otp4, username, password } = req.body;
        const enteredOTP = `${otp1}${otp2}${otp3}${otp4}`;

        if (enteredOTP === otp) {
            // Hash the password before saving it to the database
            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) {
                    return next(err);
                }
                User.create({ username, password: hashedPassword, email })
                    .then(() => {
                        res.render('login', { mess: 'Đăng kí thành công, vui lòng đăng nhập lại!' });
                    })
                    .catch(next);
            });
        } else {
            res.render('verifyOTPRegister', { err: 'Mã OTP không đúng!', username, email, otp, password });
        }
    }
}

module.exports = new registerController;