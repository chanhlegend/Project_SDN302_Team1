const Product = require('../models/Product');
const Category = require('../models/Category');
const Image = require('../models/Image'); 
const User = require('../models/User');
const Notification = require('../models/Notification');

class siteController {
  async index(req, res) {
    const user = req.session.user;
    let notifications = [];
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

   
    if (user) {
      const userId = user._id; // Lấy userId từ session.user
     notifications = await Notification.find({ userId: userId })
        .sort({ createdAt: -1 })
        .limit(10);
    }
  
    console.log(products);
    res.render('home', {
      user,
      products,
      laptops,
      phones,
      categories,
      notifications,
    });
  }
}

module.exports = new siteController;