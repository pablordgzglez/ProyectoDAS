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

export async function registerUser(formData) {
  let response;

  try {
    response = await fetch(`${API_URL}/api/users/register/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(data, "No se pudo completar el registro."));
  }

  return data;
}

export async function loginUser(formData) {
  let response;

  try {
    response = await fetch(`${API_URL}/api/auth/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(data, "No se pudo iniciar sesion."));
  }

  return data;
}
