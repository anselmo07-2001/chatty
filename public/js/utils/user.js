const users = []


const addUser = ({id, username, room}) => {
    const cleanUsername = username.trim().toLowerCase()
    const cleanRoom = room.trim().toLowerCase()

    if (!cleanUsername || !cleanRoom) {
        return {
            error:"User and room are required"
        }
    }

    const isUserExisting = users.find(user => {
        return user.room === cleanRoom && user.user === cleanUsername
    })

    if (isUserExisting) {
        return {
            error:"Username is in used"
        }
    }

    const user = {user : cleanUsername , room: cleanRoom, id}
    users.push(user)

    return user
}


const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        return users.splice(index,1)[0]
    }
}


const getUser = (id) => {
    return users.find(user => user.id === id)
}

const getUsersInRoom = (room) => {
    return users.filter(user => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}