const User = require('../models').User

module.exports = function(client, io, connections) {
	client.on('login', (username) => {
		var promise = User.findOne({ username: username }).exec()

		promise.then(user => {
			if (!user) {
				const newUser = new User({ username: username })
				return newUser.save()
			}
			return user
		}).then(user => {
			client.user = user
			connections.push(user)
			io.sockets.emit('notify', connections)
			io.sockets.emit('update count', connections.length)
		}).catch(err => {
			console.log(err)
		})
	})
}
