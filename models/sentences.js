var fs = require('fs');

/*
var sampleSentence1 = {
	text : ['The pen is', '#on#1', 'the notebook', '.'],
	preps : ['on'],
	img : '1000'
};
var sampleSentence2 = {
	text : ['The saucer is', '#under#1', 'the cup', '.'],
	preps : ['under'],
	img : '1000'
};
var sampleSentence3 = {
	text : ['The pencils are', '#in#1', 'the cup', '.'],
	preps : ['in'],
	img : '1001'
};
var sampleSentence4 = {
	text : ['The notebook is', '#beside#1', 'the cup', '.'],
	preps : ['beside'],
	img : '1000'
};
var sampleSentence5 = {
	text : ['The shell is', '#on#1', 'the sand', '.'],
	preps : ['on'],
	img : '1002'
};
var sampleSentence6 = {
	text : ['The frog is', '#in#1', 'the water', '.'],
	preps : ['in'],
	img : '1003'
};
var sampleSentence7 = {
	text : ['The frog is', '#on#1', 'the leaf', '.'],
	preps : ['on'],
	img : '1004'
};
var sampleSentence8 = {
	text : ['The horses are standing', '#in#1', 'the falling snow', '.'],
	preps : ['in'],
	img : '1005'
};
var sampleSentence9 = {
	text : ['The moon is', '#over#1', 'the lake', '.'],
	preps : ['over'],
	img : '1006'
};

*/


//var sentences = [sampleSentence1, sampleSentence2, sampleSentence3, sampleSentence4, sampleSentence5, sampleSentence6, sampleSentence7, sampleSentence8, sampleSentence9];

var isPunctuation = function(e){
	return (e === '.' || e === '?' || e === '!' || e === '...');
};

var findDefinition = function(j){
	return j;
};

var parsePreposition = function(e, i){
	var chars = e.split('');
	var txt = '';
	var def = '';
	var output = {t : '', p : true, d : 'unknown definition'};
	var i = 1;
	var foundEnd = false;
	for (i = 1; i < chars.length; i++){
		if (chars[i] === '#'){
			foundEnd = true;
			continue;
		}
		else if (foundEnd){
			def += chars[i];
		}
		else{
			txt += chars[i];
		}
	}
	output.t = (txt);
	output.d = findDefinition(parseInt(def));
	return output;
};

var getSentence = function(res, req, activePrepositions, collection){
	var output = {	txt : [],
					fileName: ''};
	var sentenceNumber;
	var preps;
	var i;
	var notFound = true;

	collection.find({preps:{$in:activePrepositions}}).toArray(function(err, docs){
		//docs.forEach(function(e){
		//	console.log(JSON.stringify(e));
		
		
		//});
	
		while (notFound){
			sentenceNumber = Math.floor(Math.random() * docs.length);
			preps = docs[sentenceNumber].preps;
			for (i = 0; i < preps.length; i++){
				if (activePrepositions.indexOf(preps[i]) !== -1){
					notFound = false;
				}
			}
		}
		
		output.fileName = docs[sentenceNumber].img;
		docs[sentenceNumber].text.forEach(function(e, i){
			if (i !== 0 && e.charAt(0) !== '#' && !isPunctuation(e)){
				output.txt.push({t : (' ' + e), p : false});
			}
			else if ((i === 0 || isPunctuation(e)) && e.charAt(0) !== '#'){
				output.txt.push({t : e, p : false});
			}
			else if (e.charAt(0) === '#'){
				output.txt.push(parsePreposition(e, i));
				if (i !== 0){//add space to end of prior string
					output.txt[i - 1].t = (output.txt[i - 1].t += ' ')
				}
			}
		});
		res.json(output);
	});	
};

exports.getSentence = getSentence;
