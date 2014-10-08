"use strict";

var progres = require('./index.js');
var Q = require('q');


// Just add a bunch of methods to ProgresClient.

progres.ProgresClient.prototype.queryGenerated = function (generated) {

	var THIS = this;

	// Wrap with Q().then to make exceptions work.
	return Q().then(function () {

		var SQLAndValues = generated.toQuery();

		return THIS.query(SQLAndValues.text, SQLAndValues.values);
	});
};


progres.ProgresClient.prototype.insert = function (tableDefinition, objectOrArray) {

	var THIS = this;

	return Q().then(function () {
	
		return THIS.queryGenerated(
			tableDefinition
				.insert(objectOrArray)
		);
	});
};


progres.ProgresClient.prototype.deleteWhere = function (tableDefinition, conditions) {

	var THIS = this;

	return Q().then(function () {

		return THIS.queryGenerated(
			tableDefinition
				.delete()
				.where(conditions)
		);
	});
};


progres.ProgresClient.prototype.readOneWhere = function (tableDefinition, conditions) {

	var THIS = this;

	return Q().then(function () {

		return THIS.queryGenerated(
			tableDefinition
				.select()
				.where(conditions)
		).then(function (rows) { return rows[0]; });
	});
};


progres.ProgresClient.prototype.readAll = function (tableDefinition) {

	var THIS = this;

	return Q().then(function () {

		return THIS.queryGenerated(
			tableDefinition
				.select()
		);
	});
};


module.exports = progres;
