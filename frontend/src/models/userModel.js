import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    userName : {
        type : String,
        required : true
    },
    email :{
        type : String,
        required : [true , "Name is Required"],
    },
    password : {
        type : String,
        required : true,
        unique : true

    },
    number : {
        type : Number,
        required : [true , "Phone Number is Required"],
        unique : true

    },
    dob : {
        type : Number,
        required : true
    }

})
export const UserModel = mongoose.models.User ||  mongoose.model("User",userSchema) 