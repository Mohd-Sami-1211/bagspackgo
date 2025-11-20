import { createSlice } from "@reduxjs/toolkit";
const initialState  = {
    currentProvider : null,

}

export const providerSlice = createSlice({
    name : "serviceProvider",
    initialState,
    reducers : {
        addServiceProvider : (state , action)=>{
            state.currentProvider = action.payload
        }
    }
})

export const {addServiceProvider} = providerSlice.actions;
export default providerSlice.reducer
