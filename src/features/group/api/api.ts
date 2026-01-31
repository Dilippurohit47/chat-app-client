import { axios } from "../../../apiClient";
import { SelectedGroupType } from "../types";

type createGroupProps = {
  groupName: string;
  prevMembers: string[];
  newMemberId: string;
};
type createGroupApiResponse = {
  message: string;
};
export const createGroupApi = async ({
  groupName,
  prevMembers,
  newMemberId,
}: createGroupProps): Promise<createGroupApiResponse> => {
  const res = await axios.post<createGroupApiResponse>(`/group/create-group`, {
    name: groupName,
    members: [...prevMembers, newMemberId],
  });

  return res.data;
};

type addNewMembersInGroup = {
  addedMembers: string[];
  groupId: string;
};

export const addNewMembersInGroup = async ({
  addedMembers,
  groupId,
}: addNewMembersInGroup): Promise<void> => {
  await axios.post<void>(
    `/group/add-new-members`,
    {
      newMembers: addedMembers,
    },
    { params: { groupId: groupId } },
  );
};

type deleteGroupProps = {
  groupId:string,
  userId:string
}

export const deleteGroup = async({groupId , userId}:deleteGroupProps):Promise<void>=>{
      await axios.delete<void>(`$/group/delete-group/${groupId}/${userId}`,{
        withCredentials:true
      })
    }


    type FetchGroupsApiResponse ={
      groups:SelectedGroupType[] | []
    }

export const fetchGroups = async (): Promise<SelectedGroupType[]> => {
  const response = await axios.get<FetchGroupsApiResponse>("/group", {
    withCredentials: true,
  })

  return response.data.groups
}