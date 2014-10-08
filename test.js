"use strict";

var Q = require('q');
var progres = require("./index.js");
var progresGenerated = require("./progres-generated-sql.js");
var sql = require("sql");

Q.all([
	progres.connect("postgres://localhost").then(function (client) {

		var handwrittenSQL = "SELECT 'passed' AS result";

		return client.query(handwrittenSQL).then(function (rows) {

			if (rows[0].result != "passed") {

				throw new Error("Didn't pass.");
			}

		}).finally(client.end);
	}),

	progresGenerated.connect("postgres://localhost").then(function (client) {

		var generatedSQL = {toQuery: function () { return {
			text: "SELECT $1::text AS result",
			values: ["passed"]
		};}};

		return client.queryGenerated(generatedSQL).then(function (rows) {

			if (rows[0].result != "passed") {

				throw new Error("Didn't pass.");
			}

		}).finally(client.end);
	})

]).done(function () {

	console.log("Everything OK.");

}, function (error) {

	console.error(error);
});
