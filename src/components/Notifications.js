import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { addNotification, markAllAsRead } from "./notificationsUtils";
import { supabase } from "../lib/supabaseClient";

export default function Notifications({ user }) {
  const [acik, setAcik] = useState(false);
  const [bildirimler, setBildirimler] = useState([]);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) {
      setBildirimler(data);
    } else {
      console.error("Bildirimler alınamadı:", error.message);
    }
  };

  const handleToggle = () => {
    setAcik(!acik);
    if (!acik) fetchNotifications();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead(user.id);
    fetchNotifications();
  };

  const okunmamisSayisi = bildirimler.filter((b) => !b.is_read).length;

  return (
    <div className="relative inline-block text-left mr-4">
      <button onClick={handleToggle} className="relative">
        <Bell className="w-6 h-6 text-gray-700 dark:text-white" />
        {okunmamisSayisi > 0 && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
        )}
      </button>

      {acik && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-50">
          <div className="p-4 border-b flex justify-between items-center">
            <span className="font-semibold text-gray-800 dark:text-white">
              Bildirimler
            </span>
            <button
              onClick={handleMarkAllAsRead}
              className="text-blue-500 text-sm hover:underline"
            >
              Tümünü okundu yap
            </button>
          </div>
          <ul className="max-h-64 overflow-y-auto">
            {bildirimler.length === 0 ? (
              <li className="p-4 text-gray-500 text-sm">Henüz bildirim yok</li>
            ) : (
              bildirimler.map((b) => (
                <li
                  key={b.id}
                  className={`p-4 border-b text-sm ${
                    b.is_read
                      ? "text-gray-500"
                      : "text-black dark:text-white font-semibold"
                  }`}
                >
                  {b.content}
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(b.created_at).toLocaleString()}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
