const randomColor = require('randomcolor')
const mongoose = require('mongoose'),
		Schema = mongoose.Schema

function randomUserColor() {
	// This does not insure unique colors for each user
	return randomColor({ luminosity: 'bright' })
}

const UserSchema = new Schema({
	username: { type: String, required: true, unique: true },
	last_connected_at: { type: Date, default: Date.now },
	color: { type: String, default: randomUserColor }
})

UserSchema.pre('remove', function(next) {
    Message.remove({user: this._id}).exec()
    next()
})

const MessageSchema = new Schema({
	msg: { type: String },
	user: { type: Schema.Types.ObjectId, ref: 'User' },
	created_at: { type: Date, default: Date.now }
})


const User = mongoose.model('User', UserSchema)
const Message = mongoose.model('Message', MessageSchema)

module.exports = { Message: Message, User: User }
