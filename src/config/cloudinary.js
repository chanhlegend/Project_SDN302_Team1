// const cloudinary = require('cloudinary').v2;
//     cloudinary.config({ 
//         cloud_name: 'dqncabikk', 
//         api_key: '638767841585638', 
//         api_secret: 'bTCJDQuLNXuIOJC9oRWavgjC_hA' // Click 'View API Keys' above to copy your API secret
//     });
// module.exports = cloudinary;
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUD_API_KEY, 
    api_secret: process.env.CLOUD_API_SECRET, 
});

module.exports = cloudinary;