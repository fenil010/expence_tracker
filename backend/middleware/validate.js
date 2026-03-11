/**
 * Validation Middleware
 * 
 * Reusable middleware that runs express-validator checks
 * and returns errors in a consistent format.
 */

import { validationResult } from 'express-validator';

/**
 * Middleware to check validation results from express-validator.
 * Place this after your validation chain to handle errors uniformly.
 * 
 * Usage:
 *   router.post('/endpoint', [
 *     body('name').notEmpty(),
 *     validate
 *   ], handler)
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
                // SECURITY: Do NOT echo err.value — prevents info leakage + reflected XSS
            }))
        });
    }
    next();
};

export default validate;
