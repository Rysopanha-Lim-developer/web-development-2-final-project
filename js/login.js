const form = document.getElementById("glass-form");


const credientialValidation = async({username, email, password}) => {
    let credientials;
    try {
        const res = await fetch("http://localhost:3000/api/users", {
            method: "GET",
        });
        if (!res.ok) {
            throw new Error("Could not load account data");
        }
        credientials = await res.json();
    } catch (error) {
        console.log(error.message)
    }

    const success = await credientials.find(
        user => user.username == username && user.email == email && user.password == password
    )

    if(success){
        localStorage.setItem('account', JSON.stringify({ username: success.username, email: success.email }))
    }
    
    console.log(success)
}

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = form.username.value;
    const email = form.email.value;
    const password = form.password.value;

    credientialValidation({username, email, password});
})
