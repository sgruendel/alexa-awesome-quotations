'use strict';

const dynamo = require('dynamodb');
dynamo.AWS.config.update({ region: 'eu-west-1' });
const Joi = require('joi');
const util = require('util');

const Author = dynamo.define('Author', {
    hashKey: 'name',
    timestamps: true,
    schema: {
        name: Joi.string(),
        sex: Joi.any().valid('M', 'F', '?'),
        locale: Joi.any().valid('de-DE', 'en-AU', 'en-CA', 'en-GB', 'en-IN', 'en-US', 'fr-CA', 'fr-FR', 'it-IT', 'es-MX', '?'),
    },
    // tableName: 'awesomeQuotations-authors',
});

var exports = module.exports = {};

exports.create = util.promisify(Author.create);

exports.get = util.promisify(Author.get);
