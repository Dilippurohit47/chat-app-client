import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { axios } from "../apiClient";
import { RootState } from "../store";
import { saveUser } from "../slices/userSlice";

export const  useLoadInitialUser = ()=>{
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);

      useEffect(() => {
    const getUser = async () => {
      const res = await axios.get(`/user/get-user`,
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
          withCredentials: true,
        },
      );
      if (res.status === 200) {
        dispatch(saveUser(res.data.user));
      }
    };
    getUser();
  }, [user.accessToken]);

}