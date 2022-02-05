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
  //-- didn't receive tag_name as arg
  if(!req.body.category_name){
    res.status(404).json({ message: `Did not receive a valid request.`,request: req.body });
  }
  //-- Otherwise create it
  else {
    Category.create(
      {
      'category_name': req.body.category_name,
    })
      .then(dbCategoryData => res.status(200).json({message: `Created new category.`,request: dbCategoryData}))
      .catch(err => {
        // console.log(err);
        res.status(500).json(err);
      });
  }
});

router.put('/:id', (req, res) => {
  // update a category by its `id` value

  if(! req.body.category_name ){
    res.status(404).json({ message: `Invalid request.`,request: req.body });
  }
  //-- otherwise, TRY to update database.
  else {
    Category.update(
      req.body,
      {
        where: {
          id: req.params.id
        }
    })
      .then(dbCategoryData => {
        //-- If the ID did not exist, response message
        if (!dbCategoryData) {
          res.status(404).json({ message: `No Category found with this id ${req.params.id}` });
          return;
        }
        res.status(200).json({message: "Requset received.",responesCode: dbCategoryData[0]});
      })
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
  }
});

router.delete('/:id', (req, res) => {
  // delete a category by its `id` value
  Category.destroy({
    where: {
      id: req.params.id
    }
  })
    .then(dbCategoryData => {
      if (!dbCategoryData) {
        res.status(404).json({ message: `No category found with this id: ${req.params.id}` });
        return;
      }
      res.status(200).json({message: `Successly deleted Category: ${req.params.id}`,responseCode: `${dbCategoryData}`});
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;
