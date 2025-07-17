import { supabase } from "../lib/supabaseClient";

export async function addNotification(user_id, role, type, content) {
  const { error } = await supabase.from("notifications").insert([
    {
      user_id,
      role,
      type,
      content,
    },
  ]);

  if (error) {
    console.error("Bildirim eklenemedi:", error.message);
  }
}

export async function markAllAsRead(user_id) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user_id);

  if (error) {
    console.error("Okundu güncelleme hatası:", error.message);
  }
}

export async function getUnreadCount(user_id) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user_id)
    .eq("is_read", false);

  return error ? 0 : data.length;
}
