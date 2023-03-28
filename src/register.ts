import axios from 'axios'

$(function() {

    const baseUrl: string = "http://localhost:5050"

    let apiEndpoint: string = `${baseUrl}/api/users/`

    let register = document.getElementById('register') as HTMLButtonElement

    register.onclick = function()    {

        let displayError = document.getElementById("error") as HTMLElement

        displayError.innerHTML = ""

        let email = document.getElementById("email") as HTMLInputElement

        let username = document.getElementById("username") as HTMLInputElement

        let password = document.getElementById("password") as HTMLInputElement

        let data = JSON.stringify({

            "username": username.value,
            "email": email.value,
            "password": password.value

        })

        let config: object = {

            method: 'post',
            url: apiEndpoint,
            headers: {
                'Content-Type': 'application/json'
            },
            data : data

        }

        axios(config)
        .then(() => {

            window.location.href = '/login';

        })
        .catch((error: any)=> {

            console.log("Validation errors:", error.response.data)

            let errors = error.response.data.errors

            for (const error of errors) {

                console.log(error.msg)

                displayError.innerHTML += `<span class="error-text">${error.msg}</span>`

            }

        })

    }

})
