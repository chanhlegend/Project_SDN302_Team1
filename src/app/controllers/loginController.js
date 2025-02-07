const User = require('../models/User')
const { mutipleMongoeseToObject } = require('../../util/Mongoese')

class loginController {
    postLogin(req, res, next) {
        const { username, password } = req.body
        User.findOne({ username: username })
            .then(user => {
                if (!user) {
                    res.render('login', { err: 'Tên đăng nhập hoặc mật khẩu không đúng!' })
                } else {
                    if (user.password === password) {
                        if (user.status === 'non-active') {
                            res.render('verifyOTPRegister', { err: 'Tài khoản chưa được kích hoạt!' })
                        } else {
                            req.session.user = user;
                            res.json({
                                message: 'success',
                                data: user
                            })
                        }
                    } else {
                        res.render('login', { err: 'Tên đăng nhập hoặc mật khẩu không đúng!' })
                    }
                }
            })
            .catch(err => {
                res.json({
                    message: 'failure',
                    data: 'Server error'
                })
            })
    }

    login(req, res, next) {
        res.render('login')
    }
}

module.exports = new loginController