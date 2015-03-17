import csv, json, urllib2
import sunlight

#### API KEY ####
sunlight.config.API_KEY = 'fbc69b7552fa42979aef5d8009291eb6'

### GLOBALS - API ####
totalBills = 0
filenames = {'bills': 'bills', 'meta':'main'}
fullURL = []
meatPotatoes = []

### GLOBALS - GET BILLS ####
calibrate = {
	'subject': 'Education',
	'session': '20152016',
	'state': 'ca'
}


#### GET LOCAL BILL LIST ####
def import_csv(path):
	data = []
	i=0
	with open(path + '.csv', 'rb') as csvFile:
		temp = csv.reader(csvFile, delimiter=',')
		for row in temp:
			data.insert(i, row)
			i += 1
	return data;

### CALL API AND RETREIVE DATA ###
def bringSunlight(bills, cal):
	tot = len(bills)
	deets = []
	for i in range(0,tot):
		deets.insert(i, sunlight.openstates.bill_detail(cal['state'],cal['session'], bills[i]))
	return deets

### OUTPUT JSON ###
def output_json(path, data):
	with open(path + '.json', "w") as file:
		json.dump(data, file)
		
### GRAB BILLS FOR APP ###		
def grab_bills(cal):
	b = []
	list = []
	b = sunlight.openstates.bills(
		q=cal['subject'],
		session=cal['session'],
		state=cal['state']
	)
	
	### GRAB ONLY THE BILLS THAT APPLY TO CURRENT SESSION ###
	ii=0
	for i in range(0, len(b)):
		if b[i]['session'] == '20152016':
			list.insert(i, b[ii]['bill_id'])	
			ii += 1
	return list

def main():
	### CALL GLOBALS ###
	global filenames
	global fullURL
	global meatPotatoes
	global calibrate
	
	### AUTO GRAB BILLS FROM OPENSTATES ###
	meatPotatoes = grab_bills(calibrate);


	print meatPotatoes
	### CALL API ###
	meatPotatoes = bringSunlight(meatPotatoes, calibrate)

	
	### OUTPUT FILE ###
	output_json(filenames['bills'], meatPotatoes)
	
	### MANUAL GRAB BILLS ###
	#bills = import_csv(filenames['bills'])
	#del bills[0]
	#totalBills = len(bills)
		
	
	### GET META DATA ###
	#meta = import_csv(variables['meta'])
	


if __name__ == '__main__':
	main();
	