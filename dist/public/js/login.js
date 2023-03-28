
$(() => {
    const login = document.getElementById('login');
    login.onclick = () => {
        const email = document.getElementById('email');
        const password = document.getElementById('password');
        let data = JSON.stringify({
            "email": email.value,
            "password": password.value
        });
        console.log(data);
        let config = {
            method: 'post',
            url: '/login',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };
        axios(config)
            .then((response) => {
            console.log(response.data);
            window.location.href = '/';
        })
            .catch((error) => {
            console.log(error.response.data);
            let displayError = document.getElementById("error");
            displayError.innerHTML = error.response.data;
        });
    };
});
//# sourceMappingURL=login.js.map