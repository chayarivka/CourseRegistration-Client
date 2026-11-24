
const MY_COURSES_API_URL =
    `${API_BASE_URL}/Registrations/my-courses`

async function loadMyCourses() {
    const container = document.getElementById("myCourses");
    const token = sessionStorage.getItem("authToken");

    if (!token) {
        container.textContent = "יש להתחבר כדי לצפות בקורסים שלך.";
        return;
    }

    try {
        const response = await fetch(MY_COURSES_API_URL, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            container.textContent =
                "פג תוקף ההתחברות. יש להתחבר מחדש.";
            return;
        }

        if (!response.ok) {
            throw new Error("לא ניתן לטעון את הקורסים.");
        }

        const courses = await response.json();

        container.replaceChildren();

        if (courses.length === 0) {
            const message = document.createElement("p");
            message.textContent = "עדיין לא נרשמת לקורסים.";
            container.appendChild(message);
            return;
        }

        courses.forEach(course => {
            const card = document.createElement("div");
            card.className = "my-course-card";

            const title = document.createElement("h2");
            title.textContent = course.courseName;

            const lecturer = document.createElement("p");
            lecturer.textContent =
                `מרצה: ${course.lecturerName}`;

            const date = document.createElement("p");
            date.textContent =
                `תאריך התחלה: ${course.startDate}`;

            const details = document.createElement("a");
            details.href =
                `course-details.html?id=${course.courseId}`;
            details.textContent = "לפרטי הקורס";
            details.className = "outline-button";


            const cancelButton = document.createElement("button");
            cancelButton.type = "button";
            cancelButton.className = "outline-button";
            cancelButton.textContent = "ביטול הרשמה";

            const courseStart = new Date(
                `${course.startDate.slice(0, 10)}T${course.startTime}`
            );

            if (Number.isNaN(courseStart.getTime()) ||
                courseStart <= new Date()) {
                cancelButton.disabled = true;
                cancelButton.title = "לא ניתן לבטל הרשמה לאחר תחילת הקורס";
            } else {
                cancelButton.addEventListener("click", () => {
                    cancelRegistration(course.courseId, cancelButton);
                });
            }

            card.append(title, lecturer, date, details, cancelButton);
            container.appendChild(card);

        });

    } catch (error) {
        console.error(error);
        container.textContent = error.message;
    }
}

async function cancelRegistration(courseId, button) {
    const confirmed = confirm(
        "האם את בטוחה שברצונך לבטל את ההרשמה לקורס?"
    );

    if (!confirmed) {
        return;
    }

    const token = sessionStorage.getItem("authToken");

    if (!token) {
        alert("יש להתחבר מחדש.");
        return;
    }

    button.disabled = true;

    try {
        const response = await fetch(
            `${API_BASE_URL}/Registrations/${courseId}`,
            {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (response.status === 401) {
            alert("פג תוקף ההתחברות. יש להתחבר מחדש.");
            return;
        }

        if (!response.ok) {
            throw new Error("לא ניתן לבטל את ההרשמה לקורס.");
        }

        alert("ההרשמה לקורס בוטלה בהצלחה!");
        await loadMyCourses();

    } catch (error) {
        console.error(error);
        alert(error.message);
    } finally {
        button.disabled = false;
    }
}


document.addEventListener("DOMContentLoaded", loadMyCourses);
