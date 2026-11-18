
function getCurrentUser() {
    try {
        const token = sessionStorage.getItem("authToken");
        const userData = sessionStorage.getItem("currentUser");

        if (!token || !userData) {
            return null;
        }

        return JSON.parse(userData);
    } catch {
        return null;
    }
}

function updateHeader() {
    const user = getCurrentUser();
    const headerActions = document.querySelector(".header-actions");

    if (!headerActions || !user) {
        return;
    }


    headerActions.innerHTML = `
    <span class="welcome-message"></span>

    <a href="my-courses.html" class="outline-button">
        הקורסים שלי
    </a>

    ${user.role === "Admin"
            ? '<a href="admin.html" class="outline-button">ניהול קורסים</a>'
            : ''}

    <button id="logoutButton"
            class="outline-button"
            type="button">
        התנתקות
    </button>
`;


    headerActions.querySelector(".welcome-message").textContent =
        `שלום, ${user.fullName}`;

    document.getElementById("logoutButton")
        .addEventListener("click", logout);
}

function logout() {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("currentUser");

    window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", updateHeader);
