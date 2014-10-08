"use strict";

var progres = require('progres');
var Q = require('q');


// Monkey-patch progres with transaction functionality.


progres.transaction = function (connectionString, job) {

	return progres.connect(connectionString, function (client) {

		return Q()
			.then(function () {

				return client.query("BEGIN;");
			})
			.then(function () {

				// Do the actual work.
				return job(client);
			})
			.then(function (jobResult) {

				return client.query("COMMIT;").then(function () {

					// The job result should be returned
					// to the API consumer.
					return jobResult
				});
			})
			.catch(function (error) {

				// This would actually be done ayway by node-postgres,
				// when the client is ended, but it's more proper to
				// handle it here.
				return client.query("ROLLBACK;").then(function () {

					// Rethrow since it wasn't handled.
					throw error;
				});
			});
	});
};

module.exports = progres;
