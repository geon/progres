"use strict";

var Q = require('q');
var progres = require("./index.js");
var progresGenerated = require("./progres-generated-sql.js");
var sql = require("sql");
var progresTransaction = require("./progres-transaction.js");

Q.all([
	progres.connect("postgres://localhost", function (client) {

		var handwrittenSQL = "SELECT 'passed' AS result";

		return client.query(handwrittenSQL).then(function (rows) {

			if (rows[0].result != "passed") {

				throw new Error("Didn't pass.");
			}
		});
	}),

	progresGenerated.connect("postgres://localhost", function (client) {

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

	progresTransaction.transaction("postgres://localhost", function (client) {

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
