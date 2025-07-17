import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { FilePlus, Users } from "lucide-react";

export default function ProfessorDashboard({ setActive }) {
  const [courses, setCourses] = useState([]);
  const user = JSON.parse(localStorage.getItem("currentUser"));

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("teacher_id", user.id);

      if (error) {
        console.error("Course fetch error:", error.message);
      } else {
        setCourses(data);
      }
    };

    if (user?.id) fetchCourses();
  }, [user]);

  const handleAddContent = (courseId) => {
    localStorage.setItem("selectedCourseId", courseId);
    setActive("addcontent");
  };

  const handleViewStudents = (courseId) => {
    localStorage.setItem("selectedCourseId", courseId);
    setActive("coursestudentslist");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Welcome, {user.fullname} 👨‍🏫</h1>

      {courses.length === 0 ? (
        <p className="text-gray-500">No courses assigned to you.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <div
              key={course.course_id}
              className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-bold">{course.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                  {course.description}
                </p>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => handleAddContent(course.course_id)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                  <FilePlus size={18} /> Add Content
                </button>
                <button
                  onClick={() => handleViewStudents(course.course_id)}
                  className="flex items-center gap-1 text-sm text-green-600 hover:underline"
                >
                  <Users size={18} /> Students
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
