const Product = require('../models/Product')
const { mutipleMongoeseToObject } = require('../../util/Mongoese')

class productController {
    listProduct(req, res, next) {
        Product.find({})
            .then(products => {
                res.json({
                    message: 'success',
                    data: products
                })
            })
            .catch(err => {
                res.json({
                    message: 'failure',
                    data: []
                })
            })
    }
}

module.exports = new productController