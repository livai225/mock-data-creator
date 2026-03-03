import SiteSetting from '../models/SiteSetting.js';

const DEFAULT_BANNER = { enabled: false, message: '', variant: 'info' };
const DEFAULT_PRICING = { pricingPlans: [], companyTypePrices: {}, companyTypeEstimatedTimes: {} };
const DEFAULT_SERVICES_CONTENT = {};
const DEFAULT_FISCALITE_CONTENT = {};

const safeJsonParse = (valueJson) => {
  try {
    return JSON.parse(valueJson);
  } catch {
    return null;
  }
};

const normalizeBanner = (payload) => {
  const allowedVariants = new Set(['info', 'warning', 'success', 'danger']);
  const variant = typeof payload?.variant === 'string' && allowedVariants.has(payload.variant)
    ? payload.variant
    : DEFAULT_BANNER.variant;

  return {
    enabled: Boolean(payload?.enabled),
    message: typeof payload?.message === 'string' ? payload.message.trim() : '',
    variant,
  };
};

const normalizePricing = (payload) => {
  const rawPlans = Array.isArray(payload?.pricingPlans) ? payload.pricingPlans : [];
  const pricingPlans = rawPlans
    .filter((p) => p && typeof p.id === 'string' && Number.isFinite(Number(p.price)))
    .map((p) => ({
      id: p.id,
      price: Number(p.price),
    }));

  const rawCompanyTypePrices = payload?.companyTypePrices && typeof payload.companyTypePrices === 'object'
    ? payload.companyTypePrices
    : {};
  const companyTypePrices = {};

  Object.entries(rawCompanyTypePrices).forEach(([key, value]) => {
    const price = Number(value);
    if (typeof key === 'string' && Number.isFinite(price)) {
      companyTypePrices[key] = price;
    }
  });

  const rawCompanyTypeEstimatedTimes = payload?.companyTypeEstimatedTimes && typeof payload.companyTypeEstimatedTimes === 'object'
    ? payload.companyTypeEstimatedTimes
    : {};
  const companyTypeEstimatedTimes = {};

  Object.entries(rawCompanyTypeEstimatedTimes).forEach(([key, value]) => {
    if (typeof key !== 'string') return;
    if (typeof value !== 'string') return;
    const normalized = value.trim();
    if (!normalized) return;
    companyTypeEstimatedTimes[key] = normalized;
  });

  return {
    pricingPlans,
    companyTypePrices,
    companyTypeEstimatedTimes,
  };
};

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const normalizeContentPayload = (payload, fallback = {}) => {
  return isPlainObject(payload) ? payload : fallback;
};

export const getPublicBanner = async (req, res, next) => {
  try {
    const row = await SiteSetting.get('banner');
    const value = row ? safeJsonParse(row.value_json) : null;

    res.status(200).json({
      success: true,
      data: value ?? DEFAULT_BANNER
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
      data: value ?? DEFAULT_PRICING
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicServicesContent = async (req, res, next) => {
  try {
    const row = await SiteSetting.get('services_content');
    const value = row ? safeJsonParse(row.value_json) : null;

    res.status(200).json({
      success: true,
      data: value ?? DEFAULT_SERVICES_CONTENT
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicFiscaliteContent = async (req, res, next) => {
  try {
    const row = await SiteSetting.get('fiscalite_content');
    const value = row ? safeJsonParse(row.value_json) : null;

    res.status(200).json({
      success: true,
      data: value ?? DEFAULT_FISCALITE_CONTENT
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminBanner = async (req, res, next) => {
  try {
    const row = await SiteSetting.get('banner');
    const value = row ? safeJsonParse(row.value_json) : null;

    res.status(200).json({
      success: true,
      data: value ?? DEFAULT_BANNER
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdminBanner = async (req, res, next) => {
  try {
    const payload = normalizeBanner(req.body ?? {});
    const row = await SiteSetting.set('banner', payload);
    const value = row ? safeJsonParse(row.value_json) : null;

    res.status(200).json({
      success: true,
      message: 'Bannière mise à jour',
      data: value ?? DEFAULT_BANNER
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminPricing = async (req, res, next) => {
  try {
    const row = await SiteSetting.get('pricing');
    const value = row ? safeJsonParse(row.value_json) : null;

    res.status(200).json({
      success: true,
      data: value ?? DEFAULT_PRICING
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdminPricing = async (req, res, next) => {
  try {
    const payload = normalizePricing(req.body ?? {});
    const row = await SiteSetting.set('pricing', payload);
    const value = row ? safeJsonParse(row.value_json) : null;

    res.status(200).json({
      success: true,
      message: 'Tarifs mis à jour',
      data: value ?? DEFAULT_PRICING
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminServicesContent = async (req, res, next) => {
  try {
    const row = await SiteSetting.get('services_content');
    const value = row ? safeJsonParse(row.value_json) : null;

    res.status(200).json({
      success: true,
      data: value ?? DEFAULT_SERVICES_CONTENT
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdminServicesContent = async (req, res, next) => {
  try {
    const payload = normalizeContentPayload(req.body, DEFAULT_SERVICES_CONTENT);
    const row = await SiteSetting.set('services_content', payload);
    const value = row ? safeJsonParse(row.value_json) : null;

    res.status(200).json({
      success: true,
      message: 'Contenu services mis à jour',
      data: value ?? DEFAULT_SERVICES_CONTENT
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminFiscaliteContent = async (req, res, next) => {
  try {
    const row = await SiteSetting.get('fiscalite_content');
    const value = row ? safeJsonParse(row.value_json) : null;

    res.status(200).json({
      success: true,
      data: value ?? DEFAULT_FISCALITE_CONTENT
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdminFiscaliteContent = async (req, res, next) => {
  try {
    const payload = normalizeContentPayload(req.body, DEFAULT_FISCALITE_CONTENT);
    const row = await SiteSetting.set('fiscalite_content', payload);
    const value = row ? safeJsonParse(row.value_json) : null;

    res.status(200).json({
      success: true,
      message: 'Contenu fiscalité mis à jour',
      data: value ?? DEFAULT_FISCALITE_CONTENT
    });
  } catch (error) {
    next(error);
  }
};
