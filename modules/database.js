var
	mongoose	= require('mongoose');

module.exports = {
	mongoose: mongoose,
	connection: mongoose.connection,
	connect: () => {
		if(mongoose.connection.readyState === 0) {
			mongoose.connect(process.env.MONGOLAB_URI, function (err, res) {
				if (err) {
					console.log('DB Connection Error', err)
				} else {
					console.log('DB Connection success')
				}
			});
		 }
		else;
	}
}