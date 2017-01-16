const
	config	= require('./config'),
	app			= require('express')(),
	http		= require('http').Server(app),
	io			= require('socket.io')(http),

	session 			= require('express-session'),
	MongoStore 		= require('connect-mongo')(session)
	cookieParser 	= require('cookie-parser'),
	bodyParser 		= require('body-parser'),
	crypto 				= require('crypto'),
	fs 						= require('fs'),

	auth 				= require('./modules/auth/auth'),
	database		= require('./modules/database'),
	core				= require('./modules/core/core')(io);

try { require("./env"); } catch(e) {}

app.set('port', (process.env.PORT || 3000));
app.set('view engine', 'jade');

app.use(session({
    key: 'session',
    secret: process.env.SESSION_SECRET,
    store: new MongoStore({ mongooseConnection: (() => { database.connect(); return database.connection; })() }),
    resave: true,
    saveUninitialized: true
}))
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/public',require('express').static('public'));
app.use(function (req,res,next) { req.session.notice = req.session.notice || {}; return next(); });

http.listen(app.get('port'), function(){
	// console.log('Listening on: ' + app.get('port'));
});

app.all('/', auth.authenticate, auth.login);

app.get('/auth',function (req,res){ return res.redirect('/'); });
app.post('/auth', auth.submit);
app.all('/auth/success', auth.authenticate, auth.success);

app.get('/constructor', auth.authenticate, function (req,res) {
	res.render('qaform',{});
});

app.all('/control',
	auth.authenticate,
	core.loadparty.bind(core), core.init.bind(core), core.loadq, core.loada,
	function (req,res) {
		res.render('main', {
			title: 'Main',
			username: req.session.username
		});
	});