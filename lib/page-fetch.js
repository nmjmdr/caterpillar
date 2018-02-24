const request = require('request');
const querystring = require('querystring');
const zlib = require('zlib');



function buildResultsPage(body, resultsPerPage) {
  const resultLinks = parseResultLinks(body);
  let result = {
    hasSearchResults: (resultLinks.length > 0),
    hasNext: hasNextLink(body),
    links: resultLinks
  }
  return result;
}

function hasNextLink(body) {
  let count = 0;
  const regex = /Next<\/span><\/a><\/td>/g;
  let m;
  while ((m = regex.exec(body)) !== null) {
      if (m.index === regex.lastIndex) {
          regex.lastIndex++;
      }
      count++;
  }
  return count > 0;
}

function parseResultLinks(body) {
  const regex = /<h3 class="r">(.*)<\/h3>/g;
  let m;
  let links = [];
  while ((m = regex.exec(body)) !== null) {
      if (m.index === regex.lastIndex) {
          regex.lastIndex++;
      }
      // The result can be accessed through the `m`-variable.
      m.forEach((match, groupIndex) => {
        if(groupIndex === 1) {
          links.push(match.substring(0,40));
        }
      });
  }
  return links;
}

function create(keywords, resultsPerPage) {
  keywords = querystring.escape(keywords);
  let url = `https://www.google.co.in/search?q=${keywords}&safe=active&ie=UTF-8&sa=N&num=${resultsPerPage}`;
  return (pageNumber) => {
    console.log(pageNumber, resultsPerPage)
    url = url + '&start='+(pageNumber * resultsPerPage);
    console.log(url)
    const options = {
      url: url,
      method: 'GET',
      headers: {
        'user-agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36'
      }
    };
    return new Promise((resolve, reject)=>{
      request(options,(err, response, body)=>{
        if(!err && response.statusCode === 200) {
          console.log(response.body);
          resolve(buildResultsPage(response.body, resultsPerPage));
        } else {
          reject(new Error('Code: '+response.statusCode+'Error: '+err));
        }
      });
    });
  }
}

module.exports = {
  create: create,
}
