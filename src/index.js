'use strict';

const Alexa = require('ask-sdk-core');
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const dashbot = process.env.DASHBOT_API_KEY ? require('dashbot')(process.env.DASHBOT_API_KEY).alexa : undefined;

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
        },
    },
};

function getTranslationArray(key, locale) {
    var translations = languageStrings[locale];
    if (!translations || !translations.translation[key]) {
        translations = languageStrings[locale.slice(0, 2)];
    }
    return translations.translation[key];
}

const RandomQuoteIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'RandomQuoteIntent';
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const locale = handlerInput.requestEnvelope.request.locale;

        console.log('getting quotes');
        const quotes = getTranslationArray('QUOTES', locale);
        const i = Math.floor(Math.random() * quotes.length);
        const quotedAuthor = getTranslationArray('AUTHORS', locale)[i];
        console.log('using random author', quotedAuthor);
        const randomQuote = quotes[i][Math.floor(Math.random() * quotes[i].length)];

        const speechOutput = requestAttributes.t('RANDOM_QUOTE_MESSAGE') + quotedAuthor + ': ' + randomQuote;
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .withStandardCard(quotedAuthor, randomQuote)
            .getResponse();
    },
};

const AuthorQuoteIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AuthorQuoteIntent';
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const locale = handlerInput.requestEnvelope.request.locale;

        const authors = getTranslationArray('AUTHORS', locale);
        const authorsNormalized = getTranslationArray('AUTHORS_NORMALIZED', locale);
        const quotes = getTranslationArray('QUOTES', locale);

        const slots = handlerInput.requestEnvelope.request.intent.slots;
        const authorSlot = slots.Author;
        var quotedAuthor, authorQuote;
        if (authorSlot && authorSlot.value) {
            const author = authorSlot.value.toLowerCase();

            console.log('searching for author', author);
            for (var i = 0; i < authors.length; i++) {
                if (authorsNormalized[i] === author) {
                    console.log('found exact match', authors[i], 'with', quotes[i].length, 'quotes');
                    quotedAuthor = authors[i];
                    authorQuote = quotes[i][Math.floor(Math.random() * quotes[i].length)];
                }
            }
            if (!authorQuote) {
                for (i = 0; i < authors.length; i++) {
                    if (authorsNormalized[i].includes(author)) {
                        console.log('found partial match', authors[i], 'with', quotes[i].length, 'quotes');
                        quotedAuthor = authors[i];
                        authorQuote = quotes[i][Math.floor(Math.random() * quotes[i].length)];
                    }
                }
            }
            if (!quotedAuthor) {
                console.error('author not found', author);
            }
        } else {
            console.error('No slot value given for author');
        }

        // Create speech output
        var speechOutput;
        if (quotedAuthor) {
            speechOutput = requestAttributes.t('AUTHOR_QUOTE_MESSAGE') + quotedAuthor + ': ' + authorQuote;
        } else {
            const i = Math.floor(Math.random() * quotes.length);
            quotedAuthor = authors[i];
            console.log('using random author', quotedAuthor);
            authorQuote = quotes[i][Math.floor(Math.random() * quotes[i].length)];
            speechOutput = requestAttributes.t('AUTHOR_NOT_FOUND') + requestAttributes.t('RANDOM_QUOTE_MESSAGE') + quotedAuthor + ': ' + authorQuote;
        }

        return handlerInput.responseBuilder
            .speak(speechOutput)
            .withStandardCard(quotedAuthor, authorQuote)
            .getResponse();
    },
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'LaunchRequest'
            || (request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent');
    },
    handle(handlerInput) {
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
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest'
            && (request.intent.name === 'AMAZON.CancelIntent' || request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
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
        console.log('Session ended with reason:', handlerInput.requestEnvelope.request.reason);
        return handlerInput.responseBuilder.getResponse();
    },
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.error('Error handled:', error);
        return handlerInput.responseBuilder
            .speak('Sorry, I can\'t understand the command. Please say again?')
            .reprompt('Sorry, I can\'t understand the command. Please say again?')
            .getResponse();
    },
};

const LocalizationInterceptor = {
    process(handlerInput) {
        const localizationClient = i18n.use(sprintf).init({
            lng: handlerInput.requestEnvelope.request.locale,
            overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
            resources: languageStrings,
            returnObjects: true,
        });

        const attributes = handlerInput.attributesManager.getRequestAttributes();
        attributes.t = (...args) => {
            return localizationClient.t(...args);
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
if (dashbot) exports.handler = dashbot.handler(exports.handler);
