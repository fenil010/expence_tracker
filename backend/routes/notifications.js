/**
 * Notification Routes
 * 
 * In-app notifications for budget alerts and insights.
 */

import express from 'express';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';
import asyncHandler from '../middleware/asyncHandler.js';
import validate from '../middleware/validate.js';
import { param, query as queryValidator, body } from 'express-validator';

const router = express.Router();

router.use(protect);

/**
 * @route   GET /api/notifications
 * @desc    List notifications
 * @access  Private
 */
router.get('/', [
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }),
  queryValidator('unreadOnly').optional().isBoolean().toBoolean(),
  queryValidator('type').optional().isString().trim().isLength({ max: 50 }),
  validate
], asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const unreadOnly = req.query.unreadOnly === true;
  const type = req.query.type;

  const filter = { user: req.user._id };
  if (unreadOnly) filter.read = false;
  if (type) filter.type = type;

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  res.json({ success: true, data: notifications });
}));

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark one notification read
 * @access  Private
 */
router.patch('/:id/read', [
  param('id').isMongoId(),
  validate
], asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }

  res.json({ success: true, data: notification });
}));

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark all notifications read
 * @access  Private
 */
router.patch('/read-all', asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, read: false },
    { read: true }
  );

  res.json({ success: true, message: 'All notifications marked as read' });
}));

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Private
 */
router.delete('/:id', [
  param('id').isMongoId(),
  validate
], asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

  if (!notification) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }

  res.json({ success: true, message: 'Notification deleted' });
}));

export default router;
