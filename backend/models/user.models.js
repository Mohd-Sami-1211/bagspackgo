import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
     username:{
        type: String,
        required : true,

     },
     email:{
        type: String,
        required : true,
        lowercase: true,
        unique: true,
     },
     number:{
        type: String,
        required : true,
        unique: true,  
     },
     password:{
        type: String,
        required : true,
        
     },
     dob:{
        type: Date,
        required : true,
        
     }
    },
    {timestamps: true})

export const User =mongoose.model("User",userSchema) 