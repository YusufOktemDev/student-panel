import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { supabase } from "../lib/supabaseClient";

export default function ProgressPanel() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchGrades = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const { data: grades, error } = await supabase
        .from("student_courses")
        .select("midterm, final, course_id")
        .eq("student_id", parseInt(userId));

      if (error) {
        console.error("📉 Grade fetch error:", error);
        return;
      }

      const { data: courses } = await supabase
        .from("courses")
        .select("course_id, name");

      const merged = grades.map((g) => {
        const course = courses.find((c) => c.course_id === g.course_id);
        const avg = Math.round((g.midterm * 0.4 + g.final * 0.6) * 10) / 10;
        return {
          name: course?.name || "Unknown",
          avg,
        };
      });

      setData(merged);
    };

    fetchGrades();
  }, []);

  const getBarColor = (score) => {
    if (score >= 85) return "#22c55e";
    if (score >= 70) return "#eab308";
    return "#ef4444";
  };

  return (
    <div className="p-6 text-black dark:text-white">
      <h2 className="text-2xl font-bold mb-2">📊 Progress Panel</h2>
      <p className="mb-6 text-sm text-gray-500">
        You can analyze your performance across courses based on your average
        scores.
      </p>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
        {data.length === 0 ? (
          <p>No data found.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="avg">
                {data.map((entry, index) => (
                  <Cell key={index} fill={getBarColor(entry.avg)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
