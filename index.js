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


ProgresClient.prototype.queryGenerated = function (generated) {

	var THIS = this;

	// Wrap with Q().then to make exceptions work.
	return Q().then(function () {

		var SQLAndValues = generated.toQuery();

		return THIS.query(SQLAndValues.text, SQLAndValues.values);
	});
};


ProgresClient.prototype.insert = function (tableDefinition, objectOrArray) {

	var THIS = this;

	return Q().then(function () {
	
		return THIS.queryGenerated(
			tableDefinition
				.insert(objectOrArray)
		);
	});
};


ProgresClient.prototype.deleteWhere = function (tableDefinition, conditions) {

	var THIS = this;

	return Q().then(function () {

		return THIS.queryGenerated(
			tableDefinition
				.delete()
				.where(conditions)
		);
	});
};


ProgresClient.prototype.readOneWhere = function (tableDefinition, conditions) {

	var THIS = this;

	return Q().then(function () {

		return THIS.queryGenerated(
			tableDefinition
				.select()
				.where(conditions)
		).then(function (rows) { return rows[0]; });
	});
};


ProgresClient.prototype.readAll = function (tableDefinition) {

	var THIS = this;

	return Q().then(function () {

		return THIS.queryGenerated(
			tableDefinition
				.select()
		);
	});
};


module.exports = {

	connect: function (connectionString) {

		var client = new pg.Client(connectionString);

		return Q.nbind(client.connect, client)().then(function () {

			return new ProgresClient(client);
		});
	}
};
