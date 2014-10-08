`connect` returns a promise of a completed job. It takes the connection string, and a "job" callback.

The job callback takes an argument with a ProgresClient object. It has this method:

* `query` takes an SQL sting and optional parameters, returning a promise of the result.

The job callback *must return a promise*. It may not use the ProgresClient object outside the promise chain, since the database connection is released automatically when the job's returned promise resolves.


Basic example:

```js
progres.connect(conString, function (client) {

	return client
		.query(SQL);

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
		.connect(connectionString, function (client) {

			return client
				.readAll(posts);

		}).then(function (posts) {

			res.end(JSON.stringify(posts));

		}).done(null, function (error) {

			res.send(500);
			console.error(
				'Error in allPosts:',
				error
			);
		});
}
```
