import { invalidNumberMsg } from '../helpers/defaults';

/**
 * Middleware the validates request queries on sms routes
 *
 * @param {object} req - request object
 * @param {object} res - response object
 * @param {object} next - next object
 * @returns {object} next object
 */
const validateLocationQuery = (req, res, next) => {
    try {
        const { limit, offset } = req.query;
        const errors = {};

        if (!offset && !limit) {
            return next();
        }

        if (limit) {
            const modulo = limit % 1;
            if (modulo !== 0) {
                errors.limit = `limit ${invalidNumberMsg}`;
            } else {
                req.query.limit = parseInt(limit, 10);
            }
        }

        if (offset) {
            const modulo = offset % 1;
            if (modulo !== 0) {
                errors.offset = `offset ${invalidNumberMsg}`;
            } else {
                req.query.offset = parseInt(offset, 10);
            }
        }

        if (Object.keys(errors).length) {
            const error = { errors, status: 400 };
            throw error;
        }

        return next();
    } catch (error) {
        return next(error);
    }
};

export default validateLocationQuery;
