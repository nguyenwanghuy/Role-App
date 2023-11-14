import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username:{
        type: String,
        require: true,
        minlength:6,
        maxlength:20,
        unique: true,
    },
    email:{
        type: String,
        require: true,
        minlength:10,
        maxlength:50,
        unique: true,
    },
    password:{
        type: String,
        require: true,
        minlength:6,
    },
    admin:{
        type: Boolean,
        default: false,
    },

},{timestamps:true,})

const UserModel = mongoose.model('users',UserSchema);
export default UserModel