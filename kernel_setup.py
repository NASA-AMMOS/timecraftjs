#!/usr/bin/python

import sys
import os

if(len(sys.argv) > 3 or len(sys.argv) < 2):
	print("Please provide the name of the folder that contains a list of kernels (in the form of 'kernels/???/???/???.???') to load and the path to the folder containing the kernels folder. Leave this last one blank default to 'node_modules/timecraftjs'. Set the folder to -all to recursively find all kernels in the 'kernels' folder");
	exit(1);

from_file = sys.argv[1];
prefix = "/node_modules/timecraftjs";

if(len(sys.argv) == 3):
	prefix = sys.argv[2];

kernels_list = [];

if(from_file == '-all'):
	for root, subdirs, files in os.walk("kernels"):
		if(len(files) > 0):
			for kf in files:
				if(kf[0] != '.'):
					kernels_list.append(os.path.join(root,kf));
else:
	with open(from_file) as ff:
		for line in ff:
			kernels_list.append(line.rstrip());

lines = [];
with open("timecraft.js","r") as pf:
	pf.readline();
	lines = pf.readlines();
with open("timecraft.js","w") as pf:
	st = "var kernel_paths = [";
	for kern in kernels_list:
		st += "\"" + os.path.join(prefix,kern) + "\"" + ",";
	pf.write(st + "];\n");
	for line in lines:
		pf.write(line);

with open("preload.js","r") as pf:
	pf.readline();
	lines = pf.readlines();
with open("preload.js","w") as pf:
	st = "var kernel_paths = [";
	for kern in kernels_list:
		st += "\"" + kern + "\"" + ",";
	pf.write(st + "];\n");
	for line in lines:
		pf.write(line);
