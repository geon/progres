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

		return Q.nbind(postgresClient.connect, postgresClient)()
			.then(job(new ProgresClient(postgresClient)))
			.finally(function () {

				postgresClient.end();
			});
	},

	ProgresClient: ProgresClient
};
