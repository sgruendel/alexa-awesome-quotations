'use strict';

const dynamoose = require('dynamoose');
const winston = require('winston');

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
    }, {
        timestamps: true,
    }),
    {
        create: false,
        prefix: 'awesomeQuotations-',
        waitForActive: false,
    });

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    transports: [
        new winston.transports.Console({
            format: winston.format.simple(),
        }),
    ],
    exitOnError: false,
});

const maleVoiceNames = {
    'en-US': [
        // Justin sounds childish
        'Joey', /* 'Justin', */ 'Matthew',
    ],
    'en-AU': [
        'Russell',
    ],
    'en-GB': [
        'Brian',
    ],
    // No names for 'en-CA' yet, no male names for 'en-IN' yet
    'de-DE': [
        'Hans',
    ],
    'es-ES': [
        'Enrique',
    ],
    'it-IT': [
        'Giorgio',
    ],
    'ja-JP': [
        'Takumi',
    ],
    'fr-FR': [
        'Mathieu',
    ],
};

const femaleVoiceNames = {
    'en-US': [
        // Ivy sounds childish
        /* 'Ivy', */ 'Joanna', 'Kendra', 'Kimberly', 'Salli',
    ],
    'en-AU': [
        'Nicole',
    ],
    'en-GB': [
        'Amy', 'Emma',
    ],
    'en-IN': [
        'Aditi', 'Raveena',
    ],
    // No names for 'en-CA' yet
    'de-DE': [
        'Marlene', 'Vicki',
    ],
    'es-ES': [
        'Conchita',
    ],
    'it-IT': [
        'Carla',
    ],
    'ja-JP': [
        'Mizuki',
    ],
    'fr-FR': [
        'Celine', 'Lea',
    ],
};

var exports = module.exports = {};

function getRandomItem(arrayOfItems) {
    if (!arrayOfItems) return undefined;
    const i = Math.floor(Math.random() * arrayOfItems.length);
    return arrayOfItems[i];
};

exports.voicifyQuote = async function(locale, authorName, quote) {
    let voiceName = getRandomItem(maleVoiceNames[locale]); // Default voice, most quotes are from males.
    let voiceLang;
    try {
        let author = await Author.get(authorName);
        if (author) {
            const authorLocaleSplit = author.locale.split('-', 2);
            const authorLang = author.locale !== '?' && authorLocaleSplit[0];
            if (locale.startsWith(authorLang) && locale !== author.locale) {
                // <voice name="Brian"><lang xml:lang="en-GB">Your secret is safe with me!</lang></voice>
                logger.debug('Using ' + author + "'s native locale " + author.locale + ' for speech output in ' + locale);
                voiceName = getRandomItem(author.sex === 'F' ? femaleVoiceNames[author.locale] : maleVoiceNames[author.locale]);
                voiceLang = author.locale;
            } else {
                // Either we have translation (e.g. Hermann Hesse quotation for en-US)
                // or a match (e.g. Abraham Lincoln for en-US), so no need to set SSML lang.
                voiceName = getRandomItem(author.sex === 'F' ? femaleVoiceNames[locale] : maleVoiceNames[locale]);
            }
        } else {
            author = await Author.create({ name: authorName });
            logger.debug('not in db yet, created', author);
        }
    } catch (err) {
        logger.error(err.stack || err.toString());
    }

    // No names for en-CA yet, no male names for en-IN.
    if (!voiceName) return quote;

    let voicifiedQuote = '<voice name="' + voiceName + '">';
    if (voiceLang) {
        voicifiedQuote += '<lang xml:lang="' + voiceLang + '">';
    }
    voicifiedQuote += quote;
    if (voiceLang) {
        voicifiedQuote += '</lang>';
    }
    voicifiedQuote += '</voice>';
    return voicifiedQuote;
};
