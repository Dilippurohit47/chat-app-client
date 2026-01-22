import { IoCall, IoCallOutline, IoClose } from "react-icons/io5";

const CallNotificationDialog = ({ callerData, onAccept, onReject, onIgnore }) => {
  return (
    <div className="fixed min-h-[330px] right-[11rem] top-[10rem]  min-w-[300px] bg-white/95 backdrop-blur-lg shadow-2xl rounded-2xl border border-white/20 p-6 flex flex-col items-center space-y-4 animate-fade-in-up overflow-hidden">
      {/* Glass morphism background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 rounded-2xl" />
      
      {/* Caller Avatar with Ring Animation */}
      <div className="relative">
        <div className="absolute -inset-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-ping-slow opacity-20"></div>
        <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse opacity-30"></div>
        <img
          src={callerData?.callerProfileUrl || "/default-avatar.png"}
          alt={callerData?.callerName}
          className="relative w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg z-10"
        />
      </div>

      {/* Caller Info */}
      <div className="text-center z-10">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
          Incoming Call
        </p>
        <p className="font-bold text-2xl bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          {callerData?.callerName}
        </p>
        <div className="flex items-center justify-center mt-2 space-x-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <p className="text-sm text-gray-500">Calling...</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-row gap-3 mt-2 z-10">
        <button
          onClick={onAccept}
          className="group relative bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl active:scale-95"
          title="Accept Call"
        >
          <IoCall size={24} />
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Accept</span>
          </div>
        </button>

        <button
          onClick={onReject}
          className="group relative bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl active:scale-95"
          title="Reject Call"
        >
          <IoCallOutline size={24} />
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Reject</span>
          </div>
        </button>

        <button
          onClick={onIgnore}
          className="group relative bg-gradient-to-r from-gray-300 to-gray-200 hover:from-gray-400 hover:to-gray-300 text-gray-700 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl active:scale-95"
          title="Ignore"
        >
          <IoClose size={24} />
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Ignore</span>
          </div>
        </button>
      </div>

      {/* Wave animation at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent animate-wave"></div>
    </div>
  );
};

export default CallNotificationDialog;