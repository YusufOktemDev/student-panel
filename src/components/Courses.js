import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Courses({ kullanici }) {
  const [dersler, setDersler] = useState([]);
  const [seciliDers, setSeciliDers] = useState(null);
  const [icerikler, setIcerikler] = useState([]);
  const [courseMap, setCourseMap] = useState({});

  useEffect(() => {
    const fetchAll = async () => {
      const studentId = kullanici.id;

      const { data: studentCourses, error: scError } = await supabase
        .from("student_courses")
        .select("*")
        .eq("student_id", studentId);

      if (scError) {
        console.error("❌ student_courses fetch error:", scError);
        return;
      }

      const { data: allCourses, error: cError } = await supabase
        .from("courses")
        .select("*");

      if (cError) {
        console.error("❌ courses fetch error:", cError);
        return;
      }

      const map = {};
      allCourses.forEach((c) => (map[c.course_id] = c));
      setCourseMap(map);

      const dersListesi = studentCourses.map((sc) => map[sc.course_id]);
      setDersler(dersListesi);
    };

    fetchAll();
  }, [kullanici]);

  const fetchContents = async (courseId) => {
    const { data: contents } = await supabase
      .from("course_contents")
      .select("*")
      .eq("course_id", courseId);

    setSeciliDers(courseId);
    setIcerikler(contents || []);
  };

  return (
    <div className="p-6">
      {!seciliDers ? (
        <>
          <h2 className="text-2xl font-bold mb-4">My Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dersler.length === 0 ? (
              <p>No enrolled courses found.</p>
            ) : (
              dersler.map((ders) => (
                <div
                  key={ders.course_id}
                  onClick={() => fetchContents(ders.course_id)}
                  className="cursor-pointer bg-white dark:bg-gray-800 text-black dark:text-white p-4 rounded-xl shadow hover:scale-[1.01] hover:shadow-lg transition"
                >
                  <h3 className="text-xl font-semibold">{ders.name}</h3>
                  <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
                    {ders.description}
                  </p>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          <button
            onClick={() => setSeciliDers(null)}
            className="text-blue-500 mb-4 hover:underline"
          >
            ← Back to Courses
          </button>
          <h2 className="text-2xl font-bold mb-4">Course Content</h2>
          {icerikler.length === 0 ? (
            <p className="text-gray-500">No content uploaded yet.</p>
          ) : (
            <ul className="space-y-4">
              {icerikler.map((item) => (
                <li
                  key={item.id}
                  className="bg-white dark:bg-gray-800 p-4 rounded shadow"
                >
                  <h4 className="font-semibold">{item.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {item.description}
                  </p>
                  {item.pdf_link && (
                    <a
                      href={item.pdf_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline text-sm mt-2 inline-block"
                    >
                      📎 View PDF
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
