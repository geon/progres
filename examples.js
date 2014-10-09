
var progres = require("progres");

var connectionString = "postgres://localhost";

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

		return client.insert(usersTable, user);
	});
	
}).done();
