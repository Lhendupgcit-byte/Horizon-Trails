/* =========================================================
   LUXORA HOTEL & RESORT
   Main JavaScript
   ========================================================= */

/* ---------- THEME TOGGLE ---------- */

const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

// Apply saved theme when page loads
const savedTheme = localStorage.getItem("luxoraTheme");

if (savedTheme === "dark") {
  document.body.classList.add("dark-mode");

  if (themeIcon) {
    themeIcon.textContent = "☀";
  }
}

// Change theme when button is clicked
if (themeToggle) {
  themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");

    const isDarkMode = document.body.classList.contains("dark-mode");

    if (isDarkMode) {
      localStorage.setItem("luxoraTheme", "dark");

      if (themeIcon) {
        themeIcon.textContent = "☀";
      }
    } else {
      localStorage.setItem("luxoraTheme", "light");

      if (themeIcon) {
        themeIcon.textContent = "☾";
      }
    }
  });
}

/* ---------- LIVE CLOCK ---------- */

function updateClock() {
  const clock = document.getElementById("liveClock");
  const date = document.getElementById("liveDate");

  if (!clock && !date) {
    return;
  }

  const now = new Date();

  if (clock) {
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    hours = String(hours).padStart(2, "0");
    minutes = String(minutes).padStart(2, "0");
    seconds = String(seconds).padStart(2, "0");

    clock.textContent = `${hours}:${minutes}:${seconds}`;
  }

  if (date) {
    date.textContent = now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }
}

// Update immediately
updateClock();

// Update every second
setInterval(updateClock, 1000);

/* ---------- MOBILE NAVIGATION ---------- */

const mobileMenuButton = document.getElementById("mobileMenuButton");

const navLinks = document.getElementById("navLinks");

if (mobileMenuButton && navLinks) {
  mobileMenuButton.addEventListener("click", function () {
    navLinks.classList.toggle("mobile-open");

    const menuIsOpen = navLinks.classList.contains("mobile-open");

    mobileMenuButton.textContent = menuIsOpen ? "✕" : "☰";
  });
}

/* ---------- BOOKING FORM ---------- */

const travelForm = document.getElementById("travelForm");

const formMessage = document.getElementById("formMessage");
const submitButton = document.getElementById("submitBtn");

if (travelForm) {
  travelForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(travelForm);
    const inquiry = Object.fromEntries(formData.entries());
    inquiry.numberOfTravelers = inquiry.travelers;
    delete inquiry.travelers;

    const isLocalDevelopment =
      window.location.protocol === "file:" ||
      ["localhost", "127.0.0.1"].includes(window.location.hostname);
    const apiUrl = isLocalDevelopment
      ? "http://localhost:5000/api/inquiry"
      : "https://horizon-trails.onrender.com/api/inquiry";
    const originalButtonText = submitButton?.textContent;

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    if (formMessage) {
      formMessage.style.display = "block";
      formMessage.textContent = "Sending your inquiry...";
    }

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inquiry),
      });
      const result = await response.json();

      if (!response.ok) {
        const validationMessage = result.errors?.[0]?.msg;
        throw new Error(
          validationMessage || result.message || "Unable to send your inquiry.",
        );
      }

      if (formMessage) {
        formMessage.textContent =
          result.message ||
          "Your inquiry has been sent successfully. We will contact you shortly.";
      }

      travelForm.reset();
    } catch (error) {
      if (formMessage) {
        formMessage.textContent =
          error instanceof TypeError
            ? "Could not connect to the inquiry service. Please make sure the backend is running and try again."
            : error.message;
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  });
}
