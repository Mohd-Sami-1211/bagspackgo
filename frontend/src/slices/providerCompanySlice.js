import { createSlice } from "@reduxjs/toolkit";
const initialState  = {
    currentCompany : null,
    currentEvent : null

}

export const providerCompanySlice = createSlice({
    name : "providerCompany",
    initialState,
    reducers : {
        addProviderCompany : (state , action)=>{
            state.currentCompany = action.payload
        },
        addCompanyEvent : (state ,action)=>{
            state.currentEvent = action.payload;
        }
    }

})

export const {addProviderCompany , addCompanyEvent} = providerCompanySlice.actions;
export default providerCompanySlice.reducer;