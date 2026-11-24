
const API_URL = `${API_BASE_URL}/Courses`;

let currentPage = 1;
const pageSize = 2;

document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("searchButton")
        .addEventListener("click", () => {
            currentPage = 1;
            loadCourses();
        });

    document.getElementById("prevPage")
        .addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                loadCourses();
            }
        });

    document.getElementById("nextPage")
        .addEventListener("click", () => {
            currentPage++;
            loadCourses();
        });
    document.getElementById("resetFilters")
        .addEventListener("click", () => {

            document.getElementById("searchInput").value = "";
            document.getElementById("categoryFilter").value = "";
            document.getElementById("sortFilter").value = "StartDate";
            document.getElementById("sortDirection").value = "false";

            currentPage = 1;
            loadCourses();
        });
    loadCategories();
    loadCourses();
});

async function loadCourses() {
    const container = document.getElementById("coursesList");

    if (!container.querySelector(".course-card")) {
        container.innerHTML =
            '<p class="empty-message">טוענים קורסים...</p>';
    }

    try {
        const params = new URLSearchParams({
            Page: currentPage,
            PageSize: pageSize,
            Search: document.getElementById("searchInput").value.trim(),
            SortBy: document.getElementById("sortFilter").value,
            Descending: document.getElementById("sortDirection").value
        });

        const categoryId =
            document.getElementById("categoryFilter").value;

        if (categoryId) {
            params.set("CategoryId", categoryId);
        }

        const response = await fetch(`${API_URL}?${params.toString()}`);

        if (!response.ok) {
            throw new Error("Failed to load courses");
        }

        const courses = await response.json();
        document.getElementById("pageNumber").textContent =
            `עמוד ${currentPage}`;

        document.getElementById("prevPage").disabled =
            currentPage === 1;

        document.getElementById("nextPage").disabled =
            courses.length < pageSize;
        if (courses.length === 0 && currentPage > 1) {
            currentPage--;
            await loadCourses();
            return;
        }

        if (courses.length === 0) {
            container.innerHTML =
                '<p class="empty-message">אין קורסים להצגה כרגע.</p>';
            return;
        }

        container.innerHTML = "";

        courses.forEach((course, index) => {
            const card = document.createElement("article");
            card.className = "course-card";
            card.style.animationDelay = `${index * 100}ms`;

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
async function loadCategories() {
    const select = document.getElementById("categoryFilter");

    try {
        const response = await fetch(
            `${API_BASE_URL}/Categories`
        );

        if (!response.ok) {
            throw new Error("Failed to load categories");
        }

        const categories = await response.json();

        categories.forEach(category => {
            const option = document.createElement("option");

            option.value = category.id;
            option.textContent = category.name;

            select.appendChild(option);
        });

    } catch (error) {
        console.error(error);
    }
}
