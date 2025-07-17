import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { User } from "lucide-react";

export default function Profile({ kullanici }) {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    username: kullanici.username,
    password: kullanici.password,
  });

  const handleSave = async () => {
    const { error } = await supabase
      .from("users")
      .update({
        username: form.username,
        password: form.password,
      })
      .eq("id", kullanici.id);

    if (error) {
      alert("Update failed ❌");
      console.error(error);
    } else {
      alert("Profile updated ✅");
      localStorage.setItem("username", form.username);
      setEditMode(false);
    }
  };

  if (!kullanici) return null;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 dark:text-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <User className="w-6 h-6" />
        User Profile
      </h2>

      {}
      <div className="mb-4 space-y-2">
        <label className="block font-medium">Username</label>
        <input
          type="text"
          value={form.username}
          disabled={!editMode}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="w-full border px-3 py-2 rounded text-black"
        />

        <label className="block font-medium">Password</label>
        <input
          type="password"
          value={form.password}
          disabled={!editMode}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full border px-3 py-2 rounded text-black"
        />
      </div>

      {}
      <p>
        <strong>Full Name:</strong> {kullanici.fullname || "—"}
      </p>
      <p>
        <strong>Email:</strong> {kullanici.email || "—"}
      </p>
      <p>
        <strong>Department:</strong> {kullanici.department || "—"}
      </p>

      {kullanici.role === "S" && (
        <>
          <p>
            <strong>Student No:</strong> {kullanici.student_no || "—"}
          </p>
          <hr className="my-4 border-gray-300 dark:border-gray-600" />
          <h3 className="text-lg font-semibold mb-2">Advisor Information</h3>
          <p>
            <strong>Advisor Name:</strong> {kullanici.advisor_name || "—"}
          </p>
          <p>
            <strong>Email:</strong> {kullanici.advisor_email || "—"}
          </p>
        </>
      )}

      {kullanici.role === "P" && (
        <p className="italic text-gray-400 dark:text-gray-500 mt-2"></p>
      )}

      <div className="mt-4">
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Edit
          </button>
        ) : (
          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Save
          </button>
        )}
      </div>
    </div>
  );
}
