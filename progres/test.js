"use strict";

var Q = require('q');
var progres = require("./index.js");

var connectionString = "postgres://localhost";

[

	// Errors in the job should propagate.
	function () {

		return progres.connect(connectionString, function (client) {

			// Exception in the job.
			throw "passed";

		}).then(function () {

			// This should never execute.
			throw new Error("Errors in the job should propagate.");

		}, function (error) {

			// Is it the error thrown in the job?
			if (error !== "passed") {

				// Unexpected error.
				throw error;
			}
		})
	},


	// postgresClient.end() should be called after the job is done.
	function () {

		var calledEnd = false;

		return progres.connect(connectionString, function (client) {

			// Attach a hook directly to the postgres client.
			var oldEnd = client.postgresClient.end;
			client.postgresClient.end = function () {

				oldEnd.call(client.postgresClient);

				calledEnd = true;
			};

			return Q();

		}).then(function () {

			if (!calledEnd) {

				throw new Error("postgresClient.end() should be called after the job is done.");
			}
		})
	},


	// Queries should return the resulting rows.
	function () {

		return progres.connect(connectionString, function (client) {

			// Run a query.
			return client.query("SELECT 'passed' AS column_name;").then(function (rows) {

				// Ensure we get the expected result back.
				if (rows[0].column_name !== "passed") {

					throw new Error("Queries should return the resulting rows.");
				}
			});
		})
	},


	// Broken SQL should propagate the error.
	function () {

		return progres.connect(connectionString, function (client) {

			var brokenSql = "broken sql";

			// Run a broken query.
			return client.query(brokenSql).then(function () {

				// This should never execute.
				throw new Error("Broken SQL should propagate the error.");

			}, function (error) {

				// The broken SQL should be part of the thrown error.
				if (error.SQL !== brokenSql) {

					throw new Error("Queries should return the resulting rows.");
				}
			})
		})
	},


	// Broken SQL should propagate the error.
	function () {

		return progres.connect(connectionString, function (client) {

			var brokenSql = "broken sql";

			// Run a query.
			return client.query(brokenSql).then(function () {

				throw new Error("Broken SQL should propagate the error.");

			}, function (error) {

				// The broken SQL should be part of the thrown error.
				if (error.SQL !== brokenSql) {

					throw new Error("Queries should return the resulting rows.");
				}
			})
		})
	},


	// An exception should be thrown if the job doesn't return a promise.
	// (Or the client might be ended prematurely - dangerous.)
	function () {

		return progres.connect(connectionString, function (client) {

			// Break the rule about returning promises.
			return "not a promise";

		}).then(function () {

			// This should never execute.
			throw new Error("An exception should be thrown if the job doesn't return a promise.");

		}, function (error) {

			// Passed the test.
		})
	}

]
	// Run in sequence.
	.reduce(function (soFar, next) { return soFar.then(next); }, Q())
	.done(function () {

		console.log("Everything OK.");

	}, function (error) {

		console.error(error);
		process.exit(1);
	});
