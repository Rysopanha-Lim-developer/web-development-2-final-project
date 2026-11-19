const form = document.getElementById("glass-form");


const AccountRegisteration = async({username, email, password}) => {
    let credientials;
    try {
        const res = await fetch("http://localhost:3000/api/users", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json' // Tell the server you're sending JSON
            },
            body: JSON.stringify(
                {
                    id: Math.floor(1000 + Math.random() * 9000),
                    username: username,
                    email: email,
                    password: password
                }
            )
        });
        if (!res.ok) {
            throw new Error("Could not load account data");
        }
        credientials = await res.json();
        console.log(credientials)
    } catch (error) {
        console.log(error.message)
    }
}

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = form.username.value;
    const email = form.email.value;
    const password = form.password.value;

    AccountRegisteration({username, email, password});
})