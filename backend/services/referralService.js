const Referral = require('../models/Referral');
const User = require('../models/User');

const getUserReferrals = async (userId) => {
  const referrals = await Referral.find({ referrer: userId })
    .populate('referred', 'fullName username email createdAt')
    .sort({ createdAt: -1 });

  const user = await User.findById(userId).select('referralCount referralEarnings referralCode');

  return {
    referrals,
    stats: {
      referralCode: user.referralCode,
      totalReferrals: user.referralCount,
      totalEarnings: user.referralEarnings,
      activeReferrals: referrals.filter(r => r.status === 'completed').length
    }
  };
};

const getAllReferrals = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const referrals = await Referral.find()
    .populate('referrer', 'fullName username email')
    .populate('referred', 'fullName username email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Referral.countDocuments();

  return { referrals, total, page, pages: Math.ceil(total / limit) };
};

module.exports = {
  getUserReferrals,
  getAllReferrals
};
