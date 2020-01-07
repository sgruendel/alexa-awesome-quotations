'use strict';

const winston = require('winston');

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    transports: [
        new winston.transports.Console({
            format: winston.format.simple(),
        }),
    ],
    exitOnError: false,
});

const db = require('./db');

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

exports.voicifyQuote = async function(locale, author, quote) {
    let voiceName = getRandomItem(maleVoiceNames[locale]); // Default voice, most quotes are from males.
    let voiceLang;
    try {
        let authorModel = await db.get(author);
        if (authorModel) {
            const authorLocale = authorModel.get('locale');
            const authorLocaleSplit = authorLocale.split('-', 2);
            const authorLang = authorLocale !== '?' && authorLocaleSplit[0];
            if (locale.startsWith(authorLang) && locale !== authorLocale) {
                // <voice name="Brian"><lang xml:lang="en-GB">Your secret is safe with me!</lang></voice>
                logger.debug('Using ' + author + "'s native locale " + authorLocale + ' for speech output in ' + locale);
                voiceName = getRandomItem(authorModel.get('sex') === 'F' ? femaleVoiceNames[authorLocale] : maleVoiceNames[authorLocale]);
                voiceLang = authorLocale;
            } else {
                // Either we have translation (e.g. Hermann Hesse quotation for en-US)
                // or a match (e.g. Abraham Lincoln for en-US), so no need to set SSML lang.
                voiceName = getRandomItem(authorModel.get('sex') === 'F' ? femaleVoiceNames[locale] : maleVoiceNames[locale]);
            }
        } else {
            authorModel = await db.create({ name: author, sex: '?', locale: '?' });
            logger.debug('not in db yet, created', authorModel.attrs);
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
