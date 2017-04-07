'use strict';

const https = require('https');
const cheerio = require('cheerio');
const fs = require('fs');

function authorsWithLetter(c, page, callback) {
    var path = '/authors/' + c;
    if (page > 1) {
        path += page;
    }
    console.log(path);
    const request = https.get({ host: 'www.brainyquote.com',
                                port: 443,
                                path: path,
                              });

    request.on('response', response => {
        if (response.statusCode == 301) {
            // page does not exist, we get a redirect to first page
            callback(null); // notify caller we're done
            return;
        } else if (response.statusCode < 200 || response.statusCode > 299) {
            console.error(path);
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
            const authors = $('.bq_s tbody tr').map((i, tr) => {
                const cells = $('td', tr).map((j, td) => {
                    if (j == 0) {
                        // author column includes href to quotes
                        const href = $('a', td).attr('href');
                        const text = $('a', td).text();
                        return { href, text };
                    } else {
                        return $(td).text();
                    }
                });
                const name = cells[0].text;
                const href = cells[0].href;
                const profession = cells[1];
                //console.log(name, href, profession);
                return { name, href, profession };
            });
            callback(authors);
            // try next page
            authorsWithLetter(c, page + 1, callback);
        });
    });

    request.on('error', err => {
        throw(err);
    });
    
    request.end();
}

function popularAuthorsWithLetter(c, page, callback) {
    var path = '/authors/' + c;
    if (page > 1) {
        path += page;
    }
    console.log(path);
    const request = https.get({ host: 'www.brainyquote.com',
                                port: 443,
                                path: path,
                              });

    request.on('response', response => {
        if (response.statusCode < 200 || response.statusCode > 299) {
            console.error(path);
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
            const authors = $('.block-sm-az').map((i, a) => {
                const name = $('span', a).text();
                const href = $(a).attr('href');
                return { name, href };
            });
            callback(authors);
            callback (null); // notify caller we're done
        });
    });

    request.on('error', err => {
        throw(err);
    });
    
    request.end();
}

function quotesForAuthor(i, href, callback) {
    console.log(href);
    const request = https.get({ host: 'www.brainyquote.com',
                                port: 443,
                                path: href,
                              });
    request.on('response', response => {
        if (response.statusCode < 200 || response.statusCode > 299) {
            console.error(href);
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
            const quotes = $('#quotesList .b-qt').map((i, a) => {
                //console.log(a);
                return $(a).text();
            });
            callback(i, quotes);
        });
    });

    request.on('error', err => {
        throw(err);
    });
    
    request.end();
}

const UNWANTED_AUTHORS = [ 'Benito Mussolini', 'Eminem', 'Kurt Cobain' ];
const A = 97;
const Z = 122;
var authorNames = [];
var authors = [];
var letterCount = 0;
for (var c = A; c <= Z; c++) {
    popularAuthorsWithLetter(String.fromCharCode(c), 1, authorsForC => {
        if (authorsForC) {
            for (var i = 0; i < authorsForC.length; i++) {
                const authorName = authorsForC[i].name;
                if (!UNWANTED_AUTHORS.includes(authorName)) {
                    authorNames.push(authorName);
                    authors.push(authorsForC[i]);
                    // console.log(authorsForC[i].name, authorsForC[i].href);
                }
            }
        } else {
            // last page reached for this letter
            letterCount++;
        }

        if (letterCount > Z-A) {
            authorNames.sort();
            //console.log(authorNames);
            var stream = fs.createWriteStream('authors_en.json');
            stream.write(JSON.stringify(authorNames, null, 2));
            stream.end();

            var quotes = [];
            for (var i = 0; i < authorNames.length; i++) {
                // initialize quotes for author with empty array, so each page with quotes can be pushed below
                quotes[i] = [];
            }
            for (var i = 0; i < authorNames.length; i++) {
                const author = authors[i];
                quotesForAuthor(authors[i].name, authors[i].href, (authorName, quotesForA) => {
                    console.log('Parsing quotes for', authorName);
                    var index = 0;
                    while (authorName != authorNames[index]) {
                        index++;
                    }
                    for (var j = 0; j < quotesForA.length; j++) {
                        quotes[index].push(quotesForA[j]);
                    }
                    if (i == authorNames.length) {
                        stream = fs.createWriteStream('quotes_en.json');
                        stream.write(JSON.stringify(quotes, null, 2));
                        stream.end();
                    }
                });
            }
        }
    });
}
