const Product = require('../models/Product');
const Category = require('../models/Category');
const Image = require('../models/Image');
const User = require('../models/User');

class searchController {
    async searchProductByName(req, res) {
        const productname = req.query.productname.trim();
        const categories = await Category.find().sort({ createdAt: -1 });

        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const skip = (page - 1) * limit;

        const totalProducts = await Product.countDocuments({ productName: { $regex: productname, $options: 'i' } });
        const totalPages = Math.ceil(totalProducts / limit);

        const products = await Product
            .find({ productName: { $regex: productname, $options: 'i' } })
            .populate('image')
            .populate('sellerId')
            .skip(skip)
            .limit(limit);

        res.render('searchProduct', { products, categories, productname, currentPage: page, totalPages, limit });
    }
}

module.exports = new searchController;