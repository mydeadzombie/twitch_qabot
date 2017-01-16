"use strict"
var 
	Emitter = require('component-emitter');

Emitter(Dagon.prototype);


var
	// database	= require('../../database'),
	// player = require('../../../models/rpg/player'),

	timeout = 0,
	TO_LIMIT = 10;

function Dagon () {
	if (!(this instanceof Dagon)) return new Dagon();
}

Dagon.prototype.analyze = function(user, message) {
	if(message.match(/^!dagon$/) === null) return;

	var 
		response = false;

	if(Math.floor(Date.now() / 1000) - timeout >= TO_LIMIT) {
		this.emit('command recieve', '/me твёрдой рукой направил Дагон на ' + user + '.');

		setTimeout(
			() => { this.emit('command recieve', '/me ухмыльнулся и кастанул Orchid Malevolence на ' + user+ '. ' +user + ' в ужасе попятился назад, перебирая в голове возможные пути к спасению.') }, 
				2000);		

		setTimeout(
			() => { this.emit('command recieve', 'Congratz, ' + user + '! YOU\'VE ' +this.roll(user) ) }, 
				5000);

		timeout = Math.floor(Date.now() / 1000);
	}
};

Dagon.prototype.roll = function(user) {
	var dmg = 1;
	switch (Math.floor(Math.random() * 5)) {
		case 0:
			return 'DODGED A DAGON!';
			break;
		case 1:
			dmg = [1, 300, 400, 500, 600, 700][Math.floor(Math.random() * 5)]
			this.emit('command recieve', '/timeout '+user+' '+dmg);
			return 'TAKEN ' + dmg + ' DAMAGE BY DAGON!'
			break;
		case 2:
			return 'TAKEN ENOUGH DAMAGE TO DIE! ***Но благословение сохранило твою жизнь... в этот раз.'
			break;
		case 3:
			return 'BLOCKED ALL DAMAGE WITH BLACK KING BAR!'
			break;
		case 4:
			return 'AVOID ATTACK WITH INSANE MICRO!'
			break;

		default:
			return 'Cheater!'
			break;
	}
};

module.exports = {
	'obj':Dagon,
	'command':'!dagon'
};