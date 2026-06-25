import PremiumPlan from '../models/PremiumPlan.js';
import logger from '../middlewares/logger.js';
import { logActivity } from '../utils/tracker.js';

// @desc    Get all active plans (Public)
// @route   GET /api/plans
// @access  Public
export const getPlans = async (req, res) => {
  try {
    const plans = await PremiumPlan.find({ isActive: true }).sort('price');
    res.status(200).json({ success: true, count: plans.length, data: plans });
  } catch (error) {
    logger.error(`Get Plans Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all plans (Admin)
// @route   GET /api/plans/admin
// @access  Private/Admin
export const getAllPlans = async (req, res) => {
  try {
    const plans = await PremiumPlan.find().sort('price');
    res.status(200).json({ success: true, count: plans.length, data: plans });
  } catch (error) {
    logger.error(`Get All Plans Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create new plan
// @route   POST /api/plans
// @access  Private/SuperAdmin
export const createPlan = async (req, res) => {
  try {
    const plan = await PremiumPlan.create(req.body);
    await logActivity(req.user.id, 'Plan Created', `Created premium plan: ${plan.name}`, req);
    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    logger.error(`Create Plan Error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update plan
// @route   PUT /api/plans/:id
// @access  Private/SuperAdmin
export const updatePlan = async (req, res) => {
  try {
    let plan = await PremiumPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    plan = await PremiumPlan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    await logActivity(req.user.id, 'Plan Updated', `Updated premium plan: ${plan.name}`, req);
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    logger.error(`Update Plan Error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete plan
// @route   DELETE /api/plans/:id
// @access  Private/SuperAdmin
export const deletePlan = async (req, res) => {
  try {
    const plan = await PremiumPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    await plan.deleteOne();
    await logActivity(req.user.id, 'Plan Deleted', `Deleted premium plan: ${plan.name}`, req);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    logger.error(`Delete Plan Error: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};
