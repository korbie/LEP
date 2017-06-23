
var manager = (function(){
	var numberOptions = 3;
	var activePrepositions = ['on','under','in','beside','around','above','over'];
	//var sentenceQueue = [];//********need to develop from here system to maintain queue of correct sentences (with images!) 
	//var currentSentence = {};
	
	var toggleActivePrepositions = function(p){
		var correctAnswersLeft = 0;
		var preposition = $(p).html();
			if (activePrepositions.indexOf(preposition) === -1){
				activePrepositions.push(preposition);
				$(p).addClass('selected').removeClass('unselected').attr('title','remove');
				if (numberOptions < 3){
					increaseOptions();
				}
			}
			else if (activePrepositions.indexOf(preposition) !== -1){
				if (activePrepositions.length === 2){
					return;
				}
				else{
					activePrepositions = activePrepositions.filter(function(e){
						return e !== preposition;
					});
					if (numberOptions === activePrepositions.length){
						decreaseOptions();
					}
					$(p).addClass('unselected').removeClass('selected').attr('title','add');
					
					//run a check to deploy new sentence if all prepositions in current sentence have been removed from the list of active prepositions
					answerChecker.getCorrectAnswers().forEach(function(e){
						correctAnswersLeft += (activePrepositions.indexOf(e) === -1 ? 0 : 1);							
					});
					if (correctAnswersLeft === 0){
						getNewSentence();
					}
				}
			}
		};
		
	var alphabetizePrepositions = function(){
		activePrepositions.sort(function(a, b){
			return a.localeCompare(b);
		});
	};
		
	var shuffleArray = function(array){
		var currentIndex = array.length,
		temporaryValue,
		randomIndex;

		while (currentIndex !== 0) {

		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	  }
	  return array;
	};
	
	var getRandomPrepositions = function(currentPreposition){//returns randomized array including correct answer, plus number of random options equal to numberOptions
		var arr,
			i,
			result = [],
			numberNeeded = numberOptions;
			
		arr = shuffleArray(activePrepositions);
		
		for (i = 0; i < numberNeeded; i++){
			if (arr[i] === currentPreposition){
				numberNeeded++;
				continue;
			}
			result.push(arr[i]);
		}
		result.push(currentPreposition);
		return shuffleArray(result);
	};
		
	var increaseOptions = function(){//increases options up to upper limit of one fewer than the total number of prepositions 
		if (numberOptions < activePrepositions.length - 1){
			numberOptions++;
			$('#numberOptions').html(numberOptions);
			return true;
		}
		else {
			return false;
		}
	};
		
	var decreaseOptions = function(){//decreases options down to the lower limit of 1
		if (numberOptions > 1){
			numberOptions--;
			$('#numberOptions').html(numberOptions);
			return true;
		}
		else{
			return false;
		}
	};
	
	var changeNumberOptions = function(instruction){//directs requests to increaseOptions or decreaseOptions
		if (instruction === 'increase'){
			return increaseOptions();
		}
		else if (instruction === 'decrease'){
			return decreaseOptions();
		}
	};
	
	var setOptionButtons = function(){
		var btns = $("#btnsNumberOptions").children(".btn");
		btns.each(function(i, e){
			var p = $(e).attr('name'),
			f = function(func, arg){
				return (function(){
					func(arg);
				});
			};
		$(e).on('click', f(changeNumberOptions,p));		
		});
	};
	
	var setPrepositionDisplay = function(){
		alphabetizePrepositions();
		var d = $('.preposition-display');
		var last = activePrepositions.length;
		var f = function(func, arg){
				return function(){
					func(arg);
				};
			};
		activePrepositions.forEach(function(e, i){
			var lnk = $('<a>').html(e).addClass('selected').attr({'data-toggle':'tooltip','title':'remove'});
			lnk.on('click',f(toggleActivePrepositions,$(lnk))).appendTo(d);
			if (i !== (last - 1)){
				$('<span>').html('  ').appendTo(d);
			}
		});
	};
	
	var setVisualAid = function(fileName){
		var path = 'img/' + fileName + '.jpg';
		$('#visualAid').attr('src', path);
	};
	
	var deploySentence = function(data){
		$('.sentence_container').empty();
		setVisualAid(data.fileName);
		answerChecker.newSentenceSetup();
		var sentence = '';
		var i;
		var txt = '';
		for (i = 0; i < data.txt.length; i++){
			if (data.txt[i].p && txt.length > 0){//NOTE: TODO address the case where the preposition is the first word in the sentence...			
				if (activePrepositions.indexOf(data.txt[i].t) === -1){
					txt += data.txt[i].t;
					continue;
				}
				var obj = makeLink(data.txt[i].t);
				var lnk = $('<a>').attr({'data-toggle':'modal','data-target':'#optionsModal','class':'option'}).html(obj.t).on('click', obj.f);
				answerChecker.newLink(data.txt[i].t, lnk);
				$('<span>').html(txt).appendTo($('.sentence_container'));
				$('<span>').append(lnk).appendTo($('.sentence_container'));
				txt = '';
			}
			else if (!data.txt[i].p){
				txt += data.txt[i].t;//need to add a space??
			}	
		}
		if (txt.length > 0){
			$('<span>').html(txt).appendTo($('.sentence_container'));
		}
		$('#repeatSentence').addClass('disabled');
		$('#getSentence').addClass('disabled');
		$('#checkAnswers').removeClass('disabled');
		
	};
	
	var makeLink = function(p){//should return object containing link html (randomized) and function
	
		var result = {t: null, f: null};
		
		var currentActive = p;
		var prepositions = getRandomPrepositions(p);
		result.t = prepositions.pop();
		
		var updatePrepositions = function(p, o){
			var index = prepositions.indexOf(p);
			prepositions[index] = o;
		};
		
		var prepositionButtonAction = function(lnk){
			return (function(){
				var buttonName = $(this).html();
				var linkName = lnk.html();
				lnk.html(buttonName);
				$(this).html(linkName);
				updatePrepositions(buttonName, linkName);
			});
		};
		
		result.f = function(){
			var i,
			m = $('#optionsButtons'),
			action;
			m.children().remove();
	
			for (i = 0; i < prepositions.length; i++){
				action = prepositionButtonAction($(this));
				m.append($('<a>').attr({'class':'btn btn-lg btn-outline','type':'button','data-toggle':'modal','data-target':'#optionsModal'}).html(prepositions[i]).on('click', action));	
			}
		};
	
		return result;
	};
	
	var answerChecker = (function(){
		var links = [];
		var correctAnswers = [];
		
		var newSentenceSetup = function(){
			links = [];
			correctAnswers = [];
		};
		
		var newLink = function(a, l){
			correctAnswers.push(a);
			links.push(l);
		};
		 var getCorrectAnswers = function(){
			 return correctAnswers;
		 };
		
		var checkAnswers = function(){
			for (var i = 0; i < links.length; i++){
				if ($(links[i]).html() !== correctAnswers[i]){
					$(links[i]).addClass('incorrect');
				}
				else{
					$(links[i]).addClass('correct');
				}
				$(links[i]).removeAttr('data-toggle data-target').prop( "onclick", null);
				$('#repeatSentence').removeClass('disabled');
				$('#getSentence').removeClass('disabled');
				$('#checkAnswers').addClass('disabled');
			}
		};
		
		return {
			newSentenceSetup : newSentenceSetup,
			newLink : newLink,
			checkAnswers : checkAnswers,
			getCorrectAnswers : getCorrectAnswers
		}

	}());
	
	var getNewSentence = function(){
		$.ajax({
			method: 'POST',
			data : {activePrepositions: JSON.stringify(activePrepositions)},//need to return only those sentences that include at least one instance of an active preposition...
			error:function(err){
				console.log(err);
				//return '';
			},
			success:function(data){
				deploySentence(data);
				$('#repeatSentence').on('click',(function(a, b){return function(){a(b)}}(deploySentence, data)));
			}
		});
	};
	
	var output =	{	toggleActivePrepositions: toggleActivePrepositions,
						changeNumberOptions : changeNumberOptions,
						getNewSentence : getNewSentence,
						checkAnswers : answerChecker.checkAnswers,
						setOptionButtons : setOptionButtons,
						setPrepositionDisplay : setPrepositionDisplay
					};
	
	return output;
}());

/*************/

var setup = function(){
	
	var setModals = function(){
		$(".modal-wide").on("show.bs.modal", function() {
			var height = $(window).height() - 200;
			$(this).find(".modal-body").css("max-height", height);
		});
	};
	
	var setOptionNumber = function(){
		$('#numberOptions').html('3');//should contain this variable within the manager module...
	};
	
	setModals();
	manager.setPrepositionDisplay();
	manager.setOptionButtons();
	setOptionNumber();
	$('#getSentence').on('click', manager.getNewSentence);
	$('#checkAnswers').on('click', manager.checkAnswers);
	$('#openModalLink').on('click', manager.linkAction);
	manager.getNewSentence();
	
};

$(document).ready(function(){
	setup();
});