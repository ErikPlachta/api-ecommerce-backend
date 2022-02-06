const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', (req, res) => {
  // find all products
  Product.findAll({
     // find all categories
      include: [
        {
          model: Category,
          attributes: [ "category_name" ]
        },
        {
          model: Tag,
          through: ProductTag,
          as: "tag_id",
          attributes: ["tag_name"],
        }
      ]
  })
    .then(products => res.status(200).json(products))
    .catch(err => res.status(500).json(`ERROR: ${err}`))
  // be sure to include its associated Category and Tag data
});

// get one product
router.get('/:id', (req, res) => {
  // find a single product by its `id`
  Product.findOne({
    where: {
      id: req.params.id
    },
  // be sure to include its associated Category and Tag data
    include: [
      {
        model: Category,
        attributes: [
            "category_name",
        ]
      },
      {
        model: Tag,
        // attributes: ["tag_id"],
        through: ProductTag,
        as: "tag_id"
      }
    ]
  })
    .then(products => {
      if(!products){
        res.status(404).json({ message: `No product found with id: ${req.params.id}` });
      }
      else {
        res.status(200).json(products)
      }
    })
    .catch(err => res.status(500).json(`ERROR: ${err}`))
});



// create new product
router.post('/', (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Product Name ehre",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4],
      category_id: [1]
    }
  */
  Product.create(req.body)
    
  // -- then Assign tags if they exist
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      
    })
    .then((productTagIds) => res.status(200).json( {message: "Successly created product.", request: req.body }))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    product_name: req.body.product_name,
    price: req.body.price,
    stock: req.body.stock,
    category_id: req.body.category_id,
    where: {
        id: req.params.id,
    },
  })
    .then((product) => {
      
      // find all associated tags from ProductTag
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    //-- Assign Product Tags if relevant
    .then((productTags) => {
      
      // get list of current tag_ids
      const productTagIds = productTags.map(({ tag_id }) => tag_id);

      // create filtered list of new tag_ids
      const newProductTags = req.body.tagIds
        .filter((tag_id) => {!productTagIds.includes(tag_id)})
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      
      // figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);
        
          // run both actions
      return Promise.all([
        
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.status(200).json(
      {
        message: "Successly received message",
        resultCode: updatedProductTags[0],
        request: {
          params: req.params, 
          body: req.body
        },
      }
    ))
    .catch( ( err ) => {
      console.log(err);
      res.status(400).json({
        message: "404 - Bad Request",
        request: {
          params: req.params, 
          body: req.body
        },
        error: err
      });
    });
});

router.delete('/:id', (req, res) => {
  // delete one product by its `id` value
  
  Product.destroy({
    where: {
      id: req.params.id
    }
  })
    .then(dbProductData => {
      if (!dbProductData) {
        res.status(404).json({ message: `No tag found with this id: ${req.params.id}` });
        return;
      }
      res.status(200).json({
        message: `Successly deleted Product: ${req.params.id}`,
        responseCode: `${dbProductData}`
    });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;
