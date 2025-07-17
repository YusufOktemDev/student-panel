import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import StudentDashboard from "./components/StudentDashboard";
import Courses from "./components/Courses";
import Grades from "./components/Grades";
import StudentMessages from "./components/StudentMessages";
import ProfessorMessages from "./components/ProfessorMessages";
import Notifications from "./components/Notifications";
import Profile from "./components/Profile";
import CalendarPage from "./components/CalendarPage";
import StudentAssignmentUpload from "./components/StudentAssignmentUpload";
import ProgressPanel from "./components/ProgressPanel";
import ProfessorDashboard from "./components/ProfessorDashboard";
import AddContent from "./components/AddContent";
import CourseStudents from "./components/CourseStudentsList";
import ProfessorAssignments from "./components/ProfessorAssignments";
import { supabase } from "./lib/supabaseClient";

function MainApp() {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState(
    localStorage.getItem("activePage") || "dashboard"
  );
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("activePage", active);
  }, [active]);

  useEffect(() => {
    const fetchUser = async () => {
      const username = localStorage.getItem("username");
      if (!username) return;

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .single();

      if (error) {
        console.error("Failed to fetch user", error);
      } else {
        setUser(data);
        setActive("dashboard");
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  return (
    <div
      className={`flex min-h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      <aside className="w-64 bg-white dark:bg-gray-800 p-6 shadow-md fixed h-screen">
        <h2 className="text-2xl font-bold mb-10">Portal</h2>
        <nav className="space-y-4 text-gray-800 dark:text-gray-200 font-medium flex flex-col">
          <button
            onClick={() => setActive("dashboard")}
            className="text-left hover:text-blue-600"
          >
            Dashboard
          </button>

          {user.role === "S" && (
            <>
              <button
                onClick={() => setActive("courses")}
                className="text-left hover:text-blue-600"
              >
                Courses
              </button>
              <button
                onClick={() => setActive("grades")}
                className="text-left hover:text-blue-600"
              >
                Grades
              </button>
              <button
                onClick={() => setActive("calendar")}
                className="text-left hover:text-blue-600"
              >
                Calendar
              </button>
              <button
                onClick={() => setActive("fileupload")}
                className="text-left hover:text-blue-600"
              >
                Assignments
              </button>
              <button
                onClick={() => setActive("progress")}
                className="text-left hover:text-blue-600"
              >
                Progress
              </button>
            </>
          )}

          {user.role === "P" && (
            <>
              <button
                onClick={() => setActive("professor-assignments")}
                className="text-left hover:text-blue-600"
              >
                Manage Assignments
              </button>
            </>
          )}

          <button
            onClick={() => setActive("messages")}
            className="text-left hover:text-blue-600"
          >
            Messages
          </button>
          <button
            onClick={() => setActive("profile")}
            className="text-left hover:text-blue-600"
          >
            Profile
          </button>
        </nav>
      </aside>

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="w-full flex justify-end items-center px-6 py-4 bg-white dark:bg-gray-800 shadow sticky top-0 z-20">
          <Notifications user={user} />

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="ml-4 text-sm px-3 py-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("username");
              setUser(null);
              navigate("/");
            }}
            className="ml-4 text-sm px-3 py-1 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition"
          >
            Log Out
          </button>
        </header>

        <main className="flex-1 p-6">
          {active === "dashboard" &&
            (user.role === "S" ? (
              <StudentDashboard kullanici={user} />
            ) : (
              <ProfessorDashboard setActive={setActive} />
            ))}

          {active === "courses" && <Courses kullanici={user} />}
          {active === "grades" && <Grades />}
          {active === "messages" &&
            (user.role === "S" ? (
              <StudentMessages />
            ) : (
              <ProfessorMessages kullanici={user} />
            ))}
          {active === "calendar" && <CalendarPage />}
          {active === "fileupload" && (
            <StudentAssignmentUpload kullanici={user} />
          )}
          {active === "profile" && <Profile kullanici={user} />}
          {active === "progress" && <ProgressPanel />}
          {active === "addcontent" && <AddContent />}
          {active === "coursestudentslist" && <CourseStudents />}
          {active === "professor-assignments" && (
            <ProfessorAssignments kullanici={user} />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<MainApp />} />
      </Routes>
    </BrowserRouter>
  );
}
