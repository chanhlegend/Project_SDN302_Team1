const Image = require('../models/Image');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Evaluate = require('../models/Evaluate');
const User = require('../models/User');


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
}

module.exports = new testController;