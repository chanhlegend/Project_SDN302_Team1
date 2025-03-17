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

    socket.on('join', (userId) => {
        if (userId) {
            socket.join(userId);
            console.log(`User ${userId} joined room`);
        }
    });

    socket.on('sendMessage', async (data) => {
        try {
            const { conversationId, senderId, receiverId, messageContent } = data;
            const Messages = require('./app/models/Messages');
            const User = require('./app/models/User');

            // Lưu tin nhắn vào database
            const message = new Messages({
                conversation_id: conversationId,
                senderId,
                messageContent
            });
            await message.save();

            // Lấy tên người gửi
            const sender = await User.findById(senderId);

            // Gửi tin nhắn lại cho sender để hiển thị ngay lập tức
            socket.emit('receiveMessage', {
                conversationId,
                senderId,
                senderName: sender.name,
                messageContent,
                createdAt: message.createdAt
            });

            // Nếu receiver online, gửi tin nhắn đến receiver
            const receiverSocket = io.sockets.adapter.rooms.get(receiverId);
            if (receiverSocket) {
                io.to(receiverId).emit('receiveMessage', {
                    conversationId,
                    senderId,
                    senderName: sender.name,
                    messageContent,
                    createdAt: message.createdAt
                });

                // Gửi thông báo đến receiver
                io.to(receiverId).emit('notification', {
                    title: 'Tin nhắn mới',
                    message: `Bạn nhận được tin nhắn từ ${sender.name}`,
                    createdAt: new Date()
                });
            } else {
                console.log(`Receiver ${receiverId} is offline. Message saved to database.`);
            }
        } catch (error) {
            console.error('Lỗi khi gửi tin nhắn:', error);
            socket.emit('error', { message: 'Không thể gửi tin nhắn. Vui lòng thử lại.' });
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

