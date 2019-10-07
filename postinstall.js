var fs = require('fs');
var https = require('https');
var readline = require('readline');

//The name of the file to search for
var find_file = "kernel_list.json";

//This function is to download and save kernel files once the directory has been put in plac
//https://stackoverflow.com/questions/11944932/how-to-download-a-file-with-node-js-without-using-third-party-libraries
var download = function(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = https.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
};

var str = __dirname + "/";
var prev_path = "";
var end_path;
var found = false;

//If a path to a kernel_list.json is given, this is how we handle it
var given_path = function(path){
	//If the path provided on the command line exists, use it
	if(fs.existsSync(path)){
		console.log("TimeCraftJS: downloading kernels as specified in " + fs.realpathSync(path) + " (Given as '" + path +"').");
		end_path = path;
		found = true;
	} else {
		//Otherwise report it and exit
		console.log("TimeCraftJS: " + path + " was provided to postinstall but the file could not be found. Using default kernels.");
		process.exit();
	}
}

//If given the path to a kernel_list.json and told not to search, immediately use the given path
if((process.argv.length === 4 && process.argv[3] === 'override')){
	console.log("TimeCraftJS: postinstall was provided '" + process.argv[2] + "' to download kernels from and told not to search for another " + find_file + ".");
	given_path(process.argv[2]);
} else {
	//If no path given on the command line or overwrite not specified, search for kernel_list.json
	//Search until we find find the file or until we reach a point where going upward sinply puts us back where we were.
	for(var i = 0; i < 2000; i++){
		if(i != 0) str += "../";
		if(fs.existsSync(str + find_file)){
			i = 2000;
			found = true;
			end_path = str + find_file;
		}
		if(prev_path === fs.realpathSync(str)){
			i = 2000;
		} else {
			prev_path = fs.realpathSync(str);
		}
	}
	if(found){
		//If kernel_list.json was found, report it
		console.log("TimeCraftJS: Found " + find_file + " at " + fs.realpathSync(str) + "/" + find_file + " (Found: " + end_path + ").");
		if(process.argv.length == 3){
			console.log("TimeCraftJS: ignoring provided " + process.argv[2] + " as " + end_path + " was found instead. Use override if this is not desired.");
		}
	} else if (process.argv.length == 3){
		//If no kernel_list.json was found, but one was provided in command line, use it
		console.log("TimeCraftJS: No custom " + find_file + " found. Using the provided " + process.argv[2] + ".");
		given_path(process.argv[2]);
	}
}

//We found the file
if(found){

	//Parse the json
	var klist = JSON.parse(fs.readFileSync(end_path,'utf8'));

	//Prepare a string to put at the timecraft.js
	var spicey_str = "var kernel_paths = [";

	var already_downloaded = true;
	//Check to see if the download has already happened
	for(var i = 0;i < klist.length;i++){
		var path = __dirname + "/" + klist[i].path;
		if(!fs.existsSync(path)){
			already_downloaded = false;
			i = klist.length;
		}
	}

	//If all kernels already found, dont download again and simply make sure that timecraft.js has the correct array of kernels to load
	if(already_downloaded){
		console.log("TimeCraftJS: All kernels specified have already been downloaded. Skipping download.");
	}

	//Loop through the kernels
	for(var i = 0;i < klist.length;i++){
		//If the directories do not exist, create them
		var path = __dirname + "/" + klist[i].path;
		var path_split = klist[i].path.split("/");//path.split("/");
		for(var j = 0;j < path_split.length;j++){
			var path_str = __dirname;
			for(var k = 0;k < j;k++){
				path_str += "/" + path_split[k];
			}
			if(!fs.existsSync(path_str)){
				fs.mkdirSync(path_str);
			}
		}

		//Download the file if they havnt been already
		if(!already_downloaded){
			download(klist[i].url,path);
		}

		//Update the string to write to TimeCraft.js
		spicey_str += "'/node_modules/@gov.nasa.jpl.mgss.seq/timecraftjs/" + klist[i].path + "',";
	}
	//Finish the string to write to timecraft.js
	spicey_str += "];";
	
	var write_str = "";
	var rl = readline.createInterface({
  		input: fs.createReadStream(__dirname + '/timecraft.js')
	});
	write_str += spicey_str  + "\n";
	var skipped = false;
	rl.on('line', (line) => {
		if(skipped){
			write_str += line + "\n";
		} else {
			skipped = true;
		}
	});

	rl.on('close',(thing) => {
		var ws = fs.createWriteStream(__dirname + '/timecraft.js');
		ws.write(write_str);
	});

} else {
	console.log("TimeCraftJS: No " + find_file + " found. Using default kernels.");
}