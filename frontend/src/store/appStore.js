import { configureStore, combineReducers } from "@reduxjs/toolkit";
import providerReducer from "src/slices/serviceProviderSlice";
import providerCompanyReducer from "src/slices/providerCompanySlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "root",
  storage,
};

const appReducer = combineReducers({
  provider: providerReducer,
  providerCompany: providerCompanyReducer,
  // add more reducers here
});

const rootReducer = (state, action) => {
  if (action.type === "auth/logout") {
    // clear persist storage key
    storage.removeItem("persist:root");
    // reset redux state
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);
