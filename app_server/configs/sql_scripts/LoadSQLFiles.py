from os import listdir, getcwd
from os.path import isfile, join
import re
import subprocess

# Make sure to only run inside smartfolio/configs/sql_scripts 
script_path = getcwd()
sqlfile_pattern = re.compile(r'\.sql$')

sqlfiles = [f for f in listdir(script_path) if isfile(join(script_path, f)) and sqlfile_pattern.search(f)]

for sqlfile in sqlfiles:
    command = "psql -d smartfolio -a -f " + sqlfile
    print "Executing... " + command
    subprocess.call(["psql", "-d", "smartfolio", "-a", "-f", sqlfile])