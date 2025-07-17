import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AddContent() {
  const courseId = localStorage.getItem("selectedCourseId");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pdfLink, setPdfLink] = useState("");
  const [courseName, setCourseName] = useState("");

  
  useEffect(() => {
    const fetchCourse = async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("name")
        .eq("course_id", courseId)
        .single();

      if (data) setCourseName(data.name);
    };

    if (courseId) fetchCourse();
  }, [courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase.from("course_contents").insert([
      {
        course_id: courseId,
        title,
        description,
        pdf_link: pdfLink || null,
      },
    ]);

    if (error) {
      alert("Error saving content");
      console.error(error);
    } else {
      alert("Content added!");
      setTitle("");
      setDescription("");
      setPdfLink("");
    }
  };

  const goBack = () => {
    window.location.reload(); 
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          Add Content to {courseName ? courseName : `Course #${courseId}`}
        </h2>
        <button
          onClick={goBack}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Go Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Title</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium">Description</label>
          <textarea
            className="w-full p-2 border rounded"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium">PDF Link (optional)</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={pdfLink}
            onChange={(e) => setPdfLink(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Add Content
        </button>
      </form>
    </div>
  );
}
