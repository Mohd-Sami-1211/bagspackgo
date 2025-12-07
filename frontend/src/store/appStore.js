import { configureStore, combineReducers } from "@reduxjs/toolkit";
import providerReducer from "src/slices/serviceProviderSlice";
import providerCompanyReducer from "src/slices/providerCompanySlice";
import userReducer from "src/slices/userSlice"

const appStore = configureStore({
    reducer : {
      user:userReducer,
      provider : providerReducer,
      providerCompany : providerCompanyReducer
    }
})
export default appStore;