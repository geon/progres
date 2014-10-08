"use strict";

var Q = require('q');
var progres = require('./index.js');

Q.all([
	progres.transaction("postgres://localhost", function (client) {

		var handwrittenSQL = "SELECT 'passed' AS result";

		return client.query(handwrittenSQL).then(function (rows) {

			if (rows[0].result != "passed") {

				throw new Error("Didn't pass.");
			}
		});
	})
]).done(function () {

	console.log("Everything OK.");

}, function (error) {

	console.error(error);
});
