const Order = require('../models/order.model');
const MenuItem = require('../models/menuItem.model');

// helper: today start
function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// ===== KPI STATS =====
exports.getStatsSummary = async (req, res) => {
  try {
    const today = startOfToday();

    const todayOrders = await Order.find({
      createdAt: { $gte: today },
      status: { $ne: 'cancelled' }
    });

    const todayRevenue = todayOrders.reduce(
      (sum, o) => sum + o.totalAmount,
      0
    );

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthlyOrders = await Order.find({
      createdAt: { $gte: monthStart },
      status: { $ne: 'cancelled' }
    });

    const monthlyRevenue = monthlyOrders.reduce(
      (sum, o) => sum + o.totalAmount,
      0
    );

    const totalItems = await MenuItem.countDocuments();

    res.json({
      todayRevenue,
      todayOrders: todayOrders.length,
      monthlyRevenue,
      totalItems
    });
  } catch (err) {
    res.status(500).json({ message: 'Stats error' });
  }
};

// ===== TOP ORDERED ITEMS =====
exports.getTopItems = async (req, res) => {
  try {
    const data = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          totalQty: { $sum: '$items.quantity' }
        }
      },
      { $sort: { totalQty: -1 } },
      { $limit: 5 }
    ]);

    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: 'Stats error' });
  }
};

// ===== LAST 7 DAYS REVENUE =====
exports.getWeeklyRevenue = async (req, res) => {
  try {
    const last7 = new Date();
    last7.setDate(last7.getDate() - 6);
    last7.setHours(0, 0, 0, 0);

    const data = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: last7 },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: 'Stats error' });
  }
};
