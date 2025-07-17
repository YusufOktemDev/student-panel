import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function StudentAssignmentUpload({ kullanici }) {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [uploadingFiles, setUploadingFiles] = useState({});

  useEffect(() => {
    if (!kullanici) return;

    const fetchAssignments = async () => {
      const { data } = await supabase
        .from("assignments")
        .select("*")
        .order("due_date", { ascending: true });

      setAssignments(data);

      for (const a of data) {
        const { data: existing } = await supabase
          .from("assignment_submissions")
          .select("*")
          .eq("assignment_id", a.id)
          .eq("student_id", kullanici.id);

        if (existing?.length > 0) {
          setSubmissions((prev) => ({ ...prev, [a.id]: existing[0] }));
        }
      }
    };

    fetchAssignments();
  }, [kullanici]);

  const handleFileChange = (e, assignmentId) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setUploadingFiles((prev) => ({
        ...prev,
        [assignmentId]: {
          file_url: reader.result,
          file_name: file.name,
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async (assignmentId) => {
    const fileData = uploadingFiles[assignmentId];
    if (!fileData || !fileData.file_url) return;

    const { error } = await supabase.from("assignment_submissions").insert([
      {
        assignment_id: assignmentId,
        student_id: kullanici.id,
        file_url: fileData.file_url,
        submitted_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      alert("Yükleme başarısız ❌");
      console.error("Upload error:", error.message);
      return;
    }

    alert("Assignment uploaded successfully✅");

    setSubmissions((prev) => ({
      ...prev,
      [assignmentId]: {
        file_url: fileData.file_url,
        file_name: fileData.file_name,
      },
    }));

    setUploadingFiles((prev) => ({ ...prev, [assignmentId]: null }));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">📁 Assignments</h2>

      {assignments.map((a) => (
        <div
          key={a.id}
          className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow"
        >
          <h3 className="text-lg font-semibold mb-1">{a.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {a.description}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Due: {a.due_date?.split("T")[0]}
          </p>
          {a.file_url && (
            <a
              href={a.file_url}
              download={a.file_name || "assignment.pdf"}
              className="text-sm text-blue-600 underline"
            >
              📎File Sent by Teacher
            </a>
          )}

          {submissions[a.id] ? (
            <p className="mt-3 text-green-600 text-sm">
              ✅ Assignment has already been submitted.
            </p>
          ) : (
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <input
                type="file"
                onChange={(e) => handleFileChange(e, a.id)}
                className="border p-2 rounded"
              />
              <button
                onClick={() => handleUpload(a.id)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Upload
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
