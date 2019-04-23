/* eslint max-len: 0 */
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';

import {
    requiredMalePopulationMsg, requiredLocationMsg, unavailableLocation,
    requiredTotalPopulationMsg
} from '../helpers/defaults';

const { Schema } = mongoose;

const LocationSchema = new Schema({
    location: {
        type: String,
        required: [true, requiredLocationMsg],
        trim: true,
        unique: true
    },
    malePopulation: {
        type: Number,
        required: [true, requiredMalePopulationMsg],
        trim: true
    },
    femalePopulation: {
        type: Number,
        required: [true, requiredMalePopulationMsg],
        trim: true
    },
    totalPopulation: {
        type: Number,
        required: [true, requiredTotalPopulationMsg],
        trim: true
    }
}, {
    timestamps: true
});

LocationSchema.path('location').validate(async (location) => {
    const foundLocation = await mongoose.models.Location.findOne({ location });
    return !foundLocation;
}, unavailableLocation);

LocationSchema.plugin(mongoosePaginate);

const Location = mongoose.model('Location', LocationSchema);

export default Location;
