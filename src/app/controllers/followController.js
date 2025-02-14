const User = require("../models/User")
const Follower = require("../models/Follower")

class FollowController {
    static async followUser(req, res) {
        try {
            const { followerId, followingId } = req.body;

            if(followerId === followingId) {
                return res.status(400).json({ message: "Không thể theo dõi chính mình" });
            }

            const existingFollower = await Follower.findOne({ followerId, followingId });

            if(existingFollower) {
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
            const { followerId, followingId } = req.body;

            const followRecord = await Follower.findOne({ followerId, followingId });
            if (!followRecord) {
                return res.status(400).json({ message: "Bạn chưa theo dõi người này" });
            }

            await Follower.deleteOne({ _id: followRecord._id });

            await User.findByIdAndUpdate(followingId, { $pull: { followers: followRecord._id } });

            return res.status(200).json({ message: "Hủy theo dõi thành công" });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    }

    static async getFollowing(req, res) {
        try {
            const { userId } = req.params;
            const following = await Follower.find({ followerId: userId }).populate('followingId', 'username email avatar');
            return res.status(200).json({ message: "Danh sách đang theo dõi", data: following });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    }

    static async getFollowers(req, res) {
        try {
            const { userId } = req.params;
            const followers = await Follower.find({ followingId: userId }).populate('followerId', 'username email avatar');
            return res.status(200).json({ message: "Danh sách người theo dõi", data: followers });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    }
}

module.exports = FollowController;
