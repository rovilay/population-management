import Location from '../models/Location';
import DB from '../helpers/db';
import {
    defaultSuccessMsg, defaultPaginationLimit, defaultPaginationOffset,
    locationNotFoundMsg,
    invalidPayloadMsg
} from '../helpers/defaults';

/**
 * Handles operations on location routes
 *
 * @exports
 * @class LocationController
 */
class LocationController {
    /**
     * Creates Sms
     *
     * @static
     * @param  {object} req - request object
     * @param  {object} res - response object
     * @param  {object} next - next object
     * @returns {object} response object
     * @memberof LocationController
     */
    static async createLocation(req, res, next) {
        try {
            const { location, malePopulation, femalePopulation } = req.body;

            const totalPopulation = Number(malePopulation) + Number(femalePopulation);
            const conditions = {
                location,
                malePopulation,
                femalePopulation,
                totalPopulation
            };

            const newLocation = await DB.create(Location, conditions);

            if (newLocation) {
                return res.status(201).json({
                    success: true,
                    message: defaultSuccessMsg,
                    location: {
                        _id: newLocation._id,
                        location: newLocation.location,
                        malePopulation: newLocation.malePopulation,
                        femalePopulation: newLocation.femalePopulation,
                        totalPopulation: newLocation.totalPopulation,
                        createdAt: newLocation.createdAt,
                        updatedAt: newLocation.updatedAt,
                    }
                });
            }
        } catch (error) {
            return next(error);
        }
    }

    /**
     * Gets Sms
     *
     * @static
     * @param  {object} req - request object
     * @param  {object} res - response object
     * @param  {object} next - next object
     * @returns {object} response object
     * @memberof LocationController
     */
    static async getLocations(req, res, next) {
        try {
            const { limit, offset, name } = req.query;
            let conditions = {};

            if (name) {
                conditions = { location: name };
            }

            const options = {
                limit: limit || defaultPaginationLimit,
                offset: offset || defaultPaginationOffset,
                select: '_id location malePopulation femalePopulation totalPopulation createdAt updatedAt', // eslint-disable-line
                sort: { updatedAt: -1 }
            };

            const locations = await DB.findAll(Location, conditions, options);

            if (!locations.docs.length) {
                const error = {
                    message: locationNotFoundMsg,
                    status: 404
                };

                throw error;
            }

            return res.status(200).json({
                success: true,
                message: defaultSuccessMsg,
                locations: locations.docs,
                offset: locations.offset,
                limit: locations.limit,
                total: locations.total
            });
        } catch (error) {
            return next(error);
        }
    }

    /**
     * Updates location status
     *
     * @static
     * @param  {object} req - request object
     * @param  {object} res - response object
     * @param  {object} next - next object
     * @returns {object} response object
     * @memberof LocationController
     */
    static async updateLocation(req, res, next) {
        try {
            const { location, malePopulation, femalePopulation } = req.body;
            const { locationId } = req.params;

            if (!location || !malePopulation || !femalePopulation) {
                const error = {
                    message: invalidPayloadMsg,
                    status: 400
                };

                throw error;
            }
            const totalPopulation = Number(malePopulation) + Number(femalePopulation);

            const conditions = { _id: locationId };

            const data = {
                location, malePopulation, femalePopulation, totalPopulation
            };


            const options = {
                new: true,
                fields: '_id location malePopulation femalePopulation totalPopulation createdAt updatedAt' // eslint-disable-line
            };

            const updatedLocation = await DB.updateOne(Location, conditions, data, options);
            if (!updatedLocation) {
                const error = {
                    message: locationNotFoundMsg,
                    status: 404
                };

                throw error;
            }

            return res.status(200).json({
                success: true,
                message: defaultSuccessMsg,
                location: updatedLocation
            });
        } catch (error) {
            return next(error);
        }
    }

    /**
     * Deletes a location
     *
     * @static
     * @param  {object} req - request object
     * @param  {object} res - response object
     * @param  {object} next - next object
     * @returns {object} response object
     * @memberof LocationController
     */
    static async deleteLocation(req, res, next) {
        try {
            const { locationId } = req.params;
            const location = await DB.findOne(Location, { _id: locationId });
            if (!location) {
                const error = {
                    message: locationNotFoundMsg,
                    status: 404
                };

                throw error;
            }

            await DB.delete(Location, { _id: locationId });

            return res.status(200).json({
                success: true,
                message: defaultSuccessMsg,
            });
        } catch (error) {
            return next(error);
        }
    }
}

export default LocationController;
