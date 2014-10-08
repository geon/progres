"use strict";

var Q = require('q');
var sql = require("sql");
var progres = require('progres');

// Monkey-patch progres with convenience methods.
require('./index.js');

Q.all([
	progres.connect("postgres://localhost", function (client) {

		var generatedSQL = {toQuery: function () { return {
			text: "SELECT $1::text AS result",
			values: ["passed"]
		};}};

		return client.queryGenerated(generatedSQL).then(function (rows) {

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
