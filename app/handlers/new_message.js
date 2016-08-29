const Message = require('../models').Message

module.exports = function(client, io) {
	client.on('new msg', (msg) => {
		if (client.user) {
			const newMsg = new Message({ user: client.user._id, msg: msg })
			newMsg.save().then(msg => {
				return Message.populate(msg, {path:'user'})
			}).then(msg => {
				io.sockets.emit('new msg', msg)
			})
		} else {
			console.log('no user specified')
		}
	})
}