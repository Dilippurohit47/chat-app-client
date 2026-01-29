import { axios } from "../../../apiClient";;
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useWebSocket } from "../../../context/webSocket";
import { groupInfoProps } from "../types";



const GroupInfoDialog = ({  setSelectedGroup ,userId, group, showGroupInfo ,setShowGroupInfo ,groupInfoButtonRef }:groupInfoProps) => {

  const infoRef = useRef<HTMLDivElement | null>(null)


  useEffect(() =>{

    const  handleClickOutside  =(e:MouseEvent) =>{
if( groupInfoButtonRef && groupInfoButtonRef.current && !groupInfoButtonRef.current.contains(e.target as Node)   && infoRef.current && !infoRef.current.contains(e.target as Node)){
setShowGroupInfo(false)
}
    }

    window.addEventListener("click",handleClickOutside)
    return () =>{
      window.removeEventListener("click",handleClickOutside)
    }
  },[])

  const {ws} = useWebSocket()

const deleteGroup = async () =>{
  try {
    const res = await axios.delete(`${import.meta.env.VITE_BASE_URL_HTTP}/group/delete-group/${group.id}/${userId}`,{
      withCredentials:true
    })
    if(res.status === 200){
      toast.success("Group Deleted")
      setSelectedGroup(null)
      setShowGroupInfo(false)
      if(!ws.current) return
      ws.current.send(
        JSON.stringify({
          type:"send-groups",
          userId:userId
        })
      )
    }
  } catch (error) {
    console.log(error)
  }
}
  return (
    <div ref={infoRef} className={` ${showGroupInfo ? "w-80  right-6 " : "w-0 right-[-30%] "} bg-white transition-all ease-in-out duration-200  rounded-lg absolute top-[4.5rem] overflow-hidden shadow-lg  dark:bg-gray-800 border border-gray-200 dark:border-gray-700`}>
      {/* Group Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-center text-white">
        <div className="mx-auto w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-3 overflow-hidden">
          <span className="text-2xl font-bold capitalize">
            {group.name.charAt(0)}
          </span>
        </div>
        <h3 className="text-xl font-bold">{group.name}</h3>
        <p className="text-sm opacity-90 mt-1">
          {group?.description || "Group of lions"}
        </p>
        <div className="mt-2 text-xs opacity-80">
          {group.members.length} members
        </div>
      </div>

      {/* Members List */}
      <div className="p-4 max-h-64 overflow-y-auto bg-[#ffffff] ">
        <h4 className="text-sm font-medium text-black dark:text-gray-400 mb-2">
          MEMBERS
        </h4>
        <ul className="space-y-2">
          {group.members.map((member, index) => {
            const user = member.user;
            console.log(user)
            return (
              <li
                key={`${group.id}-${user.id}-${index}`}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer hover:bg-gray-300  rounded-md transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-purple-500  flex items-center justify-center overflow-hidden">
                  {user.profileUrl ? (
                    <img
                      src={user.profileUrl || "https://github.com/shadcn.pnga"}
                      alt={user.name!}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-white">
                      {user.name!.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-start">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Optional Footer with Actions */}
      <div className="p-3 flex justify-between">
        <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          Invite People
        </button>
        <button className="text-sm text-red-500 dark:text-gray-400 hover:underline" onClick={deleteGroup}>
delete
        </button>
      </div>
    </div>
  );
};

export default GroupInfoDialog;
