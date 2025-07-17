import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import dayjs from "dayjs";

export default function ProfessorAssignments({ kullanici }) {
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [submissions, setSubmissions] = useState({});
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data: courses, error } = await supabase
        .from("courses")
        .select("*")
        .eq("teacher_id", kullanici.id);

      if (error) {
        console.error("Course fetch error:", error.message);
        return;
      }

      setCourses(courses);

      for (const course of courses) {
        await fetchAssignments(course.course_id);
      }
    };

    const fetchAssignments = async (courseId) => {
      const { data: list } = await supabase
        .from("assignments")
        .select("*")
        .eq("course_id", courseId)
        .order("due_date", { ascending: true });

      setAssignments((prev) => ({ ...prev, [courseId]: list }));

      for (const a of list) {
        await fetchSubmissions(a.id);
      }
    };

    const fetchSubmissions = async (assignmentId) => {
      const { data: subs } = await supabase
        .from("assignment_submissions")
        .select("*, users(fullname)")
        .eq("assignment_id", assignmentId);

      setSubmissions((prev) => ({ ...prev, [assignmentId]: subs }));
    };

    fetchCourses();
  }, []);

  const handleInput = (courseId, field, value) => {
    setForm((prev) => ({
      ...prev,
      [courseId]: { ...prev[courseId], [field]: value },
    }));
  };

  const handleFileUpload = (e, courseId) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        [courseId]: {
          ...prev[courseId],
          file_url: reader.result,
          file_name: file.name,
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddOrUpdateAssignment = async (courseId) => {
    const f = form[courseId];
    if (!f?.title || !f?.due_date) {
      alert("Başlık ve tarih zorunludur");
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from("assignments")
        .update({
          title: f.title,
          description: f.description || "",
          due_date: f.due_date,
          file_url: f.file_url || null,
          file_name: f.file_name || null,
        })
        .eq("id", editingId);

      if (error) {
        console.error("Update error:", error.message);
        alert("Güncelleme hatası: " + error.message);
        return;
      }

      alert("Assignment güncellendi ✅");
      setEditingId(null);
    } else {
      const { error } = await supabase.from("assignments").insert([
        {
          course_id: courseId,
          title: f.title,
          description: f.description || "",
          due_date: f.due_date,
          file_url: f.file_url || null,
          file_name: f.file_name || null,
          teacher_id: kullanici.id,
        },
      ]);

      if (error) {
        console.error("Insert error:", error.message);
        alert("Ekleme hatası: " + error.message);
        return;
      }

      alert("Assignment eklendi ✅");
    }

    setForm((prev) => ({ ...prev, [courseId]: {} }));
    window.location.reload();
  };

  const handleEdit = (assignment) => {
    setEditingId(assignment.id);
    setForm((prev) => ({
      ...prev,
      [assignment.course_id]: {
        title: assignment.title,
        description: assignment.description,
        due_date: assignment.due_date,
        file_url: assignment.file_url,
        file_name: assignment.file_name,
      },
    }));
  };

  const handleDelete = async (assignmentId) => {
    if (!window.confirm("Bu ödev silinsin mi?")) return;
    await supabase.from("assignments").delete().eq("id", assignmentId);
    window.location.reload();
  };

  return (
    <div className="p-6 text-black dark:text-white">
      <h2 className="text-2xl font-bold mb-4">📚 Manage Assignments</h2>

      {courses.map((course) => (
        <div
          key={course.course_id}
          className="mb-8 p-4 rounded-xl bg-white dark:bg-gray-800 shadow"
        >
          <h3 className="text-xl font-semibold mb-2">{course.name}</h3>

          <div className="flex flex-col md:flex-row gap-2 mb-4">
            <input
              type="text"
              placeholder="Title"
              value={form[course.course_id]?.title || ""}
              onChange={(e) =>
                handleInput(course.course_id, "title", e.target.value)
              }
              className="border p-2 rounded w-full md:w-1/4"
            />
            <input
              type="text"
              placeholder="Description"
              value={form[course.course_id]?.description || ""}
              onChange={(e) =>
                handleInput(course.course_id, "description", e.target.value)
              }
              className="border p-2 rounded w-full md:w-1/3"
            />
            <input
              type="date"
              value={form[course.course_id]?.due_date || ""}
              onChange={(e) =>
                handleInput(course.course_id, "due_date", e.target.value)
              }
              className="border p-2 rounded"
            />
            <input
              type="file"
              onChange={(e) => handleFileUpload(e, course.course_id)}
              className="border p-2 rounded"
            />
            <button
              onClick={() => handleAddOrUpdateAssignment(course.course_id)}
              className={`text-white px-4 py-2 rounded ${
                editingId
                  ? "bg-yellow-600 hover:bg-yellow-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {editingId ? "Update" : "Add"}
            </button>
          </div>

          {assignments[course.course_id]?.map((a) => (
            <div
              key={a.id}
              className="mb-4 border rounded p-3 bg-gray-50 dark:bg-gray-700"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-lg">{a.title}</h4>
                  <p className="text-sm text-gray-500">{a.description}</p>
                  <p className="text-xs text-gray-400">
                    Due: {dayjs(a.due_date).format("YYYY-MM-DD")}
                  </p>
                  {a.file_url && (
                    <a
                      href={a.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-600 underline mt-1 block"
                    >
                      📎 {a.file_name || "Download Attachment"}
                    </a>
                  )}
                  <p className="text-xs italic mt-2 text-gray-500 dark:text-gray-400">
                    Uploaded by: {kullanici.adSoyad}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <button
                    onClick={() => handleEdit(a)}
                    className="text-sm text-yellow-500 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-2">
                <strong className="text-sm">Submissions:</strong>
                {submissions[a.id]?.length === 0 ? (
                  <p className="text-xs text-gray-400">No submissions yet</p>
                ) : (
                  <ul className="text-sm list-disc pl-4 mt-1">
                    {submissions[a.id]?.map((s) => (
                      <li key={s.id}>
                        {s.users?.fullname || "Unnamed"} –{" "}
                        <a
                          href={s.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline"
                        >
                          View File
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
