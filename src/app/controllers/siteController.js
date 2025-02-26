const Product = require('../models/Product');
const Category = require('../models/Category');
const Image = require('../models/Image'); 
const User = require('../models/User');

class siteController {
  async index(req, res) {
    const user = req.session.user;
    const products = await Product.find().sort({ createdAt: -1 })
      .populate('image')
      .populate('sellerId'); 

    const laptopCategory = await Category.findOne({ name: 'Laptop' });
    const laptops = laptopCategory ? await Product.find({ category: laptopCategory._id }).sort({ createdAt: -1 })
      .populate('image')
      .populate('sellerId') : [];

    const phoneCategory = await Category.findOne({ name: 'Phone' });
    const phones = phoneCategory ? await Product.find({ category: phoneCategory._id }).sort({ createdAt: -1 })
      .populate('image')
      .populate('sellerId') : [];

    const categories = await Category.find().sort({ createdAt: -1 });

    console.log(products);
    res.render('home', {
      user,
      products,
      laptops,
      phones,
      categories
    });
  }
}

module.exports = new siteController;