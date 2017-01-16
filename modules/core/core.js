"use strict"

const
	config	= require('../../config');

var
	irc			= require("irc"),
	escape	= require('escape-html'),

	// -Plugins-------------------
	plugins = {
		'bot'				: require("./bot"),
		'party'			: require("./party"),

		'dagon'	: require("./plugins/dagon"),
	},

	// -Base----------------------
	bot				= plugins.bot.Bot(),
	party			= plugins.party.Party(),

	// -Custom--------------------
	dagon	= plugins.dagon.obj(),

	commands = {},
	
	re_cmd = /^$/i,
	// ---------------------------
	
	irclient, io,

	// REWRITE! -------------------
	say = (msg) => {
		if(irclient !== undefined && msg !== undefined && msg !== false) {
			irclient.say(config.channels[0],msg);
			io.emit('chat message', {user:'botname',text:msg});
		}
	},
	parseMessage = (user, message) => {
		var command = message.match(re_cmd);

		if(command !== null)
			commands[command[1]].analyze(user, message);
	};
	// ----------------------------


function Core(sck) {
	if (!(this instanceof Core)) return new Core(sck);
	if ('object' == typeof sck) {
		io = sck;
	}
	io = sck;

	commands[plugins.bot.command] = bot;
	commands[plugins.party.command] = party;
	commands[plugins.dagon.command] = dagon;

	re_cmd = new RegExp('^(' + Object.keys(commands).join('|') + ')( |$)');
}

Core.prototype.control = function(req,res) {
	res.render('control', { title: 'Control', message: ''});
};

Core.prototype.loadq = bot.loadQuestions.bind(bot);
Core.prototype.loada = bot.loadAnswers.bind(bot);
Core.prototype.loadparty = party.dbGetPartylist.bind(party);

Core.prototype.dict = function(req,res,next) {
	req.dict = bot.getDictionary();

	return next();
};

Core.prototype.init = function(req, res, next) {
	if(!io) throw new Error('IO undefined');

	if(irclient !== undefined) {
		if(irclient.conn.destroyed)
			irclient.connect();

		return next();
	}

	irclient = new irc.Client(config.server, config.botName, {
			channels: [config.channels + " " + config.token],
			debug: false,
			password: config.token,
			username: config.botName
		});

	irclient.addListener("message", (from, to, text, message) => {
		io.emit('chat message', {user:from,text:escape(text)});

		parseMessage(from, text);
	});
	irclient.addListener("ctcp", (from, to, text,type, message) => {
		io.emit('chat action', {user:from,text:escape(text)});
	});

	// socket ----------------------
	io.on('connection', (socket) => {
		io.emit('party update', party.getPartylist());

		socket.on('chat message', (msg) => {
			io.emit('chat message', msg);

			if(irclient !== undefined)
				irclient.say(config.channels[0],msg);
		});

		socket.on('chat say', say);

		socket.on('party remove', (user) => {
			party.analyze(config.owners[0],'!party remove '+user);
		});

		socket.on('party disband', () => {
			party.analyze(config.owners[0],'!party disband 9');
		});

		socket.on('irc disconnect', (msg) => {
			if(irclient !== undefined) {
					irclient.say(config.channels[0],'Goodbye, cruel world!');
				irclient.disconnect();
			}
		});
	});

	// bot -------------------------
	bot.on('bot answer', say);

	// party -----------------------
	party.on('party update', (partylist) => {
		io.emit('party update', party.getPartylist());
		party.dbPartyUpdate();
	});

	party.on('party message', say);

	// plugins----------------------
	dagon.on('command recieve', say);

	return next();
};

module.exports = Core;