const express = require('express')
const router = express.Router()
const dateFormat = require('dateformat')
const User = require('./models').User
const Message = require('./models').Message

// middleware that is specific to this router
router.use((req, res, next) => {
	const now = dateFormat(Date.now(), "longTime")
	console.log(now, req.method, req.url)
	next()
})

router.get('/login/:username', function(req, res) {
	// const username = req.body.username
	const username = req.params.username
	User.findOne({ username: username }).then(user => {
		res.status(200).send('Login route' + user)
	}).catch(err => {
		res.status(500).send('Error: ' + err)
	})

})

router.get('/messages/:username', function(req, res) {
	const username = req.params.username

	User.findOne({ username: username }).then(user => {
		return Message.find()
	}).then(msgs => {
		console.log(msgs)
		res.status(200).send('Login route' + msgs)
	}).catch(err => {
		res.status(500).send('Error: ' + err)
	})
})

router.get('/messages/:msg', function(req, res) {
	res.send('Send messages' + req.params.msg)
})


module.exports = router