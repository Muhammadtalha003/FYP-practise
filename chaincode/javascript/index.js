'use strict';

const HECContract = require('./lib/hecContract');
const UniversityContract = require('./lib/universityContract');
const UserContract = require('./lib/userContract');
const DegreeContract = require('./lib/degreeContract');

module.exports.HECContract = HECContract;
module.exports.UniversityContract = UniversityContract;
module.exports.UserContract = UserContract;
module.exports.DegreeContract = DegreeContract;

module.exports.contracts = [HECContract, UniversityContract, UserContract, DegreeContract];
