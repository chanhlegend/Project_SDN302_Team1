const User = require("../models/User")
const Follower = require("../models/Follower")
const Category = require('../models/Category')

class FollowController {
    static async followUser(req, res) {
        try {
            const followerId = req.session.user ? req.session.user._id : null;
            const { followingId } = req.body;
            console.log("followingId: ",followingId);
            if (!followerId) {
                return res.status(401).json({ message: "Bạn cần đăng nhập để theo dõi" });
            }
    
            if (followerId === followingId) {
                return res.status(400).json({ message: "Không thể theo dõi chính mình" });
            }
    
            const follower = await User.findById(followerId);
            if (!follower) {
                return res.status(404).json({ message: "Người theo dõi không tồn tại" });
            }
    
            const following = await User.findById(followingId);
            if (!following) {
                return res.status(404).json({ message: "Người được theo dõi không tồn tại" });
            }
    
            if (following.role !== "seller") {
                return res.status(400).json({ message: "Người này không thể có người theo dõi" });
            }
    
            const existingFollower = await Follower.findOne({ followerId, followingId });
            if (existingFollower) {
                return res.status(400).json({ message: "Bạn đã theo dõi người này" });
            }
    
            const newFollower = new Follower({ followerId, followingId });
            await newFollower.save();
    
            await User.findByIdAndUpdate(followingId, { $push: { followers: newFollower._id } });
    
            return res.status(201).json({ message: "Theo dõi người dùng thành công" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    static async unfollowUser(req, res) {
        try {
            const userId = req.session.user ? req.session.user._id : null;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Chưa đăng nhập" });
            }
    
            const { followingId } = req.body;
    
            const followRecord = await Follower.findOne({ followerId: userId, followingId });
            if (!followRecord) {
                return res.status(400).json({ success: false, message: "Bạn chưa theo dõi người này" });
            }
    
            await Follower.deleteOne({ _id: followRecord._id });
    
            await User.findByIdAndUpdate(userId, { $pull: { followers: followRecord._id } });
    
            return res.status(200).json({ success: true, message: "Hủy theo dõi thành công" });
        } catch (error) {
            return res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
        }
    }
    

    static async getFollowing(req, res) {
        try {
            const userId = req.session.user ? req.session.user._id : null;
        
            const following = await Follower.find({ followerId: userId }).populate('followingId', 'username email avatar');
            return res.status(200).json({ message: "Danh sách đang theo dõi", data: following });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    }

    static async getFollowers(req, res) {
        try {
            const userId = req.session.user ? req.session.user._id : null;
            if (!userId) {
                return res.status(401).json({ message: "Chưa đăng nhập" });
            }
    
            // Lấy danh sách người theo dõi và đang theo dõi
            const followers = await Follower.find({ followingId: userId }).populate('followerId', 'name email avatar');
            const following = await Follower.find({ followerId: userId }).populate('followingId', 'name email avatar');
    
            // Lấy danh sách danh mục để truyền vào template
            const categories = await Category.find(); 
    
            res.render("friend", { 
                title: "Bạn Bè", 
                followers: followers,
                following: following,
                userId: userId,
                categories: categories // Thêm categories vào render
            });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    }
    

    static async checkFollowStatus(req, res){
        try {
            const userId = req.session.user ? req.session.user._id : null;
            if (!userId) {
                return res.status(401).json({ message: "Chưa đăng nhập" });
            }
    
            const { followingId } = req.params;
            const isFollowing = await Follower.findOne({ followerId: userId, followingId });
    
            res.json({ isFollowing: !!isFollowing });
        } catch (error) {
            res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    }
}

module.exports = FollowController;
