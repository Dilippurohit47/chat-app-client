import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserType {
  id: string | null;
  name: string | null;
  email: string | null;
  isLogin: boolean;
  profileUrl: string | null;
  accessToken:string | null;
}

const initialState: UserType = {
  id: null,
  name: null,
  email: null,
  isLogin: false,
  profileUrl: null,
  accessToken:null,
};

const userReducer = createSlice({
  name: "userReducer",
  initialState,
  reducers: {
    logout: (state) => {
      (state.isLogin = false),
        (state.id = null),
        (state.name = null),
        (state.email = null);
    },
    saveUser: (state, action: PayloadAction<UserType>) => {
      (state.id = action.payload.id),
        (state.name = action.payload.name),
        (state.email = action.payload.email || null),
        (state.profileUrl = action.payload.profileUrl),
      state.isLogin = true;
    },
    saveAccessToken:(state,action) =>{
      state.accessToken = action.payload.accessToken
    }
  },
});

export const { logout, saveUser  ,saveAccessToken} = userReducer.actions;
export default userReducer.reducer;
