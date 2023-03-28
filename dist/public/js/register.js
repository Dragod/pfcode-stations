import axios from 'axios';
$(function () {
    const baseUrl = "http://localhost:5050";
    let apiEndpoint = `${baseUrl}/api/users/`;
    let register = document.getElementById('register');
    register.onclick = function () {
        let displayError = document.getElementById("error");
        displayError.innerHTML = "";
        let email = document.getElementById("email");
        let username = document.getElementById("username");
        let password = document.getElementById("password");
        let data = JSON.stringify({
            "username": username.value,
            "email": email.value,
            "password": password.value
        });
        let config = {
            method: 'post',
            url: apiEndpoint,
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };
        axios(config)
            .then(() => {
            window.location.href = '/login';
        })
            .catch((error) => {
            console.log("Validation errors:", error.response.data);
            let errors = error.response.data.errors;
            for (const error of errors) {
                console.log(error.msg);
                displayError.innerHTML += `<span class="error-text">${error.msg}</span>`;
            }
        });
    };
});
//# sourceMappingURL=register.js.map