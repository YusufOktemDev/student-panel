import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { addNotification } from "./notificationsUtils";

export default function ProfessorMessages({ kullanici }) {
  const [mode, setMode] = useState("inbox");
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState("");

  if (!kullanici) return <p className="p-6">Yükleniyor...</p>;

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select(
          "*, sender:users!messages_sender_id_fkey(id, fullname), receiver:users!messages_receiver_id_fkey(id, fullname)"
        )
        .or(`sender_id.eq.${kullanici.id},receiver_id.eq.${kullanici.id}`)
        .order("sent_at", { ascending: false });

      if (!error) setMessages(data);
      else console.error("Mesajlar çekilemedi:", error.message);
    };

    fetchMessages();
  }, [kullanici.id]);

  const filtered = messages.filter((msg) =>
    mode === "inbox"
      ? msg.receiver_id === kullanici.id
      : msg.sender_id === kullanici.id
  );

  const handleReply = async () => {
    if (!reply.trim()) return;

    const { error } = await supabase.from("messages").insert([
      {
        sender_id: kullanici.id,
        receiver_id: selected.sender_id,
        subject: "Re: " + selected.subject,
        body: reply,
        sent_at: new Date().toISOString(),
        is_read: false,
      },
    ]);

    if (!error) {
      await addNotification(
        selected.sender_id,
        "student",
        "message",
        `${kullanici.fullname} size yanıt verdi.`
      );

      alert("Yanıt gönderildi ✅");
      setReply("");
    }
  };

  return (
    <div className="p-6 flex flex-col md:flex-row gap-6">
      {/* Sol Panel */}
      <div className="md:w-1/3">
        <div className="flex justify-between mb-4">
          <button
            className={`px-4 py-2 rounded-l ${
              mode === "inbox" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setMode("inbox")}
          >
            Gelen
          </button>
          <button
            className={`px-4 py-2 rounded-r ${
              mode === "sent" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setMode("sent")}
          >
            Giden
          </button>
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-gray-500">Hiç mesaj yok.</p>
        ) : (
          filtered.map((msg) => (
            <div
              key={msg.id}
              onClick={() => setSelected(msg)}
              className={`cursor-pointer p-3 mb-2 rounded-lg shadow-sm ${
                selected?.id === msg.id
                  ? "bg-blue-100 dark:bg-gray-700"
                  : "bg-white dark:bg-gray-800"
              }`}
            >
              <p className="font-semibold text-sm">
                {mode === "inbox" ? msg.sender.fullname : msg.receiver.fullname}
              </p>
              <p className="text-xs text-gray-500 line-clamp-1">
                {msg.subject}
              </p>
            </div>
          ))
        )}
      </div>

      {}
      <div className="md:w-2/3 bg-white dark:bg-gray-800 p-6 rounded-xl shadow min-h-[250px]">
        {selected ? (
          <>
            <h3 className="text-xl font-bold mb-2">{selected.subject}</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              {selected.body}
            </p>
            <p className="text-xs text-gray-400 mb-4">
              {new Date(selected.sent_at).toLocaleString()}
            </p>

            {mode === "inbox" && (
              <>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Yanıtınızı yazın..."
                />
                <button
                  onClick={handleReply}
                  className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Gönder
                </button>
              </>
            )}
          </>
        ) : (
          <p className="text-gray-500 dark:text-gray-300">
            Mesaj seçin veya gelen kutusuna göz atın 📩
          </p>
        )}
      </div>
    </div>
  );
}
