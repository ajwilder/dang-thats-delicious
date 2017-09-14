const mongoose = require('mongoose');
mongoose.promise = global.Promise;
const slug = require('slugs');

const storeSchma = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: "Please enter a store name."
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
      type: Number,
      required: 'You must supply coordinates!'
    }],
    address: {
      type: String,
      required: 'You must supply an address!'
    }
  },
  photo: String
});

storeSchma.pre('save', function(next) {
  if (!this.isModified('name')) {
    return next();
  }
  this.slug = slug(this.name);
  next();
  // TODO make more resilient so slugs are unique.
});




module.exports = mongoose.model('Store', storeSchma);
