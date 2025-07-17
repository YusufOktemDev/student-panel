import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { supabase } from "../lib/supabaseClient";
import dayjs from "dayjs";

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [eventMap, setEventMap] = useState({}); 
  const [todayEvents, setTodayEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("user_id", parseInt(userId));

      if (error) {
        console.error("❌ Calendar fetch error:", error);
        return;
      }

     
      const map = {};
      data.forEach((event) => {
        const dateKey = dayjs(event.date).format("YYYY-MM-DD");
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(event);
      });

      setEventMap(map);
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const key = dayjs(selectedDate).format("YYYY-MM-DD");
    setTodayEvents(eventMap[key] || []);
  }, [selectedDate, eventMap]);

  return (
    <div className="p-6 text-black dark:text-white">
      <h2 className="text-2xl font-bold mb-4">Calendar</h2>
      <div className="flex flex-col md:flex-row gap-8">
        <Calendar onChange={setSelectedDate} value={selectedDate} />

        <div>
          <h3 className="text-xl font-semibold mb-2">
            Events on {dayjs(selectedDate).format("YYYY-MM-DD")}
          </h3>
          {todayEvents.length === 0 ? (
            <p className="text-gray-500">No events for this day.</p>
          ) : (
            <ul className="space-y-2">
              {todayEvents.map((e) => (
                <li
                  key={e.id}
                  className="bg-white dark:bg-gray-800 p-3 rounded shadow"
                >
                  <div className="font-semibold">{e.title}</div>
                  <div className="text-sm text-gray-500">{e.type}</div>
                  {e.description && (
                    <div className="text-sm mt-1 text-gray-400">
                      {e.description}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
