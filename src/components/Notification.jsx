import React from 'react';
import { CheckCircle, XCircle, Info, X as Close } from 'lucide-react';

const Notification = ({ notification, onClose }) => {
  if (!notification) return null;
  const baseClass =
    notification.type === 'success'
      ? 'bg-green-800 border-green-600'
      : notification.type === 'error'
      ? 'bg-red-800 border-red-600'
      : 'bg-blue-800 border-blue-600';

  const DefaultIcon =
    notification.type === 'success'
      ? CheckCircle
      : notification.type === 'error'
      ? XCircle
      : Info;
  const Icon = notification.icon || DefaultIcon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div
        className={`relative p-6 rounded-lg shadow-lg border-2 max-w-md w-full mx-4 ${baseClass}`}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white hover:text-gray-300"
        >
          <Close className="w-5 h-5" />
        </button>
        <div className="flex items-start gap-4">
          <Icon className="w-8 h-8 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-bold text-lg mb-1">
              {notification.title}
              {notification.count > 1 && ` x${notification.count}`}
            </h4>
            <p className="text-sm whitespace-pre-line">{notification.message}</p>
          </div>
        </div>
        {notification.actions && notification.actions.length > 0 && (
          <div className="mt-4 flex justify-end gap-2">
            {notification.actions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notification;
