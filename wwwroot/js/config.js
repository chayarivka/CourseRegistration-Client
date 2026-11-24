const API_BASE_URL =
    ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname)
        ? "https://localhost:7069/api"
        : "https://courseregistration-api.onrender.com/api";