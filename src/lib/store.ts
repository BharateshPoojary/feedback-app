import { configureStore } from "@reduxjs/toolkit";
export const makeStore = () => {
  return configureStore({
    reducer: {},
  });
};
//Infer (It is true and will not change ) the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
//
