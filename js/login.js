const form = document.getElementById("glass-form");


const credientialValidation = async({username, email, password}) => {
    let credientials;
    try {
        const res = await fetch("http://localhost:3000/api/users", {
            method: "GET",
            // headers: {
            //     'Content-Type': 'application/json'
            // },
            // body: JSON.stringify({username, email, password})
        });
        credientials = await res.json();
    } catch (error) {
        console.log(error.message)
    }

    // console.log(username, email, password)
    console.log(credientials)
}

credientialValidation({username, email, password})
// form.addEventListener("submit", (e) => {
//     e.preventDefault();

//     const username = form.username.value;
//     const email = form.email.value;
//     const password = form.password.value;

//     credientialValidation({username, email, password})
// })
