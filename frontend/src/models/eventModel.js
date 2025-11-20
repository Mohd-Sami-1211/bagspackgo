import mongoose from "mongoose"

const EventSchema = new mongoose.Schema({
    companyId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'providerCompanyInfo'
    },
    title : {
        type : String
    },
    eventType : {
        type : String
    },
    location : {
        type : String
    },
    date : {
        type : Date
    },
    duration : {
        type : Number
    },
    totalSlots : {
        type : Number
    },
    pricePerSlot : {
        type : Number
    },
    destination : {
        type : String
    },
    destinationLink : {
        type : String
    },
    about : {
        type : String
    },
    highlights : {
        type : [String]
    },
    whatsIncluded : {
        type : [String]
    },
    faqs : {
        type : [
            {
                Question : {type : String},
                Answer : {type: String}

            }
        ]
    },
    whatToBring : {
        type : [String]
    },
    restrictions : {
        type : [String]
    },
    pickupPoints : {
        type : [
            {
                Location : {type : String},
                MapLink : {type : String},
                PickupTime : {type : Date}
            }

        ]
    },
    itinerary : {
        type : [String]
    },
    posterFile : {
        type : String
    }
})
export const EventModel = mongoose.models.EventModel || mongoose.model("EventModel", EventSchema);