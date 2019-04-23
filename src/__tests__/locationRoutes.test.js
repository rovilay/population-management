import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';

import app from '../index';
import Location from '../models/Location';
import {
    locationApiPrefix, apiPrefix, defaultSuccessMsg,
    locationNotFoundMsg, invalidNumberMsg, invalidPayloadMsg
} from '../helpers/defaults';
import {
    nigeria, incompleteData, wrongPopulation, ghana, usa, wrongLocationId
} from './__mockData__/index';
import runDB, { db } from '../config/db';
import DB from '../helpers/db';

chai.use(chaiHttp);
const { request } = chai;

describe('Location routes', () => {
    before((done) => {
        runDB()
            .then(() => done())
            .catch(err => done(err));
    });

    after(async () => {
        await db.close();
    });

    describe('POST /locations', () => {
        before((done) => {
            DB.delete(Location, {})
                .then(() => done())
                .catch(err => done(err));
        });

        after(async () => {
            await DB.delete(Location, {});
        });

        it('should create nigeria location', (done) => {
            const url = `${apiPrefix}${locationApiPrefix}`;
            request(app.listen())
                .post(url)
                .send(nigeria)
                .end((err, res) => {
                    if (err) done(err);

                    const { success, message, location } = res.body;
                    const {
                        malePopulation, femalePopulation, totalPopulation
                    } = location;

                    expect(res.status).to.equal(201);
                    expect(success).to.equal(true);
                    expect(message).to.equal(defaultSuccessMsg);
                    expect(malePopulation).to.equal(nigeria.malePopulation);
                    expect(femalePopulation).to.equal(nigeria.femalePopulation);
                    expect(totalPopulation).to.equal(nigeria.totalPopulation);

                    done();
                });
        });

        it('should return error if trying to create existing location', (done) => {
            const url = `${apiPrefix}${locationApiPrefix}`;
            request(app.listen())
                .post(url)
                .send(nigeria)
                .end((err, res) => {
                    if (err) done(err);

                    const { success } = res.body;

                    expect(res.status).to.equal(500);
                    expect(res.body).to.have.all.keys('success', 'error');
                    expect(success).to.equal(false);

                    done();
                });
        });

        it('should return error if payload is incomplete', (done) => {
            const url = `${apiPrefix}${locationApiPrefix}`;
            request(app.listen())
                .post(url)
                .send(incompleteData)
                .end((err, res) => {
                    if (err) done(err);

                    const { success } = res.body;

                    expect(res.status).to.equal(500);
                    expect(res.body).to.have.all.keys('success', 'error');
                    expect(success).to.equal(false);

                    done();
                });
        });

        it('should return error if population is not a number', (done) => {
            const url = `${apiPrefix}${locationApiPrefix}`;
            request(app.listen())
                .post(url)
                .send(wrongPopulation)
                .end((err, res) => {
                    if (err) done(err);

                    const { success } = res.body;

                    expect(res.status).to.equal(500);
                    expect(res.body).to.have.all.keys('success', 'error');
                    expect(success).to.equal(false);

                    done();
                });
        });
    });

    describe('GET /locations', () => {
        before((done) => {
            DB.createMany(Location, [nigeria, ghana, usa])
                .then(() => done())
                .catch(err => done(err));
        });

        after(async () => {
            await DB.delete(Location, {});
        });

        it('should get locations', (done) => {
            const url = `${apiPrefix}${locationApiPrefix}`;
            request(app.listen())
                .get(url)
                .end((err, res) => {
                    if (err) done(err);

                    const {
                        success, message, locations, offset, limit, total
                    } = res.body;

                    expect(res.status).to.equal(200);
                    expect(success).to.equal(true);
                    expect(message).to.equal(defaultSuccessMsg);
                    expect(locations.length).to.equal(3);
                    expect(limit).to.equal(10);
                    expect(offset).to.equal(0);
                    expect(total).to.equal(3);

                    done();
                });
        });

        it('should get location by name', (done) => {
            const url = `${apiPrefix}${locationApiPrefix}?name=usa&limit=2`;
            request(app.listen())
                .get(url)
                .end((err, res) => {
                    if (err) done(err);

                    const {
                        success, message, locations, offset, limit, total
                    } = res.body;

                    expect(res.status).to.equal(200);
                    expect(success).to.equal(true);
                    expect(message).to.equal(defaultSuccessMsg);
                    expect(locations.length).to.equal(1);
                    expect(limit).to.equal(2);
                    expect(offset).to.equal(0);
                    expect(total).to.equal(1);

                    done();
                });
        });

        it('should return 404 if location is not found', (done) => {
            const url = `${apiPrefix}${locationApiPrefix}?name=london`;
            request(app.listen())
                .get(url)
                .end((err, res) => {
                    if (err) done(err);

                    const { success, error } = res.body;

                    expect(res.status).to.equal(404);
                    expect(success).to.equal(false);
                    expect(error).to.equal(locationNotFoundMsg);

                    done();
                });
        });

        it('should return 400 for invalid queries', (done) => {
            const url = `${apiPrefix}${locationApiPrefix}?limit=1a&offset=2e`;
            request(app.listen())
                .get(url)
                .end((err, res) => {
                    if (err) done(err);

                    const { success, error } = res.body;

                    expect(res.status).to.equal(400);
                    expect(success).to.equal(false);
                    expect(error.offset).to.equal(`offset ${invalidNumberMsg}`);
                    expect(error.limit).to.equal(`limit ${invalidNumberMsg}`);

                    done();
                });
        });
    });

    describe('[PUT, DELETE] /locations/:locationId', () => {
        let locationId = '';

        before((done) => {
            const url = `${apiPrefix}${locationApiPrefix}`;
            request(app.listen())
                .post(url)
                .send(ghana)
                .end((err, res) => {
                    if (err) done(err);

                    const { location } = res.body;
                    locationId = location._id;

                    done();
                });
        });

        after(async () => {
            await DB.delete(Location, {});
        });

        it('should update location', (done) => {
            const url = `${apiPrefix}${locationApiPrefix}/${locationId}`;
            const data = { ...ghana, femalePopulation: 500 };

            request(app.listen())
                .put(url)
                .send(data)
                .end((err, res) => {
                    if (err) done(err);

                    const { location, success, message } = res.body;

                    expect(res.status).to.equal(200);
                    expect(success).to.equal(true);
                    expect(message).to.equal(defaultSuccessMsg);
                    expect(location.femalePopulation).to.equal(500);

                    done();
                });
        });

        it('should return 404 if location is not found', (done) => {
            const url = `${apiPrefix}${locationApiPrefix}/${wrongLocationId}`;
            request(app.listen())
                .put(url)
                .send(usa)
                .end((err, res) => {
                    if (err) done(err);

                    const { success, error } = res.body;

                    expect(res.status).to.equal(404);
                    expect(success).to.equal(false);
                    expect(error).to.equal(locationNotFoundMsg);

                    done();
                });
        });

        it('should return 400 if payload is incomplete', (done) => {
            const url = `${apiPrefix}${locationApiPrefix}/${locationId}`;
            request(app.listen())
                .put(url)
                .send(incompleteData)
                .end((err, res) => {
                    if (err) done(err);

                    const { success, error } = res.body;

                    expect(res.status).to.equal(400);
                    expect(success).to.equal(false);
                    expect(error).to.equal(invalidPayloadMsg);

                    done();
                });
        });

        it('should delete location', (done) => {
            const url = `${apiPrefix}${locationApiPrefix}/${locationId}`;
            request(app.listen())
                .delete(url)
                .end((err, res) => {
                    if (err) done(err);

                    const { success, message } = res.body;

                    expect(res.status).to.equal(200);
                    expect(success).to.equal(true);
                    expect(message).to.equal(defaultSuccessMsg);

                    done();
                });
        });

        it('should return 404 if location is not found', (done) => {
            const url = `${apiPrefix}${locationApiPrefix}/${wrongLocationId}`;
            request(app.listen())
                .delete(url)
                .end((err, res) => {
                    if (err) done(err);

                    const { success, error } = res.body;

                    expect(res.status).to.equal(404);
                    expect(success).to.equal(false);
                    expect(error).to.equal(locationNotFoundMsg);

                    done();
                });
        });
    });
});
