import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { toast } from "react-toastify"; // or your toast lib
import { RefObject } from "react";
import { fetchAllUsers } from "../../../api/userApi";
import { createGroupApi } from "../api/api";

type UserTypes = {
  id: string;
  name: string;
  profileUrl?: string;
};

type UseCreateGroupProps = {
  userId: string | null;
  ws: RefObject<WebSocket | null>;
};

export const useCreateGroup = ({ userId, ws }: UseCreateGroupProps) => {
  const [totalUsers, setTotalUsers] = useState<UserTypes[]>([]);
  const [addedMembers, setAddedMembers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
if(!dialogOpen) return
    const getTotalUser = async () => {
      try {
      const data = await fetchAllUsers()
        setTotalUsers(data);
      } catch (error) {
        console.log(error);
      }
    };

    getTotalUser();
  }, [dialogOpen]);

  const addMembers = (id: string) => {
    if (id === userId) {
      toast.error("Admin cannot be removed");
      return;
    }

    setAddedMembers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const createGroup = async () => {
    try {
      setError("");

      if (!userId) {
        toast.error("User not found");
        return;
      }

      if (!groupName.trim()) {
        setError("Group name cannot be empty!");
        return;
      }

      if (addedMembers.length <= 0) {
        setError("At least one member required to create group!");
        return;
      }
      const data = await createGroupApi({groupName , prevMembers:[...addedMembers],newMemberId:userId})
        toast.success(data.message);
        setDialogOpen(false);
        setGroupName("");
        setAddedMembers([]);

        ws.current?.send(
          JSON.stringify({
            type: "send-groups",
            userId,
          })
        );
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data.message || "something went wrong");
    }
  };

  return {
    totalUsers,
    addedMembers,
    groupName,
    dialogOpen,
    error,
    setGroupName,
    setDialogOpen,
    addMembers,
    createGroup,
    setAddedMembers,
  };
};
