const Product = require('../models/Product');
const Category = require('../models/Category')
const Order = require('../models/Order')
const { mutipleMongoeseToObject, mongoeseToObject } = require('../../util/Mongoese')
const mongoose = require('mongoose');
const cloudinary = require('../../config/cloudinary');
const Image = require('../models/Image'); // Adjust the path as needed
const path = require('path');
const fs = require('fs');
const multer = require('multer');

class productOwnerController {

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

    async listProductOwner(req, res, next) {
        try {
            const userId = req.session.user ? req.session.user._id : null;
            if (!userId) {
                return res.status(401).send('Bạn cần đăng nhập để xem danh sách sản phẩm');
            }
    
            const categories = await Category.find().sort({ createdAt: -1 });
            let products = await Product.find({ 
                sellerId: userId, 
                status: "active"
            })
                .populate('image')
                .sort({ createdAt: -1 });
    
            console.log('userId:', userId);
            console.log('Active products:', products);
    
            res.render('productOwner', { 
                products, 
                categories, 
                userId, 
                currentTab: 'active' // Truyền currentTab để đánh dấu tab "Đang Bán"
            });
        } catch (err) {
            console.error('Error:', err);
            next(err);
        }
    }
    async listsoldProducts(req, res, next) {
        try {
            const userId = req.session.user ? req.session.user._id : null;
            if (!userId) {
                return res.status(401).send('Bạn cần đăng nhập để xem danh sách sản phẩm đã bán');
            }
    
            const categories = await Category.find().sort({ createdAt: -1 });
    
            let orders = await Order.find({
                status: 'Delivered'
            })
                .populate({
                    path: 'product',
                    match: { sellerId: userId },
                    populate: { path: 'image' }
                })
                .sort({ createdAt: -1 });
    
            orders = orders.filter(order => order.product.length > 0);
    
            console.log('userId: ', userId);
            console.log('Sold orders:', orders);
            res.render('selledProducts', { 
                orders, 
                categories, 
                userId, 
                currentTab: 'sold' 
            });
        } catch (err) {
            console.error('Error:', err);
            next(err);
        }
    }
    async listNonActiveProducts(req, res, next) {
        try {
            const userId = req.session.user ? req.session.user._id : null;
            if (!userId) {
                return res.status(401).send('Bạn cần đăng nhập để xem danh sách sản phẩm chưa kiểm duyệt');
            }
    
            const categories = await Category.find().sort({ createdAt: -1 });
            let products = await Product.find({
                sellerId: userId,
                status: "non-active"
            })
                .populate('image')
                .sort({ createdAt: -1 });
    
            console.log('userId: ', userId);
            console.log('Non active products:', products);
            res.render('nonActiveProduct', { 
                products, 
                categories, 
                userId, 
                currentTab: 'non-active' // Truyền currentTab để đánh dấu tab "chưa kiểm duyệt"
            });
        } catch (err) {
            console.error('Error:', err);
            next(err);
        }
    }

    // GET /create
    createProduct(req, res, next) {
        const userId = req.session.user ? req.session.user._id : null; // Lấy userId từ session

        // Kiểm tra nếu userId không tồn tại
        if (!userId) {
            return res.status(401).send('Bạn cần đăng nhập để tạo sản phẩm');
        }

        Category.find()
            .then(categories => {
                res.render('createProductOwner', { userId, categories });
            })
            .catch(next);
    }

    // POST /create
    async create(req, res, next) {
        console.log("Dữ liệu nhận được từ form:", req.body);
        const userId = req.session.user ? req.session.user._id : null; // Lấy userId từ session

        // Kiểm tra nếu userId không tồn tại
        if (!userId) {
            return res.status(401).send('Bạn cần đăng nhập để tạo sản phẩm');
        }

        const productData = req.body;

        // Đảm bảo category được cung cấp
        if (!productData.category) {
            return res.status(400).send('Category is required.');
        }

        // Validate userId
        if (!userId || userId.trim() === '') {
            console.error('Seller ID is missing or empty in session');
            return res.status(400).send('Seller ID is required.');
        }

        // Xử lý mảng các URL ảnh từ form
        let imageIds = [];
        if (productData.imageUrls) {
            try {
                // Parse mảng imageUrls từ JSON
                const imageUrls = JSON.parse(productData.imageUrls);

                // Giới hạn tối đa 6 ảnh
                if (imageUrls.length > 6) {
                    return res.status(400).send('Maximum 6 images allowed per product.');
                }

                // Tạo document Image cho từng URL
                const imagePromises = imageUrls.map(async (url) => {
                    const newImage = new Image({
                        url: url
                    });
                    const savedImage = await newImage.save();
                    return savedImage._id;
                });

                // Chờ tất cả document Image được lưu
                imageIds = await Promise.all(imagePromises);
            } catch (error) {
                console.error('Error parsing image URLs or saving images:', error);
                return res.status(500).send('Failed to save images: ' + error.message);
            }
        }

        // Lưu sản phẩm
        saveProduct(imageIds);

        // Hàm lưu sản phẩm
        function saveProduct(imageIds) {
            productData.sellerId = userId; // Gán sellerId từ userId
            productData.image = imageIds; // Gán mảng imageIds vào trường image

            const product = new Product(productData);
            product.save()
                .then(() => {
                    console.log("Product saved successfully!");
                    res.redirect(`/productOwner/product`); // Không cần userId trong URL
                })
                .catch(error => {
                    console.error('Error saving product:', error);
                    res.status(500).send('Failed to create product: ' + error.message);
                });
        }
    }

    editProduct(req, res, next) {
        const userId = req.session.user ? req.session.user._id : null; // Lấy userId từ session

        // Kiểm tra nếu userId không tồn tại
        if (!userId) {
            return res.status(401).send('Bạn cần đăng nhập để chỉnh sửa sản phẩm');
        }

        Promise.all([
            Product.findById(req.params.productid).populate('image'),
            Category.find()
        ])
            .then(([product, categories]) => {
                if (!product) {
                    return res.status(404).send("Product not found");
                }
                if (product.sellerId.toString() !== userId) {
                    return res.status(403).send("You are not authorized to edit this product");
                }
                console.log("Product.image:", product.image);
                console.log("Categories from DB:", categories);
                res.render('updateProduct', { 
                    product: product, 
                    userId: userId,
                    categories: categories
                });
            })
            .catch(next);
    }

    update(req, res, next) {
        console.log("Received request method:", req.method); // Kiểm tra phương thức
        console.log("Received params:", req.params);        // Kiểm tra productid
        console.log("Received body:", req.body);            // Kiểm tra dữ liệu gửi lên
        const userId = req.session.user ? req.session.user._id : null; // Lấy userId từ session

        // Kiểm tra nếu userId không tồn tại
        if (!userId) {
            return res.status(401).send('Bạn cần đăng nhập để cập nhật sản phẩm');
        }

        Product.findById(req.params.productid)
            .populate('image')
            .then(product => {
                if (!product) {
                    return res.status(404).send("Product not found");
                }
                if (product.sellerId.toString() !== userId) {
                    return res.status(403).send("You are not authorized to update this product");
                }

                const { productName, price, description, category, currentImageUrls, newImageUrls } = req.body;
                if (!productName || !price || !category) {
                    return res.status(400).send("Product name, price, and category are required");
                }
                if (price <= 0) {
                    return res.status(400).send("Price must be greater than 0");
                }

                return (async () => {
                    let imageIds = [];
                    if (currentImageUrls && Array.isArray(currentImageUrls)) {
                        imageIds = product.image
                            .filter(img => currentImageUrls.includes(img.url))
                            .map(img => img._id);
                    }

                    if (newImageUrls) {
                        const newUrls = JSON.parse(newImageUrls);
                        if ((imageIds.length + newUrls.length) > 6) {
                            return res.status(400).send("Maximum 6 images allowed.");
                        }

                        const newImagePromises = newUrls.map(async (url) => {
                            const newImage = new Image({ url });
                            const savedImage = await newImage.save();
                            return savedImage._id;
                        });
                        const newImageIds = await Promise.all(newImagePromises);
                        imageIds = [...imageIds, ...newImageIds];
                    }

                    if (imageIds.length === 0) {
                        return res.status(400).send("At least one image is required.");
                    }

                    const updateData = {
                        productName,
                        price,
                        description,
                        category,
                        image: imageIds
                    };
                    return Product.findByIdAndUpdate(req.params.productid, updateData, { new: true })
                        .then(updatedProduct => {
                            if (!updatedProduct) {
                                return res.status(404).send("Product not found");
                            }
                            res.redirect(`/productOwner/product`); // Không cần userId trong URL
                        });
                })();
            })
            .catch(err => {
                console.error("Error in update:", err); // Log lỗi nếu có
                next(err);
            });
    }

    delete(req, res, next) {
        const userId = req.session.user ? req.session.user._id : null; // Lấy userId từ session

        // Kiểm tra nếu userId không tồn tại
        if (!userId) {
            return res.status(401).send('Bạn cần đăng nhập để xóa sản phẩm');
        }

        Product.findById(req.params.productid)
            .then(product => {
                if (!product) {
                    return res.status(404).send("Product not found");
                }
                if (product.sellerId.toString() !== userId) {
                    return res.status(403).send("You are not authorized to delete this product");
                }

                return Product.deleteOne({ _id: req.params.productid })
                    .then(() => res.redirect(`/productOwner/product`)) // Không cần userId trong URL
                    .catch(next);
            })
            .catch(next);
    }
}

module.exports = new productOwnerController();