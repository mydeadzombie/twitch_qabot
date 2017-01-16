var
	models = require('../../models/qa');

module.exports = {
	main: function (req, res) {
		var
			notice_class = req.session.notice.class || 'hide',
			notice_msg = req.session.notice.msg || '';

		req.session.notice = {};

		res.render('qaform', { title: 'Mind constructor | Questions&Answers', groups: req.dict, notice_class: notice_class, notice_msg: notice_msg });
	},
	submit: function (req,res) {
		req.session.notice = {};
		if(req.body.hasOwnProperty('answers'))
			if(req.body.hasOwnProperty('_aid'))
				models.Answer.update({ _id: req.body._aid }, { code: req.body.code, answers: req.body.answers },{upsert: true}, function (err,res) {
					if(err)
						req.session.notice = { 'msg': 'A Updates Problem :(', 'class': 'alert alert-warning text-center' };
				});
			else
				models.Answer.create({ code: req.body.code, answers: req.body.answers },function (err,res) {
					if(err)
						req.session.notice = { 'msg': 'A Create Problem :(', 'class': 'alert alert-warning text-center' };
				});

		if(req.body.hasOwnProperty('qpatterns'))
			if(req.body.hasOwnProperty('_qid'))
				models.Question.update({ _id: req.body._qid }, { code: req.body.code, qpatterns: req.body.qpatterns },{upsert: true}, function (err,res) {
					if(err)
						req.session.notice = { 'msg': 'Q Updates Problem :(', 'class': 'alert alert-warning text-center' };
				});
			else
				models.Question.create({ code: req.body.code, qpatterns: req.body.qpatterns },function (err,res) {
					if(err)
						req.session.notice = { 'msg': 'Q Create Problem :(', 'class': 'alert alert-warning text-center' };
				});

			return res.redirect('/constructor');
	}
};