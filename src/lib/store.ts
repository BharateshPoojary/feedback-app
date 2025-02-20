import { configureStore } from "@reduxjs/toolkit";
import textAreaReducer from "./features/textArea/textAreaSlice";
export const makeStore = () => {
  return configureStore({
    //we have to initialize the store both on client and server component in order to avoid hydration error
    reducer: {
      textArea: textAreaReducer,
    },
  });
};
//Infer (It is true and will not change ) the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>; //This represents the complete state type where getState is a method which is inside App store which returns the current state
export type AppDispatch = AppStore["dispatch"]; //dispatch function to chnage the state
