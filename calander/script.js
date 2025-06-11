const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");
const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");

let currentDate = new Date();

let eventDates = []; // Store fetched event dates

// Fetch event dates from the backend
async function fetchEventDates() {
  try {
    const response = await fetch("https://college-event-ledger-backend.onrender.com/api/events");

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const events = await response.json();
    console.log("✅ Fetched events:", events);

    // Extract dates from events and store them in eventDates
    eventDates = events.map(event => event.date);

    // Now that we have the event dates, regenerate the calendar
    generateCalendar(currentDate);

  } catch (error) {
    console.error("❌ Error fetching event dates:", error);
  }
}

function generateCalendar(date) {
    calendar.innerHTML = "";

    const year = date.getFullYear();
    const month = date.getMonth();
    const today = new Date();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    monthYear.textContent = date.toLocaleString("default", { month: "long" }) + " " + year;

    // Empty blocks for days before the first of the month
    for (let i = 0; i < firstDay; i++) {
        const emptyBlock = document.createElement("div");
        emptyBlock.classList.add("empty");
        calendar.appendChild(emptyBlock);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const dayBlock = document.createElement("div");
        dayBlock.textContent = i;
        const blockDate = new Date(year, month, i);
        const formattedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;

        // Restriction: Only allow today and last 3 days to be clicked
        const diffInDays = Math.floor((today - blockDate) / (1000 * 60 * 60 * 24));

        

        // Highlight event dates
        if (eventDates.includes(formattedDate)) {
            dayBlock.classList.add("event-day");
        }
        const  eventDivs=document.querySelectorAll(".event-day")
        
        if (diffInDays < 3 || dayBlock.classList.contains("event-day")) {   
            dayBlock.classList.add("clickable"); // Add a class to disable clicking
            dayBlock.classList.remove("locked"); // Add a class for clickable dates
        }
         else {
            dayBlock.classList.add("locked"); // Add a class for clickable dates
        }


        dayBlock.dataset.date = formattedDate;
        calendar.appendChild(dayBlock);
    }
}

// Prevent clicking on locked dates
calendar.addEventListener("click", function (e) {
    if (e.target.classList.contains("clickable")) {
        const selectedDate = e.target.dataset.date;

        if (eventDates.includes(selectedDate)) {
            // Event exists -> Open `display.html`
            window.location.href = `College-Event-ledger/event-details/public/display.html?date=${selectedDate}`;
        } else {
            // No event -> Open `index.html` to create a new event
            window.location.href = `College-Event-ledger/event-details/public/index.html?date=${selectedDate}`;
        }
    }
});

// Navigation buttons
prevMonth.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    generateCalendar(currentDate);
});

nextMonth.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    generateCalendar(currentDate);
});

// Call fetchEventDates first, then generate the calendar
fetchEventDates();