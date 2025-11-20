import mongoose from "mongoose"

const EventSchema = new mongoose.Schema({
    companyId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'providerCompanyInfo'
    },
    EventTitle : {
        type : String
    },
    EventType : {
        type : String
    },
    Location : {
        type : String
    },
    Date : {
        type : Date
    },
    Duration : {
        type : Number
    },
    TotalSlots : {
        type : Number
    },
    PricePerSlot : {
        type : Number
    },
    Destination : {
        type : String
    },
    DestinationLink : {
        type : String
    },
    AboutTheEvent : {
        type : String
    },
    HighLights : {
        type : [String]
    },
    Included : {
        type : [String]
    },
    FAQ : {
        type : [
            {
                Question : {type : String},
                Answer : {type: String}

            }
        ]
    },
    WhatToBringInEvent : {
        type : [String]
    },
    Restrictions : {
        type : [String]
    },
    PickUpAndDrop : {
        type : [
            {
                Location : {type : String},
                MapLink : {type : String},
                PickupTime : {type : Date}
            }

        ]
    },
    EventItinerary : {
        type : [String]
    },
    Poster : {
        type : String
    }
})
export const EventModel = mongoose.models.EventModel || mongoose.model("EventModel", EventSchema);