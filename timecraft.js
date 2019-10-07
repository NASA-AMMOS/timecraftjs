var kernel_paths = ['/kernels/lsk/naif0012.tls','/kernels/spk/de425s.bsp','/kernels/pck/pck00010.tpc',];
var timecraftjs;
//Load the required javascript files
timecraftjs = {"is_ready":false};

//set up spice different ways depending on if in a browser or not
if(typeof window == "undefined"){
	//If in node
    timecraft = require("timecraftjs/spice.js");
	var cspice = require("timecraftjs/cspice.js");
	var fs = require("fs");
    timecraft.SPICE.setup(cspice,fs);
	for(var i = 0;i < kernel_paths.length;i++){
        timecraft.SPICE.node_furnish(kernel_paths[i]);
	}
    timecraft = timecraft.SPICE;
    timecraft.is_ready = true;
} else {
	//If in a browse



	//sp = {"SPICE":SPICE};
	//SPICE.furnish("./kernels/lsk/naif0012.tls")
	var Module = {


		// The functions to run after loading
		postRun: [function(){
			SPICE.setup(Module,FS);
			/*
				Read files into the program from the virtual file system
				SPICE.furnish(['kernels/pck/pck00010.tpc','kernels/lsk/naif0010.tls','kernels/spk/planets/de432s.bsp']) would also have worked.
			*/
			if(typeof preload_file_data == "undefined"){
				SPICE.furnish_via_xhr_request(kernel_paths,
				function(){
				},
				function(){
                    timecraft = SPICE;
                    timecraft.is_ready = true;
					var evnt = new CustomEvent("timecraftready");
					window.dispatchEvent(evnt);
				});
			} else {
				for(var i = 0;i < preload_file_data.length;i++){
					var full_path = preload_file_data[i].path;
					SPICE.furnish_via_preload_file_data(full_path,preload_file_data[i].buffer)
				}
                timecraft = SPICE;
                timecraft.is_ready = true;
				preload_file_data = null;
				var evnt = new CustomEvent("timecraftready");
				window.dispatchEvent(evnt);
			}
		}
		],
		// Capture stdout
		print: function() {
			text = Array.prototype.slice.call(arguments).join(' ');
			if(timecraft.is_ready){
				if(timecraft.report_then_reset && timecraft.failed() == 1){
					var errstr = timecraft.getmsg("LONG");
					//console.log(text);
                    timecraft.reset();
					console.error(errstr);
				} else {
					console.log(text);
				}
			}
		},
		// Capture stderr
		printErr: function() {
			text = Array.prototype.slice.call(arguments).join(' ');
			if(text.slice(0,8) === 'pre-main') return;
			console.error(text);
		},




	};
}

if(typeof window == "undefined") module.exports = timecraft;
