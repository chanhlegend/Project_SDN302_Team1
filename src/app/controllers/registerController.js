const User = require('../models/User')
const { mutipleMongoeseToObject } = require('../../util/Mongoese')

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
                        res.render('register', {err: 'Tên đăng nhập đã tồn tại!'})
                    } else if (user.email === email) {
                        res.render('register', {err: 'Email đã tồn tại!'})
                    } else if (password !== re_password) {
                        res.render('register', {err: 'Mật khẩu không khớp!'})
                    }
                } else {
                    if (password !== re_password) {
                        res.render('register', {err: 'Mật khẩu không khớp!'})
                    } else {
                    User.create({ username, password, email })
                        .then(() => {
                            res.json({
                                message: 'success',
                                data: 'Đăng ký thành công!'
                            })
                        })
                        .catch(err => {
                            res.json({
                                message: 'failure',
                                error: err.message
                            })
                        })
                    }    
                }
            })
            .catch(next)
    }
}

module.exports = new registerController