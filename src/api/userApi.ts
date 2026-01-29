import {axios} from "../apiClient"



export const fetchAllUsers = async()=>{
    const res =  await axios.get(`/user/all-users`)
    return res.data
}