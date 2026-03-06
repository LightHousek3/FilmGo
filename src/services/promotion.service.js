const httpStatus = require("../constants/httpStatus");
const { Promotion } = require("../models");
const ApiError = require("../utils/ApiError");

const checkPromotionOverlap = async (startDate, endDate, excludeId = null) => {
  const query = {
    startDate: { $lt: endDate },
    endDate: { $gt: startDate },
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const existingPromotion = await Promotion.findOne(query);

  if (existingPromotion) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Promotion time overlaps with an existing promotion",
    );
  }
};

const calculateStatus = (startDate, endDate) => {
  const now = new Date();

  if (now < startDate) return "UPCOMING";

  if (now >= startDate && now <= endDate) return "ACTIVE";

  return "EXPIRED";
};

const createPromotion = async (promotionBody) => {
  await checkPromotionOverlap(promotionBody.startDate, promotionBody.endDate);

  promotionBody.status = calculateStatus(
    promotionBody.startDate,
    promotionBody.endDate,
  );

  const promotion = await Promotion.create(promotionBody);

  return promotion;
};

const queryPromotions = async (filter, options) => {
  const promotions = await Promotion.paginate(filter, options);
  return promotions;
};

const getPromotionById = async (id) => {
  return Promotion.findById(id);
};

const updatePromotionById = async (promotionId, updateBody) => {
  const promotion = await getPromotionById(promotionId);

  if (!promotion) {
    throw new ApiError(httpStatus.NOT_FOUND, "Promotion not found");
  }

  if (updateBody.startDate || updateBody.endDate) {
    const startDate = updateBody.startDate || promotion.startDate;
    const endDate = updateBody.endDate || promotion.endDate;

    await checkPromotionOverlap(startDate, endDate, promotionId);

    updateBody.status = calculateStatus(startDate, endDate);
  }

  Object.assign(promotion, updateBody);

  await promotion.save();

  return promotion;
};

const deletePromotionById = async (promotionId) => {
  const promotion = await getPromotionById(promotionId);

  if (!promotion) {
    throw new ApiError(httpStatus.NOT_FOUND, "Promotion not found");
  }

  await promotion.softDelete();

  return promotion;
};

// const restorePromotionById = async (promotionId) => {
//   const promotion = await getPromotionById(promotionId);
  
//   if (!promotion) {
//     throw new ApiError(httpStatus.NOT_FOUND, "Promotion not found");
//   }
  
//   await promotion.restore(); // Khôi phục
//   return promotion;
// };

module.exports = {
  createPromotion,
  queryPromotions,
  getPromotionById,
  updatePromotionById,
  deletePromotionById,
};
