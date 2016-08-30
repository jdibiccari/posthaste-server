const User = require('../models').User
const Message = require('../models').Message

module.exports = function(client, io, connections) {
	client.on('login', (username) => {
		var promise = User.findOne({ username: username }).exec()

		promise.then(user => {
			if (!user) {
				const newUser = new User({ username: username })
				return newUser.save()
			} else {
				user.lastSeen().then(id => { console.log(id) })
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
