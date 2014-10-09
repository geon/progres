"use strict";

var pg = require('pg');
var Q = require('q');

// TODO: Switch to connection pooling?
// Transactions with pooling is kind of difficult to get right. Must 
// have an automatic api for it then, since you can't have all that
// code on the api consumer side.
// https://github.com/brianc/node-postgres/wiki/Transactions

function ProgresClient (postgresClient) {

	this.postgresClient = postgresClient;
}


ProgresClient.prototype.query = function (SQL, parameters) {

	return Q
		.nbind(this.postgresClient.query, this.postgresClient)(SQL, parameters)
		.catch(function (error) {

			// Add some useful info.
			error.SQL        = SQL;
			error.parameters = parameters;

			// Rethrow the error since it wasn't handled.
			throw error;

		})
		.then(function (result) {

			return result.rows;
		});
};


module.exports = {

	connect: function (connectionString, job) {

		var postgresClient = new pg.Client(connectionString);

		return (
			// Connect.
			Q.nbind(postgresClient.connect, postgresClient)()

			// Do the job.
			.then(function () {

				var jobResult = job(new ProgresClient(postgresClient));

				if (!Q.isPromiseAlike(jobResult)) {

					var error = new Error([
						"A progres job callback returned a non-promise. ",
						"That can cause the database connection to close ",
						"before you are done using it. That is bad."
					].join(""));
					error.jobResult = jobResult;

					throw error;
				}

				return jobResult;
			})

			// Disconnect.
			.finally(function () {

				postgresClient.end();
			})
		);
	},

	ProgresClient: ProgresClient
};