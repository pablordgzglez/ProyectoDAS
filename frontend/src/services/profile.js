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

async function authorizedRequest(endpoint, options, token, defaultMessage) {
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

export function getProfile(token) {
  return authorizedRequest(
    "/api/users/profile/",
    { method: "GET" },
    token,
    "No se pudo cargar el perfil."
  );
}

export function updateProfile(profileData, token) {
  return authorizedRequest(
    "/api/users/profile/",
    {
      method: "PUT",
      body: JSON.stringify(profileData),
    },
    token,
    "No se pudo actualizar el perfil."
  );
}

export function updatePassword(passwordData, token) {
  return authorizedRequest(
    "/api/users/profile/password/",
    {
      method: "PUT",
      body: JSON.stringify(passwordData),
    },
    token,
    "No se pudo actualizar la contraseña."
  );
}

export function getUsage(token) {
  return authorizedRequest(
    "/api/usage/",
    { method: "GET" },
    token,
    "No se pudo cargar el uso disponible."
  );
}

export function logoutUser(refreshToken, token) {
  return authorizedRequest(
    "/api/users/logout/",
    {
      method: "POST",
      body: JSON.stringify({ refresh: refreshToken }),
    },
    token,
    "No se pudo cerrar la sesion."
  );
}
