/*
  The main idea of this fetcher is:
  * Fetch parallely, just dont get caught by google bot
*/

const pageFetcher = require('./page-fetch');
const eventNames = require('./event-names');

function countResults(pages){
  return pages.reduce((acc, page)=>{
    if(page.links) {
      acc += page.links.length
    }
    return acc;
  },0);
}

function fetch(searchParams, eventEmitter) {
  const fetchPage = pageFetcher.create(searchParams.keywords, searchParams.resultsPerPage);
  const numberOfPages = Math.ceil(searchParams.nResults/searchParams.resultsPerPage);

  let promisesToFetch = []
  for(page=0;page<numberOfPages;page++) {
    promisesToFetch.push(fetchPage(page));
  }
  Promise.all(promisesToFetch)
  .then((pages)=>{
    eventEmitter.emit(eventNames.ResultsFetched, pages);
    return pages
  })
  .then((pages)=>{
    const resultsCount = countResults(pages);
    eventEmitter.emit(eventNames.SearchDone, { isPartial: (resultsCount < searchParams.nResults) });
  })
  .catch((err)=>{
    eventEmitter.emit(eventNames.SearchFailed, { error: err });
  })
}

module.exports = {
  fetch: fetch
}
