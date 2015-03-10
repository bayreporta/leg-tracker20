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
	data:[],
	output:[],
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


					/* STATUS DATA
					------------------------------------------------*/
					out[i].status = new Object();
						out[i].status.upper = new Object();
							out[i].status.upper.passed_upper = d[i].action_dates.passed_upper;
							out[i].status.upper.votes_yes = this.grabVotes('upper', this.data[i].votes);
							out[i].status.upper.votePercent = Math.round((out[i].status.upper.votes_yes / this.calibrate.upper) * 100);
						out[i].status.lower = new Object();
							out[i].status.lower.passed_lower = d[i].action_dates.passed_lower;
							out[i].status.lower.votes_yes = this.grabVotes('lower', this.data[i].votes);
							out[i].status.lower.votePercent = Math.round((out[i].status.lower.votes_yes / this.calibrate.lower) * 100);
						out[i].status.signed = d[i].action_dates.signed;
						out[i].status.actions = this.grabActions(this.data[i].actions);



					
					
					/*out[i].status.XXXX = d[i].XXX;
					out[i].XXX = d[i].XXX;
					out[i].XXX = d[i].XXX;
					out[i].XXX = d[i].XXX;
					out[i].XXX = d[i].XXX;
					out[i].XXX = d[i].XXX;
					out[i].XXX = d[i].XXX;*/

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

		for (var i=0 ; i < act.length ; i++){
			actions[i] = new Object();
			actions[i]['actions'] = act[i].type;
			actions[i]['actor'] = act[i].actor;
		}
		console.log(actions)
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
 				if (i != 3){
 					cal.full[i] = 'http://openstates.org/api/v1/bills/' + cal.state + '/' + cal.session + '/' + cal.bills[i][0] + '/?apikey=' + cal.pubkey + '&callback=?';
 				}
 				else {
 					cal.full[i] = 'http://openstates.org/api/v1/bills/' + cal.state + '/20132014/' + cal.bills[i][0] + '/?apikey=' + cal.pubkey + '&callback=?';
 				} 			
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



