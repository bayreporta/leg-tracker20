/* LEGTRACKER MAIN
========================================================================*/
var legTrack = {
	calibrate:{
		path:'bills',
		filterpath:'filters',
		state:null,
		session:null,
		bills:[],
		totalBills:null,
		pubkey:null,
		full: [],
		upperName: 'S',
		lowerName: 'A',
		upper:40, //make dynamic
		lower:80 //make dynamic
	},
	colors:{
		passed:'#76ce76',
		failed:'#ce7676',
		current:'#7676ce'
	},
	template:{
		meta:'<div class=""></div></a><a href=""><div class=""></div></a></div>',
		date:'<div class=""><div class=""></div></div>',
		length:'<div class=""><div class=""></div></div>',
		viz:{
			base:'<div class=""></div>',
			leg:{
				base:'<div class=""></div>',
				enroll:'<div class=""></div>',
				upper:'<div class=""></div>',
				lower:'<div class=""></div>',
				inside:'<div class=""><div></div></div><div class=""></div><div class=""></div><div class=""></div>'

			},
			end:'<div class=""><div class=""></div><div class=""></div></div>'  
		}
	},
	search:{
		rows:[]
	},
	questions:{
		legPass:false,
		legKill:false,
		signed:false,
		vetoed:false
	},
	filters:[],
	data:[],
	output:[],
	populateApp: function(temp, out){
		/* Populate bill data, row by row */
		var body = document.getElementById('leg-body');
		var fragRow = [];

		/* SETTING UP FRAGS */
		for (var i=0 ; i < 9 ; i++){
			fragRow[i] = document.createDocumentFragment();
		}

		for (var i=0 ; i < out.length; i++){			
			/* PREPARE ELEMENTS */
			var row = document.createElement('div'), meta = document.createElement('div'), date = document.createElement('div'), date2 = document.createElement('div'), length = document.createElement('div'), length2 = document.createElement('div'), viz = document.createElement('div'), title = document.createElement('div'), sum = document.createElement('div'), link = document.createElement('a');
			var div = document.createElement('div'), div2 = document.createElement('div'), leg = document.createElement('div'), enroll = document.createElement('div'), upper = document.createElement('div'), lower = document.createElement('div'), level = document.createElement('div'), intro = document.createElement('div'), commit= document.createElement('div'), floor = document.createElement('div'),level2 = document.createElement('div'), intro2 = document.createElement('div'), commit2= document.createElement('div'), floor2 = document.createElement('div'), gov=document.createElement('div'),endgame = document.createElement('div'), chaptered = document.createElement('div');

			row .className = 'leg-row height';
				meta .className = 'leg-meta left';
					//link first
					title .className = 'leg-title';
					sum .className = 'leg-sum mute';
				date .className = 'leg-date left align-center height';
					date2 .className = 'mute';
				length .className = 'leg-length left';
					length2 .className = 'align-center';
				viz .className = 'leg-viz left height';
					leg .className = 'leg-leg left height';
						enroll .className = 'leg-enroll full right';
						upper .className = 'leg-upper half left border';
							level .className = 'leg-level align-center half mute';
							intro .className = 'leg-intro block half';
							commit .className = 'leg-commit block half';
							floor .className = 'leg-floor block half';
						lower .className = 'leg-lower half left border';
							level2 .className = 'leg-level align-center half mute';
							intro2 .className = 'leg-intro block half';
							commit2 .className = 'leg-commit block half';
							floor2 .className = 'leg-floor block half';
					endgame .className = 'leg-end left height full';	
						gov .className = 'leg-gov block full';
						chaptered .className = 'leg-chapter block full';

			/* APPEND SUB-SECTIONS */
			title.appendChild(document.createTextNode(out[i].meta.bill_id));
			sum.appendChild(document.createTextNode(out[i].meta.title))
			link.setAttribute('href', out[i].meta.source);
			link.appendChild(title)
			link.appendChild(sum);
			meta.appendChild(link);
			fragRow[1] = meta;

			date2.appendChild(document.createTextNode(out[i].meta.lastStr));
			date.appendChild(date2);
			fragRow[2] = date;

			length2.appendChild(document.createTextNode(out[i].meta.daysSinceFirst));
			length.appendChild(length2);
			fragRow[3] = length;

			endgame.appendChild(gov);
			endgame.appendChild(chaptered);
			fragRow[4] = endgame;

			div.appendChild(document.createTextNode(this.calibrate.upperName));
			div2.appendChild(document.createTextNode(this.calibrate.lowerName));
			level.appendChild(div);
			level2.appendChild(div2);

			lower.appendChild(level2);
			lower.appendChild(intro2);
			lower.appendChild(commit2);
			lower.appendChild(floor2);
			fragRow[6] = lower;

			upper.appendChild(level);
			upper.appendChild(intro);
			upper.appendChild(commit);
			upper.appendChild(floor);
			fragRow[5] = upper;

			leg.appendChild(enroll);
			leg.appendChild(fragRow[5]);
			leg.appendChild(fragRow[6]);
			fragRow[7] = leg;

			viz.appendChild(fragRow[7]);
			viz.appendChild(fragRow[4]);
			fragRow[8] = viz;

			row.appendChild(fragRow[1]);
			row.appendChild(fragRow[2]);
			row.appendChild(fragRow[3]);
			row.appendChild(fragRow[8]);
			fragRow[0] = row;

			body.appendChild(fragRow[0]);

			/* FIRST CHAMBER
			=============================================*/
			/* chamber of origin */
			var origin = $('.leg-row:eq('+i+') .leg-leg').attr('origin'), org = '.leg-upper', next='.leg-lower',chamber='upper',nxtchamber='lower';
			if (origin === 'lower'){org='.leg-lower';next='.leg-upper';chamber='lower';nxtchamber='upper'}

			/* viz conditionals */
			if (out[i].status.flags.introduced != null){
				$('.leg-row:eq('+i+') .leg-leg '+org+' .leg-intro').add('.leg-row:eq('+i+') .leg-leg '+org+' .leg-level').css({'background': this.colors.current, color: '#fff'});
			}

			// Committees
			if (out[i].status.flags.committees[chamber].status === 'referred'){
				$('.leg-row:eq('+i+') .leg-leg '+org+' .leg-commit').css('background', this.colors.current);
				$('.leg-row:eq('+i+') .leg-leg '+org+' .leg-intro').css('background', this.colors.passed);
			}
			else if (out[i].status.flags.committees[chamber].status == true){
				$('.leg-row:eq('+i+') .leg-leg '+org+' .leg-commit').css('background', this.colors.passed);
				$('.leg-row:eq('+i+') .leg-leg '+org+' .leg-intro').css('background', this.colors.passed);
			}
			else if (out[i].status.flags.committees[chamber].status == false){
				$('.leg-row:eq('+i+') .leg-leg '+org+' .leg-commit').css('background', this.colors.failed);
				$('.leg-row:eq('+i+') .leg-leg '+org+' .leg-intro').css('background', this.colors.passed);
				continue;
			}

			//floor
			if (out[i].status.flags[chamber].action == true){
				$('.leg-row:eq('+i+') .leg-leg '+org+' .leg-floor').add('.leg-row:eq('+i+') .leg-leg '+org+' .leg-level').add('.leg-row:eq('+i+') .leg-leg '+org+'').css('background', this.colors.passed);
				$('.leg-row:eq('+i+') .leg-leg '+next+' .leg-intro').add('.leg-row:eq('+i+') .leg-leg '+next+' .leg-level').css({'background': this.colors.current, color: '#fff'});
			}
			else if (out[i].status.flags[chamber].action == false){
				$('.leg-row:eq('+i+') .leg-leg '+org+' .leg-floor').add('.leg-row:eq('+i+') .leg-leg '+org+' .leg-level').add('.leg-row:eq('+i+') .leg-leg '+org+'').css('background', this.colors.failed);
				$('.leg-row:eq('+i+')').attr('leg-killed', 'y');
				continue;
			}
			else if (out[i].status.flags[chamber].floor == true){
				$('.leg-row:eq('+i+') .leg-leg '+org+' .leg-floor').css('background', this.colors.current);
			}

			/* SECOND CHAMBER
			=============================================*/
			// Committees
			if (out[i].status.flags.committees[nxtchamber].status == 'referred'){
				$('.leg-row:eq('+i+') .leg-leg '+next+' .leg-commit').css('background', this.colors.current);
				$('.leg-row:eq('+i+') .leg-leg '+next+' .leg-intro').css('background', this.colors.passed);
				continue;
			}
			else if (out[i].status.flags.committees[nxtchamber].status == true){
				$('.leg-row:eq('+i+') .leg-leg '+next+' .leg-commit').css('background', this.colors.passed);
				$('.leg-row:eq('+i+') .leg-leg '+next+' .leg-intro').css('background', this.colors.passed);
				continue;
			}
			else if (out[i].status.flags.committees[nxtchamber].status == false){
				$('.leg-row:eq('+i+') .leg-leg '+next+' .leg-commit').css('background', this.colors.failed);
				$('.leg-row:eq('+i+') .leg-leg '+next+' .leg-intro').css('background', this.colors.passed);
				continue;
			}

			//floor
			if (out[i].status.flags[chamber].action == true){
				$('.leg-row:eq('+i+') .leg-leg '+next+' .leg-floor').add('.leg-row:eq('+i+') .leg-leg '+next+' .leg-level').add('.leg-row:eq('+i+') .leg-leg '+next+'').css('background', this.colors.passed);
			}
			else if (out[i].status.flags[chamber].action == false){
				$('.leg-row:eq('+i+') .leg-leg '+next+' .leg-floor').add('.leg-row:eq('+i+') .leg-leg '+next+' .leg-level').add('.leg-row:eq('+i+') .leg-leg '+next+'').css('background', this.colors.failed);
				$('.leg-row:eq('+i+')').attr('leg-killed', 'y');
				continue;
			}
			else if (out[i].status.flags[chamber].floor == true){
				$('.leg-row:eq('+i+') .leg-leg '+org+' .leg-floor').css('background', this.colors.current);
				if (out[i].status.flags.endGame.reconcile[chamber] != null){
					$('.leg-row:eq('+i+') .leg-leg .leg-enroll').add('.leg-row:eq('+i+') .leg-leg').css('background', this.colors.current);
				}
				else if (out[i].status.flags.endGame.governor.enrolled == true){
					$('.leg-row:eq('+i+') .leg-end .leg-gov').css('background', this.colors.current);
					$('.leg-row:eq('+i+')').attr('leg-pass', 'y');
				}
			
			}

			/* END GAME
			=============================================*/
			//reconcile
			if (out[i].status.flags.endGame.reconcile[chamber] == true){
				$('.leg-row:eq('+i+') .leg-leg .leg-enroll').add('.leg-row:eq('+i+') .leg-leg').css('background', this.colors.passed);
		
				if (out[i].status.flags.endGame.governor.enrolled == true){
					$('.leg-row:eq('+i+') .leg-end .leg-gov div:eq(0)').css('background', this.colors.current);
				}
			}
			else if (out[i].status.flags.endGame.reconcile[chamber] === false){
				$('.leg-row:eq('+i+') .leg-leg .leg-enroll').add('.leg-row:eq('+i+') .leg-leg').css('background', this.colors.failed);
				continue;
			}

			//governor
			if (out[i].status.flags.endGame.governor.signed == true){
				$('.leg-row:eq('+i+') .leg-end .leg-gov').css('background', this.colors.passed);
				$('.leg-row:eq('+i+')').attr('signed', 'y');
				$('.leg-row:eq('+i+') .leg-end .leg-chapter').css('background', this.colors.current);
			}
			else if (out[i].status.flags.endGame.governor.vetoed == true) {
				$('.leg-row:eq('+i+') .leg-end .leg-gov').css('background', this.colors.failed);
				$('.leg-row:eq('+i+')').attr('vetoed', 'y');
				continue;
			}

			//chaptered
			if (out[i].status.flags.endGame.chaptered == true){
				$('.leg-row:eq('+i+') .leg-end .leg-chapter').css('background', this.colors.passed);
			}	
		}
		this.calibrateSearch();
		this.applyQuestions(this.questions);
	},
	parseDetails: function(d, tot, out){
		/* grab the meat and potatoes for the app front-end */
		for (var i=0 ; i < tot ; i++){
			out[i] = new Object();

				/* META DATA
				------------------------------------------------*/
				out[i].meta = new Object();
					out[i].meta.bill_id = d[i].bill_id;
					out[i].meta.title = d[i].title;
					out[i].meta.source = d[i].sources[0].url;
					out[i].meta.firstStr = this.convertDate(d[i].action_dates.first);
					out[i].meta.lastStr = this.convertDate(d[i].action_dates.last);
					out[i].meta.firstNum = Date.parse(d[i].action_dates.first);
					out[i].meta.lastNum = Date.parse(d[i].action_dates.last);
					out[i].meta.daysSinceFirst = Math.round((out[i].meta.lastNum - out[i].meta.firstNum) / 86400000);
					out[i].meta.chamber = d[i].chamber;
					out[i].meta.subjects = legTrack.data[i][1];


				/* FLAG DATA
				------------------------------------------------*/
				out[i].status = new Object();
					out[i].status.flags = new Object();
						out[i].status.flags.introduced = null;
						out[i].status.flags.committees = new Object;
							out[i].status.flags.committees.lower = new Object;
								out[i].status.flags.committees.lower.status = null;
							out[i].status.flags.committees.upper = new Object;
								out[i].status.flags.committees.upper.status = null;
						out[i].status.flags.lower = new Object();
							out[i].status.flags.lower.action = null;
							out[i].status.flags.lower.floor = false;
						out[i].status.flags.upper = new Object();
							out[i].status.flags.upper.action = null;
							out[i].status.flags.upper.floor = false;
						out[i].status.flags.endGame = new Object();
							out[i].status.flags.endGame.reconcile = new Object();
								out[i].status.flags.endGame.reconcile.upper = null;
								out[i].status.flags.endGame.reconcile.lower = null;
							out[i].status.flags.endGame.governor = new Object();
								out[i].status.flags.endGame.governor.enrolled = null;
								out[i].status.flags.endGame.governor.signed = null;
								out[i].status.flags.endGame.governor.vetoed = null;
							out[i].status.flags.endGame.chaptered = null;



				/* STATUS DATA
				------------------------------------------------*/
					out[i].status.actions = this.grabActions(this.data[i].actions);
						this.setActions(out[i].status.actions, out[i].status.flags, i);
					out[i].status.upper = new Object();
						out[i].status.upper.passed_upper = d[i].action_dates.passed_upper;
						out[i].status.upper.votes_yes = this.grabVotes('upper', this.data[i].votes);
						out[i].status.upper.votePercent = Math.round((out[i].status.upper.votes_yes / this.calibrate.upper) * 100);
					out[i].status.lower = new Object();
						out[i].status.lower.passed_lower = d[i].action_dates.passed_lower;
						out[i].status.lower.votes_yes = this.grabVotes('lower', this.data[i].votes);
						out[i].status.lower.votePercent = Math.round((out[i].status.lower.votes_yes / this.calibrate.lower) * 100);
					out[i].status.gov = new Object();
						out[i].status.gov.signed = d[i].action_dates.signed;
						out[i].status.gov.veto = null;
						out[i].status.gov.chaptered = null;	

		}

		this.populateApp(this.template, out);
	},
	setActions: function(act, flag, e){
		/* IMPORTANT will flag the stage of the bill */
		for (var i = 0 ; i < act.length; i++){
			/* bill introduced */
			if (flag.introduced == null){
				var test1 = act[i].actions.indexOf('bill:introduced'), test2 = act[i].actions.indexOf('bill:reading:1');

				if (test1 != -1){
					flag.introduced = true;
					continue;

				}
				else if (test2 != -1){
					flag.introduced = true;
					continue;
				}
			}

			/* Chaptered */
			if (flag.endGame.chaptered == null){
				var test = act[i].details.match(/Chaptered/gi);

				if (test != null){
					flag.endGame.chaptered = true;
					continue;
				}
			}

			var veto = act[i].details.match(/Veto/gi);
			if (act[i].actorInfo === "Governor" || veto != null){
				/* Enrolled */
				if (flag.endGame.governor.enrolled == null){
					var test = act[i].details.match(/Enrolled/gi);
					if (test != null){
						flag.endGame.governor.enrolled = true;
						continue;
					}
				}

				/* Governor Action */
				if (flag.endGame.governor.signed == null && flag.endGame.governor.vetoed == null && flag.endGame.governor.enrolled == true){
					var test1 = act[i].actions.indexOf('governor:signed'),test2 = act[i].actions.indexOf('governor:vetoed');
					if (test1 != -1){
						flag.endGame.governor.signed = true;
						continue; 
					}
					else if (test2 != -1){
						flag.endGame.governor.vetoed = true;
						continue; 
					}

				}
			}
			
			if (act[i].actor !== 'other'){
				/* Reconciling Bills */
				if (flag.upper.action == true && flag.lower.action == true){
					if (flag.endGame.reconcile[act[i].actor] === 'concur'){
						var test1 = act[i].actions.indexOf('amendment:passed'),test2 = act[i].actions.indexOf('amendment:failed');
						if (test1 != -1){
							flag.endGame.reconcile[act[i].actor] = true;
							continue;
						}
						else if (test2 != -1){
							flag.endGame.reconcile[act[i].actor] = false;
							continue;
						}
					}

					if (flag.endGame.reconcile[act[i].actor] == null){
						var test = act[i].details.match(/Concurrence/gi);
						if (test != null){
							flag.endGame.reconcile[act[i].actor] = 'concur';
							continue;
						}
					}
				}			

				/* chamber action */
				if (flag[act[i].actor].action == null){
					var test1 = act[i].actions.indexOf('bill:passed'), test2 = act[i].actions.indexOf('bill:failed');

					if (test1 != -1){
						flag[act[i].actor].action = true;
						flag.committees[act[i].actor].status = true;
						commits = 0;
						continue;
					}
					else if (test2 != -1){
						flag[act[i].actor].action = false;
						flag.committees[act[i].actor].status = true;
						commits = 0;
						continue;
					}
					
				}

				/* committee */
				if (flag.committees[act[i].actor].status == null || flag.committees[act[i].actor].status == 'referred'){
					var test1 = act[i].actions.indexOf('committee:referred'), test2 = act[i].actions.indexOf('committee:passed'), test3 = act[i].actions.indexOf('committee:failed'), test4 = act[i].details.match(/Referred/gi);;

					/* test if action taken */
					if(test1 == -1 && test2 != -1){
						flag.committees[act[i].actor].status = true;
						flag[act[i].actor].floor = true;
					}
					else if (test1 == -1 && test3 != -1){
						flag.committees[act[i].actor].status = false;
					}
					else if(test1 != -1 || test4 != null) {
						flag.committees[act[i].actor].status = 'referred';
					}					
					continue;
				}

			}		
		}
	},
	convertDate: function(date){
		/* take the date string and parse out the month, day and year */
		var thisDate = date.split(' ');
		thisDate = thisDate[0].split('-');
		return thisDate[1] + '/' + thisDate[2] + '/' + thisDate[0];
	},
	grabActions: function(act){
		/* this grabs the actions that apply to each bill and organizes them */
		var actions = new Array();
		//console.log('NEW')
		for (var i=0 ; i < act.length ; i++){
			actions[i] = new Object();
			actions[i]['actions'] = act[i].type;
			actions[i]['actor'] = act[i].actor;
			actions[i]['actorInfo'] = act[i]['+actor_info'].details;
			actions[i]['details'] = act[i].action;
			//console.log(actions[i]['actor'] + ': ' + actions[i]['actions'])
		}
		return actions;
	},
	grabVotes: function(chamber, votes){
		/* determine how many yes votes in each chamber if applicable */
		for (var i = 0 ; i < votes.length ; i++){
			if (votes[i]['+type_'] === 'passage' && votes[i].chamber === chamber){
				return votes[i]['yes_count'];
				break;
			}
		}
	},
	importJSON: function(path){
		$.getJSON('data/' + path + '.json', function (d) {
			if (path === 'bills'){
				legTrack.data = d; 
				legTrack.calibrate.totalBills = legTrack.data.length;
				legTrack.parseDetails(legTrack.data, legTrack.calibrate.totalBills, legTrack.output);
			}
			else if (path === 'filters'){
				legTrack.filters = d;
				console.log(d)
			}
		});
	},
	resetQuestions:function(q){
		q.legPass = false, q.legKill = false, q.signed = false, q.vetoed = false;
	},
	applyQuestions:function(q){
		$('.leg-questions').on('click', function(){
			var question = $(this).attr('filter');

			//GET AND RESET ALL ROWS AND SEARCH
			var allRows =  document.getElementsByClassName('leg-row');
			for (var i = 0 ; i < allRows.length ; i++){
				allRows[i].style.display = "none";
			}
			$('#leg-search').val('');

			switch(question){
				case '0':
					var theseRows = document.querySelectorAll('[leg-pass=y]');
					if (q.legPass == false){
						for (var i=0 ; i < theseRows.length ; i++){
							theseRows[i].style.display = "block";
				    	}
				    	$('.leg-questions').css('background','#ddd');
				    	$(this).css('background','#aaa');
				    	legTrack.resetQuestions(q);
						q.legPass = true;
					}
					else {
						for (var i = 0 ; i < allRows.length ; i++){
							allRows[i].style.display = "block";
						}
						$('.leg-questions').css('background','#ddd');
						q.legPass = false;
					}
					break;
				case '1':
					var theseRows = document.querySelectorAll('[leg-kill=y]');
					if (q.legKill == false){
						for (var i=0 ; i < theseRows.length ; i++){
							theseRows[i].style.display = "block";
				    	}
				    	$('.leg-questions').css('background','#ddd');
				    	$(this).css('background','#aaa');
				    	legTrack.resetQuestions(q);
						q.legKill = true;
					}
					else {
						for (var i = 0 ; i < allRows.length ; i++){
							allRows[i].style.display = "block";
						}
						$('.leg-questions').css('background','#ddd');
						q.legKill = false;
					}
					break;			
				case '2':
					var theseRows = document.querySelectorAll('[signed=y]');
					if (q.signed == false){

						for (var i=0 ; i < theseRows.length ; i++){
							theseRows[i].style.display = "block";
				    	}
				    	$('.leg-questions').css('background','#ddd');
				    	$(this).css('background','#aaa');
				    	legTrack.resetQuestions(q);
						q.signed = true;
					}
					else {
						for (var i = 0 ; i < allRows.length ; i++){
							allRows[i].style.display = "block";
						}
						$('.leg-questions').css('background','#ddd');
						q.signed = false;
					}
					break;	
				case '3':
					var theseRows = document.querySelectorAll('[vetoed=y]');
					if (q.vetoed == false){
						for (var i=0 ; i < theseRows.length ; i++){
							theseRows[i].style.display = "block";
				    	}
				    	$('.leg-questions').css('background','#ddd');
				    	$(this).css('background','#aaa');
				    	legTrack.resetQuestions(q);
						q.vetoed = true;
					}
					else {
						for (var i = 0 ; i < allRows.length ; i++){
							allRows[i].style.display = "block";
						}
						$('.leg-questions').css('background','#ddd');
						q.vetoed = false;
					}
					break;
			}
		})
	},
	calibrateSearch: function(){
		this.search.rows =  document.getElementsByClassName('leg-row');

		$('#execute-search').on('click', function(){legTrack.searchTool(legTrack.search.rows);});
		$('#leg-search').on('keypress', function(e){
			var key = e.which;
			if (key == 13){legTrack.searchTool(legTrack.search.rows);}
		});
		$('#reset-search').on('click', function(){
			clear = document.getElementsByClassName('leg-row');
			for (var i=0 ; i < clear.length ; i++){
				clear[i].style.display = 'block'
			}
		    $('#leg-search').val('');
		})

	},
	searchTool: function(rows){
		var val = $.trim($('#leg-search').val()).replace(/ +/g, ' ').toLowerCase();
	    if (val !== '') {
	    	 for (var i=0 ; i < rows.length ; i++){
	    	 	rows[i].style.display = "block";

	    	 	var testText = rows[i].textContent;
	    		testText = testText.replace(/\s+/g, ' ').toLowerCase();
				if (testText.indexOf(val) == -1){
					rows[i].style.display = "none";
				}
	    	 }
	    }
	}
}

window.onload = function(){legTrack.importJSON(legTrack.calibrate.filterpath);legTrack.importJSON(legTrack.calibrate.path);}


