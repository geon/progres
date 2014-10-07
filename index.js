"use strict";

var pg = require('pg');
var Q = require('q');

// TODO: Switch to connection pooling?
// Transactions with pooling is kind of difficult to get right. Must 
// have an automatic api for it then, since you can't have all that
// code on the api consumer side.
// https://github.com/brianc/node-postgres/wiki/Transactions

module.exports = {

	connect: function (connectionString) {

		var client = new pg.Client(connectionString);

		return Q.nbind(client.connect, client)().then(function () {

			return {

				end: function () {

					client.end();
				},


				query: query,


				queryGenerated: queryGenerated,


				insert: function (tableDefinition, objectOrArray) {

					return Q().then(function () {
					
						return queryGenerated(
							tableDefinition
								.insert(objectOrArray)
						);
					});
				},


				deleteWhere: function (tableDefinition, conditions) {

					return Q().then(function () {

						return queryGenerated(
							tableDefinition
								.delete()
								.where(conditions)
						);
					});
				},


				readOneWhere: function (tableDefinition, conditions) {

					return Q().then(function () {

						return queryGenerated(
							tableDefinition
								.select()
								.where(conditions)
						).then(function (rows) { return rows[0]; });
					});
				},


				readAll: function (tableDefinition) {

					return Q().then(function () {

						return queryGenerated(
							tableDefinition
								.select()
						);
					});
				}
			};

			function query (SQL, parameters) {

				// Wrap with Q().then to make exceptions work.
				var outerArguments = arguments;
				return Q().then(function () {

					return Q
						.nbind(client.query, client)(SQL, parameters)
						.catch(function (error) {

							// Just a convenient place to log this.
							error.SQL        = SQL;
							error.parameters = parameters;

							// Rethrow the error since it wasn't handled.
							throw error;

						}).then(function (result) {

							return result.rows;
						});
				});
			}

			function queryGenerated (generated) {

				return Q().then(function () {

					var SQLAndValues = generated.toQuery();

					return query(SQLAndValues.text, SQLAndValues.values);
				});
			}
		});
	}
};
