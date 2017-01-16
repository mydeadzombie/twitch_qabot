var mongoose = require('mongoose');

var 
	User = mongoose.model('Users', 
		new mongoose.Schema({ 
			name: { type: String, required: true, notEmpty: true, check: { minLength: 4 } }, 
			password: { type: String, required: true, notEmpty: true, check: { minLength: 6 } }, 
			admin: { type: Boolean, default: false }
	}));

module.exports = User;