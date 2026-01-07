// models/menuItem.model.js
const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['snacks', 'meals', 'beverages', 'sweets'],
    },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, default: '' },
    avgTime: { type: String, default: '10-15 mins' },
    inStock: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;
