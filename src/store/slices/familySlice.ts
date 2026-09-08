import { createSlice } from "@reduxjs/toolkit";

import type { FamilyMember } from "@/lib/api";
import { initializeApp } from "../bootstrap";

type FamilyState = {
  members: FamilyMember[];
  loaded: boolean;
};

const initialState: FamilyState = {
  members: [],
  loaded: false,
};

const familySlice = createSlice({
  name: "family",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(initializeApp.fulfilled, (state) => {
      state.loaded = true;
    });
  },
});

export default familySlice.reducer;
