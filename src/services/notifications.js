// src/services/notifications.js
const NOTIFICATIONS_URL = "/api/notifications";
const SETTINGS_URL = "/api/settings";

const json = async (res) => {
  const data = await res.json().catch(() => ({}));
  return { ...data, status: res.status };
};

export async function getNotifications() {
  return json(await fetch(`${NOTIFICATIONS_URL}/`, { credentials: "include" }));
}

export async function markNotificationRead(id) {
  return json(await fetch(`${NOTIFICATIONS_URL}/${id}/read`, { method: "POST", credentials: "include" }));
}

export async function markAllNotificationsRead() {
  return json(await fetch(`${NOTIFICATIONS_URL}/read_all`, { method: "POST", credentials: "include" }));
}

export async function deleteNotification(id) {
  return json(await fetch(`${NOTIFICATIONS_URL}/${id}`, { method: "DELETE", credentials: "include" }));
}

export async function getSettings() {
  return json(await fetch(`${SETTINGS_URL}/`, { credentials: "include" }));
}

export async function saveNotificationSettings(notifications) {
  return json(
    await fetch(`${SETTINGS_URL}/`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notifications }),
    })
  );
}
