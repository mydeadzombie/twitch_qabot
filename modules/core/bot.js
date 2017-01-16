const
	config	= require('../../config');
var 
	Emitter = require('component-emitter'),
	database	= require('../database'),
	models = require('../../models/qa');

Emitter(Bot.prototype);

function Bot () {
	if (!(this instanceof Bot)) return new Bot();

	this.dictionary = {};
	this.blacklist = [];
	this.re = {
		cyrillic: /[^a-zа-яр-юё\s]/g,
		multiwhitespace: / +/,
		direct: /^(!bot|@botname)( |,|:|$)/i,
	};
	this.answer = false;
}

Bot.prototype.analyze = function (user, message) {
	message = message.toLowerCase();
	user = user.toLowerCase();

	if(message.search(this.re.direct) > -1) {	
		message = message.replace(this.re.multiwhitespace, ' ').replace(this.re.direct, '');
		if(message != '' && message != '?')
			message = message.replace(this.re.cyrillic, '').replace(this.re.multiwhitespace, ' ')

		this.emit('bot answer',this.getAnswerByQuestion(user, message));
	}
};

/**
*
* Questions & Answers. 
*/

Bot.prototype.getAnswerByQuestion = function (user, message) {
	var answer = false;

	for(group in this.dictionary) {
		if(this.dictionary.hasOwnProperty(group) && this.dictionary[group].qpatterns !== undefined) {
			var i = this.dictionary[group].qpatterns.length - 1;
			for (i; i >= 0; i--) {
				if(message.match(new RegExp('^'+this.dictionary[group].qpatterns[i])) !== null) {
					answer = this.dictionary[group].answers[Math.floor(Math.random() * this.dictionary[group].answers.length)].replace('{username}', user);
					break;
				}
			}
			if(answer !== false)
				break;
		}
	}

	if(answer === false || answer === undefined)
		if(this.dictionary.hasOwnProperty('randomanswer'))
			answer = this.dictionary.randomanswer.answers[Math.floor(Math.random() * this.dictionary[group].answers.length)].replace('{username}', user);

	return answer;
};

Bot.prototype.setDictionary = function (dictionary) {
	this.dictionary = dictionary;
};

Bot.prototype.getDictionary = function() {
	return this.dictionary;
};

Bot.prototype.loadQuestions = function (req, res, next) {
	if(!database.mongoose) throw new Error('Mongoose require!');

	if(database.mongoose.connection.readyState === 0)
		return next();

	var 
		groups = this.dictionary, self = this;

	models.Question.find({}).exec(function(err, rows) {
		if(err) {
			// console.log('Q find error', err);
		} else  {

			rows.forEach(function (row) {
				if(!groups.hasOwnProperty(row.code))
					groups[row.code] = {};
				groups[row.code].qid = row._id;
				groups[row.code].qpatterns = row.qpatterns;
			})
		}

		self.setDictionary(groups);
		return next();
	});
},

Bot.prototype.loadAnswers = function (req, res, next) {
	if(!database.mongoose) throw new Error('Mongoose require!');

	if(database.mongoose.connection.readyState === 0)
		return next();

	var 
		groups = this.dictionary, self = this;

	models.Answer.find({}).exec(function(err, rows) {
		if(err) { 
			// console.log('A find error', err);
		} else {

			for (var i = rows.length - 1; i >= 0; i--) {
				for (var j = rows[i].code.length - 1; j >= 0; j--) {
					if(!groups.hasOwnProperty(rows[i].code[j]))
						groups[rows[i].code[j]] = { answers:[] };
					else if(!groups[rows[i].code[j]].hasOwnProperty('answers'))
						groups[rows[i].code[j]].answers = [];

					groups[rows[i].code[j]].aid = rows[i]._id;
					// groups[rows[i].code[j]].answers = groups[rows[i].code[j]].answers.concat(rows[i].answers);
					groups[rows[i].code[j]].answers = rows[i].answers;
				};
			};
		}

		self.setDictionary(groups);
		return next();
	});
}

module.exports = {
	'Bot':Bot,
	'command':'!bot'
};