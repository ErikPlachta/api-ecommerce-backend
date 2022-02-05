const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', (req, res) => {
  // find all categories
  Category.findAll({
    // Include its associated Products
    include: [{model: Product}]
  })
    .then(categories => res.status(200).json(categories))
    .catch(err => res.status(500).json(`ERROR: ${err}`))
});

router.get('/:id', (req, res) => {
  // find one category by its `id` value
  Category.findOne({
    where: {
      id: req.params.id
    },
    // Include its associated Products
    include: [{model: Product}]
  })
    .then(categories => {
      if(!categories){
        res.status(404).json({ message: `No category found with id: ${req.params.id}` });
      }
      else {
        res.status(200).json(categories)
      }
    })
    .catch(err => res.status(500).json(`ERROR: ${err}`))
});

router.post('/', (req, res) => {
  // create a new category
});

router.put('/:id', (req, res) => {
  // update a category by its `id` value
});

router.delete('/:id', (req, res) => {
  // delete a category by its `id` value
});

module.exports = router;
