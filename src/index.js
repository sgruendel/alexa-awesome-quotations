/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * This sample supports multiple lauguages. (en-US, en-GB, de-DE).
 * The Intent Schema, Custom Slots and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-fact
 **/

'use strict';

const Alexa = require('alexa-sdk');

const APP_ID = 'amzn1.ask.skill.0b9d09d1-e37f-4753-8e50-e8adbfd6aeeb';
const authors_de = require('./authors_de.json');
const authors_en = require('./authors_en.json');
const quotes_de = require('./quotes_de.json');
const quotes_en = require('./quotes_en.json');

const authorsNormalized_de = authors_de.map(author => {
    return author.toLocaleLowerCase().replace('-', ' ')
        .replace('prof. dr. ', 'professor doktor ')
        .replace('ø', 'o');
    // normalize to lower case, replacing '-' with space, replacing full title with abbreviation
    // ø => o for Søren Kierkegaard
});
const authorsNormalized_en = authors_en.map(author => {
    var normalized = author.toLocaleLowerCase().replace('-', ' ')
        .replace('dr. ', 'doctor ').replace(', jr.', ' junior').replace(' ii', ' 2');
    // normalize to lower case, replacing '-' with space
    // replacing full title with abbreviation, "Pope John Paul II" => "2"
    const re = /^([a-z]\. )+/;
    const result = re.exec(normalized);
    if (result) {
        // C. S. Lewis => cs lewis
        // A. P. J. Abdul Kalam => apj abdul kalam
        const initials = result[0].replace(/\. /g, '');
        normalized = initials + normalized.slice(result[0].length - 1);
    }
    return normalized;
});

const languageStrings = {
    "en": {
        "translation": {
            "AUTHORS": authors_en,
            "AUTHORS_NORMALIZED": authorsNormalized_en,
            "QUOTES": quotes_en,
            "AUTHOR_NOT_FOUND": "I don't know the author. ",
            "RANDOM_QUOTE_MESSAGE": "Here's a quotation from ",
            "AUTHOR_QUOTE_MESSAGE": "Here's your quotation from ",
            "HELP_MESSAGE": "You can say 'Give me a quotation', or you can say 'Quote {author}', or you can say 'Exit'. How can I help you?",
            "HELP_REPROMPT": "How can I help you?",
            "STOP_MESSAGE": "Goodbye!",
        },
    },
        
    "de": {
        "translation": {
            "AUTHORS": authors_de,
            "AUTHORS_NORMALIZED": authorsNormalized_de,
            "QUOTES": quotes_de,
            "AUTHOR_NOT_FOUND": "Ich kenne den Autor nicht. ",
            "RANDOM_QUOTE_MESSAGE": "Hier ist ein Zitat von ",
            "AUTHOR_QUOTE_MESSAGE": "Hier ist dein Zitat von ",
            "HELP_MESSAGE": "Du kannst sagen „Gib mir irgendein Zitat“, oder du kannst sagen „Zitiere {author}“, oder du kannst „Beenden“ sagen. Was soll ich tun?",
            "HELP_REPROMPT": "Was soll ich tun?",
            "STOP_MESSAGE": "Bis bald!",
        },
    },
};

const handlers = {
    'LaunchRequest': function () {
        this.emit('AMAZON.HelpIntent');
    },
    'RandomQuoteIntent': function () {
        const authors = this.t('AUTHORS');
        const quotes = this.t('QUOTES');
        const i = Math.floor(Math.random() * quotes.length);
        const quotedAuthor = authors[i];
        console.log('using random author', quotedAuthor);
        const randomQuote = quotes[i][Math.floor(Math.random() * quotes[i].length)];
        const speechOutput = this.t('RANDOM_QUOTE_MESSAGE') + quotedAuthor + ': ' + randomQuote;
        this.emit(':tellWithCard', speechOutput, quotedAuthor, randomQuote);
    },
    'AuthorQuoteIntent': function () {
        const authors = this.t('AUTHORS');
        const authorsNormalized = this.t('AUTHORS_NORMALIZED');
        const quotes = this.t('QUOTES');

        const authorSlot = this.event.request.intent.slots.Author;
        var quotedAuthor, authorQuote;
        if (authorSlot && authorSlot.value) {
            const author = authorSlot.value.toLowerCase();
            
            console.log('searching for author', author);
            for (var i = 0; i < authors.length; i++) {
                if (authorsNormalized[i] == author) {
                    console.log('found exact match', authors[i], 'with', quotes[i].length, 'quotes');
                    quotedAuthor = authors[i];
                    authorQuote = quotes[i][Math.floor(Math.random() * quotes[i].length)];
                }
            }
            if (!authorQuote) {
                for (var i = 0; i < authors.length; i++) {
                    if (authorsNormalized[i].includes(author)) {
                        console.log('found partial match', authors[i], 'with', quotes[i].length, 'quotes');
                        quotedAuthor = authors[i];
                        authorQuote = quotes[i][Math.floor(Math.random() * quotes[i].length)];
                    }
                }
            }
            if (!quotedAuthor) {
                console.log('author not found');
            }
        } else {
            console.error('No slot value given for author');
        }

        // Create speech output
        var speechOutput;
        if (quotedAuthor) {
            speechOutput = this.t('AUTHOR_QUOTE_MESSAGE') + quotedAuthor + ': ' + authorQuote;
        } else {
            const i = Math.floor(Math.random() * quotes.length);
            quotedAuthor = authors[i];
            console.log('using random author', quotedAuthor);
            authorQuote = quotes[i][Math.floor(Math.random() * quotes[i].length)];
            speechOutput = this.t('AUTHOR_NOT_FOUND') + this.t('RANDOM_QUOTE_MESSAGE') + quotedAuthor + ': ' + authorQuote;
        }

        this.emit(':tellWithCard', speechOutput, quotedAuthor, authorQuote);
    },
    'AMAZON.HelpIntent': function () {
        const authors = this.t('AUTHORS');
        const i = Math.floor(Math.random() * authors.length);
        const speechOutput = this.t('HELP_MESSAGE').replace('{author}', authors[i]);
        const reprompt = this.t('HELP_REPROMPT');
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'SessionEndedRequest': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
};

exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
