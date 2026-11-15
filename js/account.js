const userSide = document.querySelector('.user-side');
const guestSide = document.querySelector('.guest-side');
const username = document.getElementById('username');
const email = document.getElementById('email');
const ticketCount = document.getElementById('ticket-count');
const getAccount = () => {
    try {
        return JSON.parse(localStorage.getItem('account'));
    } catch {
        return null;
    }
}

const render = () => {
    const account = getAccount();

    if (account) {
        userSide.hidden = false;
        guestSide.hidden = true;
        username.textContent = account.username;
        email.textContent = account.email;
        ticketCount.textContent = (account.tickets || []).length;
    } else {
        userSide.hidden = true;
        guestSide.hidden = false;
    }
}

document.getElementById("signout").addEventListener('click', () => {
    localStorage.removeItem('account');
    render();
});

render();