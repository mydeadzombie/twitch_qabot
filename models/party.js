var mongoose = require('mongoose');

var 
	Party = mongoose.model('Party', 
		new mongoose.Schema({
			key: { type: String, required: true, notEmpty: true, check: { minLength: 4 }, default: 'party' },
			partylist: [{ type: String, required: true, notEmpty: true, check: { minLength: 4 } }], 
	}));

module.exports = Party;