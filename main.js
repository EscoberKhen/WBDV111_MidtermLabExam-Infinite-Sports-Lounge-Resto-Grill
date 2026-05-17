document.addEventListener("DOMContentLoaded", function () {

// RESERVATION FORM (VALIDATION/ERRORS/INPUT FORMATS)
    const confirmBtn = document.getElementById("confirmReservationBtn");
    const nameInput = document.querySelector('#bookingModal input[type="text"]');
    const contactInput = document.querySelector('#bookingModal input[type="tel"]');
    const gmailInput = document.getElementById("gmailInput");
    const guestsInput = document.querySelector('#bookingModal input[type="number"]');
    const checkboxes = document.querySelectorAll('#bookingModal input[type="checkbox"]');

    // Error messages for required fields and invalid formats
    function showFieldError(input, message) {
        let error = input.nextElementSibling;

        if (!error || !error.classList.contains("error-text")) {
            error = document.createElement("div");
            error.classList.add("error-text");
            error.style.color = "red";
            error.style.fontSize = "12px";
            error.style.marginTop = "4px";
            input.parentNode.appendChild(error);
        }

        error.textContent = message;
        input.style.border = "2px solid red";
    }

    function clearFieldError(input) {
        let error = input.nextElementSibling;

        if (error && error.classList.contains("error-text")) {
            error.remove();
        }

        input.style.border = "";
    }

    function showCheckboxError(message) {
        let existing = document.querySelector(".checkbox-error");
        if (existing) return;

    const lastOption = document.querySelector(".reserve-option:last-of-type");

    const error = document.createElement("div");
        error.classList.add("checkbox-error");
        error.style.color = "red";
        error.style.fontSize = "12px";
        error.style.marginTop = "6px";
        error.textContent = message;

        lastOption.parentNode.appendChild(error);
    }

    function clearCheckboxError() {
        let error = document.querySelector(".checkbox-error");
        if (error) error.remove();
    }

    // Clears all errors
    [nameInput, contactInput, gmailInput, guestsInput].forEach(input => {
        input.addEventListener("input", () => clearFieldError(input));
    });

    // Name input format: only letters and spaces, auto-capitalization, max 50 chars
    nameInput.addEventListener("input", function () {
        this.value = this.value.replace(/[^a-zA-Z\s]/g, "");
        this.value = this.value.replace(/\s+/g, " ").trimStart();
        this.value = this.value
            .toLowerCase()
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

        if (this.value.length > 50) {
            this.value = this.value.slice(0, 50);
        }
    });

    // Contact input format: auto-format as 09XX-XXX-XXXX, only digits allowed, max 11 digits
    contactInput.addEventListener("input", function () {
        let numbers = this.value.replace(/[^0-9]/g, "");

        if (numbers.length > 0 && !numbers.startsWith("09")) {
            numbers = "09" + numbers.replace(/^0+/, "");
        }

        numbers = numbers.slice(0, 11);

        let formatted = "";
        if (numbers.length > 0) formatted = numbers.substring(0, 4);
        if (numbers.length >= 5) formatted += "-" + numbers.substring(4, 7);
        if (numbers.length >= 8) formatted += "-" + numbers.substring(7, 11);

        this.value = formatted;
    });

    // Gmail input format: only allows input before @gmail.com, auto-appends @gmail.com, 
    // only alphanumeric characters, dots, and underscores allowed, max 30 chars before @
    gmailInput.addEventListener("keydown", function (e) {

    if (e.key === "@") {
        e.preventDefault();

        let value = this.value;
        value = value.replace("@gmail.com", "");
        this.value = value + "@gmail.com";
        this.setSelectionRange(value.length, value.length);
        }
    });

    gmailInput.addEventListener("input", function () {

    let value = this.value;
    value = value.replace(/\s/g, "").toLowerCase();
    value = value.replace(/[^a-z0-9.@_]/g, "");

    this.value = value;
    });

    // Gmail validation regex: alphanumeric characters before @gmail.com
    const gmailRegex = /^[a-zA-Z][a-zA-Z0-9._]*@gmail\.com$/i;

    // Date input format: MM/DD/YYYY, only digits and slashes allowed, auto-formatting, future dates only
    const yearSelect = document.getElementById("year");
    const monthSelect = document.getElementById("month");
    const daySelect = document.getElementById("day");

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    yearSelect.innerHTML = `<option value="${currentYear}">${currentYear}</option>`;

    const months = ["January", "February", "March", "April", "May", "June", 
                "July", "August", "September", "October", "November", "December"];

        let monthOptions = "";
    months.forEach((month, index) => {
    monthOptions += `<option value="${index + 1}">${month}</option>`;
        });

        monthSelect.innerHTML = monthOptions;

    function populateDays(days) {
        let dayOptions = "";
        for (let d = 1; d <= days; d++) {
            dayOptions += `<option value="${d}">${d}</option>`;
        }
        daySelect.innerHTML = dayOptions;
    }

    function updateDaysAndScroll() {
        const month = parseInt(monthSelect.value);
        const year = parseInt(yearSelect.value);
        if (!month || !year) return;

        const daysInMonth = new Date(year, month, 0).getDate();
        populateDays(daysInMonth);

        if (month === currentMonth) {
            daySelect.value = currentDay;
        } 
        
        else {
            daySelect.value = 1;
        }

        daySelect.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    monthSelect.addEventListener("change", updateDaysAndScroll);
    yearSelect.addEventListener("change", updateDaysAndScroll);

    monthSelect.value = currentMonth;
    updateDaysAndScroll();

    function getSelectedDate() {
        const year = yearSelect.value;
        const month = monthSelect.value;
        const day = daySelect.value;

        if (!year || !month || !day) return null;

        const selectedDate = new Date(year, month - 1, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) return null;

        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    //Time input format: only digits allowed, auto-format to 12-hour with AM/PM
    const hourSelect = document.getElementById("hour");
    const ampmSelect = document.getElementById("ampm");

    const allowedTimes = [
        { hour: 11, period: "AM" },
        { hour: 12, period: "PM" },
        { hour: 1, period: "PM" },
        { hour: 2, period: "PM" },
        { hour: 3, period: "PM" },
        { hour: 4, period: "PM" },
        { hour: 5, period: "PM" },
        { hour: 6, period: "PM" },
        { hour: 7, period: "PM" },
        { hour: 8, period: "PM" },
        { hour: 9, period: "PM" },
        { hour: 10, period: "PM" },
        { hour: 11, period: "PM" },
        { hour: 12, period: "AM" },
        { hour: 1, period: "AM" },
        { hour: 2, period: "AM" },
        { hour: 3, period: "AM" },
        ];

        function updateHours() {
        const selectedPeriod = ampmSelect.value;

        let options = "";

        allowedTimes.forEach(t => {
                if (t.period === selectedPeriod) {
                    options += `<option value="${t.hour}">${t.hour}</option>`;
                }
            });

            hourSelect.innerHTML = options;
        }

        ampmSelect.addEventListener("change", updateHours);

    updateHours();

    guestsInput.addEventListener("input", function () {
        this.value = this.value.replace(/[^0-9]/g, "");
        const value = parseInt(this.value || "0");
        if (value > 20) this.value = 20;
    });

    // Checkboxes: select up to 2 options, visually indicate selection, deselect oldest if more than 2
    const reserveOptions = document.querySelectorAll(".reserve-option");

    clearCheckboxError();
    let selectedOrder = [];

    checkboxes.forEach(cb => {
        cb.addEventListener("change", function () {

            if (this.checked) {
                selectedOrder.push(this);

                if (selectedOrder.length > 2) {
                    const removed = selectedOrder.shift();
                    removed.checked = false;
                    removed.closest(".reserve-option").classList.remove("active");
                }
            } 
            
            else {
                selectedOrder = selectedOrder.filter(item => item !== this);
            }

            reserveOptions.forEach(opt => opt.classList.remove("active"));

            selectedOrder.forEach(cb => {
                cb.closest(".reserve-option").classList.add("active");
            });
        });
    });

    // Reservation confirmation and submission: validate all fields, show errors
    confirmBtn.addEventListener("click", function (event) {
        event.preventDefault();

        const name = nameInput.value.trim();
        const contact = contactInput.value.trim();
        const gmail = gmailInput.value.trim();
        const guests = guestsInput.value;
        const cleanContact = contact.replace(/[^0-9]/g, "");
        const date = getSelectedDate();

        let isValid = true;

        // Name check
        if (!name) {
            showFieldError(nameInput, "Please fill in this required field.");
            isValid = false;
        }

        // Contact check
        if (!contact) {
            showFieldError(contactInput, "Please fill in this required field.");
            isValid = false;
        } 
        
        else if (cleanContact.length !== 11) {
            showFieldError(contactInput, "Contact number must be 11 digits.");
            isValid = false;
        }

        // Gmail check
        if (!gmail) {
            showFieldError(gmailInput, "Please fill in this required field.");
            isValid = false;
        } 
        
        else if (!gmailRegex.test(gmail)) {
        showFieldError(gmailInput, "Please enter a valid Gmail address.");
        isValid = false;
        }

        // Date check
        if (!date) {
            showFieldError(daySelect, "Please select a valid future date.");
            isValid = false;
        }

        // Guests number check
        if (!guests) {
            showFieldError(guestsInput, "Please fill in this required field.");
            isValid = false;
        }

        // Clears old checkbox error
        clearCheckboxError();

        let selected = [];
        checkboxes.forEach(cb => {
            if (cb.checked) selected.push(cb.value);
        });

        if (selected.length === 0) {
            showCheckboxError("Please select one of the options.");
            isValid = false;
        }

        if (!isValid) return;

        // Resets the form after successful submission
        nameInput.value = "";
        contactInput.value = "";
        gmailInput.value = "";
        guestsInput.value = "";
        checkboxes.forEach(cb => cb.checked = false);
        reserveOptions.forEach(opt => opt.classList.remove("active"));
        monthSelect.value = currentMonth;
        updateDaysAndScroll();

        window.location.hash = "bookingDone";
    });

// IMAGE LIGHTBOX (FOR BETTER VIEWING OF PHOTOS)
    const lightboxOverlay = document.getElementById("lightboxOverlay");
    const lightboxImg     = document.getElementById("lightboxImg");
    const lightboxClose   = document.getElementById("lightboxClose");

    const clickableImgs = document.querySelectorAll(".image-item img, .card img");

    clickableImgs.forEach(img => {
        img.addEventListener("click", function () {
            lightboxImg.src = this.src;
            lightboxImg.alt = this.alt;
            lightboxOverlay.classList.add("active");
            document.body.style.overflow = "hidden";
        });
    });

    function closeLightbox() {
        lightboxOverlay.classList.remove("active");
        lightboxImg.src = "";
        document.body.style.overflow = "";
    }

    lightboxClose.addEventListener("click", closeLightbox);

    lightboxOverlay.addEventListener("click", function (e) {
        if (e.target === lightboxOverlay) closeLightbox();
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeLightbox();
    });

    // Mobile navbar drawer 
    const menuToggle = document.getElementById("menu-toggle");
    const navLinks = document.querySelector(".nav-links");
    const drawerOverlay = document.getElementById("drawerOverlay");
    const menuIcon = document.querySelector(".menu-icon");

    function closeDrawer() {
        menuToggle.checked = false;
        drawerOverlay.style.display = "none";
        navLinks.style.transform = "translateX(100%)";
        menuIcon.style.color = "";
    }

    function openDrawer() {
        drawerOverlay.style.display = "block";
        navLinks.style.transform = "translateX(0)";
        menuIcon.style.color = "#39FF14";
    }

    menuToggle.addEventListener("change", function () {
        if (this.checked) openDrawer();
        else closeDrawer();
    });

    // Closes if overlay is clicked
    drawerOverlay.addEventListener("click", closeDrawer);

    // Closes if any nav link is clicked
    navLinks.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", closeDrawer);
    });
});