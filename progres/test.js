"use strict";

var Q = require('q');
var progres = require("./index.js");


// Connect to postges.
progres.connect("postgres://localhost", function (client) {

	// Run a query.
	return client.query("SELECT 'passed' AS result").then(function (rows) {

		// Ensure we get the expected result back.
		if (rows[0].result != "passed") {

			throw new Error("Didn't pass.");
		}
	});
})
.done(function () {

	console.log("Everything OK.");

}, function (error) {

	console.error(error);
	process.exit(1);
});
