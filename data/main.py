import csv, json, urllib2
import sunlight

#### API KEY ####
sunlight.config.API_KEY = 'fbc69b7552fa42979aef5d8009291eb6'

### GLOBALS ####
totalBills = 0
variables = {'bills': 'bills', 'meta':'main'}
fullURL = []
meatPotatoes = []
	
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

def calibrate_app(meta, var, tot, bills):
	global fullURL
	var['state'] = meta[1][1].lower()
	var['session'] = str(meta[2][1])
	var['pubkey'] = meta[3][1]
	
	ii = 0
	for i in range(1,tot):
		fullURL.insert(ii, 'http://openstates.org/api/v1/bills/' + var['state'] + '/' + var['session'] + '/' + bills[i][0] + '/?apikey=' + var['pubkey'] + '&callback=?')
		print fullURL[ii]
		ii += 1
	return var

def bringSunlight(bills, tot):
	deets = []
	for i in range(1,tot):
		deets.insert(i, sunlight.openstates.bill_detail('ca','20152016',bills[i][0]))
	return deets

def output_json(path, data):
	with open(path + '.json', "w") as file:
		json.dump(data, file)

def main():
	### CALL GLOBALS ###
	global totalBills
	global variables
	global fullURL
	global meatPotatoes
	
	### GET BILL LIST ###
	bills = import_csv(variables['bills'])
	del bills[0]
	totalBills = len(bills)
	
	### CALL API ###
	meatPotatoes = bringSunlight(bills, totalBills)
	
	### OUTPUT FILE ###
	output_json(variables['bills'], meatPotatoes)
	
	
	### GET META DATA ###
	#meta = import_csv(variables['meta'])
	
	### CALIBRATE APP ###
	#variables = calibrate_app(meta, variables, totalBills, bills)
	

if __name__ == '__main__':
	main();