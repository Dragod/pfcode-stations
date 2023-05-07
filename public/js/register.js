$(document).ready(function($) {

    const socket = io()

    const baseUrl = socket.io.uri

    let apiEndpoint = `${baseUrl}/api/users/`;

    let register = document.getElementById('register')

    register.onclick = function()    {

        let displayError = document.getElementById("error")

        displayError.innerHTML = ""

        let email = document.getElementById("email").value

        let username = document.getElementById("username").value

        let password = document.getElementById("password").value

        let data = JSON.stringify({

            "username": username,
            "email": email,
            "password": password

        })

        let config = {

            method: 'post',
            url: apiEndpoint,
            headers: {
                'Content-Type': 'application/json'
            },
            data : data

        }

        axios(config)
        .then(function () {

            window.location.href = '/login';

        })
        .catch(function (error) {

            console.log("Validation errors:", error.response.data)

            let errors = error.response.data.errors

            for (const error of errors) {

                console.log(error.msg)

                displayError.innerHTML += `<span class="error-text">${error.msg}</span>`

            }

        })

    }

})