import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const {id: receiverId} = req.params;
        const senderId = req.user._id;

        let conversation = await Conversation.findOne({
            participants:{ $all: [senderId , receiverId]},
        });

        if(!conversation){
            conversation = await Conversation.create({
                participants: [senderId , receiverId],
            })
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            message
        });

        if(newMessage){
            conversation.messages.push(newMessage._id);
        }

        //this will run in parallel
        await Promise.all([conversation.save() , newMessage.save()]);
        
        //Socket Io functionality will go here to make it real time
        const receiverSocketId = getReceiverSocketId(receiverId);

        if(receiverSocketId){
            //io.to(<socket_id>).emit() used to send event to a specific client
            io.to(receiverSocketId).emit("newMessage",newMessage)
        }

        res.status(201).json(newMessage);


    } catch (error) {
        console.log("Error in sendMessage controller:", error.message);
        res.status(500).json({message:"Internal Server Error."});
    }
};

export const getMessage = async (req , res) => {
    try {
        const {id: userToChatId} = req.params;
        const senderId = req.user._id;

        const conversation = await Conversation.findOne({
            participants: {$all : [senderId , userToChatId]},
        }).populate("messages"); //not references but  the actual message

        if(!conversation){
            return res.status(200).json([]);
        }

        const messages = conversation.messages;

        res.status(200).json(messages);

    } catch (error) {
        console.log("Error in getMessage controller:", error.message);
        res.status(500).json({error:"Internal Server Error."});
    }
}