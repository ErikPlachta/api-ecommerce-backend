// import models
const Product = require('./Product');
const Category = require('./Category');
const Tag = require('./Tag');
const ProductTag = require('./ProductTag');


//------------------------------------------------------------------------------
//-- Assoc. between category.id as Foreign Key within product under value category_id

// Products belongsTo Category
Product.belongsTo(Category, {
  foreignKey: 'id'
});

// Categories have many Products
Category.hasMany(Product, {
  foreignKey: 'id'
});


//------------------------------------------------------------------------------
//-- Assoc. between product and tag id values as foreign key in ProductTag

/*
  Building content into table product_tag from Product and Tag
*/

// Products belongToMany Tags (through ProductTag)
Product.belongsToMany(Tag, {
  through: ProductTag,
  as: 'product_id',
  
});

// Tags belongToMany Products (through ProductTag)
Tag.belongsToMany(Product, {
  through: ProductTag,
  as: "tag_id",
});


//------------------------------------------------------------------------------
//-- Exporting Modules for npm run seed to build database with values and assoc.

module.exports = {
  Product,
  Category,
  Tag,
  ProductTag,
};
