const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

//-- Used for getting products associated to tags
const sequelize = require('../../config/connection');

// The `/api/tags` endpoint

router.get('/', (req, res) => {
  // find all tags
  Tag.findAll({
    // be sure to include its associated Product data
    include: [
      {
        model: Product,
        as: "tag_id"
      }
    ]
  })
  .then(tags => res.status(200).json(tags))
  .catch(err => res.status(500).json(`ERROR: ${err}`))
});

router.get('/:id', (req, res) => {
  // find a single tag by its `id`
  Tag.findOne({
    where: {
      id: req.params.id
    },
    // Include its associated Product data
    include: [
      {
        model: Product,
        as: "tag_id"
      }
  ]
  })
  .then( tags => res.status(200).json(tags))
  .catch(err => res.status(500).json(`ERROR: ${err}`))
});

router.post('/', (req, res) => {
  // create a new tag
});

router.put('/:id', (req, res) => {
  // update a tag's name by its `id` value
});

router.delete('/:id', (req, res) => {
  // delete on tag by its `id` value
});

module.exports = router;
