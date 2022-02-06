/*
   Purpose: API Gateway to the `/api/tags` endpoint, full CRUD.
   Author(s): Erik Plachta, and Xander Rapstine
   Date: 02/06/2022
*/

//------------------------------------------------------------------------------
//-- IMPORTS

const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

//-- Used for getting products associated to tags
const sequelize = require('../../config/connection');

//------------------------------------------------------------------------------
//-- GET

//-- The `/api/tags` endpoint used to get ALL tags & associated products.
router.get('/', (req, res) => {
  
  // find all tags
  Tag.findAll({
    //-- Include FULL product details
    include: [
      {
        model: Product,
        // attributes: [ "id", "product_name" ]
        // as: "tag_id"
      }
    ]
  })
  .then(tags => res.status(200).json(tags))
  .catch(err => res.status(500).json(`ERROR: ${err}`))
});

//-- The `/api/tags/:id` endpoint used to get a specific tag by id #.
router.get('/:id', (req, res) => {
  
  // find a single tag by its `id`
  Tag.findOne({
    where: {
      id: req.params.id
    },
    //- Include  associated products full details
    include: [{model: Product}]
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

//------------------------------------------------------------------------------
//-- POST

//-- The `/api/tags` endpoint used to creat3e a NEW tag.
router.post('/', (req, res) => {
  // create a new tag
  
  /* Payload Example:
  
    URL: http://127.0.0.1:3001/api/tags/

    Body: as JSON
      {
        "tag_name": "Your Tag-Name here"
      }
    
    RESPONSE:
      {
        "message": "Created new tag.",
        "response": 
          {
            "id": 9,
            "tag_name": "My New Tag"
          }
      }
  */
  
  //-- didn't receive tag_name as arg
  if(!req.body.tag_name){
    res.status(404).json({
      request: {
        method: req.method,
        params: req.params
      },
      response: {
        message: `Invalid request.`,
        status: 404,
      }
    });
  }
  //-- Otherwise create it
  else {
    Tag.create(
      {
      'tag_name': req.body.tag_name,
    })
      .then(dbTagData => res.status(200).json({
        // message: `Created new tag ${dbTagData.id} id: ${dbTagData.tag_name}.`,
        request: {
          method: req.method, 
          params: req.params
        },
        response: {
          status: 200,
          message: `Created new tag ${dbTagData.id} id: ${dbTagData.tag_name}.`,
          new: dbTagData,
        }
      }))
      .catch(err => {
        // console.log(err);
        res.status(500).json(err);
      });
  }
});

//------------------------------------------------------------------------------
//-- PUT

//-- The `/api/tags/:id` endpoint used to update an existing `tag_name`
router.put('/:id', (req, res) => {
  //-- Update `tag_name` on already existing tag

  /*Request Example
    URL: http://127.0.0.1:3001/api/tags/1

    Body: as JSON
      {
        "tag_name": "Your new tag-name here"
      }
    
    Client Response:
      {
        "message": "Request received.",
        "request": {
          "id": "9",
          "body": {
            "tag_name": "Reassigned"
          }
        },
        "response": {
          "success": 1
        }
      }
  */

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
        res.status(200).json({
          message: "Request received.",
          request: {
            method: req.method,
            // id: req.params.id,
            params: req.params, 
            body: req.body
          },
          response: {
            success: dbTagData[0]
          }
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
  }
});

//------------------------------------------------------------------------------
//-- DELETE

//-- The `/api/tags/:id` endpoint used to delete a tag. 
router.delete('/:id', (req, res) => {
  // delete on tag by its `id` value

  /* Request Example

      URL: http://127.0.0.1:3001/api/tags/1
  */

  Tag.destroy({
    where: {
      id: req.params.id
    }
  })
    .then(dbTagData => {
      if (!dbTagData) {
        res.status(404).json({
          request: {
            method: req.method,
            body: req.body,
            params: req.params
          },
          response: {
            message: `Invalid request. No tag found with id: ${req.params.id}`,
            status: 404
          }
        });
        return;
      }
      res.status(200).json({
        message: `Successly deleted tag ${req.params.id}`,
        request: {
          method: req.method,
          id: req.params.id
        },
        response: {
          message: `Successly processed request to delete tag id: ${req.params.id}`,
          responseCode: dbTagData
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        messege: "ERROR: Unable to complete client request.",
        request: {
          method: req.method,
          id: req.params.id
        },
        response:{
          error: err,
        } 
      });
    });
});


//------------------------------------------------------------------------------
//-- EXPORTS

module.exports = router;
