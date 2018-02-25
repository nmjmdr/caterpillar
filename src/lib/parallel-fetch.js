/*
  The main idea of this fetcher is:
  * Fetch parallely, just dont get caught by google bot
*/

const pageFetcher = require('./page-fetch');
const eventNames = require('./event-names');


function fetch(searchParams, eventEmitter) {
  const fetchPage = pageFetcher.create(searchParams.keywords, searchParams.resultsPerPage);
  const numberOfPages = Math.ceil(searchParams.nResults/searchParams.resultsPerPage);

  let promisesToFetch = []
  for(page=0;page<numberOfPages;page++) {
    promisesToFetch.push(fetchPage(page));
  }
  Promise.all(promisesToFetch)
  .then((pageResults)=>{
    
  })
  .catch(())
}

module.exports = {
  fetch: fetch
}
