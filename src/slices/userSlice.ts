import { createSlice ,PayloadAction  } from "@reduxjs/toolkit";


export interface UserType {
    id: string | null;
    name: string | null;
    email: string | null;
    isLogin:boolean;
  }

const initialState: UserType = {
    id: null,
    name: null,
    email: null,
    isLogin :false,
  };
  
  const userReducer = createSlice({
    name: 'userReducer',
    initialState,
    reducers:{
        logout:(state)=>{
            state.isLogin = false,
            state.id = null,
            state.name = null,
            state.email = null;
        },
        saveUser:(state,action:PayloadAction<UserType>) =>{
            state.id = action.payload.id,
            state.name = action.payload.name,
            state.email = action.payload.email,
            state.isLogin = true
        }

    }
  })


  export const {logout ,saveUser } = userReducer.actions
  export default userReducer.reducer;