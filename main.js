document.addEventListener("DOMContentLoaded", function () {

    const confirmBtn = document.querySelector("#bookingModal .modal-btn");
    const nameInput = document.querySelector('#bookingModal input[type="text"]');
    const contactInput = document.querySelector('#bookingModal input[type="tel"]');
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

    // Clears all errors
    [nameInput, contactInput, guestsInput].forEach(input => {
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

    // Date input format: MM/DD/YYYY, only digits and slashes allowed, auto-formatting, future dates only
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

    // Guests input format: only digits allowed, max 20 guests
    guestsInput.addEventListener("input", function () {
        this.value = this.value.replace(/[^0-9]/g, "");
        const value = parseInt(this.value || "0");
        if (value > 20) this.value = 20;
    });

    // Checkboxes: select up to 3 options, visually indicate selection, deselect oldest if more than 3
    const reserveOptions = document.querySelectorAll(".reserve-option");
    let selectedOrder = [];

    checkboxes.forEach(cb => {
        cb.addEventListener("change", function () {

            if (this.checked) {
                selectedOrder.push(this);

                if (selectedOrder.length > 3) {
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

        // Guests number check
        if (!guests) {
            showFieldError(guestsInput, "Please fill in this required field.");
            isValid = false;
        }

        // Date check
        if (!date) {
            showFieldError(dateInput, "Please select a valid future date.");
            isValid = false;
        }

        // Checkbox (only 1 allowed)
        let selected = [];
        checkboxes.forEach(cb => {
            if (cb.checked) selected.push(cb.value);
        });

        if (!isValid) return;

        showFieldError("Reservation successful!");

        // Resets the form after successful submission
        nameInput.value = "";
        contactInput.value = "";
        guestsInput.value = "";
        checkboxes.forEach(cb => cb.checked = false);
        reserveOptions.forEach(opt => opt.classList.remove("active"));
        monthSelect.value = currentMonth;
        updateDaysAndScroll();
    });
});