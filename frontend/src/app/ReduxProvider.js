"use client";

import { Provider } from "react-redux";
import appStore from "src/store/appStore";

export default function ReduxProvider({ children }) {
  return(
    <Provider store={appStore}>
        {children}
      
    </Provider>
  ) 
} 