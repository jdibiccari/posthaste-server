const User = require('../models').User

module.exports = function(client, io, connections) {
	client.on('disconnect', () => {
		if (client.user) {
			// Update last_connected_at on disconnect
			User.update({ _id: client.user._id }, { $set: { last_connected_at: Date.now() }}).exec()
			const index = connections.indexOf(client.user)
			connections.splice(index, 1)
			io.sockets.emit('notify', connections)
			io.sockets.emit('update count', connections.length)
		}

	})
}
