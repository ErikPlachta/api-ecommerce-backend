const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

//-- Used for getting products associated to tags
const sequelize = require('../../config/connection');

//-- The `/api/tags` endpoint
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

//-- The `/api/tags/:id` endpoint
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
  .then( tag => {
    if(!tag){
      res.status(404).json({ message: `No tag found with id: ${req.params.id}` });
    }
    else {
      res.status(200).json(tag)
    }
  })
  .catch(err => res.status(500).json(`ERROR: ${err}`))
});

router.post('/', (req, res) => {
  // create a new tag
  
  //-- didn't receive tag_name as arg
  if(!req.body.tag_name){
    res.status(404).json({ message: `Did not receive a valid request.` });
  }
  //-- Otherwise create it
  else {
    Tag.create(
      {
      'tag_name': req.body.tag_name,
    })
      .then(dbTagData => res.status(200).json({message: `Created new tag.`,responseCode: dbTagData}))
      .catch(err => {
        // console.log(err);
        res.status(500).json(err);
      });
  }
});

router.put('/:id', (req, res) => {
  // update a tag's name by its `id` value
  if(! req.body.tag_name ){
    res.status(404).json({ message: `Invalid request.`,request: req.body });
  }
  //-- otherwise, TRY to update database.
  else {
    Tag.update(
      req.body,
      {
        where: {
          id: req.params.id
        }
    })
      .then(dbTagData => {
        //-- If the ID did not exist, response message
        if (!dbTagData) {
          res.status(404).json({ message: `No Tag found with this id ${req.params.id}` });
          return;
        }
        res.status(200).json({message: "Requset received.",responesCode: dbTagData[0]});
      })
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
  }
});

router.delete('/:id', (req, res) => {
  // delete on tag by its `id` value
  Tag.destroy({
    where: {
      id: req.params.id
    }
  })
    .then(dbTagData => {
      if (!dbTagData) {
        res.status(404).json({ message: `No tag found with this id: ${req.params.id}` });
        return;
      }
      res.status(200).json({message: `Successly deleted Tag: ${req.params.id}`,responseCode: `${dbTagData}`});
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;
