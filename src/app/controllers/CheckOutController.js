const Product = require ('../models/Product');

class CheckOutController {
    checkout(req ,res ,next){
        const{productIds} = req.body;
        res.json(productIds);
    }
}

module.exports = new CheckOutController;