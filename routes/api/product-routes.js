/*
   Purpose: API Gateway to the `/api/products` endpoint, full CRUD.
   Author(s): Erik Plachta, and Xander Rapstine
   Date: 02/06/2022
*/

//------------------------------------------------------------------------------
//-- IMPORTS

const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

//------------------------------------------------------------------------------
//-- GET

//-- The `/api/products/` endpoint used to get all products
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
          // as: "product_id",
          attributes: ["tag_name"],
        }
      ]
  })
    .then(products => res.status(200).json(products))
    .catch(err => res.status(500).json(`ERROR: ${err}`))
  // be sure to include its associated Category and Tag data
});

//-- The `/api/products/:id` endpoint used to get a specific product
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
        through: ProductTag,
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


//------------------------------------------------------------------------------
//-- POST

//-- The `/api/products/` endpoint used to post a new product
router.post('/', (req, res) => {
  //-- Create a new product

  /* req.body should look like this...
    {
      product_name: "Product Name ehre",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4],
      category_id: [1]
    }
  */
    let dbProductData = null;

    Product.create(req.body)
  
  // -- then Assign tags if they exist
    .then((product) => {
      
      //-- Assigning database response to var
      dbProductData = product;

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
    .then((productTagIds) => res.status(200).json({
      request: {
        method: req.method,
        body: req.body,
      },
      response: {
        status: 200,
        message: "Successly created new product.",
        new: {
          product: dbProductData,
          productTag: productTagIds
        }
      }
    }))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

//------------------------------------------------------------------------------
//-- PUT

//-- The `/api/products/:id` endpoint used make a change to an existing product field
router.put('/:id', (req, res) => {
  //-- Update an existing product field
  
  // update product data
  Product.update(req.body, {
    // product_name: req.body.product_name,
    // price: req.body.price,
    // stock: req.body.stock,
    // category_id: req.body.category_id,
    where: {
        id: req.params.id,
    },
  })
  
  // find all associated tags from ProductTag
    .then((product) => {
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
        
        // run both actions, then return results
      return Promise.all([
        
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })

    //-- Respond to client with success with details
    .then((updatedProductTags) => res.status(200).json(
      {
        request: {
          method: req.method,
          // id: req.params.id,
          params: req.params, 
          body: req.body
        },
        response: {
          status: 200,
          message: "Received and procssed request.",
          success: updatedProductTags[0],
        }
      }
    ))

    //-- Respond to client if error with details
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


//------------------------------------------------------------------------------
//-- DELETE

// delete one product by its `id` value
router.delete('/:id', (req, res) => {  
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

//------------------------------------------------------------------------------
//-- EXPORTS
module.exports = router;
