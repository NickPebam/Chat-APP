import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import generateTokenAndSetCookies from "../utils/generateToken.js";

export const signup = async  (req ,res) => {
    try {
        const { fullname , username , password , confirmPassword , gender} = req.body;

        if(password !== confirmPassword){
            return res.sendStatus(400).json({error:"Password doesn't match"});
        }

        const user = await User.findOne({username});

        if(user) {
            return res.sendStatus(400).json({error:"User already exists"});
        }

        // Hash password here
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password , salt);


        //https://avatar.iran.liara.run/public/boy?username=[value]
        const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
        const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

        const newUser = new User ({
            fullname,
            username,
            password: hashPassword,
            gender,
            profilepic: gender === 'Male' ? boyProfilePic : girlProfilePic
        });

        if (newUser) {
            //jwt token generated
            generateTokenAndSetCookies(newUser._id , res);

            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullname: newUser.fullname,
                username: newUser.username,
                profilepic: newUser.profilepic
            });
        }
        else {
            res.sendStatus(400).json({error: "Invalid User Data"});
        }
        
    } catch (error) {
        console.log('Error in signup controller' , error.message);
        res.sendStatus(500).json({error: "Internal server Error"});
    }
}

export const login = async (req ,res) => {
    try {
        const {username , password } = req.body;
        const user = await User.findOne({username});
        const isPasswordCorrect = await bcrypt.compare(password , user?.password || "");

        if(!user || !isPasswordCorrect){
            return res.status(400).json({error: "Invalid username or password"});
        }

        generateTokenAndSetCookies(user._id , res);

        res.status(200).json({
            _id: user._id,
            fullname: user.fullname,
            username: user.username,
            profilepic: user.profilepic
        });


    } catch (error) {
        console.log('Error in signup controller' , error.message);
        res.status(500).json({error: "Internal server Error"});
    }
}

export const logout = (req ,res) => {
    try {
        res.cookie("jwt" , "" , {maxAge:0});
        res.status(200).json({message: "Logged Out Successfully"});
    } catch (error) {
        console.log('Error in signup controller' , error.message);
        res.status(500).json({error: "Internal server Error"});
    }
}