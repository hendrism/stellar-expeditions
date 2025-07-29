import React from 'react';
import { Bell } from 'lucide-react';

const NotificationFeed = ({ feed, open, toggleOpen, clearFeed }) => {
  return (
    <div>
      <button
        onClick={toggleOpen}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 p-3 rounded-full shadow-lg z-50"
      >
        <Bell className="w-5 h-5" />
        {feed.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {feed.length}
          </span>
        )}
      </button>
      {open && (
        <div className="fixed bottom-20 right-4 w-80 max-h-80 overflow-y-auto bg-gray-800 border-blue-600 border-2 rounded-lg p-4 space-y-2 z-50">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-lg">Notifications</h4>
            <button onClick={clearFeed} className="text-sm text-blue-300 hover:text-blue-400">Clear</button>
          </div>
          {feed.length === 0 && <div className="text-gray-400 text-sm">No notifications</div>}
          {feed.map((n, idx) => (
            <div
              key={idx}
              className={`p-2 rounded border-l-4 ${
                n.type === 'success'
                  ? 'bg-green-900 border-green-600'
                  : n.type === 'error'
                  ? 'bg-red-900 border-red-600'
                  : 'bg-blue-900 border-blue-600'
              }`}
            >
              <div className="font-semibold">
                {n.title}
                {n.count > 1 && ` x${n.count}`}
              </div>
              <div className="text-sm whitespace-pre-line">{n.message}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationFeed;
