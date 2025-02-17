const siteRouter = require('./site')
const productRouter = require('./product')
const loginRouter = require('./login')
const userRouter = require('./user')
const registerRouter = require('./register')
const followRouter = require('./follow')
const reportRouter = require('./report')
const reviewRouter = require('./review')
const categoryRouter = require('./category')
const orderRouter = require('./order')

function route(app) {
    app.use('/', siteRouter)
    app.use('/login', loginRouter)
    app.use('/product', productRouter)
    app.use('/user', userRouter)
    app.use('/register', registerRouter)
    app.use('/follow', followRouter)
    app.use('/report', reportRouter)
    app.use('/review', reviewRouter)
    app.use('/category', categoryRouter)
    app.use('/order', orderRouter)
}
module.exports = route