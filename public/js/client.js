
let fav = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-star-fill flex align-self-center fav-true" viewBox="0 0 16 16">
<path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
</svg>`

let unfav = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-star flex align-self-center fav-false" viewBox="0 0 16 16">
<path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z"/>
</svg>`

const baseUrl = "http://localhost:5050"


function getAll()
{
    let config = {
        method: 'get',
        url: 'http://localhost:5050/radio/',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    axios(config)
    .then(function (response) {

        //console.log(JSON.stringify(response.data))

        let data = response.data

        let html = `<div class='flex flex-column pa-all-1' draggable='true'>`

        for (const radio of data) {

            html += `<div title='${radio.name}' class='flex flex-column js-radio radio-guide' draggable='true'>`
            html += `<div class="pa-b-half flex flex-row">`
            html += `<div class='value flex-1'>${radio.name}</div>`;
            html += `</div>`
            html += ` <div class="flex flex-column">`
            html += `
                <audio controls>
                    <source src='${radio.url}' type='audio/ogg'>
                    <source src='${radio.url}' type='audio/mpeg'>
                    <source src='${radio.url}' type='audio/mp3'>
                    Your browser does not support the audio element.
                </audio>`
            html += `</div>`
            html += `</div>`
        }

        html += `</div>`

        document.getElementById('list').innerHTML = html



    })
    .catch(function (error) {

        console.log(error)

    })

}

function getList()
{
    let config = {
        method: 'get',
        url: `${baseUrl}/stations/`,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    axios(config)
    .then(function (response) {

        //console.log(JSON.stringify(response.data))

        let data = response.data

        console.log(data)

        let html = `
        <div class='flex flex-column pa-all-1 flex-1 pa-b-0'>
        <div class="flex flex-row pa-r-1 pa-b-1">
            <div id="stations-count" class="stations-count flex-1">
                Found ${data.length} stations
            </div>
            <div class="flex flex-row">
                <label class="switch flex flex-row">
                <input type="checkbox" checked onclick="toggleFavorites()">
                <span class="slider round"></span>
        </label>
        <div class="flex">Favorite</div>
        </div>
        </div>
            <div class="flex flex-row stations-header">
                <div class="flex flex-1">Name</div>
                <div class="flex flex-2">Url</div>
                <div class="fav-lengh pa-r-1">Favorite</div>
            </div>
            <div id="station-main-list" class="overflow-auto station-main-list">
        `

        for (const radio of data) {

            radio.favorite === 1 ? html +=`<div class="flex flex-row flex-1 stations-list is-fav" onclick="showStation('${radio.name}','${radio.url}',${radio.favorite})">` : html +=`<div class="flex flex-row flex-1 stations-list" onclick="showStation('${radio.name}','${radio.url}',${radio.favorite})">`

            html += `
                    <div class="flex flex-1">
                        <span class="ellipsis-name" title="${radio.name}">${radio.name}</span>
                    </div>
                    <div class="flex flex-2">
                        <span class="ellipsis" title="${radio.url}">${radio.url}</span>
                    </div>
            `

            radio.favorite === 1 ?  html += `<div class="flex fav-length" title="Favorite">${fav}</div>` :  html += `<div class="flex fav-length">${unfav}</div>`

            html += `</div>`

        }

        html += `
                </div>
            </div>
        `

        document.getElementById('station-list').innerHTML = html

        // Filter stations by name

        const filterInput = document.getElementById("filter")

        const list = document.getElementById("station-main-list").getElementsByClassName("stations-list")

        filterInput.addEventListener("input", () => {

            const searchTerm = filterInput.value.toLowerCase()

            Array.from(list).forEach(item => {

                const name = item.textContent.toLowerCase()

                if (name.includes(searchTerm)) {

                    item.style.display = "flex"

                }
                else {

                    item.style.display = "none"

                }

            })

            // Update count of stations found as you filter by name

            const stationsList = document.querySelectorAll('.stations-list')

            let flexStationsCount = 0

            stationsList.forEach(item => {

                if (item.style.display === 'flex') {

                    flexStationsCount++

                }

            })

            let station = ""

            flexStationsCount === 1
            ? station = "station"
            : station = "stations"

            flexStationsCount === 0
            ? document.getElementById('stations-count').innerHTML = `No stations found`
            : document.getElementById('stations-count').innerHTML = `Found ${flexStationsCount} ${station}`

        })

    })
    .catch(function (error) {

        console.log(error)

    })

}

function showStation(name, url, fav) {

    let favIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-star-fill flex align-self-center fav-true" viewBox="0 0 16 16">
                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                    </svg>`

    let list = document.getElementById("list")

    list.classList.remove("list-station-empty")

    let favorite = fav

    let html = `
        <div class='flex flex-column pa-all-1'>

            <div title='${name}' class='flex flex-column js-radio radio-guide' >

                <div class="pa-b-half flex flex-row">

                <div class='value flex-1'>${name}</div>
    `

    favorite === 1 ? html += `<div class="flex fav-length justify-end" title="Favorite">${favIcon}</div>` : html += `<div class="flex fav-length justify-end"></div>`

    html += `</div>
            <div class="flex flex-column">
                <audio  controls autoplay>
                    <source src='${url}' type='audio/ogg'>
                    <source src='${url}' type='audio/mpeg'>
                    <source src='${url}' type='audio/mp3'>
                    Your browser does not support the audio element.
                </audio>
            </div>
        </div>
    </div>
    `

    document.getElementById('list').innerHTML = html
}

let isFavShowing = false

function toggleFavorites() {

    if (isFavShowing) {

        $('.station-main-list > .stations-list').show()

        $('.toggle').text('Show Favorites')

    }
    else {

        $('.station-main-list > .stations-list:not(.is-fav)').hide()

        $('.toggle').text('Show All')

    }

    isFavShowing = !isFavShowing

}

$(".toggle").click(function() {

    toggleFavorites()

})

function isValidURL(value) {
    let expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    let regexp = new RegExp(expression);
    return regexp.test(value);
}

$(document).ready(function($) {

    let radioAdd = document.getElementById('radio-add')

    radioAdd.onclick = function()
    {
        let radioName = document.getElementById("radio-name").value;
        let radioURL = document.getElementById("radio-url").value;

        let minLength = 16;
        let nameMinLength = 3;

        if (radioName === "" || radioName.length < nameMinLength)
        {
            console.log("You need a valid Radio name, min 3 char.");
        }

        if ((isValidURL(radioURL) === false && radioURL.length < minLength) || radioURL === "")
        {
            console.log("You need a valid url");
        }

        if (isValidURL(radioURL) === true && radioName !== "" && radioName.length >= nameMinLength)
        {

            let radioFavCheck = document.getElementById("radio-fav")

            let fav;

            radioFavCheck.checked === true ? fav = 1 : fav = 0

            let data = JSON.stringify({
                "name": radioName,
                "url": radioURL,
                "favorite": fav
            });

            let config = {
                method: 'post',
                url: `${baseUrl}/stations/`,
                headers: {
                    'Content-Type': 'application/json'
                },
                data : data
            };

            axios(config)
            .then(function (response) {

                console.log(JSON.stringify(response.data))

            })
            .catch(function (error) {

                console.log(error)

            })
        }

        window.location.reload()

    }

    let radioDelete = document.getElementById('radio-confirm-delete')

    radioDelete.onclick = async function() {

        let radioId = document.getElementById("radio-id").value

        const res = await axios.delete(`${baseUrl}/stations/${radioId}`)

        res.status === 200 ? console.log("Station deleted") : console.log("Error")

        window.location.reload()

    }

    let stationUpdate = document.getElementById('update-station')

    stationUpdate.onclick = async function() {

        let radioIdUpdate = document.getElementById("radio-id-update").value

        console.log("Radio id:", radioIdUpdate)

        let radioName = document.getElementById("radio-update-name").value

        console.log("Radio name:", radioName)

        let radioURL = document.getElementById("radio-update-url").value

        console.log("Radio url:", radioURL)

        let radioFavCheck = document.getElementById("radio-update-fav")

        console.log("Radio fav:", radioFavCheck)

        let fav

        radioFavCheck.checked === true ? fav = 1 : fav = 0;

        let data = {
            "id": radioIdUpdate,
            "name": radioName,
            "url": radioURL,
            "favorite": fav
        }

        console.log(data)

        const res = await axios.put(`${baseUrl}/stations/${radioIdUpdate}`, data)

        res.status === 200 ? console.log(`Station name: ${data.name} updated`) : console.log("Error updating station")

        window.location.reload()

    }

    let getStationId = document.getElementById('get-station-id')

    getStationId.onclick = async function() {

        let stationName = document.getElementById("station-name").value

        console.log(stationName)

        const res = await axios.get(`${baseUrl}/stations/${stationName}`)

        console.log(JSON.stringify(res.data))

        let data = res.data

        res.status === 200 ? console.log(res.data) : console.log("Error")

        console.log(data.id)

        if (data.id === undefined) {

            let html = `<span class="pa-t-1 error">Station ${stationName} not found. </span>`
            html += `<span class="pa-t-1 error">Please check the name (case sensitive) and try again.</span>`

            document.getElementById('station-by-id').innerHTML = html

        }
        else{

            let html = `<div class='flex flex-column'>`

            html += `<label class="radio-name pa-t-1">${stationName} ID</label>
                    <input type="text" class="" placeholder="ID" value="${data.id}" readonly>`

            html += `</div>`

            document.getElementById('station-by-id').innerHTML = html

        }

    }

    getList()

    // modal dialog

    const deleteStation = document.getElementById("delete-station")

    const cancelButton = document.getElementById("cancel")

    const dialog = document.getElementById("delete-dialog")

    function openCheck(dialog) {

    if (dialog.open) {

        console.log("Dialog open")

        }
        else {

        console.log("Dialog closed")

        }

    }

    // Update button opens a modal dialog

    deleteStation.addEventListener("click", () => {

        dialog.showModal()

        openCheck(dialog)

    })

    // Form cancel button closes the dialog box

    cancelButton.addEventListener("click", () => {

        dialog.close("Won't delete")

        openCheck(dialog)

    })

})
