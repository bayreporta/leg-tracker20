/* LEGTRACKER MAIN
========================================================================*/
var legTrack = {
	calibrate:{
		state:null,
		session:null,
		bills:[],
		totalBills:null,
		pubkey:null,
		full: []
	},
	data:[],
	output:[],
	parseDetails: function(d, cal, out){
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
					out[i].meta.firstStr = this.convertDate(d[i].action_dates.first);
					out[i].meta.lastStr = this.convertDate(d[i].action_dates.last);
					out[i].meta.firstNum = Date.parse(d[i].action_dates.first);
					out[i].meta.lastNum = Date.parse(d[i].action_dates.last);
					out[i].meta.daysSinceFirst = Math.round((out[i].meta.lastNum - out[i].meta.firstNum) / 86400000);
					out[i].meta.chamber = d[i].chamber;
					out[i].meta.subjects = legTrack.data[i][1];


					/* META DATA
					------------------------------------------------*/

					/*
					out[i].XXX = d[i].XXX;
					out[i].XXX = d[i].XXX;
					out[i].XXX = d[i].XXX;
					out[i].XXX = d[i].XXX;
					out[i].XXX = d[i].XXX;
					out[i].XXX = d[i].XXX;
					out[i].XXX = d[i].XXX;
					out[i].XXX = d[i].XXX;
					out[i].XXX = d[i].XXX;
					out[i].XXX = d[i].XXX;
					out[i].XXX = d[i].XXX;
					out[i].XXX = d[i].XXX;
					out[i].XXX = d[i].XXX;
					out[i].XXX = d[i].XXX;
					out[i].XXX = d[i].XXX;
					out[i].XXX = d[i].XXX;
					out[i].XXX = d[i].XXX;
					out[i].XXX = d[i].XXX;
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
		var thisDate = date.split(' ');
		thisDate = thisDate[0].split('-');
		return thisDate[1] + '/' + thisDate[2] + '/' + thisDate[0];

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



