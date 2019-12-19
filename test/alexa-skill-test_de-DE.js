'use strict';

// include the testing framework
const alexaTest = require('alexa-skill-test-framework');

const USER_ID = 'amzn1.ask.account.unit_test';

// initialize the testing framework
alexaTest.initialize(
    require('../src/index'),
    'amzn1.ask.skill.0b9d09d1-e37f-4753-8e50-e8adbfd6aeeb',
    USER_ID);
alexaTest.setLocale('de-DE');

describe('Schöne Sprüche Skill', () => {
    describe('LaunchRequest', () => {
        alexaTest.test([
            {
                request: alexaTest.getLaunchRequest(),
                saysLike: 'Du kannst sagen „Gib mir irgendein Zitat“, oder du kannst sagen „Zitiere',
                reprompts: 'Was soll ich tun?',
                shouldEndSession: false,
            },
        ]);
    });

    describe('RandomQuoteIntent', () => {
        alexaTest.test([
            {
                request: alexaTest.getIntentRequest('RandomQuoteIntent'),
                saysLike: 'Hier ist ein Zitat von ',
                //TODO hasCardTitle: 'Author',
                //TODO hasCardTextLike: 'Zitat',
                repromptsNothing: true, shouldEndSession: true,
            },
        ]);
    });

    describe('AuthorQuoteIntent', () => {
        alexaTest.test([
            {
                request: alexaTest.getIntentRequest('AuthorQuoteIntent', { Author: 'jean paul sartre' }),
                saysLike: 'Hier ist dein Zitat von Jean-Paul Sartre: ',
                hasCardTitle: 'Jean-Paul Sartre',
                //TODO hasCardTextLike: 'Zitat',
                repromptsNothing: true, shouldEndSession: true,
            },
            {
                request: alexaTest.getIntentRequest('AuthorQuoteIntent', { Author: 'jk rowling' }),
                saysLike: 'Hier ist dein Zitat von J. K. Rowling: ',
                hasCardTitle: 'J. K. Rowling',
                //TODO hasCardTextLike: 'Zitat',
                repromptsNothing: true, shouldEndSession: true,
            },
            {
                request: alexaTest.getIntentRequest('AuthorQuoteIntent', { Author: 'jon kabat zinn' }),
                saysLike: 'Hier ist dein Zitat von Jon Kabat-Zinn: ',
                hasCardTitle: 'Jon Kabat-Zinn',
                //TODO hasCardTextLike: 'Zitat',
                repromptsNothing: true, shouldEndSession: true,
            },
            {
                request: alexaTest.getIntentRequest('AuthorQuoteIntent', { Author: 'lincoln' }),
                saysLike: 'Hier ist dein Zitat von Abraham Lincoln: ',
                hasCardTitle: 'Abraham Lincoln',
                //TODO hasCardTextLike: 'Zitat',
                repromptsNothing: true, shouldEndSession: true,
            },
            {
                request: alexaTest.getIntentRequest('AuthorQuoteIntent', { Author: 'martin luther' }),
                saysLike: 'Hier ist dein Zitat von Martin Luther: ',
                hasCardTitle: 'Martin Luther',
                //TODO hasCardTextLike: 'Zitat',
                repromptsNothing: true, shouldEndSession: true,
            },
            {
                request: alexaTest.getIntentRequest('AuthorQuoteIntent', { Author: 'professor doktor christian ernst' }),
                saysLike: 'Hier ist dein Zitat von Prof. Dr. Christian Ernst: ',
                hasCardTitle: 'Prof. Dr. Christian Ernst',
                //TODO hasCardTextLike: 'Zitat',
                repromptsNothing: true, shouldEndSession: true,
            },
            {
                request: alexaTest.getIntentRequest('AuthorQuoteIntent', { Author: 'soren kierkegaard' }),
                saysLike: 'Hier ist dein Zitat von Søren Kierkegaard: ',
                hasCardTitle: 'Søren Kierkegaard',
                //TODO hasCardTextLike: 'Zitat',
                repromptsNothing: true, shouldEndSession: true,
            },
        ]);
    });

    describe('HelpIntent', () => {
        alexaTest.test([
            {
                request: alexaTest.getIntentRequest('AMAZON.HelpIntent'),
                saysLike: 'Du kannst sagen „Gib mir irgendein Zitat“, oder du kannst sagen „Zitiere',
                reprompts: 'Was soll ich tun?',
                shouldEndSession: false,
            },
        ]);
    });

    describe('CancelIntent', () => {
        alexaTest.test([
            {
                request: alexaTest.getIntentRequest('AMAZON.CancelIntent'),
                says: '<say-as interpret-as="interjection">bis dann</say-as>.',
                repromptsNothing: true, shouldEndSession: true,
            },
        ]);
    });

    describe('StopIntent', () => {
        alexaTest.test([
            {
                request: alexaTest.getIntentRequest('AMAZON.StopIntent'),
                says: '<say-as interpret-as="interjection">bis dann</say-as>.',
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
                says: "Sorry, I can't understand the command. Please say again?",
                reprompts: "Sorry, I can't understand the command. Please say again?",
                shouldEndSession: false,
            },
        ]);
    });
});