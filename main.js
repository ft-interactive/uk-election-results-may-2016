var fs = require('fs');
var request = require('request');
var nunjucks = require('nunjucks');



var config = JSON.parse(fs.readFileSync('config.json','utf-8'));

console.log(config);


if(config.bertha){
	request(config.bertha, function (err, response, body) {
		if (!err && response.statusCode == 200) {
			var sheets = JSON.parse(body);
			var partyLookup = makeLookup(sheets.parties, 'paabbreviation');
			var cardLookup = makeLookup(sheets.cards, 'election');

			nunjucks.configure('views', {
			    autoescape: true
			})
			.addFilter('partyname', function(code){
				console.log(code);
				if(partyLookup[code]){ 
					return partyLookup[code].name; 
				}
				return code			
			})
			.addFilter('partylogo', function(code){
				console.log(code);
				if(partyLookup[code]){ 
					return partyLookup[code].logo; 
				}
				return code			
			})
			.addFilter('cardtitle', function(code){
				console.log(code);
				if(cardLookup[code]){ 
					return cardLookup[code].title; 
				}
				return code			
			});

			//render html
			var html = nunjucks.render('template.html', sheets)
			//save html
			fs.writeFileSync(config.htmlDir + '/index.html', html);
		}else{
			console.error(new Date() + " " + err);
			exit(1);
		}
	})
}else{
	console.error(new Date() + " no bertha sheet specified");
	exit(1);
}


function makeLookup(array, key){
	var lookup = {};
	array.forEach(function(d){
		lookup[ d[key] ] = d;
	});
	return lookup;
}