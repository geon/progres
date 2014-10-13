
var Q = require('q');
var progres = require('progres');

var connectionString = 'postgres://localhost';

// Do a simple query and print the result.
progres.connect(connectionString, function (client) {

	return client.query('SELECT NOW() AS time').then(function (rows) {

		console.log('Time is ' + rows[0].time);
	});

}).done();




require('progres-convenience');
var sql = require('sql');

var usersTable = sql.define({
	name: 'users',
	columns: [
		{name: 'id', dataType: 'SERIAL PRIMARY KEY'},
		{name: 'name', dataType: 'TEXT'},
		{name: 'email', dataType: 'TEXT'}
	]
});

var user = {
	name: 'geon',
	email: 'victor@topmost.se'
};

progres.connect(connectionString, function (client) {

	return client.queryGenerated(usersTable.create().ifNotExists()).then(function () {

		return [

			// Insert a single object.
			function () {

				return client.insert(usersTable, user).then(function (insertedRow) {

					console.log('Inserted row:', insertedRow);
				});
			},

			// Insert multiple objects at once.
			function () {

				return client.insert(usersTable, [user, user]).then(function (insertedRows) {

					console.log('Inserted rows:', insertedRows);
				});
			},

			// Update.
			function () {

				return client
					.update(usersTable, '1 = 1', {name: 'anonymous'})
					.then(function (updatedRows) {

						console.log('Updated rows:', updatedRows);
					});
			}
		]
			// Run in sequence.
			.reduce(function (soFar, next) { return soFar.then(next); }, Q());
	});

}).done();
