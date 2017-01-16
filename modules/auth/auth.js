var
	User = require('../../models/user'),
	jwt = require('jsonwebtoken');

module.exports = {
	authenticate: function (req,res,next) {
		var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.session.token;
		
		if(req.path === '/auth' || req.path === '/')
			return next();
		else if(req.session !== undefined && token){
			console.log('Verify auth params...');
			jwt.verify(token, process.env.SESSION_SECRET, function(err, decoded) {
				if (err) {
					console.log('Auth error...');
					req.session.notice.msg = 'Failed to authenticate token.';
					req.session.notice.class = 'alert alert-warning text-center';

					return res.redirect('/');
				} else {
					console.log('Auth success.');
					req.session.decoded = decoded;
					return next();
				}
			});
		} else {
			console.log('Not authorized connect...');
			req.session.notice.msg = 'No token provided.';
			req.session.notice.class = 'alert alert-warning text-center';

			return res.redirect('/');
		}
	},
	login: function (req,res,next) {
		var
			notice_class = req.session.notice.class || 'hide',
			notice_msg = req.session.notice.msg || '';
		
		req.session.notice = {};
		if(req.session.decoded)
			return res.redirect('/auth/success');
		else
			res.render('form', { title: 'Login', h2: 'Welcome to the bonfire, Unkindled One.', notice_class: notice_class, notice_msg: notice_msg });
	},
	submit: function (req,res,next) {
		User.findOne({ name: req.body.login }, function(err, user) {
			if (err) throw err;
			
			if (!user) {
				req.session.notice.msg = 'User not found.';
				req.session.notice.class = 'alert alert-danger text-center';

				return res.redirect('/');
			} else if (user) {
					if (user.password != req.body.password) {
						req.session.notice.msg = 'Warning!'; /*'Wrong password.';*/
						req.session.notice.class = 'alert alert-warning text-center';

						return res.redirect('/');
					} else {
						var token = jwt.sign(user, process.env.SESSION_SECRET, { expiresIn: "1d" });
						req.session.token = token;
						req.session.username = user.name;

						return res.redirect('/auth/success');
					}
			}
		});
	},
	success: function (req, res, next) {
		res.render('success', { title: 'Success', h2: 'Welcome Home, ashen one. Speak thine heart’s desire.'});
	}
};