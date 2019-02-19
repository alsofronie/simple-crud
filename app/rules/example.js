/*

A table named users with the following definition:

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


 */
module.exports = {
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