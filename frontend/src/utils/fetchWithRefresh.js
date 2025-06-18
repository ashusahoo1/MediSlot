import { apiFetch } from "./apiFetch";

async function fetchWithRefresh(url, options = {}) {
  try {
    // First try the original request
    const res = await apiFetch(url, options);
    return res;
  } catch (error) {
    // If unauthorized, try to refresh token
    if (error.status === 401) {
      const refreshRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/refresh-token`, {
        method: 'GET',
        credentials: 'include', // send cookies for refresh token
      });

      if (refreshRes.ok) {
        // Refresh successful, retry original request
        const retryRes = await apiFetch(url, options);
        return retryRes;
      } else {
        // Refresh failed, logout or redirect to login
        throw new Error('Session expired, please login again');
      }
    } else {
      // Some other error, just throw it
      throw error;
    }
  }
}

export {
    fetchWithRefresh
}