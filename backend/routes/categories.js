/**
 * Category Routes
 * 
 * CRUD operations for categories with protection against
 * deleting categories that have transactions.
 */

import express from 'express';
import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Transaction from '../models/Transaction.js';
import { protect } from '../middleware/auth.js';
import asyncHandler from '../middleware/asyncHandler.js';
import validate from '../middleware/validate.js';
import { body, param, query as queryValidator } from 'express-validator';
import { escapeRegex } from '../utils/sanitize.js';

const router = express.Router();

router.use(protect);

/**
 * @route   GET /api/categories
 * @desc    Get all categories for logged-in user
 * @access  Private
 */
router.get('/', [
  queryValidator('type').optional().isIn(['income', 'expense']),
  validate
], asyncHandler(async (req, res) => {
  const { type } = req.query;
  const categories = await Category.getUserCategories(req.user._id, type || null);

  res.json({
    success: true,
    data: categories
  });
}));

/**
 * @route   GET /api/categories/defaults
 * @desc    Get default category definitions
 * @access  Private
 */
router.get('/defaults', asyncHandler(async (req, res) => {
  const defaults = Category.getDefaultCategories();

  res.json({
    success: true,
    data: defaults
  });
}));

/**
 * @route   GET /api/categories/:id
 * @desc    Get single category
 * @access  Private
 */
router.get('/:id', [
  param('id').isMongoId(),
  validate
], asyncHandler(async (req, res) => {
  const category = await Category.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  res.json({ success: true, data: category });
}));

/**
 * @route   POST /api/categories
 * @desc    Create custom category
 * @access  Private
 */
router.post('/', [
  body('name').trim().notEmpty().withMessage('Category name is required')
    .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('icon').optional().isString(),
  body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color must be hex format'),
  body('description').optional().trim().isLength({ max: 200 }),
  validate
], asyncHandler(async (req, res) => {
  const { name, type, icon, color, description } = req.body;

  // Check for duplicates
  const existing = await Category.findOne({
    user: req.user._id,
    name: new RegExp(`^${escapeRegex(name)}$`, 'i'),
    type,
    isActive: true
  });

  if (existing) {
    return res.status(409).json({
      success: false,
      message: `A ${type} category named "${name}" already exists`
    });
  }

  const category = await Category.create({
    user: req.user._id,
    name,
    type,
    icon: icon || '💰',
    color: color || '#5c7cfa',
    description: description || '',
    isSystem: false
  });

  res.status(201).json({
    success: true,
    data: category
  });
}));

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category (can't update system categories)
 * @access  Private
 */
router.put('/:id', [
  param('id').isMongoId(),
  body('name').optional().trim().notEmpty().isLength({ max: 50 }),
  body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/),
  validate
], asyncHandler(async (req, res) => {
  const category = await Category.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  if (category.isSystem) {
    return res.status(403).json({
      success: false,
      message: 'Cannot modify system category'
    });
  }

  const allowedUpdates = ['name', 'icon', 'color', 'description', 'sortOrder', 'budgetAllocation'];
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      category[field] = req.body[field];
    }
  });

  await category.save();

  res.json({
    success: true,
    data: category
  });
}));

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category (prevents deleting if transactions exist)
 * @access  Private
 */
router.delete('/:id', [
  param('id').isMongoId(),
  validate
], asyncHandler(async (req, res) => {
  const category = await Category.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  if (category.isSystem) {
    return res.status(403).json({
      success: false,
      message: 'Cannot delete system category'
    });
  }

  // Check if transactions reference this category
  const txCount = await Transaction.countDocuments({
    user: req.user._id,
    category: category._id
  });

  if (txCount > 0) {
    return res.status(409).json({
      success: false,
      message: `Cannot delete: ${txCount} transactions use this category. Reassign them first or use the merge endpoint.`
    });
  }

  await category.deleteOne();

  res.json({
    success: true,
    message: 'Category deleted'
  });
}));

/**
 * @route   POST /api/categories/merge
 * @desc    Merge one category into another (reassign transactions)
 * @access  Private
 */
router.post('/merge', [
  body('sourceId').isMongoId().withMessage('Source category ID required'),
  body('targetId').isMongoId().withMessage('Target category ID required'),
  validate
], asyncHandler(async (req, res) => {
  const { sourceId, targetId } = req.body;

  if (sourceId === targetId) {
    return res.status(400).json({
      success: false,
      message: 'Source and target must be different'
    });
  }

  const [source, target] = await Promise.all([
    Category.findOne({ _id: sourceId, user: req.user._id }),
    Category.findOne({ _id: targetId, user: req.user._id })
  ]);

  if (!source || !target) {
    return res.status(404).json({
      success: false,
      message: 'One or both categories not found'
    });
  }

  if (source.type !== target.type) {
    return res.status(400).json({
      success: false,
      message: 'Cannot merge categories of different types'
    });
  }

  // Reassign all transactions from source to target
  const result = await Transaction.updateMany(
    { user: req.user._id, category: source._id },
    { $set: { category: target._id } }
  );

  // Update transaction count
  await Category.incrementTransactionCount(target._id, result.modifiedCount);

  // Delete source category
  await source.deleteOne();

  res.json({
    success: true,
    message: `Merged ${result.modifiedCount} transactions into "${target.name}"`,
    data: { mergedCount: result.modifiedCount }
  });
}));

export default router;
