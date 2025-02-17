class siteController {
    index(req, res) {
        // res.render('partials/header', { title: 'Express' });
        res.render('partials/footer', { title: 'Express' });
        // res.render('home', { title: 'Express' });
    }
}

module.exports = new siteController