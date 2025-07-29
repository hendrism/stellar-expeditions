import React from 'react';

const Notification = ({ notification, onClose }) => {
  if (!notification) return null;
  const baseClass =
    notification.type === 'success'
      ? 'bg-green-800 border-green-600'
      : notification.type === 'error'
      ? 'bg-red-800 border-red-600'
      : 'bg-blue-800 border-blue-600';

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-lg shadow-lg border-2 max-w-md w-full mx-4 ${baseClass}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-lg mb-1">
            {notification.title}
            {notification.count > 1 && ` x${notification.count}`}
          </h4>
          <p className="text-sm whitespace-pre-line">{notification.message}</p>
        </div>
        <button onClick={onClose} className="text-white hover:text-gray-300 ml-2 text-xl">
          ×
        </button>
      </div>
    </div>
  );
};

export default Notification;
