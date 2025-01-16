const express = require('express')
const morgan = require('morgan')
const path = require('path')
const app = express()
const route = require('./routes')
require('dotenv').config({ path: './src/.env' });

const db = require('./config/db')

//connect DB
db.connect()

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
