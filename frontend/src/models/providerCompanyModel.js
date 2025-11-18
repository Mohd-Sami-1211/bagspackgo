import mongoose from "mongoose";

const providerCompanySchema = new mongoose.Schema({
    personalEmail : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'ServiceProvider'
    },
    companyEmail : {
        type : String,
        required : true,
    },
    companyName : {
        type : String,
        required : true
    },
    companyMobileNumber : {
        type : String,
        required : true
    },
    OperatingLocation : {
        type : String
    },
    facebookLink : {
        type : String
    },
    instagramLink : {
        type : String
    },
    BusinessLicense : {
        type : String,
        required : true
    },
    idProof : {
        type : String,
        required : true
    },
    availability: {
        trips: { type: Boolean, default: false },
        treks: { type: Boolean, default: false },
        mergers: { type: Boolean, default: false }
    }
})
export const providerCompanyModel = mongoose.models.providerCompanyInfo ||  mongoose.model("providerCompanyInfo",providerCompanySchema); 