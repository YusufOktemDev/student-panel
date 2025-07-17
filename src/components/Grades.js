import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Grades() {
  const [notlar, setNotlar] = useState([]);

  useEffect(() => {
    const fetchGrades = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const { data: studentCourses, error: scError } = await supabase
        .from("student_courses")
        .select("*")
        .eq("student_id", parseInt(userId));

      if (scError) {
        console.error("❌ student_courses fetch error:", scError);
        return;
      }

      const { data: allCourses, error: cError } = await supabase
        .from("courses")
        .select("course_id, name");

      if (cError) {
        console.error("❌ courses fetch error:", cError);
        return;
      }

      const courseMap = {};
      allCourses.forEach((c) => {
        courseMap[c.course_id] = c.name;
      });

      const finalData = studentCourses.map((item) => {
        const vize = item.midterm;
        const final = item.final;
        const ortalama = Math.round((vize * 0.4 + final * 0.6) * 10) / 10;

        return {
          ders: courseMap[item.course_id] || "Unknown Course",
          vize,
          final,
          ortalama,
        };
      });

      setNotlar(finalData);
    };

    fetchGrades();
  }, []);

  return (
    <div className="p-6 text-black dark:text-white">
      <h2 className="text-2xl font-bold mb-4">Grades</h2>
      <div className="space-y-4">
        {notlar.length === 0 ? (
          <p className="text-gray-500">No grades found.</p>
        ) : (
          notlar.map((n, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow flex justify-between items-center"
            >
              <div>
                <h3 className="text-xl font-semibold">{n.ders}</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Midterm: {n.vize} | Final: {n.final}
                </p>
              </div>
              <div className="text-lg font-bold text-green-600">
                Average: {n.ortalama}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
