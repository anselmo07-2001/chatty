const socket = io()
const $sharedLocationBtn = document.querySelector("#share_location")
const $messageForm = document.querySelector("#sendMsgForm")
const $sendMessageBtn = document.querySelector("#sendMsgBtn")
const $inputForm = document.querySelector("#inputForm")
const $messagesContainer = document.querySelector("#messages")
const $userListContainer = document.querySelector(".chat__sidebar")

const $messageTemplate = document.querySelector("#message-template").innerHTML
const $sharedLocationMsgTemplate = document.querySelector("#sharedLocationMsg-template").innerHTML
const $sideBarUserListTemplate = document.querySelector("#sidebar-template").innerHTML


//Query String
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

$messageForm.addEventListener("submit", (e) => {
    e.preventDefault()
    $sendMessageBtn.setAttribute("disabled", "disabled")
    $inputForm.focus()
    const msg = $inputForm.value
    
    if (msg) {
        socket.emit("sendMessage", {msg, username, room}, (error) => {
            if (error) {
                return console.log(error)
            }
        })     
    }

    $inputForm.value = ""
    $sendMessageBtn.removeAttribute("disabled")
})

$sharedLocationBtn.addEventListener("click", () => {
    // disable the button
    $sharedLocationBtn.setAttribute("disabled", "disabled")

    if (!navigator.geolocation) {
        return alert("Getting Location is not supported by you're browser")
    }

    navigator.geolocation.getCurrentPosition((pos) => {
        const userLocation = {
            long : pos.coords.longitude,
            lat :  pos.coords.latitude,
            username: username,
            room: room,
        }

        socket.emit("shareLocation", userLocation, () => {
             console.log("Location shared!")
             $sharedLocationBtn.removeAttribute("disabled")
        })

    })
})

socket.on("welcomeMsg", (msgData) => {
    console.log(msgData)
    const html = Mustache.render($messageTemplate, {
        message: msgData.text,
        createdAt: moment(msgData.createdAt).format('h:mm a'),
        username: msgData.username
    })
    $messagesContainer.insertAdjacentHTML("beforeend", html)
})

const autoScroll = () => {
    //get new message ands its height, add the margin to the height
    const $newMsg = $messagesContainer.lastElementChild
    const newMsgMargin = parseInt(getComputedStyle($newMsg).marginBottom)
    const newMsgHeight = $newMsg.offsetHeight + newMsgMargin + $newMsg.clientHeight
    

    //get the visible height and height of the messages area
    const visibleHeight = $messagesContainer.offsetHeight
    const containerHeight = $messagesContainer.scrollHeight

    //get the how far the user scroll from the top 
    const scrollOffSet =  $messagesContainer.scrollTop + visibleHeight
    

    //if the user is in the bottom, then automatic scroll else dont
    if (containerHeight - newMsgHeight <= scrollOffSet) {
       $messagesContainer.scrollTop = $messagesContainer.scrollHeight
    }
}

socket.on("sendMessage", (msgData) => {
    console.log(msgData)
    const html = Mustache.render($messageTemplate, {
        message: msgData.text,
        createdAt: moment(msgData.createdAt).format('h:mm a'),
        username: msgData.username
    })
    $messagesContainer.insertAdjacentHTML("beforeend", html)

    autoScroll()
})

socket.on("locationMsg", (msgData) => {
    console.log(location)
    const html = Mustache.render($sharedLocationMsgTemplate, {
        location : msgData.text,
        createdAt :  moment(msgData.createdAt).format('h:mm a'),
        username: msgData.username
    })

    $messagesContainer.insertAdjacentHTML("beforeend", html)
})

socket.on("roomData", ({room, users}) => {
    console.log(room, users)
    $userListContainer.innerHTML = ""

    const html = Mustache.render($sideBarUserListTemplate, {
       users,
       room
    })

    $userListContainer.insertAdjacentHTML("beforeend", html)
})


socket.emit("join", {username,room}, (err) => {
    if (err) {
        alert(err)
        location.href= "/"
    }
})

// socket.on("userJoin", () => {
//     console.log("A new user join to group")
// })

// socket.on("userLeave", () => {
//     console.log("A user is left the group")
// })
