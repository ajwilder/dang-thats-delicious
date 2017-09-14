const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter: function(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if(isPhoto) {
      next(null, true);
    } else {
      next({ message: 'that filetype isn\'t allowed you prick'}, false);
    }
  }
};

exports.homepage = (req, res) => {
  console.log(req.name);
  res.render('index', { title: 'Homebase' });
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store'});
};

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  // check if there is no new file to resize
  if (!req.file) {
    next();
    return;
  };
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  // Now we resize
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  // now the we have stored the photo, keep going!
  next();
}

exports.createStore = async (req, res) => {
  const store = await (new Store(req.body)).save();
  req.flash('succes', `Successfully Created ${store.name}. Care to leave a review?`);
  res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
  // 1. Query the database for a list of all stores
  const stores = await Store.find();
  res.render('stores', { title: 'Stores', stores })
};

exports.editStore = async (req, res) => {
  //1. Find the store given the ID
  const store = await Store.findOne( { _id: req.params.id } );
  //2. confirm they are the owner of the store
  // TODO
  //3. Render out the edit form so the user can update their store
  res.render('editStore', { title: `Edit ${store.name}`, store } );
};

exports.updateStore = async (req, res) => {
  // set the location data to a Point
  req.body.location.type = 'Point';
  // 1. Find and update the store
  const store = await Store.findOneAndUpdate( { _id: req.params.id }, req.body, {
    new: true, // return new store instead of old one
    runValidators: true  // Make sure the store still has required variables
  }).exec();
  req.flash('success', `Successfully updated ${store.name} <a href="/stores/${store.slug}">View Store </a>`);

  // 2. Redirect to the store and tell them it worked
  res.redirect(`/stores/${store.id}/edit`);


}
