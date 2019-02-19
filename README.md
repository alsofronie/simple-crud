# Simple CRUD MySQL Database Access

### Installation

Clone the repo:

```
git clone https://github.com/alsofronie/simple-crud.git
cd simple-crud
```

Copy the `env.example` file into `.env` file and modify to reflect your database setup:

```
cp env.example .env
```

Install the dependencies:

```
npm install
```

If you have nodemon installed globally, you can run `npm run dev`. If not, simple run `npm run serve`.

### Why

We find ourselves in the course of development process that we need a simple, CRUD access to a remote database. We need to write routes, controllers, actions, domains, repositories and many more of these complicated things and, worse, many times the tasks and functions are somewhat repetitive. We all hate this.

This project wants to solve the need to implement a simple API over a MySQL (for now) database, completely **configuration based**. Just describe the tables and let the CRUD be already there for you.

Let's have an example. A table named `users` needs to have the CRUD operations exposed in the endpoints of an API. The table looks like this:

```sql
CREATE TABLE `users` (
  `id` char(36) CHARACTER SET ascii NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL,
  `level` tinyint(2) unsigned NOT NULL,
  `is_active` tinyint(1) unsigned NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

We want to have:

 * **GET** on `/api/users` for full listing,
 * **POST** on `/api/users` for create a new user,
 * **GET** on `/api/users/1234` for getting the user with the ID 1234,
 * **PUT** on `/api/users/1234` for updating the user with the ID 1234,
 * **DELETE** on `/api/users/1234` for deleting the user with the ID 1234

More, we need to hide the password from **listing** and **read** and we need to automatically update some of the fields on **create** and **update** operations.

Lets define the rules on which this table gets managed:

```js
const rulesForUsersTable = {
  name: 'users',
  key: 'id',
  fields: ['id', 'email', 'password', 'name', 'level', 'is_active', 'created_at', 'updated_at'],
  listing: {
    exclude: ['password']
  },
  read: {
    exclude: ['password']
  },
  create: {
    exclude: ['id', 'created_at', 'updated_at'],
    auto: [
      { id: 'uuid' },
      { created_at: 'now' },
      { updated_at: 'now' },
    ],
    transform: [
      { password: 'password' },
    ]
  },
  update: {
    exclude: ['id', 'created_at', 'updated_at'],
    auto: [
      { updated_at: 'now' }
    ],
    transform: [
      { password: 'password' }
    ]
  }
};

module.exports = rulesForUsersTable;
```

The rules are self-explanatory. They are detailed below. Note that at this point, this file can be pretty much a JSON file. Javascript was chosen just to avoid all the quotes :).

### The listing

```
GET /api/users?_sort=created_at,-name&limit=0,15&name=Administrator&level=9
```

This will get all fields except `password`, sorted by `created_at` ascending and `name` descending (note the `-` prefixing the field named `name`), we filter the results so only where `name` is *Administrator* **AND** `level` is 9, and we limit the results to `15` records starting at offset `0`.

### The create

```
POST /api/users

Content-Type: application/json
{
	"name": "Regular",
	"email": "regular@localhost.dom",
	"password": "secret",
	"level": 2,
	"is_active": 1
}
```

This request will have the following result.

First, the fields `id`, `created_at` and `updated_at` will get generated, regardless if a corresponding value is present in the request body.

Next, all the fields defined in the rules except the ones in `auto` or `excluded` will get the corresponding value from the request body or `NULL`, meaning `id`, `created_at` and `updated_at`.

After that, the `password` field will be transformed.

And finally, the query will be executed against the table specified in `rulesForUsersTable.name` and the result returned.

### The update

```
POST /api/users/1234

Content-Type: application/json
{
	"name": "Regularized",
	"email": "regularized@localhost.dom",
	"password": "secret_is_not_a_safe_password",
}
```

This request will have the following result.

First, the field `updated_at` will get generated, regardless if a corresponding value is present in the request body.

Next, all the fields defined in the rules except the ones in `auto` or `excluded` will get the corresponding value from the request body or `NULL`.

After that, the `password` field will be transformed.

And finally, the query will be executed against the table specified in `rulesForUsersTable.name` and the result returned. As a *bonus*, all the `update`s accepts partials. 


## TODO:

  * relationships on listing
  * more operations on listing filter (greater than, less than, LIKE)
  * a global search on listing, having the searchable fields defined in rules
  * validation on create and update
  * normalize the returned JSON, preferably [json:api](https://jsonapi.org/)

## Wishlist:

  * authentication
  * more SQL and NoSQL servers support
  * triggers and events

### Warnings

This project is in a pre-alpha status. Expect breaking changes on each push :).