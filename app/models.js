const mongoose = require('mongoose'),
		Schema = mongoose.Schema

const UserSchema = new Schema({
	username: { type: String, required: true, unique: true },
	last_connected_at: { type: Date, default: Date.now }
})

UserSchema.static('findByUsername', (username) => {
	return this.find({ username: username})
})

const MessageSchema = new Schema({
	msg: { type: String },
	user: { type: Schema.Types.ObjectId, ref: 'User' },
	created_at: { type: Date, default: Date.now }
})


const User = mongoose.model('User', UserSchema)
const Message = mongoose.model('Message', MessageSchema)

module.exports = { Message: Message, User: User }
