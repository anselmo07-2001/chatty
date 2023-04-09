const generateMessage = (msgData) => {
     return {
          text : msgData.msg,
          createdAt: new Date().getTime(),
          username: msgData.username
     }
}

module.exports = {
    generateMessage
}
