/* LEGTRACKER MAIN
========================================================================*/
var legTrack = {
	calibrate:{
		path:'bills',
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
		row:'<div class="leg-row height"></div>',
		meta:'<div class="leg-meta left"><a href=""><div class="leg-title"></div></a><a href=""><div class="leg-sum mute"></div></a></div>',
		date:'<div class="leg-date left align-center height"><div class="mute"></div></div>',
		length:'<div class="leg-length left"><div class="align-center"></div></div>',
		viz:{
			base:'<div class="leg-viz left height"></div>',
			leg:{
				base:'<div class="leg-leg left height"></div>',
				enroll:'<div class="leg-enroll full right"></div>',
				upper:'<div class="leg-upper half left border"></div>',
				lower:'<div class="leg-lower half left border"></div>',
				inside:'<div class="leg-level align-center half mute"><div></div></div><div class="leg-intro block half"></div><div class="leg-commit block half"></div><div class="leg-floor block half"></div>'

			},
			end:'<div class="leg-end left height full"><div class="leg-gov block full"></div><div class="leg-chapter block full"></div></div>'  
		}
	},
	data:[],
	output:[],
	populateApp: function(temp, out){
		/* Populate bill data, row by row */
		var body = document.getElementById('leg-body');
		for (var i=0 ; i < out.length; i++){
			/* append the DOM */
			$(body).append(temp.row);
				$('.leg-row:eq('+i+')').append(temp.meta,temp.date,temp.length,temp.viz.base);
					$('.leg-row:eq('+i+') .leg-viz').append(temp.viz.leg.base, temp.viz.end);
						$('.leg-row:eq('+i+') .leg-leg').append(temp.viz.leg.enroll, temp.viz.leg.upper, temp.viz.leg.lower).attr('origin', out[i].meta.chamber);
							$('.leg-row:eq('+i+') .leg-upper').add('.leg-row:eq('+i+') .leg-lower').append(temp.viz.leg.inside);
						
				

			/* add meta */
			$('.leg-row:eq('+i+') .leg-meta a').attr('href', out[i].meta.source);
			$('.leg-row:eq('+i+') .leg-meta div:eq(0)').text(out[i].meta.bill_id);
			$('.leg-row:eq('+i+') .leg-meta div:eq(1)').text(out[i].meta.title);
			$('.leg-row:eq('+i+') .leg-leg div:eq(1) .leg-level div').text(this.calibrate.upperName);
			$('.leg-row:eq('+i+') .leg-leg div:last-of-type .leg-level div').text(this.calibrate.lowerName);

			/* add last action */
			$('.leg-row:eq('+i+') .leg-date div').text(out[i].meta.lastStr);

			/* add length */
			$('.leg-row:eq('+i+') .leg-length div:eq(0)').text(out[i].meta.daysSinceFirst);


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
			}
			else if (out[i].status.flags.committees[nxtchamber].status == true){
				$('.leg-row:eq('+i+') .leg-leg '+next+' .leg-commit').css('background', this.colors.passed);
				$('.leg-row:eq('+i+') .leg-leg '+next+' .leg-intro').css('background', this.colors.passed);
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
				continue;
			}
			else if (out[i].status.flags[chamber].floor == true){
				$('.leg-row:eq('+i+') .leg-leg '+org+' .leg-floor').css('background', this.colors.current);
				if (out[i].status.flags.endGame.reconcile[chamber] != null){
					$('.leg-row:eq('+i+') .leg-leg .leg-enroll').add('.leg-row:eq('+i+') .leg-leg').css('background', this.colors.current);
				}
				else if (out[i].status.flags.endGame.governor.enrolled == true){
					$('.leg-row:eq('+i+') .leg-end .leg-gov').css('background', this.colors.current);
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
				$('.leg-row:eq('+i+') .leg-end .leg-chapter').css('background', this.colors.current);
			}
			else if (out[i].status.flags.endGame.governor.vetoed == true) {
				$('.leg-row:eq('+i+') .leg-end .leg-gov').css('background', this.colors.failed);
				continue;
			}

			//chaptered
			if (out[i].status.flags.endGame.chaptered == true){
				$('.leg-row:eq('+i+') .leg-end .leg-chapter').css('background', this.colors.passed);
			}	
		}
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
			legTrack.data = d; 
			legTrack.calibrate.totalBills = legTrack.data.length;
			legTrack.parseDetails(legTrack.data, legTrack.calibrate.totalBills, legTrack.output);
		});
	}
}
window.onload = function(){legTrack.importJSON(legTrack.calibrate.path);}


