import csv
import json

variables = {'path': 'data'}

def get_bills(path):
	with open(path + '.csv', 'rb') as csvFile:
		temp = csv.reader(csvFile, delimiter=',');
		for row in temp:
			data.insert(i, row)
			i += 1
	print temp;



def main():
	bills = get_bills(variables['path']);
	print bills;

if __name__ == '__main__':
	main();