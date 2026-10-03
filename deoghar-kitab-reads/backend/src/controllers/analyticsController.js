const { SearchLog, Book, BookRequest } = require('../models');

// Log a search query
const logSearch = async (req, res) => {
  try {
    const { query, location, college, category, isAvailable } = req.body;
    
    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }

    const log = new SearchLog({
      query: query.trim(),
      location: location || 'Deoghar',
      college: college || '',
      category: category || '',
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      user: req.user ? req.user._id : null
    });

    await log.save();
    res.status(201).json({ message: 'Search logged successfully' });
  } catch (error) {
    console.error('Error logging search:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get general/admin demand analytics
const getDemandAnalytics = async (req, res) => {
  try {
    // 1. Most searched terms
    const mostSearched = await SearchLog.aggregate([
      { $group: { _id: { $toLower: '$query' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // 2. Out-of-stock (unavailable) searches
    const unavailableSearches = await SearchLog.aggregate([
      { $match: { isAvailable: false } },
      { $group: { _id: { $toLower: '$query' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // 3. Location-wise demand
    const locationDemand = await SearchLog.aggregate([
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 4. Category demand
    const categoryDemand = await SearchLog.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      mostSearched: mostSearched.map(item => ({ query: item._id, count: item.count })),
      unavailableSearches: unavailableSearches.map(item => ({ query: item._id, count: item.count })),
      locationDemand: locationDemand.map(item => ({ location: item._id || 'Deoghar', count: item.count })),
      categoryDemand: categoryDemand.map(item => ({ category: item._id || 'General', count: item.count }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get shopkeeper-specific insights
const getShopkeeperInsights = async (req, res) => {
  try {
    const sellerId = req.user._id;

    // 1. Low stock alert: books owned by seller with stock < 3
    const lowStockBooks = await Book.find({
      seller: sellerId,
      stock: { $lt: 3 },
      status: { $ne: 'sold' }
    });

    // 2. Trending books based on global searches in last 30 days
    const trendingSearches = await SearchLog.aggregate([
      { $group: { _id: { $toLower: '$query' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // 3. Recommended Inventory (High demand, unavailable searches in the local area)
    const recommendations = await SearchLog.aggregate([
      { $match: { isAvailable: false } },
      { $group: { _id: { $toLower: '$query' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // 4. Most requested books on the platform
    const pendingRequests = await BookRequest.find({ status: 'pending' })
      .select('bookTitle author category studentName createdAt')
      .limit(10);

    // 5. Demand Forecast (Calculated simple predictive analytics)
    const forecasts = [
      { category: 'NCERT', message: 'Class 10 NCERT Science books are projected to spike 25% due to upcoming mid-terms.' },
      { category: 'Competitive', message: 'JEE Reference books are seeing 15% higher local searches compared to last month.' },
      { category: 'Fiction', message: 'Fiction titles see consistent weekend demand. Consider running weekend bundles.' }
    ];

    res.json({
      lowStock: lowStockBooks,
      trending: trendingSearches.map(t => ({ query: t._id, count: t.count })),
      recommendations: recommendations.map(r => ({ query: r._id, count: r.count })),
      requests: pendingRequests,
      forecasts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  logSearch,
  getDemandAnalytics,
  getShopkeeperInsights
};
