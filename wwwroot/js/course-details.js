
const API_BASE_URL = "https://localhost:7069/api/Courses";

document.addEventListener("DOMContentLoaded", loadCourseDetails);

async function loadCourseDetails() {
    const container = document.getElementById("courseDetails");

    const parameters = new URLSearchParams(window.location.search);
    const courseId = parameters.get("id");

    if (!courseId || !/^[1-9]\d*$/.test(courseId)) {
        container.textContent = "לא נבחר קורס תקין.";
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/${courseId}`);

        if (!response.ok) {
            throw new Error("Course could not be loaded");
        }

        const course = await response.json();

        const startDate = new Date(course.startDate)
            .toLocaleDateString("he-IL");

        const isFull = course.availableSeats === 0;

        container.innerHTML = `
            <article class="details-card">
                <span class="course-category"></span>

                <h1 class="details-title"></h1>
                <p class="details-description"></p>

                <div class="details-information">
                    <p><strong>מרצה:</strong> <span class="detail-lecturer"></span></p>
                    <p><strong>תאריך פתיחה:</strong> <span class="detail-date"></span></p>
                    <p><strong>שעת התחלה:</strong> <span class="detail-time"></span></p>
                    <p><strong>מספר מפגשים:</strong> <span class="detail-meetings"></span></p>
                    <p><strong>מקומות פנויים:</strong> <span class="detail-seats"></span></p>
                </div>

               <div class="details-footer">
    <strong class="details-price"></strong>
    <button id="registerCourseButton"
            class="primary-button"
            type="button">
        הרשמה לקורס
    </button>
</div>
            </article>
        `;

        container.querySelector(".course-category").textContent =
            course.categoryName;

        container.querySelector(".details-title").textContent =
            course.name;

        container.querySelector(".details-description").textContent =
            course.description;

        container.querySelector(".detail-lecturer").textContent =
            course.lecturerName;

        container.querySelector(".detail-date").textContent =
            startDate;

        container.querySelector(".detail-time").textContent =
            course.startTime.slice(0, 5);

        container.querySelector(".detail-meetings").textContent =
            course.numberOfMeetings;

        container.querySelector(".detail-seats").textContent =
            isFull ? "הקורס מלא" : course.availableSeats;

        container.querySelector(".details-price").textContent =
            `₪${course.price.toLocaleString("he-IL")}`;
        const registerButton =
            document.getElementById("registerCourseButton");

        const courseStart = new Date(
            `${course.startDate.slice(0, 10)}T${course.startTime}`
        );
       

        if (isFull || courseStart <= new Date()) {
            registerButton.disabled = true;
            registerButton.textContent = isFull
                ? "הקורס מלא"
                : "ההרשמה הסתיימה";
        } else {
            registerButton.addEventListener("click", () => {
                registerToCourse(courseId, registerButton);
            });
        }

    } catch (error) {
        console.error(error);
        container.textContent = "לא ניתן לטעון את פרטי הקורס.";
    }
}

async function registerToCourse(courseId, button) {
    const token = sessionStorage.getItem("authToken");

    if (!token) {
        alert("יש להתחבר כדי להירשם לקורס.");
        window.location.href = "auth.html?mode=login";
        return;
    }

    button.disabled = true;

    try {
        const response = await fetch(
            `https://localhost:7069/api/Registrations/${courseId}`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (response.status === 401) {
            alert("פג תוקף ההתחברות. יש להתחבר מחדש.");
            return;
        }
        if (response.status === 409) {
            throw new Error("את כבר רשומה לקורס זה.");
        }

        if (!response.ok) {
            throw new Error("לא ניתן להשלים את ההרשמה לקורס.");
        }

        alert("נרשמת לקורס בהצלחה!");
        window.location.href = "my-courses.html";

    } catch (error) {
        console.error(error);
        alert(error.message);
    } finally {
        button.disabled = false;
    }
}

