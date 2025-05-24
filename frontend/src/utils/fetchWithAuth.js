




export const refreshAccessToken = async () => {

  const refresh = localStorage.getItem("refresh");
    const API_URL = import.meta.env.VITE_API_URL;

  try {
    const res = await fetch(`${API_URL}/api/token/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh }),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("access", data.access);
      return data.access;
    } else {
      
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      window.location.href = "/login";
      return null;
    }
  } catch (err) {
    console.error("Refresh token error", err);
    return null;
  }
};

export const fetchWithAuth = async (url, options = {}) => {
  let access = localStorage.getItem("access");

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access}`,
    },
  });

  if (res.status === 401) {
    // Access token might have expired
    access = await refreshAccessToken();
    if (!access) return; // Redirected

    // Retry with new token
    return await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${access}`,
      },
    });
  }

  return res;
};
