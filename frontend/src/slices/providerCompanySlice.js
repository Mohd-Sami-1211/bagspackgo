import { createSlice } from "@reduxjs/toolkit";
const initialState  = {
    currentCompany : null,
    currentEvents : []

}

export const providerCompanySlice = createSlice({
    name : "providerCompany",
    initialState,
    reducers : {
        addProviderCompany : (state , action)=>{
            state.currentCompany = action.payload
        },
        addCompanyEvent : (state ,action)=>{
            if(Array.isArray(action.payload)){
                state.currentEvents = action.payload;
            }
            else{
                state.currentEvents.push(action.payload);
            }
        }
    }

})

export const {addProviderCompany , addCompanyEvent} = providerCompanySlice.actions;
export default providerCompanySlice.reducer;