'use strict';

const http = require('http');
const cheerio = require('cheerio');
const fs = require('fs');

function authorsWithLetter(c, callback) {
    const request = http.get({ host: 'zitatezumnachdenken.com',
                               port: 80,
                               path: '/autoren/' + c,
                             });

    request.on('response', response => {
        if (response.statusCode < 200 || response.statusCode > 299) {
            throw(new Error(response.statusMessage));
        }
        response.on('error', err => {
            throw(err);
        });

        // explicitly treat incoming data as utf8
        response.setEncoding('utf8');

        // incrementally capture the incoming response body        
        var body = '';
        response.on('data', chunk => {
            body += chunk;
        });
            
        response.on('end', () => {
            const $ = cheerio.load(body);
            const authors = $('#autorTable tr').map((i, tr) => {
                if (i > 0) {
                    // skip table headers
                    const cells = $('td', tr).map((j, td) => {
                        const text = $(td).text();
                        if (j == 0) {
                            // author column includes href to quotes
                            const href = $('a', td).attr('href');
                            return { href, text };
                        } else {
                            return text
                        }
                    });
                    const name = cells[0].text;
                    const href = cells[0].href;
                    const desc = cells[1];
                    const noOfQuotes = parseInt(cells[2]);
                    // console.log(name, href, desc, noOfQuotes);
                    return { name, href, desc, noOfQuotes };
                }
            });
            callback(authors);
        });
    });

    request.on('error', err => {
        throw(err);
    });
    
    request.end();
}

function quotesForAuthor(i, href, page, callback) {
    var path = href.slice(href.lastIndexOf('/'));
    if (page > 1) {
        path += '/page/' + page;
    }
    console.log(path);
    const request = http.get({ host: 'zitatezumnachdenken.com',
                               port: 80,
                               path: path,
                             });
    request.on('response', response => {
        if (response.statusCode == 404) {
            // page not found
            return;
        } else if (response.statusCode < 200 || response.statusCode > 299) {
            throw(new Error(response.statusMessage));
        }
        response.on('error', err => {
            throw(err);
        });

        // explicitly treat incoming data as utf8
        response.setEncoding('utf8');

        // incrementally capture the incoming response body        
        var body = '';
        response.on('data', chunk => {
            body += chunk;
        });
            
        response.on('end', () => {
            const $ = cheerio.load(body);
            const quotes = $('#loop .stripex p').map((i, p) => {
                //console.log(p);
                return $(p).text();
            });
            callback(i, quotes);
            // get quotes from next page
            quotesForAuthor(i, href, page + 1, callback);
        });
    });

    request.on('error', err => {
        throw(err);
    });
    
    request.end();
}

const UNWANTED_AUTHORS = [ 'Eminem', 'Kurt Cobain' ];
const A = 65;
const Z = 90;
var authorNames = [];
var authors = [];
var letterCount = 0;
var totalQuoteCount = 0;
for (var c = A; c <= Z; c++) {
    authorsWithLetter(String.fromCharCode(c), authorsForC => {
        for (var i = 0; i < authorsForC.length; i++) {
            if (authorsForC[i].noOfQuotes > 0) {
                const authorName = authorsForC[i].name;
                if (!UNWANTED_AUTHORS.includes(authorName)) {
                    authorNames.push(authorName);
                    authors.push(authorsForC[i]);
                    totalQuoteCount += authorsForC[i].noOfQuotes;
                    // console.log(authorsForC[i].name, authorsForC[i].href);
                }
            }
        }

        letterCount++;
        if (letterCount > Z-A) {
            authorNames.sort();
            //console.log(authorNames);
            var stream = fs.createWriteStream('authors.json');
            stream.write(JSON.stringify(authorNames, null, 2));
            stream.end();

            var quotes = [];
            for (var i = 0; i < authorNames.length; i++) {
                // initialize quotes for author with empty array, so each page with quotes can be pushed below
                quotes[i] = [];
            }
            var quoteCount = 0;
            for (var i = 0; i < authorNames.length; i++) {
                const author = authors[i];
                quotesForAuthor(authors[i].name, authors[i].href, 1, (authorName, quotesForA) => {
                    console.log('Parsing quotes for', authorName);
                    var index = 0;
                    while (authorName != authorNames[index]) {
                        index++;
                    }
                    for (var j = 0; j < quotesForA.length; j++) {
                        quotes[index].push(quotesForA[j]);
                        quoteCount++;
                    }
                    console.log(quoteCount, totalQuoteCount);
                    if (quoteCount == totalQuoteCount) {
                        stream = fs.createWriteStream('quotes.json');
                        stream.write(JSON.stringify(quotes, null, 2));
                        stream.end();
                    }
                });
            }
        }
    });
}
