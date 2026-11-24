
const API_URL = `${API_BASE_URL}/Courses`;

document.addEventListener("DOMContentLoaded", loadCourses);

async function loadCourses() {
    const container = document.getElementById("coursesList");

    container.innerHTML = '<p class="empty-message">טוענים קורסים...</p>';

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to load courses");
        }

        const courses = await response.json();

        if (courses.length === 0) {
            container.innerHTML =
                '<p class="empty-message">אין קורסים להצגה כרגע.</p>';
            return;
        }

        container.innerHTML = "";

        courses.forEach(course => {
            const card = document.createElement("article");
            card.className = "course-card";

            const startDate = new Date(course.startDate)
                .toLocaleDateString("he-IL");

            const isFull = course.availableSeats === 0;

            card.innerHTML = `
                <div class="course-card-content">
                    <span class="course-category"></span>
                    <h3></h3>
                    <p class="course-description"></p>

                    <div class="course-details">
                        <p class="lecturer"></p>
                        <p class="date"></p>
                        <p class="seats"></p>
                    </div>

                    <div class="course-card-footer">
                        <strong class="price"></strong>
                       <a class="primary-button details-link">
                         פרטים נוספים
                       </a>
                    </div>
                </div>
            `;

            card.querySelector(".course-category").textContent =
                course.categoryName;

            card.querySelector("h3").textContent = course.name;
            card.querySelector(".course-description").textContent =
                course.description;

            card.querySelector(".lecturer").textContent =
                `מרצה: ${course.lecturerName}`;

            card.querySelector(".date").textContent =
                `תאריך פתיחה: ${startDate}`;

            card.querySelector(".seats").textContent =
                isFull ? "הקורס מלא" :
                    `מקומות פנויים: ${course.availableSeats}`;

            card.querySelector(".price").textContent =
                `₪${course.price.toLocaleString("he-IL")}`;
            card.querySelector(".details-link").href =
                `course-details.html?id=${course.id}`;


            container.appendChild(card);
        });

    } catch (error) {
        console.error(error);

        container.innerHTML =
            '<p class="empty-message">לא ניתן לטעון את הקורסים כרגע.</p>';
    }
}
