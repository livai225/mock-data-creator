import SiteSetting from '../models/SiteSetting.js';

const safeJsonParse = (valueJson) => {
  try {
    return JSON.parse(valueJson);
  } catch {
    return null;
  }
};

export const getPublicBanner = async (req, res, next) => {
  try {
    const row = await SiteSetting.get('banner');
    const value = row ? safeJsonParse(row.value_json) : null;

    res.status(200).json({
      success: true,
      data: value ?? { enabled: false, message: '', variant: 'info' }
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicPricing = async (req, res, next) => {
  try {
    const row = await SiteSetting.get('pricing');
    const value = row ? safeJsonParse(row.value_json) : null;

    res.status(200).json({
      success: true,
      data: value ?? { pricingPlans: [], companyTypePrices: {} }
    });
  } catch (error) {
    next(error);
  }
};
