const cloudinary = require('cloudinary').v2;
    cloudinary.config({ 
        cloud_name: 'dqncabikk', 
        api_key: '638767841585638', 
        api_secret: 'bTCJDQuLNXuIOJC9oRWavgjC_hA' // Click 'View API Keys' above to copy your API secret
    });
module.exports = cloudinary;
