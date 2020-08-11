'use strict';

const Alexa = require('ask-sdk-core');
const i18next = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
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

const utils = require('./utils');

const SKILL_ID = 'amzn1.ask.skill.0b9d09d1-e37f-4753-8e50-e8adbfd6aeeb';

const authors_de = require('./authors_de.json');
const authors_en = require('./authors_en.json');
const quotes_de = require('./quotes_de.json');
const quotes_en = require('./quotes_en.json');

function normalizeAuthor(author) {
    const re = /([a-z]\. )+/;
    const result = re.exec(author);
    if (result) {
        // C. S. Lewis => cs lewis
        // J. K. Rowling => jk rowling
        // A. P. J. Abdul Kalam => apj abdul kalam
        // George S. Patton => george s patton
        const letters = result[0].replace(/\. /g, '');
        author = author.substring(0, result.index)
            + letters
            + author.substring(result.index + result[0].length - 1, author.length);
    }
    return author;
}

const authorsNormalized_de = authors_de.map(author => {
    const normalizedDe = author.toLocaleLowerCase().replace('-', ' ')
        .replace('prof. dr. ', 'professor doktor ')
        .replace('ø', 'o');
    // normalize to lower case, replacing '-' with space
    // replacing full title with abbreviation, ø => o for Søren Kierkegaard
    return normalizeAuthor(normalizedDe);
});
const authorsNormalized_en = authors_en.map(author => {
    const normalizedEn = author.toLocaleLowerCase().replace('-', ' ')
        .replace('dr. ', 'doctor ')
        .replace(', jr.', ' junior')
        .replace(' ii', ' 2');
    // normalize to lower case, replacing '-' with space
    // replacing full title with abbreviation, "Pope John Paul II" => "2"
    return normalizeAuthor(normalizedEn);
});

const languageStrings = {
    en: {
        translation: {
            AUTHORS: authors_en,
            AUTHORS_NORMALIZED: authorsNormalized_en,
            QUOTES: quotes_en,
            AUTHOR_NOT_FOUND: "I don't know the author. ",
            RANDOM_QUOTE_MESSAGE: "Here's a quotation from ",
            AUTHOR_QUOTE_MESSAGE: "Here's your quotation from ",
            HELP_MESSAGE: 'You can say „Give me a quotation“, or you can say „Quote %s“, or you can say „Exit“. What can I help you with?',
            HELP_REPROMPT: 'What can I help you with?',
            STOP_MESSAGE: 'See you soon!',
            NOT_UNDERSTOOD_MESSAGE: 'Sorry, I don\'t understand. Please say again?',
        },
    },
    de: {
        translation: {
            AUTHORS: authors_de,
            AUTHORS_NORMALIZED: authorsNormalized_de,
            QUOTES: quotes_de,
            AUTHOR_NOT_FOUND: 'Ich kenne den Autor nicht. ',
            RANDOM_QUOTE_MESSAGE: 'Hier ist ein Zitat von ',
            AUTHOR_QUOTE_MESSAGE: 'Hier ist dein Zitat von ',
            HELP_MESSAGE: 'Du kannst sagen „Gib mir irgendein Zitat“, oder du kannst sagen „Zitiere %s“, oder du kannst „Beenden“ sagen. Was soll ich tun?',
            HELP_REPROMPT: 'Was soll ich tun?',
            STOP_MESSAGE: '<say-as interpret-as="interjection">bis dann</say-as>.',
            NOT_UNDERSTOOD_MESSAGE: 'Entschuldigung, das verstehe ich nicht. Bitte wiederhole das?',
        },
    },
};

function getTranslationArray(key, locale) {
    let translations = languageStrings[locale];
    if (!translations || !translations.translation[key]) {
        translations = languageStrings[locale.slice(0, 2)];
    }
    return translations.translation[key];
}

const RandomQuoteIntentHandler = {
    canHandle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;
        return request.type === 'IntentRequest' && request.intent.name === 'RandomQuoteIntent';
    },
    async handle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;
        logger.debug('request', request);

        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const locale = Alexa.getLocale(handlerInput.requestEnvelope);

        const quotes = getTranslationArray('QUOTES', locale);
        const i = Math.floor(Math.random() * quotes.length);
        const quotedAuthor = getTranslationArray('AUTHORS', locale)[i];
        logger.info('using random author ' + quotedAuthor);
        const randomQuote = quotes[i][Math.floor(Math.random() * quotes[i].length)];

        const speechOutput = requestAttributes.t('RANDOM_QUOTE_MESSAGE') + quotedAuthor + ': ' + await utils.voicifyQuote(locale, quotedAuthor, randomQuote);
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .withStandardCard(quotedAuthor, randomQuote)
            .getResponse();
    },
};

const AuthorQuoteIntentHandler = {
    canHandle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;
        return request.type === 'IntentRequest' && request.intent.name === 'AuthorQuoteIntent';
    },
    async handle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;
        logger.debug('request', request);

        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const locale = Alexa.getLocale(handlerInput.requestEnvelope);

        const authors = getTranslationArray('AUTHORS', locale);
        const authorsNormalized = getTranslationArray('AUTHORS_NORMALIZED', locale);
        const quotes = getTranslationArray('QUOTES', locale);

        const slots = handlerInput.requestEnvelope.request.intent.slots;
        const authorSlot = slots.Author;
        let quotedAuthor, authorQuote;
        if (authorSlot && authorSlot.value) {
            const author = authorSlot.value.toLowerCase();

            logger.debug('searching for author ' + author);
            for (let i = 0; i < authors.length; i++) {
                if (authorsNormalized[i] === author) {
                    logger.info('found exact match "' + authors[i] + '" with ' + quotes[i].length + ' quotes');
                    quotedAuthor = authors[i];
                    authorQuote = quotes[i][Math.floor(Math.random() * quotes[i].length)];
                }
            }
            if (!authorQuote) {
                for (let i = 0; i < authors.length; i++) {
                    if (authorsNormalized[i].includes(author)) {
                        logger.info('found partial match "' + authors[i] + '" with ' + quotes[i].length + ' quotes');
                        quotedAuthor = authors[i];
                        authorQuote = quotes[i][Math.floor(Math.random() * quotes[i].length)];
                    }
                }
            }
            if (!quotedAuthor) {
                logger.error('author not found: ' + author);
            }
        } else {
            logger.error('No slot value given for author');
        }

        // Create speech output
        let speechOutput;
        if (quotedAuthor) {
            speechOutput = requestAttributes.t('AUTHOR_QUOTE_MESSAGE') + quotedAuthor + ': '
                + await utils.voicifyQuote(locale, quotedAuthor, authorQuote);
        } else {
            const i = Math.floor(Math.random() * quotes.length);
            quotedAuthor = authors[i];
            logger.info('using random author: ' + quotedAuthor);
            authorQuote = quotes[i][Math.floor(Math.random() * quotes[i].length)];
            speechOutput = requestAttributes.t('AUTHOR_NOT_FOUND') + requestAttributes.t('RANDOM_QUOTE_MESSAGE') + quotedAuthor + ': '
                + await utils.voicifyQuote(locale, quotedAuthor, authorQuote);
        }

        return handlerInput.responseBuilder
            .speak(speechOutput)
            .withStandardCard(quotedAuthor, authorQuote)
            .getResponse();
    },
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;
        return request.type === 'LaunchRequest'
            || (request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent');
    },
    handle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;
        logger.debug('request', request);

        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const authors = requestAttributes.t('AUTHORS');
        const i = Math.floor(Math.random() * authors.length);
        const speechOutput = requestAttributes.t('HELP_MESSAGE', authors[i]);
        const repromptSpeechOutput = requestAttributes.t('HELP_REPROMPT');
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt(repromptSpeechOutput)
            .getResponse();
    },
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;
        return request.type === 'IntentRequest'
            && (request.intent.name === 'AMAZON.CancelIntent' || request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;
        logger.debug('request', request);

        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const speechOutput = requestAttributes.t('STOP_MESSAGE');
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .getResponse();
    },
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;
        try {
            if (request.reason === 'ERROR') {
                logger.error(request.error.type + ': ' + request.error.message);
            }
        } catch (err) {
            logger.error(err.stack || err.toString(), request);
        }

        logger.debug('session ended', request);
        return handlerInput.responseBuilder.getResponse();
    },
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        logger.error(error.stack || error.toString(), handlerInput.requestEnvelope.request);
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const speechOutput = requestAttributes.t('NOT_UNDERSTOOD_MESSAGE');
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .reprompt(speechOutput)
            .getResponse();
    },
};

const LocalizationInterceptor = {
    process(handlerInput) {
        i18next.use(sprintf).init({
            lng: Alexa.getLocale(handlerInput.requestEnvelope),
            overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
            resources: languageStrings,
            returnObjects: true,
        });

        const attributes = handlerInput.attributesManager.getRequestAttributes();
        attributes.t = (...args) => {
            return i18next.t(...args);
        };
    },
};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        RandomQuoteIntentHandler,
        AuthorQuoteIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler)
    .addRequestInterceptors(LocalizationInterceptor)
    .addErrorHandlers(ErrorHandler)
    .withSkillId(SKILL_ID)
    .lambda();
