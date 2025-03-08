const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const User = require('../../app/models/User'); // Đường dẫn đến User model của bạn
require('dotenv').config({ path: './src/.env' });

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, 
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Tìm hoặc tạo user mới dựa trên Google ID hoặc email
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
            user = new User({
                username: profile.id, // Google ID làm username
                email: profile.emails[0].value,
                name: profile.displayName,
                avatar: profile.photos[0].value, // Ảnh đại diện từ Google
                password: 'google-auth-' + profile.id // Tạo mật khẩu giả (không dùng)
            });
            await user.save();
        }
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));

// Serialize: Lưu toàn bộ user vào session
passport.serializeUser((user, done) => {
    done(null, user); // Lưu toàn bộ đối tượng user
});

// Deserialize: Không cần tìm lại từ DB, trả thẳng user từ session
passport.deserializeUser((user, done) => {
    done(null, user); // Trả lại user đã lưu trong session
});

module.exports = passport;