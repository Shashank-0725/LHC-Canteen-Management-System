// controllers/order.controller.js
const Order = require('../models/order.model');
const MenuItem = require('../models/menuItem.model');

// POST /api/orders
// body: { items: [{ menuItemId, quantity }] }
async function createOrder(req, res) {
  try {
    const userId = req.user.id;
    const { items, note } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Load all menu items in one query
    const ids = items.map((i) => i.menuItemId);
    const menuItems = await MenuItem.find({ _id: { $in: ids } });

    if (menuItems.length !== items.length) {
      return res.status(400).json({ message: 'Some items not found' });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of items) {
      const menuItem = menuItems.find(
        (m) => m._id.toString() === cartItem.menuItemId
      );

      if (!menuItem) continue;

      if (!menuItem.inStock) {
        return res
          .status(400)
          .json({ message: `${menuItem.name} is currently out of stock` });
      }

      const qty = cartItem.quantity || 1;
      const subtotal = menuItem.price * qty;

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        imageUrl: menuItem.imageUrl,   // ✅ ADD THIS
        quantity: qty,
        subtotal,
      });


      totalAmount += subtotal;
    }

    if (orderItems.length === 0) {
      return res.status(400).json({ message: 'No valid items in cart' });
    }

    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount,
      note: note || '',
      status: 'pending',
      paymentStatus: 'unpaid',
    });

    return res.status(201).json({
      message: 'Order created',
      order,
    });
  } catch (err) {
    console.error('Create order error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/orders/my
async function getMyOrders(req, res) {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ orders });
  } catch (err) {
    console.error('Get my orders error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Staff: GET /api/staff/orders
async function getAllOrders(req, res) {
  try {
    const orders = await Order.find()
      .populate('user', 'name usnOrStaffId email mobile')
      .sort({ createdAt: -1 });

    return res.json({ orders });
  } catch (err) {
    console.error('Get all orders error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Staff: PATCH /api/staff/orders/:id/status
async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.json({ message: 'Status updated', order });
  } catch (err) {
    console.error('Update order status error:', err);
    return res.status(500).json({ message: 'Server error' });
  }



}

module.exports = { createOrder, getMyOrders, getAllOrders, updateOrderStatus };
