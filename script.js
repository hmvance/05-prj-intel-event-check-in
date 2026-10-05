const checkInForm = document.getElementById("checkInForm");
const attendeeNameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const greeting = document.getElementById("greeting");
const celebrationMessage = document.getElementById("celebrationMessage");
const attendeeCount = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const attendeeList = document.getElementById("attendeeList");

const teamNames = {
  water: "Team Water Wise",
  zero: "Team Net Zero",
  power: "Team Renewables",
};

const attendanceData = {
  total: 0,
  water: 0,
  zero: 0,
  power: 0,
  attendees: [],
};

// Restore saved attendance when the page opens.
function loadAttendanceData() {
  const savedData = localStorage.getItem("intelSummitAttendance");

  if (!savedData) {
    return;
  }

  try {
    const parsedData = JSON.parse(savedData);

    if (
      Number.isInteger(parsedData.total) &&
      parsedData.total >= 0 &&
      Number.isInteger(parsedData.water) &&
      parsedData.water >= 0 &&
      Number.isInteger(parsedData.zero) &&
      parsedData.zero >= 0 &&
      Number.isInteger(parsedData.power) &&
      parsedData.power >= 0 &&
      Array.isArray(parsedData.attendees)
    ) {
      attendanceData.total = parsedData.total;
      attendanceData.water = parsedData.water;
      attendanceData.zero = parsedData.zero;
      attendanceData.power = parsedData.power;
      attendanceData.attendees = parsedData.attendees.filter(
        function (attendee) {
          return (
            attendee &&
            typeof attendee.name === "string" &&
            (attendee.team === "water" ||
              attendee.team === "zero" ||
              attendee.team === "power")
          );
        },
      );
    }
  } catch (error) {
    // Start with empty attendance if saved data cannot be read.
  }
}

// Save all counts and attendee names together.
function saveAttendanceData() {
  localStorage.setItem("intelSummitAttendance", JSON.stringify(attendanceData));
}

function showCelebration() {
  const highestCount = Math.max(
    attendanceData.water,
    attendanceData.zero,
    attendanceData.power,
  );
  const winningTeams = [];

  if (attendanceData.water === highestCount) {
    winningTeams.push(teamNames.water);
  }
  if (attendanceData.zero === highestCount) {
    winningTeams.push(teamNames.zero);
  }
  if (attendanceData.power === highestCount) {
    winningTeams.push(teamNames.power);
  }

  if (winningTeams.length === 1) {
    celebrationMessage.textContent = `🎉 Attendance goal reached! ${winningTeams[0]} has the highest turnout!`;
  } else {
    celebrationMessage.textContent = `🎉 Attendance goal reached! ${winningTeams.join(", ")} are tied for the highest turnout!`;
  }
  celebrationMessage.hidden = false;
}

// Update the counts, progress bar, attendee list, and goal message.
function updateDisplay() {
  attendeeCount.textContent = attendanceData.total;
  document.getElementById("waterCount").textContent = attendanceData.water;
  document.getElementById("zeroCount").textContent = attendanceData.zero;
  document.getElementById("powerCount").textContent = attendanceData.power;

  const progressPercentage = Math.min((attendanceData.total / 50) * 100, 100);
  progressBar.style.width = `${progressPercentage}%`;

  attendeeList.innerHTML = "";
  attendanceData.attendees.forEach(function (attendee) {
    const listItem = document.createElement("li");
    listItem.textContent = `${attendee.name} - ${teamNames[attendee.team]}`;
    attendeeList.appendChild(listItem);
  });

  if (attendanceData.total >= 50) {
    showCelebration();
  } else {
    celebrationMessage.hidden = true;
    celebrationMessage.textContent = "";
  }
}

loadAttendanceData();
updateDisplay();

checkInForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = attendeeNameInput.value.trim();
  const selectedTeam = teamSelect.value;

  if (name === "") {
    greeting.textContent = "Please enter an attendee name.";
    greeting.classList.remove("success-message");
    greeting.style.display = "block";
    attendeeNameInput.focus();
    return;
  }

  if (!teamNames[selectedTeam]) {
    greeting.textContent = "Please select a team.";
    greeting.classList.remove("success-message");
    greeting.style.display = "block";
    teamSelect.focus();
    return;
  }

  attendanceData.total += 1;
  attendanceData[selectedTeam] += 1;
  attendanceData.attendees.push({ name: name, team: selectedTeam });

  greeting.textContent = `Welcome, ${name}!`;
  greeting.classList.add("success-message");
  greeting.style.display = "block";

  saveAttendanceData();
  updateDisplay();
  attendeeNameInput.value = "";
});
