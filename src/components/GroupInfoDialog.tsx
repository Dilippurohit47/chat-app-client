
const GroupInfoDialog = ({ group, showGroupInfo }) => {
  return (
    <div className={` ${showGroupInfo ? "w-80  right-6 " : "w-0 right-[-30%] "} bg-white transition-all ease-in-out duration-200  rounded-lg absolute top-[4.5rem] overflow-hidden shadow-lg  dark:bg-gray-800 border border-gray-200 dark:border-gray-700`}>
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
      <div className="p-4 max-h-64 overflow-y-auto">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          MEMBERS
        </h4>
        <ul className="space-y-2">
          {group.members.map((member, index) => {
            const user = member.user;
            return (
              <li
                key={`${group.id}-${user.id}-${index}`}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-purple-500 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-white ">
                      {user.name.charAt(0)}
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
      <div className="border-t border-gray-200 dark:border-gray-700 p-3 flex justify-between">
        <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          Invite People
        </button>
        <button className="text-sm text-red-500 dark:text-gray-400 hover:underline">
delete
        </button>
      </div>
    </div>
  );
};

export default GroupInfoDialog;
