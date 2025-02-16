const express = require('express')
const morgan = require('morgan')
const path = require('path')
const app = express()
const route = require('./routes')
require('dotenv').config({ path: './src/.env' });
const bodyParser = require('body-parser');
const flash = require('express-flash')
const session = require('express-session');

const db = require('./config/db')

//connect DB
db.connect()

app.use(bodyParser.urlencoded({ extended: true }));

// Sử dụng session
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`);
});
