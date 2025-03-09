const Product = require('../models/Product')
const Category = require('../models/Category')
const { mutipleMongoeseToObject, mongoeseToObject } = require('../../util/Mongoese')
const mongoose = require('mongoose');
class productOwnerController {
    listProductowner(req, res, next) {
        const userId = req.params.userid;
    
        Promise.all([
            Product.find({ sellerId: userId }),
            Category.find() 
        ])
        .then(([products, categories]) => {
            if (req.xhr || req.headers['accept']?.includes('application/json')) {
                // Trả về JSON nếu yêu cầu từ frontend
                res.json({ success: true, products, categories });
            } else {
                // Render trang `productOwner`
                res.render('productOwner', { products, categories });
            }
        })
        .catch(err => next(err));
    }


    listProduct(req, res, next) {
        const userId = req.params.userid;
        
        if(!userId){
            return res.status(400).json({success: false , message: "Không tìm thấy userId"})
        }

        Promise.all([
            Product.find({ sellerId: userId }).populate('image'),
            Category.find()
        ])
        .then(([products, categories]) => {
            res.json({ success: true, products, categories }); 
        })
        .catch(err => {
            console.error("Lỗi API:", err);
            res.status(500).json({ success: false, message: "Lỗi server", error: err.message });
        });
    }


    listProductByStatus(req, res, next) {
        
        const { userid } = req.params;
        const { status } = req.query;

        if (!status) {
            return res.status(400).json({ success: false, message: "Vui lòng cung cấp status" });
        }
    
        Product.find({ sellerId: userid, status })
            .populate('image')
            .then(products => {
                res.json({ success: true, products });
            })
            .catch(err => {
                console.error("Lỗi API:", err);
                res.status(500).json({ success: false, message: "Lỗi server", error: err.message });
            });
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
