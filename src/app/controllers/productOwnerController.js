const Product = require('../models/Product')
const { mutipleMongoeseToObject, mongoeseToObject } = require('../../util/Mongoese')
const mongoose = require('mongoose');
class productOwnerController {
    listProductowner(req, res, next) {
        const userId = req.params.userid; // Giả sử ID người dùng được lưu trong req.user
        //req.session.userId//req.params.userId
    
        Product.find({ sellerId: userId }) // Lọc sản phẩm theo sellerId      
            .then(products => res.render('productOwner', { products }))
            .catch(err => next(err));
    }
// GET /create
createProduct(req, res, next) {
    const userId = req.params.userid; // Hoặc lấy userId từ session
    res.render('createProduct', { userId: userId });
    
}

// POST /create/:userid
create(req, res, next) {
    const productData = req.body;
    const userId = req.params.userid; // Extract the user ID from the URL

    // Add the user ID to the product data
    productData.sellerId = userId;

    const product = new Product(productData);
    product.save()
        .then(() => {
            res.redirect('/listProductowner'); // Redirect to the product list
        })
        .catch((error) => {
            console.error('Error saving product:', error);
            res.status(500).send('Failed to create product');
        });
}

    editProduct(req, res, next){
        Product.findbyId(req.params.productid)
        .then(Product => res.render('edit')) 
        .catch(next);
    }
    update(req, res, next){
        Product.findByIdAndUpdate(req.params.productid, req.body)
        .then(()=> res.redirect('/listProductowner'))
        .catch(next);
    }
    delete(req, res, next) {
        Product.deleteOne({ productid: req.params.roductid })
            .then(() => res.redirect('/listProductowner'))
            .catch(next)
    }
}

module.exports = new productOwnerController
