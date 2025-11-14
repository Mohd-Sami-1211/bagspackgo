import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    email :{
        type : String,
        required : [true , "Email is Required"],
    },
    password : {
        type : String,
        required : true,
        unique : true

    },
    phoneNumber : {
        type : String,
        required : [true , "Phone Number is Required"],
        unique : true

    },
    dob : {
      type : String,
      required : true
    },
    refreshToken : {
      type : String
    }

})
userSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    
    try {
      this.password = await bcrypt.hash(this.password, 10);
      
    } catch (err) {
      console.error("Error hashing password:", err);
      return next(err);
    }
  }
  next();
});
userSchema.methods.generateAccessToken =function(){
  const accessToken =jwt.sign({
    id : this._id,
    email : this.email
  },process.env.JWT_SECRET,
  {expiresIn : "1d"}
  )
  return accessToken;
}

userSchema.methods.generateRefreshToken = async function(){
  const refreshToken = jwt.sign({
    id : this._id,
    email : this.email
    
  } , process.env.REFRESH_TOKEN_SECRET)
  const hashedRefreshToken = await bcrypt.hash(refreshToken , 10);
  this.refreshToken = hashedRefreshToken;
  return refreshToken;
}
userSchema.methods.isPasswordValid = async function(passwordFromUser){
  const isValid = await bcrypt.compare(passwordFromUser , this.password);
  if(isValid){
    return true;
  }
  return false;
}
export const UserModel = mongoose.models.User ||  mongoose.model("User",userSchema) 