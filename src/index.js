const express = require('express')
const morgan = require('morgan')
const path = require('path')
const app = express()
const route = require('./routes')
require('dotenv').config({ path: './.env' });
const bodyParser = require('body-parser');
const flash = require('express-flash')
const session = require('express-session');
const cloudinary = require('cloudinary').v2;
const db = require('./config/db')

//connect DB
db.connect()

cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});


app.use(bodyParser.urlencoded({ extended: true }));

// Sử dụng method-override để gửi form DELETE, PUT từ HTML
const methodOverride = require('method-override');
// Cấu hình method-override để sử dụng query parameter
app.use(methodOverride('_method'));

// Sử dụng session
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

app.use(flash())
// Thiết lập view engine là EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'resources/views')); // Đường dẫn tới thư mục chứa file EJS


//sử dụng các tệp css đã biên dịch
app.use(express.static(path.join(__dirname, 'public')))

app.use(express.urlencoded({
  extended: true
}))
app.use(express.json())

//HTTP logger
app.use(morgan('combined'));

// Routes init
route(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`);
});
