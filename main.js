var fs = require('fs');
var request = require('request');
var nunjucks = require('nunjucks');
var d3time = require('d3-time-format');

var fttimeformat = d3time.timeFormat("%I:%M%p");
console.log('running at: ' + new Date());
var config = JSON.parse(fs.readFileSync('config.json','utf-8'));

var outputDir = config.htmlDir;
if(process.argv[2] == 'live'){
	outputDir = config.livehtmlDir;
}

if(config.bertha){
	request(config.bertha, function (err, response, body) {
		if (!err && response.statusCode == 200) {
			var sheets = JSON.parse(body);

			sheets.councils = sheets.councils.sort(sortBy('numseats'));
			sheets.wales = sheets.wales.sort(sortBy('numseats'));
			sheets.scotland = sheets.scotland.sort(sortBy('numseats'));
			sheets.londonAssembly = sheets.londonAssembly.sort(sortBy('numseats'));
			sheets.nIreland = sheets.nIreland.sort(sortBy('numseats'));

			var partyLookup = makeLookup(sheets.parties, 'paabbreviation');
			var cardLookup = makeLookup(sheets.cards, 'election');
			
			sheets.elections = sheets.cards.map(function(row) {
				row.results = sheets[row.sheet] || [];
				return row;
			}).filter(function(election) {
				return election && election.enabled;
			});

			nunjucks.configure('views', {
			    autoescape: true
			})
			.addFilter('partyname', function(code){
				if(partyLookup[code]){ 
					return partyLookup[code].name; 
				}
				return code			
			})
			.addFilter('partylogo', function(code){
				if(partyLookup[code]){ 
					return partyLookup[code].logo; 
				}
				return code			
			})
			.addFilter('fttimeformat', function (date){
				return fttimeformat(date).toLowerCase()
			})
			.addFilter('linkurl', function (url){
				return url
			})

			.addFilter('changesign', function(num){
				if (num === null) {
					return '-';
				}
				if (num > 0){
					return "+" + num;
				}
				return num;
			})
			.addFilter('totals', function(num){
				if (num === null) {
					return '-';
				}
				return num;
			});
			
			sheets.date = new Date().setTime( new Date().getTime() + (60*60*1000) );
			sheets.url = sheets.options.link;

			//render html
			var html = nunjucks.render('template.html', sheets)
			//save html
			fs.writeFileSync(outputDir + '/index.html', html);
		}else{
			console.error(new Date() + " " + err);
			exit(1);
		}
	})
}else{
	console.error(new Date() + " no bertha sheet specified");
	exit(1);
}

function sortBy(key, f){
	if(!f) f = function(x){ return x === null ? 1 : Number(x); }
	return function(a, b){
		return f(b[key]) - f(a[key]);
	}
}


function makeLookup(array, key){
	var lookup = {};
	array.forEach(function(d){
		lookup[ d[key] ] = d;
	});
	return lookup;
}