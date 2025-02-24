const Category = require('../models/Category');
const Product = require('../models/Product');

class CategoryController {
    async postCategory(req, res, next) {
        
            const { name } = req.body; 
            console.log(name);
            if (!name) {
                return res.status(400).json({ message: 'Category name is required' });
            }
            const newCategory = new Category({ name }); 
            await newCategory.save();
            res.status(201).json({ message: 'Success', data: newCategory });
        
    }

    async postCategories(req, res, next) {
        try {
            const { categories } = req.body; 

            if (!Array.isArray(categories) || categories.length === 0) {
                return res.status(400).json({ message: 'Danh sách categories là bắt buộc và phải là mảng' });
            }

   
            const categoryDocs = categories.map(name => ({ name }));
            const newCategories = await Category.insertMany(categoryDocs); 

            res.status(201).json({ message: 'Thêm thành công', data: newCategories });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    }

    async getProductsByCategory(req, res, next) {
        try {
            const { id } = req.params;
            const category = await Category.findById(id);
            if (!category) {
                return res.status(404).json({ message: 'Không tìm thấy category' });
            }

            const products = await Product.find({ category: id })
                .populate({
                    path: 'image'
                })
                .populate({
                    path: 'sellerId'
                })
            res.json({ message: 'Thành công', data: products });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    }
}

module.exports = new CategoryController;
