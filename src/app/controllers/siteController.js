const Product = require('../models/Product')
const Category = require('../models/Category')

class siteController {
    async index(req, res) {
        const user = req.session.user;
        const products = await Product.find().sort({ createdAt: -1 });

        const laptopCategory = await Category.findOne({ name: 'Laptop' });
        const laptops = laptopCategory ? await Product.find({ category: laptopCategory._id }).sort({ createdAt: -1 }) : [];


        const phoneCategory = await Category.findOne({ name: 'Phone' });
        const phones = phoneCategory ? await Product.find({ category: phoneCategory._id }).sort({ createdAt: -1 }) : [];

        const categories = await Category.find().sort({ createdAt: -1 });
        res.render('home', {
            user,
            products,
            laptops,
            phones,
            categories
        });

        // res.render('partials/footer');
    }
}

module.exports = new siteController();