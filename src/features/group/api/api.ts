import { axios } from "../../../apiClient";

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
