"use strict";

var progres = require("./index.js");

progres.connect("postgres://localhost").then(function (client) {

	return client.query("SELECT 'passed' AS result").then(function (rows) {

		if (rows[0].result != "passed") {

			throw new Error("Didn't pass.");
		}

	}).finally(client.end);

}).done(function () {

	console.log("Everything OK.");

}, function (error) {

	console.error(error);
});
