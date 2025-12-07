  import mongoose from "mongoose"
  import bcrypt from "bcrypt"
  import jwt from "jsonwebtoken"
  const serviceProviderSchema = new mongoose.Schema({
      name : {
          type : String,
          required : true
      },
      email : {
          type : String,
          required : true
      },
      password : {
          type : String
      },
      phoneNumber : {
          type : String
      },
      role : {
        type : String
      },
      refreshToken : {
          type : String
      }
  })
  serviceProviderSchema.pre("save", async function (next) {
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
  serviceProviderSchema.methods.generateAccessToken =function(){
    const accessToken =jwt.sign({
      id : this._id,
      email : this.email,
      role : this.role
    },process.env.JWT_SECRET,
    {expiresIn : "1d"}
    )
    return accessToken;
  }

  serviceProviderSchema.methods.generateRefreshToken = async function(){
    const refreshToken = jwt.sign({
      id : this._id,
      email : this.email,
      role : this.role
      
    } , process.env.REFRESH_TOKEN_SECRET)
    const hashedRefreshToken = await bcrypt.hash(refreshToken , 10);
    this.refreshToken = hashedRefreshToken;
    return refreshToken;
  }
  serviceProviderSchema.methods.isPasswordValid = async function(passwordFromUser){
    const isValid = await bcrypt.compare(passwordFromUser , this.password);
    if(isValid){
      return true;
    }
    return false;
  }
  // mongoose.deleteModel && mongoose.deleteModel("ServiceProvider");
  export const serviceProviderModel = mongoose.models.ServiceProvider ||  mongoose.model("ServiceProvider",serviceProviderSchema); 