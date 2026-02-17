/**
 * Account Routes
 * 
 * CRUD for user accounts/wallets (cash, bank, credit card, etc.)
 */

import express from 'express';
import Account from '../models/Account.js';
import { protect } from '../middleware/auth.js';
import asyncHandler from '../middleware/asyncHandler.js';
import validate from '../middleware/validate.js';
import { body, param } from 'express-validator';

const router = express.Router();

router.use(protect);

/**
 * @route   GET /api/accounts
 * @desc    Get all user accounts
 * @access  Private
 */
router.get('/', asyncHandler(async (req, res) => {
    const accounts = await Account.getActiveAccounts(req.user._id);
    const totalBalance = await Account.getTotalBalance(req.user._id);

    res.json({
        success: true,
        data: {
            accounts,
            totalBalance: Math.round(totalBalance * 100) / 100
        }
    });
}));

/**
 * @route   GET /api/accounts/:id
 * @desc    Get single account
 * @access  Private
 */
router.get('/:id', [
    param('id').isMongoId(),
    validate
], asyncHandler(async (req, res) => {
    const account = await Account.findOne({
        _id: req.params.id,
        user: req.user._id
    });

    if (!account) {
        return res.status(404).json({
            success: false,
            message: 'Account not found'
        });
    }

    res.json({ success: true, data: account });
}));

/**
 * @route   POST /api/accounts
 * @desc    Create account
 * @access  Private
 */
router.post('/', [
    body('name').trim().notEmpty().withMessage('Account name is required'),
    body('type').isIn([
        'cash', 'bank', 'credit_card', 'digital_wallet', 'investment', 'savings', 'other'
    ]).withMessage('Invalid account type'),
    body('balance').optional().isFloat(),
    body('currency').optional().isLength({ min: 3, max: 3 }),
    body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/),
    validate
], asyncHandler(async (req, res) => {
    const account = await Account.create({
        ...req.body,
        user: req.user._id
    });

    res.status(201).json({
        success: true,
        data: account
    });
}));

/**
 * @route   PUT /api/accounts/:id
 * @desc    Update account
 * @access  Private
 */
router.put('/:id', [
    param('id').isMongoId(),
    body('name').optional().trim().notEmpty(),
    body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/),
    validate
], asyncHandler(async (req, res) => {
    const account = await Account.findOne({
        _id: req.params.id,
        user: req.user._id
    });

    if (!account) {
        return res.status(404).json({
            success: false,
            message: 'Account not found'
        });
    }

    const allowedUpdates = ['name', 'icon', 'color', 'currency', 'creditLimit', 'isDefault', 'notes'];
    allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
            account[field] = req.body[field];
        }
    });

    // Allow direct balance adjustment
    if (req.body.balance !== undefined) {
        account.balance = parseFloat(req.body.balance);
    }

    await account.save();

    res.json({
        success: true,
        data: account
    });
}));

/**
 * @route   DELETE /api/accounts/:id
 * @desc    Deactivate account (soft delete)
 * @access  Private
 */
router.delete('/:id', [
    param('id').isMongoId(),
    validate
], asyncHandler(async (req, res) => {
    const account = await Account.findOne({
        _id: req.params.id,
        user: req.user._id
    });

    if (!account) {
        return res.status(404).json({
            success: false,
            message: 'Account not found'
        });
    }

    if (account.isDefault) {
        return res.status(400).json({
            success: false,
            message: 'Cannot delete default account. Set another account as default first.'
        });
    }

    account.isActive = false;
    await account.save();

    res.json({
        success: true,
        message: 'Account deactivated'
    });
}));

export default router;
