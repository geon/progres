"use strict";

var Q = require('q');
var sql = require("sql");
var progres = require("./index.js");

// Monkey-patch progres with extra functionality.
require("./progres-generated-sql.js");
require("./progres-transaction.js");

Q.all([
	progres.connect("postgres://localhost", function (client) {

		var handwrittenSQL = "SELECT 'passed' AS result";

		return client.query(handwrittenSQL).then(function (rows) {

			if (rows[0].result != "passed") {

				throw new Error("Didn't pass.");
			}
		});
	}),

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
	}),

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
