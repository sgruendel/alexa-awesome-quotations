'use strict';

// include the testing framework
const alexaTest = require('alexa-skill-test-framework');

const USER_ID = 'amzn1.ask.account.unit_test';

// initialize the testing framework
alexaTest.initialize(
    require('../src/index'),
    'amzn1.ask.skill.0b9d09d1-e37f-4753-8e50-e8adbfd6aeeb',
    USER_ID);
alexaTest.setLocale('en-US');
alexaTest.setExtraFeature('questionMarkCheck', false); // quotations may end with question marks

describe('Awesome Quotations Skill (en-US)', () => {
    describe('LaunchRequest', () => {
        alexaTest.test([
            {
                request: alexaTest.getLaunchRequest(),
                saysLike: 'You can say „Give me a quotation“, or you can say „Quote',
                reprompts: 'What can I help you with?',
                shouldEndSession: false,
            },
        ]);
    });

    describe('RandomQuoteIntent', () => {
        alexaTest.test([
            {
                request: alexaTest.getIntentRequest('RandomQuoteIntent'),
                saysLike: "Here's a quotation from ",
                //TODO hasCardTitle: 'Author',
                //TODO hasCardTextLike: 'Zitat',
                repromptsNothing: true, shouldEndSession: true,
            },
        ]);
    });

    describe('AuthorQuoteIntent', () => {
        alexaTest.test([
            {
                request: alexaTest.getIntentRequest('AuthorQuoteIntent', { Author: 'lincoln' }),
                saysLike: "Here's your quotation from Abraham Lincoln: ",
                hasCardTitle: 'Abraham Lincoln',
                //TODO hasCardTextLike: 'Zitat',
                repromptsNothing: true, shouldEndSession: true,
            },
            {
                request: alexaTest.getIntentRequest('AuthorQuoteIntent', { Author: 'twain' }),
                saysLike: "Here's your quotation from Mark Twain: ",
                hasCardTitle: 'Mark Twain',
                //TODO hasCardTextLike: 'Zitat',
                repromptsNothing: true, shouldEndSession: true,
            },
            {
                request: alexaTest.getIntentRequest('AuthorQuoteIntent', { Author: 'muhammad ali' }),
                saysLike: "Here's your quotation from Muhammad Ali: ",
                hasCardTitle: 'Muhammad Ali',
                //TODO hasCardTextLike: 'Zitat',
                repromptsNothing: true, shouldEndSession: true,
            },
            {
                request: alexaTest.getIntentRequest('AuthorQuoteIntent', { Author: 'beyoncé knowles' }),
                saysLike: "Here's your quotation from Beyoncé Knowles: ",
                hasCardTitle: 'Beyoncé Knowles',
                //TODO hasCardTextLike: 'Zitat',
                repromptsNothing: true, shouldEndSession: true,
            },
            {
                request: alexaTest.getIntentRequest('AuthorQuoteIntent', { Author: 'apj abdul kalam' }),
                saysLike: "Here's your quotation from A. P. J. Abdul Kalam: ",
                hasCardTitle: 'A. P. J. Abdul Kalam',
                //TODO hasCardTextLike: 'Zitat',
                repromptsNothing: true, shouldEndSession: true,
            },
            {
                request: alexaTest.getIntentRequest('AuthorQuoteIntent', { Author: 'cs lewis' }),
                saysLike: "Here's your quotation from C. S. Lewis: ",
                hasCardTitle: 'C. S. Lewis',
                //TODO hasCardTextLike: 'Zitat',
                repromptsNothing: true, shouldEndSession: true,
            },
            {
                request: alexaTest.getIntentRequest('AuthorQuoteIntent', { Author: 'doctor seuss' }),
                saysLike: "Here's your quotation from Dr. Seuss: ",
                hasCardTitle: 'Dr. Seuss',
                //TODO hasCardTextLike: 'Zitat',
                repromptsNothing: true, shouldEndSession: true,
            },
            {
                request: alexaTest.getIntentRequest('AuthorQuoteIntent', { Author: 'george s patton' }),
                saysLike: "Here's your quotation from George S. Patton: ",
                hasCardTitle: 'George S. Patton',
                //TODO hasCardTextLike: 'Zitat',
                repromptsNothing: true, shouldEndSession: true,
            },
            {
                request: alexaTest.getIntentRequest('AuthorQuoteIntent', { Author: 'lincoln' }),
                saysLike: "Here's your quotation from Abraham Lincoln: ",
                hasCardTitle: 'Abraham Lincoln',
                //TODO hasCardTextLike: 'Zitat',
                repromptsNothing: true, shouldEndSession: true,
            },
            {
                request: alexaTest.getIntentRequest('AuthorQuoteIntent', { Author: 'martin luther king junior' }),
                saysLike: "Here's your quotation from Martin Luther King, Jr.: ",
                hasCardTitle: 'Martin Luther King, Jr.',
                //TODO hasCardTextLike: 'Zitat',
                repromptsNothing: true, shouldEndSession: true,
            },
            {
                request: alexaTest.getIntentRequest('AuthorQuoteIntent', { Author: 'pope john paul 2' }),
                saysLike: "Here's your quotation from Pope John Paul II: ",
                hasCardTitle: 'Pope John Paul II',
                //TODO hasCardTextLike: 'Zitat',
                repromptsNothing: true, shouldEndSession: true,
            },
        ]);
    });

    describe('HelpIntent', () => {
        alexaTest.test([
            {
                request: alexaTest.getIntentRequest('AMAZON.HelpIntent'),
                saysLike: 'You can say „Give me a quotation“, or you can say „Quote',
                reprompts: 'What can I help you with?',
                shouldEndSession: false,
            },
        ]);
    });

    describe('CancelIntent', () => {
        alexaTest.test([
            {
                request: alexaTest.getIntentRequest('AMAZON.CancelIntent'),
                says: 'See you soon!',
                repromptsNothing: true, shouldEndSession: true,
            },
        ]);
    });

    describe('StopIntent', () => {
        alexaTest.test([
            {
                request: alexaTest.getIntentRequest('AMAZON.StopIntent'),
                says: 'See you soon!',
                repromptsNothing: true, shouldEndSession: true,
            },
        ]);
    });

    describe('SessionEndedRequest', () => {
        alexaTest.test([
            {
                request: alexaTest.getSessionEndedRequest(),
                saysNothing: true, repromptsNothing: true, shouldEndSession: true,
            },
        ]);
    });

    describe('ErrorHandler', () => {
        alexaTest.test([
            {
                request: alexaTest.getIntentRequest(''),
                says: "Sorry, I don't understand. Please say again?",
                reprompts: "Sorry, I don't understand. Please say again?",
                shouldEndSession: false,
            },
        ]);
    });
});
