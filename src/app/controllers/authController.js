
class authController {
    login(req, res) {
        res.redirect('/');
    }

    callback(req, res) {
        req.session.user = req.user;
        res.redirect('/');
    }
}
  
module.exports = new authController;
