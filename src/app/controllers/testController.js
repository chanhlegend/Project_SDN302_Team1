const Image = require('../models/Image');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Evaluate = require('../models/Evaluate');
const User = require('../models/User');
const RegistrationForm = require('../models/RegistrationForm');


class testController {
    async addImage(req, res) {
        try {
            const { url } = req.body;
            const newImage = new Image({ url });
            await newImage.save();
            res.status(201).json({ message: 'Image added successfully', image: newImage });
        } catch (error) {
            res.status(500).json({ message: 'Error adding image', error });
        }
    }

    async addImageToProduct(req, res) {
        try {
            const { productId, imageUrl } = req.body;

            // Validate input
            if (!productId || !imageUrl) {
                return res.status(400).json({ message: 'Product ID and Image URL are required' });
            }

            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            const newImage = new Image({ url: imageUrl });
            await newImage.save();

            product.image.push(newImage._id);
            await product.save();

            res.status(200).json({ message: 'Image added to product successfully', product });
        } catch (error) {
            res.status(500).json({ message: 'Error adding image to product', error });
        }
    }

    async addEvaluate(req, res) {
        try {
            const { star, evaluaterId, userId } = req.body;

            // Validate input
            if (star == null || !evaluaterId) {
                return res.status(400).json({ message: 'Star rating and Evaluater ID are required' });
            }

            const newEvaluate = new Evaluate({ star, evaluaterId });
            await newEvaluate.save();

            // Find the user and add the evaluation to their evaluate array
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            user.evaluate.push(newEvaluate._id);
            await user.save();

            res.status(201).json({ message: 'Evaluation added successfully', evaluate: newEvaluate });
        } catch (error) {
            res.status(500).json({ message: 'Error adding evaluation', error });
        }
    }

    async productDetail(req, res) {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.render('productDetail', { categories });
    }

    async productByCategory(req, res) {
        const categories = await Category.find().sort({ createdAt: -1 });
        const categoryId = req.params.categoryId;
        const products = await Product.find({ category: categoryId }).sort({ createdAt: -1 })
            .populate({
                path: 'image'
            })
            .populate({
                path: 'sellerId'
            })

        // res.json({ categories, products });

        res.render('productsByCategory', { categories, products });
    }

    async menuAccount(req, res) {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.render('menuAccount', { categories });
    }

    async changePassword(req, res, next) {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.render('changePassword', { categories });
    }

    async postChangePassword(req, res, next) {
        const email = req.session.user.email;
        const { oldpassword, newpassword, repassword } = req.body;

        try {
            if (password.length <= 6) {
                return res.status(400).json({ message: 'Mật khẩu phải trên 6 kí tự.' });
            }
            if (newpassword !== repassword) {
                return res.status(400).json({ message: 'Mật khẩu không trùng nhau.' });
            }
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            if (oldpassword !== user.password) {
                return res.status(400).json({ message: 'Mật khẩu cũ không đúng.' });
            }
            user.password = newpassword;
            await user.save();
            res.status(200).json({ message: 'Đổi mật khẩu thành công' });
        } catch (error) {
            res.status(500).json({ message: 'Error changing password', error });
        }
    }

    async salesRegistation(req, res) {
        const categories = await Category.find().sort({ createdAt: -1 });
        if (!req.session.user) {
            return res.redirect('/login');
        }
        const user = req.session.user;
        res.render('salesRegistration', { categories, user });
    }

    async postSalesRegistation(req, res) {
        if (!req.session.user) {
            return res.redirect('/login');
        }
        const userId = req.session.user._id;

        const registrationForm = await RegistrationForm.find({ userId });
        const categories = await Category.find().sort({ createdAt: -1 });

        if (registrationForm) {
            return res.render('menuAccount', { err: 'Đơn đăng kí của bạn đang được duyệt!', categories });
        }

        try {
            const newRegistrationForm = new RegistrationForm({ userId });
            await newRegistrationForm.save();
            res.status(201).json({ message: 'Registration form created successfully', registrationForm: newRegistrationForm });
        } catch (error) {
            res.status(500).json({ message: 'Error creating registration form', error });
        }
    }
}

module.exports = new testController;