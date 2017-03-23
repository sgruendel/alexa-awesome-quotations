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
const languageStrings = {
    'en': {
        translation: {
            CARD_TITLE: 'Awesome Quotations',
            QUOTE_MESSAGE: 'Here\'s your quote: ',
            HELP_MESSAGE: 'You can say "Give me a quote", or you can say "Exit". How can I help you?',
            HELP_REPROMPT: 'How can I help you?',
            STOP_MESSAGE: 'Goodbye!',
        },
    },
        
    'de': {
        translation: {
            CARD_TITLE: 'Schöne Sprüche',
            QUOTE_MESSAGE: 'Hier ist dein Spruch: ',
            HELP_MESSAGE: 'Du kannst sagen „Gib mir ein Zitat“, oder du kannst „Beenden“ sagen. Was soll ich tun?',
            HELP_REPROMPT: 'Was soll ich tun?',
            STOP_MESSAGE: 'Bis bald!',
        },
    },
};

const QUOTES = [
    'Man muß das Unmögliche versuchen, um das Mögliche zu erreichen.',
    'Man braucht vor niemand Angst zu haben. Wenn man jemanden fürchtet, dann kommt es daher, daß man diesem Jemand Macht über sich eingeräumt hat. (aus "Demian")',
    'Leute mit Mut und Charakter sind den anderen Leuten immer sehr unheimlich.',
    'Wenn wir einen Menschen glücklicher und heiterer machen können, so sollten wir es in jedem Fall tun, mag er uns darum bitten oder nicht.',
    'Es wird immer gleich ein wenig anders, wenn man es ausspricht.',
    'Jeder Mensch ist liebenswert, wenn er wirklich zu Worte kommt.',
    'Solange du nach dem Glück jagst, bist du nicht reif zum Glücklichsein.',
    'Wahrlich, keiner ist weise, der nicht das Dunkel kennt.',
    'Ein Haus ohne Bücher ist arm, auch wenn schöne Teppiche seinen Böden und kostbare Tapeten und Bilder die Wände bedecken.',
    'Eigensinn macht Spaß.',
    'Das Amt des Dichters ist nicht das Zeigen der Wege, sondern vor allem das Wecken der Sehnsucht.',
    'Nur das Denken, das wir leben, hat einen Wert.',
    'Wer das Denken zur Hauptsache macht, der kann es darin zwar weit bringen, aber er hat doch eben den Boden mit dem Wasser vertauscht, und einmal wird er ersaufen.',
    'Wahrer Beruf für den Menschen ist nur, zu sich selbst zu kommen.',
    'Solang du um Verlorenes klagst und Ziele hast und rastlos bist, weisst du noch nicht, was Friede ist.',
    'In der ganzen Welt ist jeder Politiker sehr für Revolution, für Vernunft und Niederlegung der Waffen - nur beim Feind, ja nicht bei sich selbst.',
    'Ich weiß nicht, ob mein Leben nutzlos und bloß ein Mißverständnis war oder ob es einen Sinn hat. (aus "Das Glasperlenspiel")',
    'Von den vielen Welten, die der Mensch nicht von der Natur geschenkt bekam, sondern sich aus eigenem Geist erschaffen hat, ist die Welt der Bücher die größte.',
    'Gerade das ist es ja, das Leben, wenn es schön und glücklich ist ein Spiel! Natürlich kann man auch alles mögliche andere aus ihm machen, eine Pflicht oder einen Krieg oder ein Gefängnis, aber es wird dadurch nicht hübscher.',
    'Gegner bedürfen einander oft mehr als Freunde, denn ohne Wind gehen keine Mühlen.',
    'Die Praxis sollte das Ergebnis des Nachdenkens sein, nicht umgekehrt.',
    'Man hat nur Angst, wenn man mit sich selber nicht einig ist. (aus "Demian")',
    'Intellektuelle Erkenntnisse sind Papiere. Vertrauen hat immer nur der, der von Erfahrenem redet.',
];

const handlers = {
    'LaunchRequest': function () {
        this.emit('EmitQuotation');
    },
    'EmitQuotationIntent': function () {
        this.emit('EmitQuotation');
    },
    'EmitQuotation': function () {
        const quoteIndex = Math.floor(Math.random() * QUOTES.length);
        const randomQuote = QUOTES[quoteIndex];

        // Create speech output
        const speechOutput = this.t('QUOTE_MESSAGE') + randomQuote;
        this.emit(':tellWithCard', speechOutput, this.t('CARD_TITLE'), randomQuote);
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = this.t('HELP_MESSAGE');
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
