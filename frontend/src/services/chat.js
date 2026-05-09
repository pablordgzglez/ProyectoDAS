const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getErrorMessage(data, defaultMessage) {
  if (!data || typeof data !== "object") {
    return defaultMessage;
  }

  const firstValue = Object.values(data)[0];

  if (Array.isArray(firstValue) && firstValue.length > 0) {
    return firstValue[0];
  }

  if (typeof firstValue === "string") {
    return firstValue;
  }

  return defaultMessage;
}

async function parseResponse(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function request(endpoint, options, token, defaultMessage) {
  let response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(data, defaultMessage));
  }

  return data;
}

export function getChats(token) {
  return request("/api/chats/", { method: "GET" }, token, "No se pudieron cargar los chats.");
}

export function createChat(token) {
  return request(
    "/api/chats/",
    {
      method: "POST",
      body: JSON.stringify({ title: "New chat" }),
    },
    token,
    "No se pudo crear el chat."
  );
}

export function getChatById(chatId, token) {
  return request(
    `/api/chats/${chatId}/`,
    { method: "GET" },
    token,
    "No se pudieron cargar los mensajes del chat."
  );
}

export function deleteChatById(chatId, token) {
  return request(
    `/api/chats/${chatId}/`,
    { method: "DELETE" },
    token,
    "No se pudo borrar el chat."
  );
}

export function sendChatMessage(chatId, content, token) {
  return request(
    `/api/chats/${chatId}/message/`,
    {
      method: "POST",
      body: JSON.stringify({ content }),
    },
    token,
    "No se pudo enviar el mensaje."
  );
}
