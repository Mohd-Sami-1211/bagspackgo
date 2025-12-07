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
        }
    }

})

export const {addProviderCompany} = providerCompanySlice.actions;
export default providerCompanySlice.reducer;