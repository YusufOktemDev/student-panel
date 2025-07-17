import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function StudentDashboard({ kullanici }) {
  const [todayClasses, setTodayClasses] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [latestNotification, setLatestNotification] = useState(null);
  if (!kullanici) return <p className="p-6">Yükleniyor...</p>;

  useEffect(() => {
    if (!kullanici) return;

    const today = new Date().toISOString().split("T")[0];

    const fetchDashboardData = async () => {
      const { data: calendarData } = await supabase
        .from("calendar")
        .select("*")
        .eq("event_date", today)
        .contains("student_ids", [kullanici.id]);

      setTodayClasses(calendarData || []);

      const { data: assignmentData } = await supabase
        .from("assignments")
        .select("*")
        .gt("due_date", today)
        .in("course_id", kullanici.enrolledCourses || []);

      setUpcomingAssignments(assignmentData || []);

      const { data: notifications } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", kullanici.id)
        .order("created_at", { ascending: false })
        .limit(1);

      setLatestNotification(notifications?.[0] || null);
    };

    fetchDashboardData();
  }, [kullanici]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Welcome, {kullanici.fullname} 👋
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Today's Classes</h2>
          {todayClasses.length === 0 ? (
            <p className="text-sm text-gray-500">there is no class today.</p>
          ) : (
            todayClasses.map((cls, i) => (
              <p key={i} className="text-sm">
                {cls.event_time} - {cls.course_name}
              </p>
            ))
          )}
        </div>

        {}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Upcoming Assignments</h2>
          {upcomingAssignments.length === 0 ? (
            <p className="text-sm text-gray-500">
              No upcoming assignments found.
            </p>
          ) : (
            upcomingAssignments.map((a, i) => (
              <p key={i} className="text-sm">
                {a.title} – {new Date(a.due_date).toLocaleDateString()}
              </p>
            ))
          )}
        </div>

        {}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Messages</h2>
          {latestNotification ? (
            <>
              <p className="text-sm">{latestNotification.content}</p>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(latestNotification.created_at).toLocaleString()}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500">Yeni mesajınız yok.</p>
          )}
        </div>
      </div>
    </div>
  );
}
