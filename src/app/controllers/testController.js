const Image = require('../models/Image');
const Product = require('../models/Product');

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
}

module.exports = new testController;