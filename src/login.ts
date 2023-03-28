
import axios from 'axios';

$(()=> {

    const login = document.getElementById('login') as HTMLButtonElement

    login.onclick = ()=> {

        const email = document.getElementById('email') as HTMLInputElement

        const password = document.getElementById('password') as HTMLInputElement

        let data = JSON.stringify({

            "email": email.value,

            "password": password.value

        })

        console.log(data)

        let config: object = {

            method: 'post',
            url: '/login',
            headers: {
                'Content-Type': 'application/json'
            },
            data : data

        }

        axios(config)
        .then((response) => {

            console.log(response.data)

            window.location.href = '/'

        })
        .catch((error: any) => {

            console.log(error.response.data)

            let displayError = document.getElementById("error") as HTMLElement

            displayError.innerHTML = error.response.data

        })

    }

})