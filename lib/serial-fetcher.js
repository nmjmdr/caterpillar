/*
  The main idea of this fetcher is:
  * Fetch serially, avoid fetching parallely as it might trigger Google's bots into blocking our ip
*/

const pageFetcher = require('./page-fetcher');
const serializer = require('./serialized-promises');
const events = require('./event-names');

function fetch(searchParams, eventEmitter) {
  const fetchPage = pageFetcher.create(searchParams.keywords, searchParams.resultsPerPage);
  let requiredPages = Math.ceil((searchParams.nResults/searchParams.resultsPerPage));
  let pageNumber = 1;

  return serializer.serialize(requiredPages,(pageNumber)=>{
    return fetchPage(pageNumber);
  },(page)=>{
    // done fetching a page
    eventEmitter.emit(events.PageResulted, page);
    // fetch the next page
    pageNumber = pageNumber + 1;
    // we will have to parse the page here to see if we have to stop
    // indicate to continue
    return true;
  });
}

module.exports = {
  fetch: fetch
}
