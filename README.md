# Caterpillar
Google search results scrapper and parser

## Introduction
Caterpillar fetches results from google and counts the number of links that have the same domain that one you are interested in.
### How to use:
`node index.js keywords="keywords" url="domain-to-look-for"`

_Example_:
![use](https://raw.githubusercontent.com/nmjmdr/caterpillar/master/screenshots/creditor_watch_use.png)

```The program looks for likns with the same `domain` as that of the url provided as input argument. It then outputs the links that did meet this criterion and the page numbes of which these links were found in google search results.```

## Design notes:
I have tried to follow a `functional` and `event driven` approach. 
>_The program is flexible and granular so that it can be easily extended to do something else with the search results isntead > of counting the url matches._


### Components:

Crawler is responsible for crawling the pages. It sets up an event-emitter that can be used by potential listeners for events: _ResultsFetched, SearchDone and SearchFailed_.
It uses a dependency that is _injected into it_ to fetch the pages. This depedency is implemented by two components: `serial-fetch` and `parallel-fetch`.

Serial-fetch fetches the search results pages one after the another (Probably the better as this might avoid getting the IP blocked).

Parallel-fetch fetches the search results parallely.

Both these fetches use a common component `page-fetch` to fetch a single search result page.

![components](https://raw.githubusercontent.com/nmjmdr/caterpillar/master/screenshots/Components.png)


### Unit tests:
The program runs unit tests using chain, mocha, sinon.

### Performance:
The program uses "cheerio" to parse the html body of the search results. Cheerio loads the html and converts it a dom. It does not do any JS exection, just laods the dom to make it easy to search the elements. Still, ideally a regular expressions based search would be more performant. I faced some issues in parsing the body using regex and hence the use of cheerio. As one f the next steps it would be better to use regex to parse the body instead of using cheerio.

Still it takes a lot less to parse the body as compared to fetching the response:



