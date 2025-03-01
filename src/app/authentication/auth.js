const passport = require('passport');  
const LocalStrategy = require('passport-local').Strategy;  
const User = require('../models/User');  

passport.use(new LocalStrategy(  
    User.authenticate()  
));  

passport.serializeUser((user, done) => {  
    done(null, user._id);  
});  

passport.deserializeUser(async (_id, done) => {  
    try {  
        const user = await User.findById(_id); 
        done(null, user); 
    } catch (err) {  
        done(err, false);  
    }  
});

module.exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) { 
      return next(); // Cho phép tiếp tục request nếu đã đăng nhập
  }
  res.status(401).json({ error: 'Unauthorized. Please log in first.' });
};
