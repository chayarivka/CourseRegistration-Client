
const ADMIN_API_BASE = "https://localhost:7069/api";
let editingCourse = null;

document.addEventListener("DOMContentLoaded", () => {
    const user = getCurrentUser();
    const token = sessionStorage.getItem("authToken");

    const adminContent = document.getElementById("adminContent");
    const adminMessage = document.getElementById("adminMessage");

    if (!user || !token) {
        adminMessage.textContent =
            "יש להתחבר כדי לגשת לממשק הניהול.";
        return;
    }

    if (user.role !== "Admin") {
        adminMessage.textContent =
            "אין לך הרשאה לצפות בעמוד הניהול.";
        return;
    }
    adminContent.hidden = false;
    adminMessage.textContent = "";

    document.getElementById("addCourseBtn")
        .addEventListener("click", () => {
            editingCourse = null;
            openCourseForm();

            document.querySelector("#courseForm h2").textContent =
                "הוספת קורס חדש";
        });

    document.getElementById("cancelCourseBtn")
        .addEventListener("click", closeCourseForm);
    document.getElementById("courseForm")
        .addEventListener("submit", createCourse);

    loadAdminCourses();
});

async function loadAdminCourses() {
    const container = document.getElementById("adminCourses");
    container.textContent = "טוענים קורסים...";

    try {
        const response = await fetch(`${ADMIN_API_BASE}/Courses`);

        if (!response.ok) {
            throw new Error("Failed to load courses");
        }

        const courses = await response.json();
        container.innerHTML = "";

        if (courses.length === 0) {
            container.textContent = "אין קורסים להצגה.";
            return;
        }

        const table = document.createElement("table");
        table.className = "admin-courses-table";

        table.innerHTML = `
            <thead>
                <tr>
                    <th>שם הקורס</th>
                    <th>מרצה</th>
                    <th>תאריך פתיחה</th>
                    <th>מחיר</th>
                    <th>פעולות</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector("tbody");

        courses.forEach(course => {
            const row = document.createElement("tr");

            const values = [
                course.name,
                course.lecturerName,
                new Date(course.startDate)
                    .toLocaleDateString("he-IL"),
                `₪${course.price.toLocaleString("he-IL")}`
            ];

            values.forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            const actionsCell = document.createElement("td");

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className = "outline-button";
            editButton.textContent = "עריכה";
            editButton.addEventListener("click", () => editCourse(course));

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "outline-button";
            deleteButton.textContent = "מחיקה";
            deleteButton.addEventListener("click", () => deleteCourse(course));

            actionsCell.append(editButton, deleteButton);
            row.appendChild(actionsCell);
            tbody.appendChild(row);
        });

        container.appendChild(table);

    } catch (error) {
        console.error(error);
        container.textContent = "לא ניתן לטעון את הקורסים.";
    }
}

async function openCourseForm() {
    const form = document.getElementById("courseForm");
    const message = document.getElementById("courseFormMessage");
    const categorySelect = document.getElementById("courseCategory");

    form.reset();
    form.hidden = false;
    message.textContent = "";
    categorySelect.innerHTML =
        '<option value="">טוענים קטגוריות...</option>';

    try {
        const response = await fetch(`${ADMIN_API_BASE}/Categories`);

        if (!response.ok) {
            throw new Error("Failed to load categories");
        }

        const categories = await response.json();

        categorySelect.innerHTML =
            '<option value="">בחרי קטגוריה</option>';

        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });

    } catch (error) {
        console.error(error);
        categorySelect.innerHTML =
            '<option value="">לא ניתן לטעון קטגוריות</option>';
        message.textContent = "שגיאה בטעינת הקטגוריות.";
    }
}

function closeCourseForm() {
    const form = document.getElementById("courseForm");

    form.reset();
    form.hidden = true;
    editingCourse = null;
}
async function createCourse(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const message = document.getElementById("courseFormMessage");
    const submitButton = form.querySelector('button[type="submit"]');
    const token = sessionStorage.getItem("authToken");

    if (!token) {
        message.textContent = "יש להתחבר מחדש.";
        return;
    }

    const data = new FormData(form);

    const course = {
        name: data.get("name").trim(),
        description: data.get("description").trim(),
        price: Number(data.get("price")),
        startDate: `${data.get("startDate")}T00:00:00`,
        startTime: `${data.get("startTime")}:00`,
        lecturerName: data.get("lecturerName").trim(),
        numberOfMeetings: Number(data.get("numberOfMeetings")),
        capacity: Number(data.get("capacity")),
        categoryId: Number(data.get("categoryId"))
    };
    if (editingCourse !== null) {
        course.rowVersion = editingCourse.rowVersion;
    }

    submitButton.disabled = true;
    message.textContent = "שומרים את הקורס...";

    try {
        const response = await fetch(
            editingCourse
                ? `${ADMIN_API_BASE}/Courses/${editingCourse.id}`
                : `${ADMIN_API_BASE}/Courses`,
            {
                method: editingCourse ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(course)
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("פג תוקף ההתחברות. יש להתחבר מחדש.");
            }

            if (response.status === 403) {
                throw new Error("אין הרשאה להוסיף קורס.");
            }

            if (response.status === 400) {
                throw new Error("נתוני הקורס אינם תקינים.");
            }
            if (response.status === 404) {
                throw new Error("הקורס לא נמצא במערכת.");
            }

            if (response.status === 409) {
                throw new Error(
                    "הקורס השתנה בינתיים על ידי משתמש אחר. רענני את העמוד ונסי שוב."
                );
            }

            throw new Error(
                editingCourse
                    ? "עדכון הקורס נכשל."
                    : "שמירת הקורס נכשלה."
            );
        }

        const wasEditing = editingCourse !== null;

        closeCourseForm();
        editingCourse = null;

        await loadAdminCourses();

        document.getElementById("adminMessage").textContent =
            wasEditing
                ? "הקורס עודכן בהצלחה!"
                : "הקורס נוסף בהצלחה!";

    } catch (error) {
        console.error(error);
        message.textContent = error.message;
    } finally {
        submitButton.disabled = false;
    }
}
async function editCourse(course) {
    editingCourse = course;
    await openCourseForm();

    const form = document.getElementById("courseForm");

    form.querySelector("h2").textContent = "עריכת קורס";

    form.elements["name"].value = course.name;
    form.elements["description"].value = course.description;
    form.elements["price"].value = course.price;
    form.elements["startDate"].value = course.startDate.substring(0, 10);
    form.elements["startTime"].value = course.startTime.substring(0, 5);
    form.elements["lecturerName"].value = course.lecturerName;
    form.elements["numberOfMeetings"].value = course.numberOfMeetings;
    form.elements["capacity"].value = course.capacity;
    form.elements["categoryId"].value = course.categoryId;

    form.scrollIntoView({ behavior: "smooth" });
}
async function deleteCourse(course) {
    const confirmed = confirm(
        `האם את בטוחה שברצונך למחוק את הקורס "${course.name}"?`
    );

    if (!confirmed) {
        return;
    }

    const token = sessionStorage.getItem("authToken");
    const message = document.getElementById("adminMessage");

    if (!token) {
        message.textContent = "יש להתחבר מחדש.";
        return;
    }

    message.textContent = "מוחקים את הקורס...";

    try {
        const response = await fetch(
            `${ADMIN_API_BASE}/Courses/${course.id}`,
            {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("פג תוקף ההתחברות.");
            }

            if (response.status === 403) {
                throw new Error("אין הרשאה למחוק קורס.");
            }

            if (response.status === 404) {
                throw new Error("הקורס לא נמצא במערכת.");
            }

            if (response.status === 400 || response.status === 409) {
                throw new Error(
                    "לא ניתן למחוק את הקורס. ייתכן שקיימות אליו הרשמות פעילות."
                );
            }

            throw new Error("מחיקת הקורס נכשלה.");
        }

        await loadAdminCourses();

        message.textContent = "הקורס נמחק בהצלחה!";

    } catch (error) {
        console.error(error);
        message.textContent = error.message;
    }
}