import { configureStore } from "@reduxjs/toolkit";
export const makeStore = () => {
  return configureStore({
    reducer: {},
  });
};
//Infer (It is true and will not change ) the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>; //This represents the complete state type where getState is a method which is inside App store which returns the cueent state
export type AppDispatch = AppStore["dispatch"];
