const path = require("path")
const http = require("http")
const express = require("express")
const socketio = require("socket.io")
const Filter = require("bad-words")
const { generateMessage } = require("../public/js/utils/time")
const {addUser, removeUser, getUser, getUsersInRoom} = require("../public/js/utils/user")

const app = express()
const server = http.createServer(app)
const io = socketio(server) 

const publicDirectory = path.join(__dirname, "../public")
app.use(express.static(publicDirectory))

const PORT = process.env.PORT || 3000

// let count = 0

// if meron kang 5 client, this code run 5 times
// socket argument use to send or receive events
io.on("connection", (socket) => {
    console.log("New Connection")
    
    // socket.emit("countUpdated", count)    
    // socket.on("incrementCount", () => {
    //      count++
    //      // socket.emit("countUpdated", count)
    //      io.emit("countUpdated", count)
    // }


    socket.on("join", (data, callback) => {
        const { user, error, room } = addUser({
            id: socket.id,
            username: data.username,
            room: data.room
        })
        console.log("--User--", user)
        console.log("--Error--", error)

        if (error) {
            console.log(error)
            callback(error)
            return 
        }

        socket.join(room)
        socket.emit("welcomeMsg", generateMessage({
             msg: `Welcome to Chat App ${user}`,
             username: "Chat App"
        }))

        socket.broadcast.to(room).emit("sendMessage", generateMessage({
            msg: `${user} joined the group`,
            username: user
        }))

        io.to(room).emit("roomData", {room, users: getUsersInRoom(room)})

        callback()
    })

    //socket.emit("welcomeMsg", generateMessage("Welcome!"))
    //socket.broadcast.emit("sendMessage", generateMessage("A new user join the group"))

    socket.on("sendMessage", (msgData, callback) => {
        const filter = new Filter()
        const { room, user } = getUser(socket.id)

        if (filter.isProfane(msgData.msg)) {
            callback("Profanity is not allowed")
            return
        }

        io.to(room).emit("sendMessage", generateMessage({
            username: user,
            msg: msgData.msg
        }))

       
    })

    socket.on("shareLocation", (location, callback) => {
        const { room, user } = getUser(socket.id)
        console.log(room)

        io.to(room).emit("locationMsg", generateMessage({
            msg: `https://google.com/maps?q=${location.lat},${location.long}`,
            username: user
        }))
        callback()
    })

    // listen if someone disconnect
    socket.on("disconnect", () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit("sendMessage", generateMessage({
                msg: `${user.user} left join the group`,
                username: user.user
           }))

           io.to(user.room).emit("roomData", {room: user.room, users: getUsersInRoom(user.room)})
        }   
    })
})


server.listen(PORT, () => {
    console.log("Listen to port ", 3000)
})


