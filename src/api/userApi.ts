import {axios} from "../apiClient"
import { UserType } from "../slices/userSlice";
import { User } from "../types";

export const fetchAllUsers = async():Promise<User[]> =>{
    const res = await axios.get<User[]>(`/user/all-users`);
   return  res.data
}

export const getAuthenticatedUser = async():Promise<UserType>=>{
      const res = await axios.get<UserType>(`/user/get-user`, );
        return res.data
}

export const userSignOut = async():Promise<void>=>{
       await axios.post<void>(`/user/sign-out`)
}