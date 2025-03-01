
class logoutController {

    async logout(req, res, next) {
        req.session.destroy(err => {
            if (err) {
                return res.redirect('/')
            }
            res.redirect('/')
        })
    }

}

module.exports = new logoutController