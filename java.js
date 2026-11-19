/* ==========================================
   DAILY LIFE PLANNER & WELLNESS APP
   Main JavaScript File: java.js
========================================== */

const app = document.getElementById("app");

let activities = JSON.parse(
    localStorage.getItem("dailyActivities")
) || [];

let waterCount = Number(
    localStorage.getItem("waterCount")
) || 0;

let alarmEnabled = true;
let firedAlarms = new Set();

// ------------------------------------------
// APPLICATION INTERFACE
// ------------------------------------------

app.innerHTML = `
<div class="dashboard">

    <header class="topbar">
        <div>
            <h1>LifeSync ✨</h1>
            <p>Your day. Your goals. Your health.</p>
        </div>

        <div class="date-display" id="today"></div>
    </header>

    <section class="welcome">
        <h2>Make Today Count! 👋</h2>
        <p>Plan your activities and build healthier habits.</p>
    </section>

    <section class="stats">

        <div class="stat-card">
            <h3>Total Activities</h3>
            <h2 id="totalActivities">0</h2>
        </div>

        <div class="stat-card">
            <h3>Completed</h3>
            <h2 id="completedActivities">0</h2>
        </div>

        <div class="stat-card">
            <h3>Water Intake</h3>
            <h2 id="waterDisplay">0 / 8</h2>
        </div>

    </section>

    <section class="main-grid">

        <div class="panel">

            <h2>➕ Add New Activity</h2>

            <form id="activityForm">

                <input
                    type="text"
                    id="activityName"
                    placeholder="Activity name"
                    required
                >

                <select id="activityType">
                    <option value="General">General</option>
                    <option value="Exercise">Exercise</option>
                    <option value="Food">Food / Meal</option>
                    <option value="Water">Water Intake</option>
                    <option value="Study">Study</option>
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                </select>

                <input
                    type="date"
                    id="activityDate"
                    required
                >

                <input
                    type="time"
                    id="activityTime"
                    required
                >

                <textarea
                    id="activityNotes"
                    placeholder="Additional notes..."
                ></textarea>

                <label class="toggle-label">
                    <input type="checkbox" id="reminderToggle" checked>
                    Enable reminder and alarm
                </label>

                <button type="submit">
                    Save Activity ✨
                </button>

            </form>

        </div>

        <div class="panel">

            <h2>💧 Water Tracker</h2>

            <p>Daily target: 8 glasses</p>

            <div class="water-progress">
                <div id="waterProgress"></div>
            </div>

            <h2 id="waterCountText">0 glasses</h2>

            <button id="addWater">+ Add Glass</button>

            <button id="resetWater" class="secondary">
                Reset Water
            </button>

            <hr>

            <h3>🔔 Reminder Settings</h3>

            <button id="enableNotifications">
                Enable Notifications
            </button>

            <p id="notificationStatus">
                Notifications not enabled
            </p>

        </div>

    </section>

    <section class="panel schedule-panel">

        <h2>📅 Your Daily Schedule</h2>

        <div class="filter-buttons">
            <button data-filter="All">All</button>
            <button data-filter="Today">Today</button>
            <button data-filter="Exercise">Exercise</button>
            <button data-filter="Food">Food</button>
            <button data-filter="Water">Water</button>
            <button data-filter="Completed">Completed</button>
        </div>

        <div id="activityList"></div>

    </section>

</div>
`;

// ------------------------------------------
// INITIAL SETTINGS
// ------------------------------------------

const today = new Date().toISOString().split("T")[0];

document.getElementById("today").textContent =
    new Date().toDateString();

document.getElementById("activityDate").value = today;

document.getElementById("activityDate").min = today;

// ------------------------------------------
// SAVE DATA
// ------------------------------------------

function saveData() {

    localStorage.setItem(
        "dailyActivities",
        JSON.stringify(activities)
    );

    localStorage.setItem(
        "waterCount",
        waterCount
    );

}

// ------------------------------------------
// ADD NEW ACTIVITY
// ------------------------------------------

document.getElementById("activityForm")
.addEventListener("submit", function(event) {

    event.preventDefault();

    const activity = {

        id: Date.now(),

        name: document.getElementById("activityName").value,

        type: document.getElementById("activityType").value,

        date: document.getElementById("activityDate").value,

        time: document.getElementById("activityTime").value,

        notes: document.getElementById("activityNotes").value,

        reminder: document.getElementById("reminderToggle").checked,

        completed: false

    };

    activities.push(activity);

    saveData();

    renderActivities();

    this.reset();

    document.getElementById("activityDate").value =
        new Date().toISOString().split("T")[0];

    document.getElementById("reminderToggle").checked = true;

    alert("Activity successfully saved! 🎉");

});

// ------------------------------------------
// DISPLAY ACTIVITIES
// ------------------------------------------

function renderActivities(filter = "All") {

    const list = document.getElementById("activityList");

    list.innerHTML = "";

    const todayDate = new Date().toISOString().split("T")[0];

    let filtered = activities;

    if (filter === "Today") {
        filtered = activities.filter(a => a.date === todayDate);
    }

    else if (filter === "Completed") {
        filtered = activities.filter(a => a.completed);
    }

    else if (filter !== "All") {
        filtered = activities.filter(a => a.type === filter);
    }

    filtered.sort((a, b) =>
        (a.date + a.time).localeCompare(b.date + b.time)
    );

    if (filtered.length === 0) {

        list.innerHTML = `
            <div class="empty-state">
                <h3>No activities found 🌱</h3>
                <p>Add an activity to organize your day.</p>
            </div>
        `;

    }

    filtered.forEach(activity => {

        const card = document.createElement("div");

        card.className = "activity-card";

        if (activity.completed) {
            card.classList.add("completed");
        }

        const details = document.createElement("div");

        const title = document.createElement("h3");
        title.textContent = activity.name;

        const info = document.createElement("p");
        info.textContent =
            `${activity.type} | ${activity.date} | ${activity.time}`;

        const notes = document.createElement("p");
        notes.textContent = activity.notes || "";

        details.append(title, info, notes);

        const actions = document.createElement("div");
        actions.className = "activity-actions";

        const completeButton = document.createElement("button");

        completeButton.textContent = activity.completed
            ? "Undo"
            : "Complete";

        completeButton.addEventListener("click", () => {

            activity.completed = !activity.completed;

            saveData();
            renderActivities(filter);

        });

        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";

        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", () => {

            if (confirm("Delete this activity?")) {

                activities = activities.filter(
                    a => a.id !== activity.id
                );

                saveData();
                renderActivities(filter);

            }

        });

        actions.append(completeButton, deleteButton);

        card.append(details, actions);

        list.appendChild(card);

    });

    updateStats();

}

// ------------------------------------------
// DASHBOARD STATISTICS
// ------------------------------------------

function updateStats() {

    document.getElementById("totalActivities")
    .textContent = activities.length;

    document.getElementById("completedActivities")
    .textContent = activities.filter(a => a.completed).length;

    updateWater();

}

// ------------------------------------------
// WATER INTAKE TRACKER
// ------------------------------------------

function updateWater() {

    document.getElementById("waterDisplay")
    .textContent = `${waterCount} / 8`;

    document.getElementById("waterCountText")
    .textContent = `${waterCount} glasses consumed`;

    const percentage = Math.min(
        (waterCount / 8) * 100,
        100
    );

    document.getElementById("waterProgress")
    .style.width = percentage + "%";

}

document.getElementById("addWater")
.addEventListener("click", () => {

    waterCount++;

    saveData();

    updateWater();

});

document.getElementById("resetWater")
.addEventListener("click", () => {

    waterCount = 0;

    saveData();

    updateWater();

});

// ------------------------------------------
// FILTER ACTIVITIES
// ------------------------------------------

document.querySelectorAll("[data-filter]")
.forEach(button => {

    button.addEventListener("click", () => {

        renderActivities(button.dataset.filter);

    });

});

// ------------------------------------------
// NOTIFICATION PERMISSION
// ------------------------------------------

document.getElementById("enableNotifications")
.addEventListener("click", async () => {

    if (!("Notification" in window)) {

        alert("Your browser does not support notifications.");

        return;

    }

    const permission = await Notification.requestPermission();

    const status = document.getElementById("notificationStatus");

    if (permission === "granted") {

        status.textContent = "Notifications enabled successfully! ✅";

        alertSound();

    }

    else {

        status.textContent = "Notification permission denied.";

    }

});

// ------------------------------------------
// ALARM SOUND
// ------------------------------------------

let audioContext;

function alertSound() {

    try {

        const AudioContext =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContext) return;

        audioContext = audioContext || new AudioContext();

        if (audioContext.state === "suspended") {
            audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();

        const gain = audioContext.createGain();

        oscillator.connect(gain);

        gain.connect(audioContext.destination);

        oscillator.type = "sine";

        oscillator.frequency.setValueAtTime(
            880,
            audioContext.currentTime
        );

        gain.gain.setValueAtTime(
            0.3,
            audioContext.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + 1
        );

        oscillator.start();

        oscillator.stop(audioContext.currentTime + 1);

    }

    catch (error) {

        console.error("Alarm error:", error);

    }

}

// ------------------------------------------
// REMINDER CHECKER
// ------------------------------------------

function checkReminders() {

    if (!alarmEnabled) return;

    const now = new Date();

    const currentDate = now.toISOString().split("T")[0];

    const currentTime =
        now.getHours().toString().padStart(2, "0") +
        ":" +
        now.getMinutes().toString().padStart(2, "0");

    activities.forEach(activity => {

        const alarmKey = activity.id;

        if (

            activity.reminder &&
            !activity.completed &&
            activity.date === currentDate &&
            activity.time === currentTime &&
            !firedAlarms.has(alarmKey)

        ) {

            firedAlarms.add(alarmKey);

            alertSound();

            if (
                "Notification" in window &&
                Notification.permission === "granted"
            ) {

                new Notification("⏰ LifeSync Reminder", {

                    body: `${activity.name} - Time to complete your activity!`

                });

            }

            else {

                alert(`⏰ Reminder: ${activity.name}`);

            }

        }

    });

}

// Check every 10 seconds
setInterval(checkReminders, 10000);

// ------------------------------------------
// INITIALIZE APP
// ------------------------------------------

renderActivities();

updateWater();

console.log("LifeSync App Successfully Initialized!");