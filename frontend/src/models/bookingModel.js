import mongoose from "mongoose"

const partipantsSchema = new mongoose.Schema(
    {
        name : {type : String},
        gender : {type : String},
        age : {type : String},
        bloodGroup : {type : String},
        country : {type : String},
        address : {type : String},
        idType : String,
        idNumber : String,
        idFileUrl : String
    },
    {_id : false},
);
const contactDetailsSchema = new mongoose.Schema({
    email : String,
    mobileNumber : String
} , {_id : false});
const bookingSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    eventId : {type : String},
    contactDetails : contactDetailsSchema,
    participantsDetails : [partipantsSchema],
    amount : {type : String},
    razorpayOrderId : {type : String},
    status: {type : String},
    paymentId : {type : String},
    paidAt : {type : Date},
    guide : {type : String}
})
// mongoose.deleteModel && mongoose.deleteModel("booking");
export const bookingModel = mongoose.models.booking || mongoose.model("booking", bookingSchema);