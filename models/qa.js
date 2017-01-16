var mongoose = require('mongoose');

var 
	Question = mongoose.model('MQuestions', 
		new mongoose.Schema({
			code: { type: String, required: true, notEmpty: true, check: { minLength: 3 }},
			qpatterns: [{ type: String, required: true, notEmpty: true, check: { minLength: 2 }}]
		})),
	Answer = mongoose.model('MAnswers', 
		new mongoose.Schema({
			code: [{ type: String, required: true, notEmpty: true, check: { minLength: 3 }}],
			answers: [{ type: String, required: true, notEmpty: true, check: { minLength: 2 }}]
		}));

module.exports = { 'Question': Question, 'Answer': Answer };