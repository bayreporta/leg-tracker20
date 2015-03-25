import csv, json, urllib2, re, time
import sunlight

#### API KEY ####
sunlight.config.API_KEY = 'fbc69b7552fa42979aef5d8009291eb6'

### GLOBALS - API ####
totalBills = 0
fullURL = []
meatPotatoes = []
billsFiltered = []

### GLOBALS - GET BILLS ####
calibrate = {
	'subject': 'Education',
	'session': '20152016',
	'state': 'ca'
}

## UTILITY FUNCTIONS
#======================================

#### IMPORT CSV FILE ####
def import_csv(path, opt):
	d = []
	i=0
	with open(path + '.csv', opt) as csvFile:
		temp = csv.reader(csvFile, delimiter=',')
		for row in temp:
			d.insert(i, row)
			i += 1
	return d;

### IMPORT JSON ###
def import_json(path):
	d = []
	with open(path + '.json') as file:
		 d = json.load(file)
	return d

### OUTPUT JSON ###
def output_json(path, data):
	with open(path + '.json', "w") as file:
		json.dump(data, file)
		

## API FUNCTIONS
#======================================
### GRAB BILLS FOR APP ###		
def grab_bills(cal):
	b = []
	list = []
	b = sunlight.openstates.bills(
		q=cal['subject'],
		session=cal['session'],
		state=cal['state']
	)
	
	### GRAB ONLY THE BILLS THAT APPLY TO CURRENT SESSION AND ARE AB or SB ###
	ii=0
	regex = [r'(AB)',r'(SB)']
	for i in range(0, len(b)):
		if b[i]['session'] == '20152016':
			test = [0, 0]
			test[0] = re.search(regex[0],b[i]['bill_id'])
			test[1] = re.search(regex[1],b[i]['bill_id'])
			if test[0] != None:
				list.insert(i, b[ii]['bill_id'])
			elif test[1] != None:
				list.insert(i, b[ii]['bill_id'])
		ii += 1
	return list
	
### CALL API AND RETREIVE DATA ###
def bringSunlight(bills, cal):
	tot = len(bills)
	deets = []
	for i in range(0,tot):
		time.sleep(1)
		deets.insert(i, sunlight.openstates.bill_detail(cal['state'],cal['session'], bills[i]))
	
	### OUTPUT BILL DETAILS ###
	output_json('bills', deets)
	return deets


## FILTER FUNCTIONS
#======================================

### PULL OUT SUMMARY AND TITLE ###
def parse_meta(d):
	data = []
	for i in range(0, len(d)):
		test = 'none'
		try:
			d[i]['summary']
		except NameError:
			print 'none'
		else:
			test = d[i]['summary']
		data.insert(i, [d[i]['title'], test])	
	return data
	
### DETERMINE AND APPLY FILTERS TO BILLS ###
def apply_filters(d):
	#d = import_json('meta')
	rawFilter = import_csv('filters', 'rU')
	cleanFilter = []
	filterTest = []

	### MAKE PROPER FILTERS ###
	ii = 0
	for i in range(1, len(rawFilter)):
		prog = re.compile(r'[^\[^\']+', re.IGNORECASE)
		text = prog.search(str(rawFilter[i]))
		cleanFilter.insert(ii, text.group())
		ii += 1  

	### CHECK META TO FILTERS ###
	length = len(d) + 1
	iii = -1
	print len(d)
	for i in range(0,length):
		print iii
		filterTest.insert(i, [])
		for ii in range(0,len(cleanFilter)):
			if i == 0:
				filterTest[i].insert(ii, rawFilter[ii])
				continue			
			prog = re.compile(r'('+cleanFilter[ii]+')+',re.IGNORECASE)
			title = prog.search(d[iii][0])
			sum = prog.search(d[iii][1])
			if sum != None:
				filterTest[i].insert(ii, True)
			elif title != None:	
				filterTest[i].insert(ii, True)
			else:
				filterTest[i].insert(ii, False)	
		iii += 1
	output_json('filters',filterTest)
	return filterTest

## THE MAIN FUNCTION
#======================================

def main():
	### CALL GLOBALS ###
	global meatPotatoes
	global billsFiltered
	global calibrate
	
	### AUTO GRAB BILLS FROM OPENSTATES ###
	meatPotatoes = grab_bills(calibrate);

	### CALL API ###
	meatPotatoes = bringSunlight(meatPotatoes, calibrate)

	### PARSE META ###
	billMeta = parse_meta(meatPotatoes)
	
	### MATCH FILTERS ###
	billsFiltered = apply_filters(billMeta)
	


if __name__ == '__main__':
	main();
	