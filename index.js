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

	// `end` is a bit special. I want it to be passed as a callback, 
	// so it must be bound to `this`, or close over pgClient directly.
	this.end = function () {

		pgClient.end();
	};
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

	connect: function (connectionString) {

		var client = new pg.Client(connectionString);

		return Q.nbind(client.connect, client)().then(function () {

			return new ProgresClient(client);
		});
	},

	ProgresClient: ProgresClient
};
