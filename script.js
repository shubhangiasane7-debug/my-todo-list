
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");
const emptyMessage = document.getElementById("empty-message");
const filterButtons = document.querySelectorAll(".filter");

let tasks = [];
let currentFilter = "all";

// Load saved tasks safely
try {
    const savedTasks = JSON.parse(localStorage.getItem("todoTasks") || "[]");

    if (Array.isArray(savedTasks)) {
        tasks = savedTasks.filter(task =>
            task &&
            typeof task.id === "string" &&
            typeof task.text === "string" &&
            typeof task.completed === "boolean"
        );
    }
} catch (error) {
    console.error("Could not load saved tasks:", error);
}

// Save tasks in the browser
function saveTasks() {
    try {
        localStorage.setItem("todoTasks", JSON.stringify(tasks));
    } catch (error) {
        alert("Tasks could not be saved in this browser.");
        console.error(error);
    }
}

// Add a new task
taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const text = taskInput.value.trim();

    if (text === "") {
        alert("Please enter a task!");
        return;
    }

    const newTask = {
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        text: text,
        completed: false
    };

    tasks.push(newTask);
    saveTasks();

    taskInput.value = "";
    currentFilter = "all";
    updateFilterButtons();
    renderTasks();

    taskInput.focus();
});

// Display tasks
function renderTasks() {
    taskList.replaceChildren();

    const filteredTasks = tasks.filter(function (task) {
        if (currentFilter === "active") {
            return !task.completed;
        }

        if (currentFilter === "completed") {
            return task.completed;
        }

        return true;
    });

    filteredTasks.forEach(function (task) {
        const li = document.createElement("li");
        li.className = "task-item";
        li.dataset.id = task.id;

        if (task.completed) {
            li.classList.add("completed");
        }

        const taskText = document.createElement("span");
        taskText.className = "task-text";
        taskText.textContent = task.text;

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "edit-btn";
        editButton.dataset.action = "edit";
        editButton.textContent = "Edit";

        const doneButton = document.createElement("button");
        doneButton.type = "button";
        doneButton.className = "done-btn";
        doneButton.dataset.action = "done";
        doneButton.textContent = task.completed ? "Undo" : "Done";

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-btn";
        deleteButton.dataset.action = "delete";
        deleteButton.textContent = "Delete";

        actions.append(editButton, doneButton, deleteButton);
        li.append(taskText, actions);
        taskList.appendChild(li);
    });

    const remainingTasks = tasks.filter(task => !task.completed).length;
    taskCount.textContent =
        remainingTasks + (remainingTasks === 1
            ? " task remaining"
            : " tasks remaining");

    emptyMessage.hidden = filteredTasks.length !== 0;

    if (filteredTasks.length === 0) {
        if (currentFilter === "active" && tasks.length > 0) {
            emptyMessage.textContent = "No active tasks!";
        } else if (currentFilter === "completed" && tasks.length > 0) {
            emptyMessage.textContent = "No completed tasks yet!";
        } else {
            emptyMessage.textContent = "No tasks yet. Add your first task!";
        }
    }
}

// Handle Edit, Done/Undo and Delete clicks
taskList.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");

    if (!button || !taskList.contains(button)) {
        return;
    }

    const li = button.closest(".task-item");

    if (!li) {
        return;
    }

    const task = tasks.find(item => item.id === li.dataset.id);

    if (!task) {
        return;
    }

    const action = button.dataset.action;

    if (action === "edit") {
        const newText = prompt("Enter updated task:", task.text);

        if (newText === null) {
            return;
        }

        if (newText.trim() === "") {
            alert("Task cannot be empty!");
            return;
        }

        task.text = newText.trim();
    } else if (action === "done") {
        task.completed = !task.completed;
    } else if (action === "delete") {
        const confirmed = confirm(
            "Are you sure you want to delete this task?"
        );

        if (!confirmed) {
            return;
        }

        tasks = tasks.filter(item => item.id !== task.id);
    } else {
        return;
    }

    saveTasks();
    renderTasks();
});

// Filter tasks
filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        currentFilter = button.dataset.filter;
        updateFilterButtons();
        renderTasks();
    });
});

// Highlight selected filter
function updateFilterButtons() {
    filterButtons.forEach(function (button) {
        button.classList.toggle(
            "active",
            button.dataset.filter === currentFilter
        );
    });
}

// Initial display
updateFilterButtons();
renderTasks();