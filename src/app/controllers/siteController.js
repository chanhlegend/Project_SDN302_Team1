class siteController {
    index(req, res) {
        res.render('index', { title: 'Express' });
    }
}

module.exports = new siteController