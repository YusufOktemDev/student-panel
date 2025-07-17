import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function CourseStudents() {
  const [students, setStudents] = useState([]);
  const [courseName, setCourseName] = useState("");
  const [search, setSearch] = useState("");
  const courseId = localStorage.getItem("selectedCourseId");

  useEffect(() => {
    const fetchStudents = async () => {
      const { data: courseData } = await supabase
        .from("courses")
        .select("name")
        .eq("course_id", courseId)
        .single();

      if (courseData) setCourseName(courseData.name);

      const { data, error } = await supabase
        .from("student_courses")
        .select("midterm, final, users(fullname)")
        .eq("course_id", courseId);

      if (error) {
        console.error("Error fetching students:", error.message);
      } else {
        setStudents(data);
      }
    };

    if (courseId) fetchStudents();
  }, [courseId]);

  const calculateAverage = (vize, final) => {
    if (vize == null || final == null) return "-";
    return Math.round(vize * 0.4 + final * 0.6);
  };

  const filtered = students.filter((s) =>
    s.users.fullname.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">
          Students for: {courseName || `Course #${courseId}`}
        </h1>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Go Back
        </button>
      </div>

      <input
        type="text"
        placeholder="Search student name..."
        className="w-full border p-2 rounded mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.length === 0 ? (
        <p className="text-gray-500">No matching students found.</p>
      ) : (
        <table className="w-full border text-left text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">Student</th>
              <th className="p-2">Midterm</th>
              <th className="p-2">Final</th>
              <th className="p-2">Average</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((stu, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="p-2">{stu.users.fullname}</td>
                <td className="p-2">{stu.midterm ?? "-"}</td>
                <td className="p-2">{stu.final ?? "-"}</td>
                <td className="p-2 font-semibold text-green-600">
                  {calculateAverage(stu.midterm, stu.final)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
