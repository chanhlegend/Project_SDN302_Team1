const User = require('../models/User');
const { mutipleMongoeseToObject, mongoeseToObject } = require('../../util/Mongoese');

const sampleUser = {
    username: 'john_doe',
    password: 'securepassword123',
    name: 'John Doe',
    dob: new Date('1990-01-01'),
    role: 'user',
    avatar: 'https://example.com/avatar.jpg',
    address: '123 Main St, Anytown, USA',
    phone: '123-456-7890',
    email: 'john.doe@example.com',
    status: 'active',
    evaluate: [
        { star: 5, evaluaterId: 'eval123' },
        { star: 4, evaluaterId: 'eval456' }
    ],
    followers: [
        { followerId: 'follower123' },
        { followerId: 'follower456' }
    ]
};

module.exports = sampleUser;

class userController {
    addUser(req, res, next) {
       const newUser = new User(sampleUser);
       newUser.save()
           .then(() => res.send('User added successfully'))
           .catch(next);
    }
}


module.exports = new userController;
 