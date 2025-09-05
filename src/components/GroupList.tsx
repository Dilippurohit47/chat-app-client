import { useEffect, useState } from "react";
import { onlineUsersType } from "./totalUserList";
import { axios } from "../apiClient";;
import { useWebSocket } from "../context/webSocket";
import GroupContextMenuDialogBox from "./groupContextMenu";
import { UserType } from "../slices/userSlice";
import { SelectedGroupType } from "../pages/Homepage";

type GroupListType = {
  connected: boolean;
  logedInUser: UserType;
  selectedGroup:SelectedGroupType | null,
  setSelectedGroup : React.Dispatch<React.SetStateAction<SelectedGroupType | null>>
};

const GroupList = ({ logedInUser, connected  ,selectedGroup ,setSelectedGroup}: GroupListType) => {
  const [groupList, setGroupList] = useState<SelectedGroupType[] | []>([]);
  const [openContextMenu , setOpenContextMenu] = useState<string | null>(null)
  const {ws } = useWebSocket()
  console.log("group list ",groupList)
  useEffect(() => {
    if(!ws.current) return
    const fetchGroups = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL_HTTP}/group`,{
          withCredentials:true
        });
        console.log(response)
        setGroupList(response.data.groups)
      } catch (error) {
        console.log("err in getting groups",error)
      }
    };

    fetchGroups();

    const getRefreshedGroups =(e:MessageEvent) =>{
    const data = JSON.parse(e.data)
  if(data.type === "get-groups-ws"){
    setGroupList(data.groups)
  }
    }

    ws.current.addEventListener("message",getRefreshedGroups)
    return () =>{ 
      if(!ws.current) return
      ws.current.removeEventListener("message",getRefreshedGroups)
    }
  },[]);

  return (
    <div className="px-3 py-1  overflow-y-auto">
      <h2 className="text-[1.2rem]  flex justify-center items-center gap-2 font-semibold mb-2">
        {" "}
        {logedInUser.isLogin
          ? connected
            ? ""
            : "connecting..."
          : "Login first "}{" "}
      </h2>
      <ul className=" overflow-y-auto h-[75vh] flex-1   flex flex-col gap-2 transition-all ">
        {groupList?.length > 0
          ? groupList.map((group) => {
              return (
                <div className="relative ">
                
                <li
                onContextMenu={(e) =>{ e.preventDefault() ;  setOpenContextMenu(group.id)}}
                  key={group.id}
                  className={`p-3 cursor-pointer rounded-lg  z-0  flex  
                      ${
                    selectedGroup?.id === group.id
                      ? "bg-[#008080d6] text-white"
                      : "bg-gray-200 "
                  }`
                }
                  onClick={() => setSelectedGroup(group)}
                >
                  <div className="flex   w-[3rem]  justify-start items-center gap-3 ">
                    <img
                      src={
                        group.groupProfilePicture
                          ? group.groupProfilePicture
                          : "https://github.com/shadcn.png"
                      }
                      className="rounded-full h-9 w-9 object-cover"
                      alt=""
                    />
                  </div>
                  <div className="flex flex-col justify-center bg   w-full items-start  px-3">
                    <div className="flex justify-between    w-full   items-center gap-3 ">
                      <div className="font-medium max-w-[10rem]   overflow-hidden truncate">
                        {group?.name}
                      </div>
                      {/* {onlineUsers &&
                      onlineUsers.map((u) => u.userId).includes(user.id) ? (
                        <div className="bg-green-500  rounded-4xl h-2 w-2"></div>
                      ) : (
                        <div className="bg-gray-500  rounded-4xl h-2 w-2"></div>
                      )} */}
                    </div>
                    <div
                      className={`text-sm flex    justify-between w-full overflow-hidden truncate
                        
                      ${
                        selectedGroup?.id === group.id
                          ? "text-gray-200"
                          : "text-gray-500"
                      }`
                    
                    }
                    >
                      <span className="max-w-[8rem] overflow-hidden truncate">
                        {" "}
                        {group?.lastMessage}
                      </span>
                 
                    </div>
                  </div>
                </li>
                {
                  openContextMenu === group.id && <GroupContextMenuDialogBox  groupId={group.id} open={openContextMenu} setOpen={setOpenContextMenu} setSelectedGroup={setSelectedGroup} />
                }
                </div>
              );
            })
          : connected
          ? "create new group"
          : ""}
      </ul>
    </div>
  );
};

export default GroupList;
