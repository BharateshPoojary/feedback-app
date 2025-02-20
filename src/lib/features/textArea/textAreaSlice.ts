import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
export interface TextAreaState {
  content: string;
}

const initialState: TextAreaState = {
  content: "",
};
export const textAreaSlice = createSlice({
  name: "textArea",
  initialState,
  reducers: {
    setTextArea: (state, action: PayloadAction<string>) => {
      state.content = action.payload;
    },
  },
});
export const { setTextArea } = textAreaSlice.actions;
export default textAreaSlice.reducer;
