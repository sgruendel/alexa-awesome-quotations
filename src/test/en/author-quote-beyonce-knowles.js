'use strict';

var expect = require('chai').expect;
var index = require('../../index');

const context = require('aws-lambda-mock-context');
const ctx = context();

describe('Testing a session with the AuthorQuoteIntent:', () => {
    var speechResponse = null
    var speechError = null
    
    before(function(done) {
        index.handler( {
            "session": {
                "sessionId": "SessionId.8d5db35e-a9e1-464c-aee2-264552ce6a4e",
                "application": {
                    "applicationId": "amzn1.ask.skill.0b9d09d1-e37f-4753-8e50-e8adbfd6aeeb"
                },
                "attributes": {},
                "user": {
                    "userId": "amzn1.ask.account.[unique-value-here]"
                },
                "new": true
            },
            "request": {
                "type": "IntentRequest",
                "requestId": "EdwRequestId.a0821d38-f684-4327-be74-035f3a4fdf59",
                "locale": "en-US",
                "timestamp": "2017-03-31T15:49:08Z",
                "intent": {
                    "name": "AuthorQuoteIntent",
                    "slots": {
                        "Author": {
                            "name": "Author",
                            "value": "beyoncé knowles"
                        }
                    }
                }
            },
            "version": "1.0"
        }, ctx)
        
        ctx.Promise
            .then(resp => { speechResponse = resp; done(); })
            .catch(err => { speechError = err; done(); })
    })
    
    describe('The response', () => {
        it('should not have errored', () => {
            expect(speechError).to.be.null
        })
        
        it('should have a version', () => {
            expect(speechResponse.version).to.exist
        })
        
        it('should have a speechlet response', () => {
            expect(speechResponse.response).to.exist
        })

        it('should have a spoken response', () => {
            expect(speechResponse.response.outputSpeech).to.exist
        })

        it('should have a card response', () => {
            expect(speechResponse.response.card).to.exist
        })

        it('should have a card title for Beyoncé Knowles', () => {
            expect(speechResponse.response.card.title).to.equal('Beyoncé Knowles')
        })

        it('should end the alexa session', () => {
            expect(speechResponse.response.shouldEndSession).to.be.true
        })
    })
})
