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






