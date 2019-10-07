var kernel_paths = ["kernels/lsk/naif0012.tls","kernels/pck/pck00010.tpc","kernels/spk/de425s.bsp"];
var cspice = require("./cspice.js");
var fs = require("fs");
var em_fs = cspice.get_fs();
var output = [];
for(var i = 0; i < kernel_paths.length;i++){
	//Create the necessary path in order to save the file
	var splitPath = ("node_modules/timecraftjs/" + kernel_paths[i]).split("/");
	var pathStr = ""
	for(var ii = 0;ii < splitPath.length-1;ii++){
		pathStr += splitPath[ii];
		//There does not appear to be a simple way in this.FS to check if a directory exists or is duplicated, so just try and recover if an error occurs (the directory already exists)
		try{
			em_fs.mkdir(pathStr);
		} catch(e){
			//nope
		}
	}
	var fileStr = splitPath[splitPath.length-1];
	var buffer = new Uint8Array(fs.readFileSync(kernel_paths[i]));
	em_fs.createDataFile(pathStr,fileStr,buffer,true,true);
	var save_buff = em_fs.readFile(pathStr + "/" + fileStr);
	var write_buff = Object.keys(save_buff).map(function (key) { return save_buff[key]; });
	output[i] = {"path":pathStr + "/" + fileStr,"buffer": write_buff};
	//fs.writeFile("./test_file_out.txt",JSON.stringify(em_fs.readFile(pathStr + "/" + fileStr)));
}
//var buff1 = em_fs.readFile("node_modules/timecraftjs/kernels/lsk/naif0012.tls");
//var obj_tmp = {"path":"node_modules/timecraftjs/kernels/lsk/naif0012.tls","buff":buff1};
fs.writeFile("./preload_file_data.js","var preload_file_data = " + JSON.stringify(output) + ";");
