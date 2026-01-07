import mongoose from "mongoose";
const packageSchema = new mongoose.Schema({
    activities : [
        {
            details : String,
            id : Number,
            name : String
        }
    ],
    inclusive :{
        include : {type : String , enum : ["FOOD" , "TRANSPORT" , "ACCOMODATION" , "GUIDANCE" , "PICKUPDROP"]},
        details : [String],
        included : Boolean,
        title : String

    },
    itinerary : [
        {
            agenda : String,
            day : Number,
            highlights : [String],
            hotel : String,
            isCompleted : Boolean,
            location : String,
            pickup : Date

        }
    ],
    packageInfo : {
        days : Number,
        destination : String,
        discountEnable : Boolean,
        discountPeople : Number,
        discountPercentage : Number,
        name : String,
        pricePerPerson : Number,
        type : {type : String , enum : ["PREMIUM" , "BUDGET"]}
    }
})
export const packageModel = mongoose.models.providerCompanyInfo ||  mongoose.model("package",packageSchema);