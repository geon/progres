Progres
=======

[`progres`](node_modules/progres/readme.md) is a Node.js module to wrap [`node-postgres`](https://github.com/brianc/node-postgres) in a nice, promise based interface.

The add-on modules [`progres-transaction`](progres-transaction/readme.md) and [`progres-convenience`](progres-convenience/readme.md) provides some non-essential functionality.

Basic example
-------------

```
var progres = require('progres');

progres.connect(connectionString, function (client) {

	return client.query('SELECT NOW() AS time').then(function (rows) {
	
		console.log('Time is ' + rows[0].time);
	});

}).done();
```

API
---

### progres.connect(connectionString, job)


* `connectionString` - The postgres connection string.
* `job` - A callback where you do the actual work. It' single argument is a `ProgresClient` instance, and it **must return a promise**. It may not use the `ProgresClient` instance outside the chain of the returned promise, since the database connection is released automatically when the `job`'s returned promise resolves.

Return value: The promise returned by your `job` callback.
	
### ProgresClient

You are not supposed to create instances of `ProgresClient` yourself. It is passed to you in the argument to your `job` callback in `progres.connect`. Assuming it is named `client`:

#### client.query(SQL, parameters)

This is a promisified proxy to the `client.query(SQL, parameters, callback)` method of `node-postgres`.

* `SQL` - The query to execute.
* `parameters` - Optional parameters for prepared statements.

Return value: A promise, resolved with the resulting rows from the SQL statement.

progres-transaction
-------------------

The `progres-transaction` module adds automatic transaction handling.

```
var progres = require('progres-transaction');

progres.transaction(connectionString, function (client) {

	// Queries executed here are automatically wrapped in a transaction.
	
}).done();
```

### progres.transaction(connectionString, job)

This method works just like `progres.connect(connectionString, job)`, but is wrapped in a transaction. If the promise returned by `job` resolves, the transaction is committed. If it is rejected, the transaction is rolled back.

progres-convenience
-------------------

The `progres-convenience` module adds a few methods to `ProgresClient` for common tasks, using `node-sql` for SQL generation.

```
var progres = require('progres-convenience');
var sql = require('sql');

var userTable = sql.define({
	name: 'user',
	columns: ['id', 'name', 'email']
});

var user = {
	name: 'geon',
	email: 'victor@topmost.se'
};

progres.connect(connectionString, function (client) {

	return client.insert(userTable, user);

}).done();
```

#### client.insert(tableDefinition, objectOrObjects)

* `tableDefinition` - A [`node-sql`](https://github.com/brianc/node-sql) table definition.
* `objectOrObjects` - An object, or an array of objects to insert into the table defined by `tableDefinition`.

Return value: A promise.

#### etc...

Combining Transactions And Convenience
--------------------------------------

They are designed to work well together. Just require both `progres-transaction` and `progres-convenience`, and you are set. Internally, they both monkey-patch `progres` to extend it, so they all return the same module object.

All variations below are equivalent:

```
var progres = require('progres-transaction');
require('progres-convenience');
```

```
require('progres-transaction');
var progres = require('progres-convenience');
```

```
var progres = require('progres');
require('progres-transaction');
require('progres-convenience');
```
