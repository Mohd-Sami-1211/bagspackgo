import { createSlice } from "@reduxjs/toolkit";
const initialState  = {
    currentUser: null

}

export const userSlice = createSlice({
    name : "currentUser",
    initialState,
    reducers : {
        addUser : (state , action)=>{
            state.currentUser = action.payload
        },
        removeUser : (state)=>{
            state.currentUser = null
        }
    }

})

export const {addUser , removeUser} = userSlice.actions;
export default userSlice.reducer;