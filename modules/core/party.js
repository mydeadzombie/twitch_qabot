const
	config	= require('../../config');

var 
	Emitter = require('component-emitter'),
	database	= require('../database'),
	model = require('../../models/party');

Emitter(Party.prototype);

var
	re = { 		
		actions: {
			join: 	/^!party$/,
			common: /^!party (list|leave)$/,
			owners: /^!party (add|remove|up|disband) (\w+)$/,
		}
	},
	partylist = [];

function Party () {
	if (!(this instanceof Party)) return new Party();
}

/**
*
* Party.
*/

Party.prototype.isOwner = function(username) {
	return config.owners.indexOf(username) > -1;
};

Party.prototype.actionSwitch = function(cmd, user) {
	switch (cmd[1]){
		case 'list':
			return this.partyListStr();
			break;
		case 'leave':
			return this.partyLeave(user);
			break;
		case 'add':
			return this.partyAddUser(cmd[2]);
			break;
		case 'remove':
			return this.partyRemoveUser(cmd[2]);
			break;
		case 'up':
			return this.partyUpUser(cmd[2]);
			break;
		case 'disband':
			return this.partyDisbandGroup(cmd[2]);
			break;
		default:
			return 'Вот это поворот...';
			break;
	}
};

Party.prototype.analyze = function(user, message) {
	var 
		response = false;

	if(this.isOwner(user)) {
		if ((cmd = message.match(re.actions.common)) !== null) {
			
			response = 'By the hand of St.Owner: ' + this.actionSwitch(cmd, user);
		} else if((cmd = message.match(re.actions.owners)) !== null) {
				
			response = this.actionSwitch(cmd, user);
		}
	} else {
		if ((cmd = message.match(re.actions.join)) !== null) {
			
			response = this.partyRequest(user);
		} else if((cmd = message.match(re.actions.common)) !== null) {
			
			response = this.actionSwitch(cmd, user);
		}
	}

	this.emit('party message', response);
};

Party.prototype.partyRequest = function(user) {
	if(partylist.indexOf(user) > -1) {

		return 'Вы уже записались в пати. Не надо пытаться сделать это снова.';
	} else {
		if(partylist.length >= 9) {
			
			return 'Свободных мест нет :(';
		} else {
			partylist.push(user);
			this.emit('party update', partylist);
			
			return 'Поздравляю, @' + user + ', Вы вступили в партию!';
		}
	}
};

Party.prototype.partyUpUser = function(user) {
	if(partylist.indexOf(user) > -1) {
		partylist.splice(partylist.indexOf(user), 1);
		partylist.splice(0,0,user);

		this.emit('party update', partylist);
	}
};

Party.prototype.partyLeave = function(user) {
	if(partylist.indexOf(user) > -1) {
			partylist.splice(partylist.indexOf(user), 1);
			this.emit('party update', partylist);

			return 'Вы, @'+user+', отписались.'
	} else {
		return 'Вам не уйти!'
	}
};

Party.prototype.partyListStr = function() {
	if(partylist.length === 0) {

		return 'Party has no members.';
	} else {

		return 'Party members: ' + partylist.join(', ');
	}
};

Party.prototype.getPartylist = function() {
	
	return partylist;
};

Party.prototype.partyAddUser = function(username) {

	return 'По велению Высших Сил, ' + this.partyRequest(username);
};

Party.prototype.partyRemoveUser = function(username) {

	return 'По велению Высших Сил, ' + this.partyLeave(username);
};

Party.prototype.partyDisbandGroup = function(size) {
	if(parseInt(size) > 0) {
		partylist = partylist.slice(size, partylist.length);
		this.emit('party update', partylist);

		return 'Часть добровольцев была распущена.';
	} else {

		return 'Как так-то? Необходимо сообщить в соответствующие инстанции.';
	}

};


Party.prototype.dbPartyUpdate = function() {
	model.update({ key: "party" },{ partylist: partylist },{upsert: true}, function (err,res) {
		if(err);
		});
};

Party.prototype.dbGetPartylist = function(req, res, next) {
	if(!database.mongoose) return next();

	if(database.mongoose.connection.readyState === 0) return next();

	model.find({key:'party'}).exec(function(err, rows) {
		if(err) {
			// ...
		} else  {
			partylist = rows[0].partylist;
			
			return next();
		}
	});
};

module.exports = {
	'Party':Party,
	'command':'!party'
};