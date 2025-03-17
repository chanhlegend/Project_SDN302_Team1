const siteRouter = require('./site')
const productRouter = require('./product')
const loginRouter = require('./login')
const userRouter = require('./user')
const registerRouter = require('./register')
const followRouter = require('./follow')
const reportRouter = require('./report')
const sellerRouter = require('./sellerDashboard')
const categoryRouter = require('./category')
const orderRouter = require('./order')
const productOwnerRouter = require('./productOwner')
const testRouter = require('./test')
const cartRouter = require('./cartRouter')
const searchRouter = require('./search')
const logoutRouter = require('./logout')
const notificationRouter = require('./notificationRouter')
const registrationRoutes = require('./registrationRoutes');
const checkout = require ('./checkout')
const orderTransportationRouter = require('./orderTransportation')

const chatRouter = require('./chat');
function route(app) {
    app.use('/', siteRouter)
    app.use('/login', loginRouter)
    app.use('/product', productRouter)
    app.use('/user', userRouter)
    app.use('/register', registerRouter)
    app.use('/follow', followRouter)
    app.use('/report', reportRouter)
    app.use('/seller', sellerRouter)
    app.use('/category', categoryRouter)
    app.use('/order', orderRouter)
    app.use('/admin', productRouter)
    app.use('/productOwner', productOwnerRouter)
    app.use('/test', testRouter)
    app.use('/cart', cartRouter)
    app.use('/search', searchRouter)
    app.use('/logout', logoutRouter)
    app.use('/notification', notificationRouter)
    app.use('/registration', registrationRoutes)
    app.use('/chat', chatRouter);
    app.use('/checkout', checkout);
    app.use('/orderTransportation', orderTransportationRouter);
}
module.exports = route