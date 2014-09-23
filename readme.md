`connect` returns a promise of a connection. It has these methods:

* `query` takes an SQL sting and optional parameters, returning a promise of the result.
* `end` disconnects.
* `queryGenerated` takes a `node-sql`-object, returning a promise of the result.
* insert (tableDefinition, objectOrArray) - takes a `node-sql` table definition and an object to insert.

Basic example:

```js
progres.connect(conString).then(function (client) {

	return client
		.query(SQL)
		.finally(client.end);

}).done();
```




An example Express route:
	
```js
var connectionString =
	'postgres://user:password@localhost/database';

var posts = sql.define({
	name: 'posts',
	columns: [
		"id",
		"slug",
		"content",
		"timePublished",
		"keywords"
	]
})

module.exports.allPosts = function (event, res) {

	progres
		.connect(connectionString)
		.then(function (client) {

			return client
				.readAll(posts)
				.finally(client.end);

		}).done(function () {

			res.end();

		}, function (error) {

			res.send(500);
			console.error(
				'Error in allPosts:',
				error
			);
		});
}
``