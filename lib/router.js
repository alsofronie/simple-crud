const express = require('express');
const pack = require('./../package');
const router = express.Router();

const controller = require('./controller');

router.get('/', (req, res) => {
  res.json({
    name: pack.name,
    version: pack.version
  });
});

router.get('/:table', controller.listing);
router.post('/:table', controller.create);
router.get('/:table/:id', controller.read);
router.put('/:table/:id', controller.update);
router.delete('/:table/:id', controller.destroy);

module.exports = router;