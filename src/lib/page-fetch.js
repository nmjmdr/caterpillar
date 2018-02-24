const request = require('request');
const querystring = require('querystring');
const cheerio = require('cheerio');

function buildResultsPage(body, resultsPerPage) {
  const parsedBody = parseBody(body);
  let result = {
    hasSearchResults: (parsedBody.links.length > 0),
    hasNext: parsedBody.hasNext,
    links: parsedBody.links
  }
  return result;
}


function parseBody(body) {
  const linkSelection = 'h3.r a'
  const itemSelection = 'div.g'
  const nextSelection = 'td.b a span'
  let links = [];
  const $ = cheerio.load(body);
  $(itemSelection).each(function (i, elem) {
    const linkElem = $(elem).find(linkSelection);
    const linkObj = querystring.parse($(linkElem).attr('href'))
    const link = Object.keys(linkObj)[0];
    if(link) {
      links.push(link)
    }
  });
  hasNext = ($(nextSelection).last().text() === 'Next');
  return {
    links: links,
    hasNext: hasNext
  }
}

function create(keywords, resultsPerPage) {
  keywords = querystring.escape(keywords);
  const url = `https://www.google.co.in/search?q=${keywords}&safe=active&ie=UTF-8&sa=N&num=${resultsPerPage}`;
  return (pageNumber) => {
    const urlWithStart = url + '&start='+(pageNumber * resultsPerPage);
    const options = {
      url: urlWithStart,
      method: 'GET',
      headers: {
        'user-agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36'
      }
    };
    return new Promise((resolve, reject)=>{
      request(options,(err, response, body)=>{
        if(!err && response.statusCode === 200) {
          resolve(buildResultsPage(response.body, resultsPerPage));
        } else {
          reject(new Error('Code: '+response.statusCode+' Error: '+err));
        }
      });
    });
  }
}

module.exports = {
  create: create,
}
