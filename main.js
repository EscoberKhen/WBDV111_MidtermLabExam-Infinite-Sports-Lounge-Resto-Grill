document.addEventListener("DOMContentLoaded", function () {

    const confirmBtn = document.querySelector("#bookingModal .modal-btn");
    const nameInput = document.querySelector('#bookingModal input[type="text"]');
    const contactInput = document.querySelector('#bookingModal input[type="tel"]');
    const guestsInput = document.querySelector('#bookingModal input[type="number"]');
    const checkboxes = document.querySelectorAll('#bookingModal input[type="checkbox"]');

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

    contactInput.addEventListener("input", function () {

    let numbers = this.value.replace(/[^0-9]/g, "");

    if (numbers.length > 0 && !numbers.startsWith("09")) {
        numbers = "09" + numbers.replace(/^0+/, "");
    }

    numbers = numbers.slice(0, 11);

    let formatted = "";

    if (numbers.length > 0) {
        formatted = numbers.substring(0, 4);
    }
    if (numbers.length >= 5) {
        formatted += "-" + numbers.substring(4, 7);
    }
    if (numbers.length >= 8) {
        formatted += "-" + numbers.substring(7, 11);
    }

    this.value = formatted;
});

    const yearSelect = document.getElementById("year");
    const monthSelect = document.getElementById("month");
    const daySelect = document.getElementById("day");
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    yearSelect.innerHTML = `<option value="${currentYear}">${currentYear}</option>`;

    let monthOptions = "";
    for (let m = 1; m <= 12; m++) {
        monthOptions += `<option value="${m}">${m}</option>`;
    }
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

        if (parseInt(month) === currentMonth) {
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

    function getSelectedDate(showMessage) {
        const year = yearSelect.value;
        const month = monthSelect.value;
        const day = daySelect.value;

        if (!year || !month || !day) {
            showMessage("Please select a complete reservation date.", "error");
            return null;
        }

        const paddedMonth = month.padStart(2, "0");
        const paddedDay = day.padStart(2, "0");
        const dateStr = `${year}-${paddedMonth}-${paddedDay}`;

        const selectedDate = new Date(year, month - 1, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            showMessage("Please select a future date.", "error");
            return null;
        }

        return dateStr;
    }

    guestsInput.addEventListener("input", function () {
        this.value = this.value.replace(/[^0-9]/g, "");

        const value = parseInt(this.value || "0");

        if (value > 20) {
            this.value = 20;
        }
    });

    const reserveOptions = document.querySelectorAll(".reserve-option");

    checkboxes.forEach(cb => {
        cb.addEventListener("change", function () {

            checkboxes.forEach(other => {
                if (other !== this) {
                    other.checked = false;
                }
            });

            reserveOptions.forEach(opt => opt.classList.remove("active"));

            if (this.checked) {
                this.closest(".reserve-option").classList.add("active");
            }
        });
    });

    const messageBox = document.createElement("div");
    messageBox.style.marginTop = "10px";
    messageBox.style.padding = "10px";
    messageBox.style.borderRadius = "6px";
    messageBox.style.display = "none";
    messageBox.style.fontSize = "14px";

    const modalBox = document.querySelector("#bookingModal .modal-box");
    if (modalBox) {
        modalBox.appendChild(messageBox);
    }

    function showMessage(text, type) {
        messageBox.style.display = "block";
        messageBox.textContent = text;

        if (type === "error") {
            messageBox.style.background = "#ffe0e0";
            messageBox.style.color = "#a10000";
        } 
        
        else {
            messageBox.style.background = "#e0ffe0";
            messageBox.style.color = "#006600";
        }
    }

    confirmBtn.addEventListener("click", function (event) {
        event.preventDefault();

        const name = nameInput.value.trim();
        const contact = contactInput.value.trim();
        const cleanContact = contact.replace(/[^0-9]/g, "");

        if (cleanContact.length !== 11) {
            showMessage("Contact number must be 11 digits.", "error");
            return;
        }
        
        const date = getSelectedDate(showMessage);
        if (!date) return;

        const guests = guestsInput.value;

        let selected = [];
        checkboxes.forEach(cb => {
            if (cb.checked) {
                selected.push(cb.value);
            }
        });

        const guestCount = parseInt(guests);

        if (isNaN(guestCount) || guestCount < 1 || guestCount > 20) {
            showMessage("Guests must be between 1 and 20.", "error");
            return;
        }

        if (!name || !contact || !date || !guests) {
            showMessage("Please fill in all required fields.", "error");
            return;
        }

        if (selected.length !== 1) {
            showMessage("Please select exactly one reservation option.", "error");
            return;
        }

        showMessage("Reservation successful! Redirecting...", "success");

        reserveOptions.forEach(opt => opt.classList.remove("active"));

        nameInput.value = "";
        contactInput.value = "";
        yearSelect.value = currentYear;
        monthSelect.value = currentMonth;
        updateDaysAndScroll();
        guestsInput.value = "";
        checkboxes.forEach(cb => cb.checked = false);

        setTimeout(() => {
            window.location.hash = "bookingDone";
        }, 800);
    });

});