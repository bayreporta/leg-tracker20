f = open('myfile','w')
f.write('hi there') # python will convert \n to os.linesep
f.close() # you can omit in most cases as the destructor will call if