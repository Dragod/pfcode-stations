$(document).ready(function($) {

    const login = document.getElementById('login')

    login.onclick = function() {

        const email = document.getElementById('email').value

        const password = document.getElementById('password').value


        let data = JSON.stringify({

            "email": email,

            "password": password

        })

        console.log(data)

        let config = {

            method: 'post',
            url: '/login',
            headers: {
                'Content-Type': 'application/json'
            },
            data : data

        }

        axios(config)
        .then(function (response) {

            console.log(response.data)

            window.location.href = '/'

        })
        .catch(function (error) {

            console.log(error.response.data)

            let displayError = document.getElementById("error")

            displayError.innerHTML = error.response.data

        })

    }

})