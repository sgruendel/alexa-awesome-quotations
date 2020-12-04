'use strict';

// Convert from old db format created by module dynamodb to new format created by module dynamoose;
// Main difference: field updatedAt is new, createdAt is now using epoch instead of TZ string
// Only convert those entries that have se or locale set.

const dynamoose = require('dynamoose');

dynamoose.aws.sdk.config.update({ region: 'eu-west-1' });
const Author = dynamoose.model('Author',
    new dynamoose.Schema({
        name: {
            type: String,
            validate: (name) => name.length > 0,
            required: true,
        },
        sex: {
            type: String,
            default: '?',
            required: true,
            enum: ['M', 'F', '?'],
        },
        locale: {
            type: String,
            default: '?',
            required: true,
            enum: ['de-DE', 'en-AU', 'en-CA', 'en-GB', 'en-IN', 'en-US', 'fr-CA', 'fr-FR', 'it-IT', 'es-MX', '?'],
        },
        createdAt: Date,
        updatedAt: Date,
    }),
    {
        create: true,
        prefix: 'awesomeQuotations-',
        waitForActive: false,
    });

const AuthorOld = dynamoose.model('authors',
    new dynamoose.Schema({
        name: String,
        sex: String,
        locale: String,
        createdAt: String,
    }),
    {
        create: false,
        waitForActive: false,
    });

async function convert(results) {
    for (let i = 0; i < results.count; i++) {
        const authorOld = results[i];
        if (authorOld.sex !== '?' || authorOld.locale !== '?') {
            const author = new Author(authorOld);
            author.createdAt = new Date(authorOld.createdAt).getTime();
            author.updatedAt = new Date().getTime();
            try {
                await author.save();
            } catch (error) {
                console.error(error);
            }
        }
    }
};

(async() => {
    let lastKey;
    do {
        const results = await AuthorOld.scan().startAt(lastKey).limit(100).exec();
        console.log('converting ' + results.count);
        await convert(results);
        lastKey = results.lastKey;
    } while (lastKey);
})();
