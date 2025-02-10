const siteRouter = require('./site')
const productRouter = require('./product')
const loginRouter = require('./login')
const userRouter = require('./user')
const registerRouter = require('./register')
const categoryRouter = require('./category')
function route(app) {
    app.use('/', siteRouter)
    app.use('/login', loginRouter)
    app.use('/product', productRouter)
    app.use('/user', userRouter)
    app.use('/register', registerRouter)
    app.use('/', categoryRouter)
}
module.exports = route