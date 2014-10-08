"use strict";

var pg = require('pg');
var Q = require('q');

// TODO: Switch to connection pooling?
// Transactions with pooling is kind of difficult to get right. Must 
// have an automatic api for it then, since you can't have all that
// code on the api consumer side.
// https://github.com/brianc/node-postgres/wiki/Transactions

function ProgresClient (pgClient) {

	this.pgClient = pgClient;
}


ProgresClient.prototype.query = function (SQL, parameters) {

	return Q
		.nbind(this.pgClient.query, this.pgClient)(SQL, parameters)
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

		var client = new pg.Client(connectionString);

		return Q.nbind(client.connect, client)().then(function () {

			return job(new ProgresClient(client)).finally(function () {

				client.end();
			});
		});
	},

	ProgresClient: ProgresClient
};
