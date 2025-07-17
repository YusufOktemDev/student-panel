import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function StudentMessages() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const [courses, setCourses] = useState([]);
  const [selectedTab, setSelectedTab] = useState("inbox");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [teacher, setTeacher] = useState(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [inbox, setInbox] = useState([]);
  const [sent, setSent] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data: enrolled } = await supabase
        .from("student_courses")
        .select("course_id")
        .eq("student_id", user.id);

      const courseIds = enrolled.map((e) => e.course_id);

      const { data: courseList } = await supabase
        .from("courses")
        .select("course_id, name, teacher_id")
        .in("course_id", courseIds);

      setCourses(courseList || []);
    };

    fetchCourses();
  }, [user.id]);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data: received } = await supabase
        .from("messages")
        .select("*, users:sender_id(fullname)")
        .eq("receiver_id", user.id)
        .order("sent_at", { ascending: false });

      const { data: sents } = await supabase
        .from("messages")
        .select("*, users:receiver_id(fullname)")
        .eq("sender_id", user.id)
        .order("sent_at", { ascending: false });

      setInbox(received || []);
      setSent(sents || []);
    };

    fetchMessages();
  }, [user.id]);

  useEffect(() => {
    if (!selectedCourse) {
      setTeacher(null);
      return;
    }

    const course = courses.find(
      (c) => c.course_id === parseInt(selectedCourse)
    );
    if (course?.teacher_id) {
      fetchTeacher(course.teacher_id);
    }
  }, [selectedCourse]);

  const fetchTeacher = async (teacherId) => {
    const { data } = await supabase
      .from("users")
      .select("id, fullname")
      .eq("id", teacherId)
      .single();

    setTeacher(data);
  };

  const handleSend = async () => {
    if (!teacher || !subject || !body) {
      alert("Please fill in all fields.");
      return;
    }

    const { error } = await supabase.from("messages").insert([
      {
        sender_id: user.id,
        receiver_id: teacher.id,
        subject,
        body,
      },
    ]);

    if (error) {
      alert("Message could not be sent.");
      console.error(error);
    } else {
      alert("Message sent ✅");
      setSubject("");
      setBody("");
      setShowForm(false);
    }
  };

  return (
    <div className="flex gap-4">
      {}
      <div className="w-1/3 space-y-4">
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          New Message
        </button>

        <div className="bg-white p-3 rounded shadow">
          <h2 className="font-semibold mb-2">My Messages</h2>
          <div
            onClick={() => {
              setSelectedTab("inbox");
              setSelectedMessage(null);
            }}
            className={`cursor-pointer px-2 py-1 rounded hover:bg-gray-100 ${
              selectedTab === "inbox" ? "bg-gray-200 font-semibold" : ""
            }`}
          >
            Incoming
          </div>
          <div
            onClick={() => {
              setSelectedTab("sent");
              setSelectedMessage(null);
            }}
            className={`cursor-pointer px-2 py-1 rounded hover:bg-gray-100 ${
              selectedTab === "sent" ? "bg-gray-200 font-semibold" : ""
            }`}
          >
            Outgoing
          </div>
        </div>
      </div>

      {}
      <div className="flex-1 bg-white p-4 rounded shadow">
        {showForm ? (
          <>
            <h2 className="text-lg font-bold mb-4">New Message</h2>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full border p-2 rounded mb-2"
            >
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c.course_id} value={c.course_id}>
                  {c.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={teacher?.fullname || ""}
              disabled
              className="w-full border p-2 rounded mb-2 bg-gray-100 text-gray-700"
              placeholder="Teacher will appear automatically"
            />

            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border p-2 rounded mb-2"
            />

            <textarea
              placeholder="Message body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full border p-2 rounded mb-2"
              rows={4}
            />

            <div className="flex gap-2">
              <button
                onClick={handleSend}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Send
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="text-sm text-gray-500 hover:underline"
              >
                Cancel
              </button>
            </div>
          </>
        ) : selectedMessage ? (
          <div>
            <h2 className="text-xl font-bold mb-2">
              {selectedMessage.subject}
            </h2>
            <p className="text-sm text-gray-500 mb-1">
              From: {selectedMessage.users.fullname}
            </p>
            <p className="whitespace-pre-line">{selectedMessage.body}</p>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-bold mb-4">
              {selectedTab === "inbox" ? "Incoming Messages" : "Sent Messages"}
            </h2>
            <ul className="space-y-2">
              {(selectedTab === "inbox" ? inbox : sent).map((msg) => (
                <li
                  key={msg.id}
                  onClick={() => setSelectedMessage(msg)}
                  className="p-3 border rounded cursor-pointer hover:bg-gray-100"
                >
                  <div className="font-semibold">
                    {selectedTab === "inbox"
                      ? msg.users.fullname
                      : msg.users.fullname}
                  </div>
                  <div className="text-sm text-gray-600">{msg.subject}</div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
