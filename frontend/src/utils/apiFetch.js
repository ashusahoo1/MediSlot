export async function apiFetch(url, options = {}) {
  const defaultOptions = {
    credentials: "include", // send cookies by default
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Merge user options with defaults
  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {}),
    },
  };

  try {
    const res = await fetch(url, config);

    // Parse JSON (handle empty body gracefully)
    const data = res.status !== 204 ? await res.json() : null;

    if (!res.ok) {
      // You can customize error structure here
      const error = new Error(data?.message || "API request failed");
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    console.log("error: ",err.message)
    throw err;
  }
}
