
import {
    getAccount,
    listByUser,
    remove
} from "./mockoon-api.js";

const API = "http://localhost:3001/api";

const userSide = document.querySelector(".user-side");
const guestSide = document.querySelector(".guest-side");

const ticketCount = document.getElementById("ticket-count");
const bookingList = document.getElementById("booking-list");
const watchlist = document.getElementById("watchlist");


// ==============================
// NEW: Edit Booking Elements
// ==============================

const editModal = document.getElementById("edit-booking-modal");
const editForm = document.getElementById("edit-booking-form");
const editMovieTitle = document.getElementById("edit-movie-title");

const editDate = document.getElementById("edit-date");
const editTime = document.getElementById("edit-time");
const editQuantity = document.getElementById("edit-quantity");

const saveBooking = document.getElementById("save-booking");
const closeEditModal = document.getElementById("close-edit-modal");

let selectedBooking = null;


// ==============================
// NEW: Open Edit Booking Modal
// ==============================

function openEditBooking(record) {
    selectedBooking = record;

    editMovieTitle.textContent = record.movieTitle;

    // Display existing booking information
    editDate.value = record.showDate;

    // Preserve the original showtime if it is not listed
    const timeExists = Array.from(editTime.options).some(
        option => option.value === record.showTime
    );

    if (!timeExists) {
        editTime.add(new Option(record.showTime, record.showTime));
    }

    editTime.value = record.showTime;
    editQuantity.value = record.quantity;

    // Prevent users from selecting a past date
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    editDate.min = `${year}-${month}-${day}`;

    editModal.showModal();
}


// ==============================
// NEW: Update Booking Using PUT
// ==============================

async function updateBooking(id, updatedData) {
    const response = await fetch(
        `${API}/bookings/${encodeURIComponent(id)}`,
        {
            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(updatedData)
        }
    );

    if (!response.ok) {
        throw new Error(`Update failed: ${response.status}`);
    }
}


// ==============================
// NEW: Save Booking Changes
// ==============================

editForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!selectedBooking) return;

    const account = getAccount();

    // Check that the booking belongs to the current user
    if (!account || selectedBooking.userId !== account.id) {
        alert("You cannot edit this booking.");
        editModal.close();
        return;
    }

    const quantity = Number(editQuantity.value);

    // Validate ticket quantity
    if (!Number.isInteger(quantity) || quantity < 1) {
        alert("Please enter a valid number of tickets.");
        return;
    }

    // Validate booking date and time
    const showDateTime = new Date(
        `${editDate.value}T${editTime.value}`
    );

    if (
        Number.isNaN(showDateTime.getTime()) ||
        showDateTime <= new Date()
    ) {
        alert("Please select a future booking date and time.");
        return;
    }

    // Preserve existing booking information
    const updatedBooking = {
        ...selectedBooking,

        showDate: editDate.value,
        showTime: editTime.value,
        quantity: quantity,

        updatedAt: new Date().toISOString()
    };

    saveBooking.disabled = true;
    closeEditModal.disabled = true;
    saveBooking.textContent = "Saving...";

    try {
        await updateBooking(
            selectedBooking.id,
            updatedBooking
        );

        editModal.close();

        await refreshRecords();

        alert("Booking updated successfully!");

    } catch (error) {
        console.error(error);

        alert("Could not update booking. Please try again.");

    } finally {
        saveBooking.disabled = false;
        closeEditModal.disabled = false;
        saveBooking.textContent = "Save Changes";
    }
});


// Close Edit Booking Modal
closeEditModal.addEventListener("click", () => {
    editModal.close();
});

// Prevent closing with Escape while saving
editModal.addEventListener("cancel", (event) => {
    if (saveBooking.disabled) {
        event.preventDefault();
    }
});

// Clear selected booking when the modal closes
editModal.addEventListener("close", () => {
    selectedBooking = null;
    editForm.reset();
});


// ==============================
// Display Tickets or Saved Movies
// ==============================

function showRecords(container, records, resource) {
    container.replaceChildren();

    if (!records.length) {
        const empty = document.createElement("li");
        empty.className = "empty";

        empty.textContent = resource === "bookings"
            ? "No tickets booked yet."
            : "No saved movies yet.";

        container.append(empty);
        return;
    }

    for (const record of records) {
        const card = document.createElement("li");
        card.className = "ticket";

        // Movie poster
        const poster = document.createElement("div");
        poster.className = "poster";

        const validPoster =
            /^\/[a-zA-Z0-9/_-]+\.(jpg|jpeg|png|webp)$/;

        if (validPoster.test(record.posterPath || "")) {
            poster.style.backgroundImage =
                `url(https://image.tmdb.org/t/p/w185${record.posterPath})`;
        }

        // Movie title and booking details
        const content = document.createElement("div");
        content.className = "ticket-main";

        const title = document.createElement("h3");
        title.textContent = record.movieTitle;

        const info = document.createElement("p");

        info.textContent = resource === "bookings"
            ? `${record.showDate} at ${record.showTime} · ${record.quantity} ticket(s)`
            : "Saved to your watchlist";

        content.append(title, info);

        // Action buttons
        const actions = document.createElement("div");
        actions.className = "ticket-stub";


        // NEW: Edit button for booked tickets only
        if (resource === "bookings") {
            const editButton = document.createElement("button");

            editButton.type = "button";
            editButton.className = "btn btn-edit";
            editButton.textContent = "Edit";

            editButton.onclick = () => {
                openEditBooking(record);
            };

            actions.append(editButton);
        }


        // Remove or cancel button
        const button = document.createElement("button");

        button.type = "button";
        button.className = "btn btn-ghost";

        button.textContent =
            resource === "bookings" ? "Cancel" : "Remove";

        button.onclick = async () => {
            if (!confirm("Remove this item?")) return;

            button.disabled = true;

            try {
                await remove(resource, record.id);
                await refreshRecords();

            } catch (error) {
                console.error(error);
                alert("Could not remove this item.");
                button.disabled = false;
            }
        };

        actions.append(button);

        card.append(poster, content, actions);
        container.append(card);
    }
}


// ==============================
// Get Current User's Records
// ==============================

async function refreshRecords() {
    const account = getAccount();

    if (!account) return;

    try {
        const [bookings, saved] = await Promise.all([
            listByUser("bookings", account.id),
            listByUser("watchlist", account.id)
        ]);

        // Total number of tickets booked
        ticketCount.textContent = bookings.reduce(
            (total, item) => total + Number(item.quantity || 0),
            0
        );

        showRecords(bookingList, bookings, "bookings");
        showRecords(watchlist, saved, "watchlist");

    } catch (error) {
        console.error(error);

        ticketCount.textContent = "—";

        bookingList.textContent =
            "Could not load bookings. Start Mockoon and refresh.";

        watchlist.textContent =
            "Could not load saved movies. Start Mockoon and refresh.";
    }
}


// ==============================
// Show Account or Guest Page
// ==============================

function render() {
    const account = getAccount();

    userSide.hidden = !account;
    guestSide.hidden = !!account;

    if (account) {
        document.getElementById("username").textContent =
            account.username;

        document.getElementById("email").textContent =
            account.email;

        refreshRecords();
    }
}


// ==============================
// Logout
// ==============================

document.getElementById("signout").addEventListener(
    "click",
    () => {
        localStorage.removeItem("account");
        render();
    }
);

render();
