/**
 * Category Routes
 * 
 * CRUD operations for transaction categories.
 */

import express from 'express';
import Category from '../models/Category.js';
import { protect } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

router.use(protect);

/**
 * @route   GET /api/categories
 * @desc    Get all categories for user
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const categories = await Category.getUserCategories(req.user._id, type);
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
});

/**
 * @route   GET /api/categories/defaults
 * @desc    Get default categories
 * @access  Private
 */
router.get('/defaults', (req, res) => {
  const defaults = Category.getDefaultCategories();
  res.json({
    success: true,
    data: defaults
  });
});

/**
 * @route   POST /api/categories
 * @desc    Create custom category
 * @access  Private
 */
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('type').isIn(['income', 'expense']).withMessage('Invalid category type'),
  body('icon').optional().isString().withMessage('Invalid icon'),
  body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Invalid color format'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, type, icon, color } = req.body;

    // Check if custom category with same name exists
    const existing = await Category.findOne({
      user: req.user._id,
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      isSystem: false
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    const category = await Category.create({
      user: req.user._id,
      name,
      type,
      icon: icon || '💰',
      color: color || '#5c7cfa',
      isSystem: false
    });

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating category'
    });
  }
});

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category
 * @access  Private
 */
router.put('/:id', [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('icon').optional().isString().withMessage('Invalid icon'),
  body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Invalid color format'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id,
      isSystem: false
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found or cannot be modified'
      });
    }

    const allowedUpdates = ['name', 'icon', 'color', 'budgetAllocation', 'sortOrder'];
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
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating category'
    });
  }
});

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete custom category
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
      isSystem: false
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found or cannot be deleted'
      });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting category'
    });
  }
});

export default router;

