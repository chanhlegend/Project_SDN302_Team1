const express = require('express')
const morgan = require('morgan')
const path = require('path')
const app = express()
const route = require('./routes')
require('dotenv').config({ path: './.env' });
const bodyParser = require('body-parser');
const flash = require('express-flash')
const session = require('express-session');
const passport = require('../src/config/passport/passport-config');
const MongoStore = require('connect-mongo');

const socketIo = require('socket.io');
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Ứng dụng đang chạy trên cổng ${PORT}`);
});


const io = socketIo(server);

// Lưu io vào app để sử dụng trong các controller
app.set('io', io);

// Xử lý kết nối Socket.IO
io.on('connection', (socket) => {
  console.log('Người dùng đã kết nối:', socket.id);

  // Khi client gửi sự kiện "join" với userId
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(userId); // Tham gia phòng dựa trên userId
      console.log(`User ${userId} joined room`);
    }
  });

  socket.on('disconnect', () => {
    console.log('Người dùng đã ngắt kết nối:', socket.id);
  });
});
app.use(express.static('public'));


const db = require('./config/db')

//connect DB
db.connect()

app.use(bodyParser.urlencoded({ extended: true }));

// Sử dụng method-override để gửi form DELETE, PUT từ HTML
const methodOverride = require('method-override');
// Cấu hình method-override để sử dụng query parameter
app.use(methodOverride('_method'));

// Sử dụng session
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/myDatabase',
    collectionName: 'sessions'
  }),
  cookie: { secure: false } // Đặt secure: true nếu dùng HTTPS
}));
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Khởi tạo Passport và session
app.use(passport.initialize());
app.use(passport.session());

// Middleware kiểm tra session (debug)
app.use((req, res, next) => {
  console.log('Session:', req.session);
  console.log('User:', req.user);
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

const Notification = require('./app/models/Notification'); 

app.use(async (req, res, next) => {
    if (req.session.user) {
        try {
            const notifications = await Notification.find({ userId: req.session.user._id })
                .sort({ createdAt: -1 }) // Sắp xếp theo thời gian
                .limit(10); // Giới hạn 10 thông báo

            res.locals.notifications = notifications;
        } catch (error) {
            console.error('Lỗi khi lấy thông báo:', error);
            res.locals.notifications = [];
        }
    } else {
        res.locals.notifications = [];
    }
    next();
});

// Routes init
route(app);

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`);
});
