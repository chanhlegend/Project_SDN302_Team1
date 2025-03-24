const Conversations = require('../models/Conversations');
const Messages = require('../models/Messages');
const User = require('../models/User');
const Category = require("../models/Category");
const mongoose = require('mongoose');
class ChatController {
    // GET /chat
    async index(req, res) {
        try {
            if (!req.session || !req.session.user || !req.session.user._id) {
                return res.redirect('/login');
            }

            const userId = req.session.user._id;

            const conversations = await Conversations.find({ 'participants.userId': userId })
                .populate('participants.userId', 'name avatar');

            // Lấy thông tin currentUser từ session
            const currentUser = req.session.user;

            const categories = await Category.find().sort({ createdAt: -1 });
            res.render('chat', {
                conversations: conversations || [],
                currentUser: currentUser || {}, // Sử dụng currentUser đã được định nghĩa
                selectedConversationId: null,
                messages: [],
                categories,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Lỗi server');
        }
    }

    // GET /chat/:conversationId
    async showChat(req, res) {
        try {
            const userId = req.session.user._id;
            const conversationId = req.params.conversationId;

            if (!userId) {
                return res.redirect('/login');
            }

            const conversation = await Conversations.findOne({
                _id: conversationId,
                'participants.userId': userId
            }).populate('participants.userId', 'name avatar');

            if (!conversation) {
                return res.redirect('/chat');
            }
            
            const messages = await Messages.find({ conversation_id: conversationId })
                .populate('senderId', 'name')
                .sort({ createdAt: 1 });

            const conversations = await Conversations.find({ 'participants.userId': userId })
                .populate('participants.userId', 'name avatar');
            const categories = await Category.find().sort({ createdAt: -1 });
            res.render('chat', {
                conversations: conversations || [],
                selectedConversationId: conversationId,
                messages: messages || [],
                currentUser: await User.findById(userId) || {},
                categories,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Lỗi server');
        }
    }

   // GET /chat/start/:sellerId


   async startChat(req, res) {
    if (!req.session || !req.session.user || !req.session.user._id) {
        return res.redirect('/login');
    }
        try {
            const sellerId = new mongoose.Types.ObjectId(req.params.sellerId); // Thêm 'new'
            const userId = new mongoose.Types.ObjectId(req.session.user._id); // Thêm 'new'

            if (!userId) {
                return res.redirect('/login');
            }

            // Tìm cuộc trò chuyện hiện có giữa userId và sellerId
            let conversation = await Conversations.findOne({
                'participants.userId': { $all: [userId, sellerId] }
            }).populate('participants.userId', 'name avatar');

            // Nếu chưa có, tạo cuộc trò chuyện mới
            if (!conversation) {
                conversation = new Conversations({
                    participants: [{ userId: userId }, { userId: sellerId }]
                });
                await conversation.save();
            }

            // Chuyển hướng đến trang chat với conversationId
            res.redirect(`/chat/${conversation._id}`);
        } catch (error) {
            console.error(error);
            res.status(500).send('Lỗi server');
        }
    }
}
module.exports = new ChatController();