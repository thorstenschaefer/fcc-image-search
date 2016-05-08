var GOOGLE_SEARCH_API_KEY = "AIzaSyBdc77VVW1JC4y1ugvsyM8MyL7xajIVJrY";
var QUERY = 'https://www.googleapis.com/customsearch/v1?&cx=011928329055440715287%3Arkklnszt9mk&filter=1&searchType=image&key=' + GOOGLE_SEARCH_API_KEY + "&q=";

var express = require('express');
var request = require('request');
var app = express();
var recentSearches = [];


// binding for recent searches
app.get("/latest/imagesearch", function(req, res) {
  var targetUrl = req.params.targetUrl;
  console.log("Request for recent searches");
  res.json(recentSearches);
});

// binding for queries
app.get("/imagesearch/:q", function(req, res) {
  var q = req.params.q;
  var page = req.query.offset || 1;
  console.log("Requesting search for: " + q);
  console.log("Page is " + page);
  var finalQuery = QUERY + encodeURIComponent(q);
  if (page) {
    if (page > 9) {
      res.send("Please use an offset <=9. This is a limitation imposed by the Google free search API :(");
      return;
    }
    var start = page * 10 + 1;
    finalQuery += "&start=" + start;
  }
  console.log("Sending request to Google: " + finalQuery);

  var googleRequest = request(finalQuery, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        //console.log(body) // Print the google web page.
        recentSearches.push({ "term" : q, "when": new Date() });
        var result = toResult(JSON.parse(body));
        res.json(result);
     } else {
       res.send("Something went wrong. Status code: " + response.statusCode + "; Error: " + error);
     }
  });
  
  googleRequest.end();
});

var port = process.env.PORT || 8080;
app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});

function toResult(body) {
  var items = body.items;
  var result = [];
  for (var i=0; i<items.length;i++) {
    var item = items[i];
    result.push({
      "url" : item.link,
      "snippet" : item.snippet,
      "thumbnail" : item.image.thumbnailLink,
      "context" : item.image.contextLink
    });
  }
  return result;
}