/* LEGTRACKER MAIN
========================================================================*/
var legTrack = {
	calibrate:{
		state:null,
		session:null,
		bills:[],
		totalBills:null,
		pubkey:null,
		full: [],
		upper:40, //make dynamic
		lower:80 //make dynamic
	},
	template:{
		row:'<div class="leg-row height"></div>',
		meta:'<div class="leg-meta left height">',
		date:'<div class="leg-date left align-center height">',
		length:'<div class="leg-length left">'
		viz:{
			base:'<div class="leg-viz right height">'
			leg:{
				base:'<div class="leg-leg left height">',
				enroll:'<div class="leg-enroll full right"></div>',
				contents:'<div class="half left"><div class="leg-level block half mute"><div></div></div><div class="leg-intro block half"></div><div class="leg-commit block half"></div><div class="leg-floor block half"></div></div>'
			}
			end:'<div class="leg-end right height full">'
		}
	}
	data:[],
	output:[],
	populateApp: function(temp, out){
		for (var i=0 ; i < out.length ; i++)
	},
	parseDetails: function(d, cal, out){
		/* grab the meat and potatoes for the app front-end */
		if (legTrack.data[cal.totalBills-1] == undefined){
			this.callAPI(cal);
		}
		else {
			for (var i=0 ; i < cal.totalBills ; i++){
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
							out[i].status.flags.upper = new Object();
								out[i].status.flags.upper.action = null;
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
							console.log(i + ' ' + flag.endGame.reconcile[act[i].actor])
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
		console.log('NEW')
		for (var i=0 ; i < act.length ; i++){
			actions[i] = new Object();
			actions[i]['actions'] = act[i].type;
			actions[i]['actor'] = act[i].actor;
			actions[i]['actorInfo'] = act[i]['+actor_info'].details;
			actions[i]['details'] = act[i].action;
			console.log(actions[i]['actor'] + ': ' + actions[i]['actions'])
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
	calibrateApp: function(cal){
		/* grab meta data for accessing OpenStates API */
		$.getJSON('data/main.json', function(d){
			var state = d[1][1];
			cal.state = state.toLowerCase();
			cal.session = d[2][1];
 			cal.pubkey = d[3][1];

 			/* Weave the API call URL based on above and bill data */
 			for (var i=0 ; i < cal.totalBills ; i++){
 				if (i == 3 || i == 7 || i == 8){
 					cal.full[i] = 'http://openstates.org/api/v1/bills/' + cal.state + '/20132014/' + cal.bills[i][0] + '/?apikey=' + cal.pubkey + '&callback=?';
 				}
 				else {
 					cal.full[i] = 'http://openstates.org/api/v1/bills/' + cal.state + '/' + cal.session + '/' + cal.bills[i][0] + '/?apikey=' + cal.pubkey + '&callback=?';
 				} 			
 				console.log(cal.full[i])
 			}
		});
		setTimeout(function(){legTrack.callAPI(cal); console.log('trigger')}, 1000);
	},
	grabBills: function(cal){
		/* figure out the bills to look up through API */
		$.getJSON('data/bills.json', function (d) {
			for (var i=1 ; i < d.length ; i++){
				cal.bills[i-1] = new Array();
				var bill = d[i][0];
				cal.bills[i-1][0] = bill.replace(' ', '%20');
				cal.bills[i-1][1] = d[i][1];
				cal.bills[i-1][2] = d[i][2];
				cal.totalBills += 1;
			}
		});
		legTrack.calibrateApp(cal);
	},
	callAPI: function(cal){
		/* grab API data */
		if (cal.full[cal.totalBills-1] == undefined){
			this.calibrateApp(cal);
		}
		else {
			for (var i = 0 ; i < cal.totalBills ; i++){
				(function(i){ //this is needed because the loop executes before jSON returns value
					$.getJSON(cal.full[i], function (d) {legTrack.data[i] = d;});				
			   	})(i);
			}
			setTimeout(function(){legTrack.parseDetails(legTrack.data, cal, legTrack.output); console.log('trigger')}, 1000);
		}		
	}
}

window.onload = function(){legTrack.grabBills(legTrack.calibrate);}


