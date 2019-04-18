import express from 'express';

import { locationApiPrefix } from '../helpers/defaults';
import locationController from '../controllers/Location';
import validateLocationQuery from '../middlewares/validateLocationQuery';

const locationRoutes = express.Router();

locationRoutes.post(`${locationApiPrefix}`, locationController.createLocation);

locationRoutes.get(
    `${locationApiPrefix}`,
    validateLocationQuery,
    locationController.getLocations
);

locationRoutes.put(
    `${locationApiPrefix}/:locationId`,
    locationController.updateLocation
);

locationRoutes.delete(
    `${locationApiPrefix}/:locationId`,
    locationController.deleteLocation
);

export default locationRoutes;
