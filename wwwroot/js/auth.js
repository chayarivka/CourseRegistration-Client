const AUTH_API_URL = `${API_BASE_URL}/Auth`;
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const registerFields = document.getElementById("registerFields");
const submitButton = document.getElementById("submitButton");
const passwordInput = document.getElementById("password");
const fullNameInput = document.getElementById("fullName");
const authMessage = document.getElementById("authMessage");
let isRegisterMode = false;

function setAuthMode(isRegister) {
    isRegisterMode = isRegister;
    registerFields.hidden = !isRegister;
    fullNameInput.required = isRegister;
    passwordInput.minLength = isRegister ? 8 : 0;

    loginTab.classList.toggle("active", !isRegister);
    registerTab.classList.toggle("active", isRegister);

    submitButton.textContent =
        isRegister ? "יצירת חשבון" : "התחברות";

    authMessage.textContent = "";
}

loginTab.addEventListener("click", () => setAuthMode(false));
registerTab.addEventListener("click", () => setAuthMode(true));

const parameters = new URLSearchParams(window.location.search);
const isRegister = parameters.get("mode") === "register";

setAuthMode(isRegister);

const authForm = document.getElementById("authForm");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phoneNumber");

authForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    authMessage.textContent = "";
    submitButton.disabled = true;

    const endpoint = isRegisterMode ? "register" : "login";

    const userData = {
        email: emailInput.value.trim(),
        password: passwordInput.value
    };

    if (isRegisterMode) {
        userData.fullName = fullNameInput.value.trim();
        userData.phoneNumber = phoneInput.value.trim() || null;
    }

    try {
        const response = await fetch(`${AUTH_API_URL}/${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("כתובת האימייל או הסיסמה שגויות.");
            }

            if (response.status === 400) {
                throw new Error("יש לבדוק את הפרטים שהוזנו.");
            }

            if (response.status === 409) {
                throw new Error("כתובת האימייל כבר רשומה במערכת.");
            }

            throw new Error("לא ניתן להשלים את הפעולה כרגע.");
        }

        const result = await response.json();

        // שמירה זמנית בזיכרון הדפדפן, ללא שמירת הסיסמה
        sessionStorage.setItem("authToken", result.token);

        sessionStorage.setItem("currentUser", JSON.stringify({
            userId: result.userId,
            fullName: result.fullName,
            email: result.email,
            role: result.role
        }));
        alert(
            isRegisterMode
                ? "החשבון נוצר בהצלחה!"
                : "התחברת בהצלחה!"
        );

        window.location.href = "index.html";

    } catch (error) {
        console.error(error);
        authMessage.textContent = error.message;
    } finally {
        submitButton.disabled = false;
    }
});

