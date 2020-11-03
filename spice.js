/** @namespace SPICE
* @description The object through which all Spice functions are accessed. 
*/
var SPICE = (function() {
	'use strict';


	/** @function ptr_matrix
	 * Converts a 3x3 matrix C pointer to a JavaScript 3x3 array
	 * @private
	 */
	function ptr_matrix(ptr) {
		var matrix = [[],[],[]];
		for (var i = 0; i < 9; i++) {
			var row = matrix[Math.floor(i/3)];
			row.push(this.Module.getValue(ptr+(i*8), 'double'))
		}
		return matrix;
	}

	function arrayToMemory(array,type){
		var blockSize;
		var ptr;
		if(type == "double"){
			blockSize = 8;
		} else if(type == "integer"){
			blockSize = integer_size;
			type = integer_type;
		} else if(type == "char"){
			blockSize = 1;
			type = 'i8'
		} else {
			console.error("Invalid type for arrayToMemory: " + type + "Must be 'double', 'integer', or 'char'");
		}
		if(array[0].length == undefined){//If a one dimensional array
			var ptr = this.Module._malloc(array.length * blockSize);
			for(var i = 0;i < array.length;i++){
				this.Module.setValue(ptr,array[i],type);
			}
		} else if(array[0].length > 0){ //If a two dimensional array
			var rowLength = array[0].length * blockSize;
			var ptr = this.Module._malloc(array.length * array[0].length * blockSize);
			for(var i = 0;i < array.length;i++){
				for(var ii = 0;ii < array[0].length;ii++){
					this.Module.setValue(ptr+(rowLength*i)+(blockSize*ii),array[i][ii],type)
				}
			}
		}

		return ptr;
	}

	var void_ptr_size = 4;
	var integer_size = void_ptr_size;
	var integer_type = 'i32';
	var SPICE_CELL_CONTROL_SIZE = 6; //SpiceCells contain an array with 6 control spaces before the actual data

	/* The SpiceCell structure contains the members:

   dtype:     Data type of cell: character,
              integer, or double precision.
 
              dtype has type
              SpiceCellDataType.
 
   length:    For character cells, the
              declared length of the
              cell's string array.
 
   size:      The maximum number of data
              items that can be stored in
              the cell's data array.
 
   card:      The cell's "cardinality": the
              number of data items currently
              present in the cell.
 
   isSet:     Boolean flag indicating whether
              the cell is a CSPICE set.
              Sets have no duplicate data
              items, and their data items are
              stored in increasing order.
 
   adjust:    Boolean flag indicating whether
              the cell's data area has
              adjustable size.  Adjustable
              size cell data areas are not
              currently implemented.
 
   init:      Boolean flag indicating whether
              the cell has been initialized.
 
   base:      is a void pointer to the
              associated data array.  base
              points to the start of the
              control area of this array.
 
   data:      is a void pointer to the
              first data slot in the
              associated data array.  This
              slot is the element following
              the control area.

	The terms ``size'' and ``cardinality'' refer, respectively, to the maximum number of data elements the cell's data array can hold and the number of data elements currently in the data array. 
	*/

	/** @namespace Cell
	* @type {object}
	* @description A cell is a kind of array that holds some information about itself. They are used extensively in the C version of SPICE. Cells contain arrays of strings, integers, or doubles. Depending on how the data
	* is stored, cells may also be considered several other things: If all elements are unique and in ascending order, a cell is considered a set. If it is a double cell composed of pairs of start and end points that do not
	* overlap (time intervals), it is considered a window. Certain functions may or may not work for a cell depending on if it has these properties. Cells should be instantiated with the proper functions and only
	* interacted with via the proper functions. This is because every cell is mirrored in the C memory, and arbitrarily changing it's javascript values will have no effect on the actual object. All properties may be accessed either
	* with cell.property or cell.get_property() but should not be changed via Javascript. Instantiated by calling SPICE.new_char_cell(length,size), SPICE.new_double_cell(size), or SPICE.new_int_cell(size).
	* @todo There is a problem with character stings. SPICE.copy(source_cell,result_cell) does not work for character cells. Result_cell is made into a cell with all the same params, but every string in data becomes entirely spaces
	* up to the max length. As this is called internally for several functions, various cell functions do not work for character cells. This must be fixed.
	* @property {number} dtype - The type of cell. 0 is a char cell, 1 is a double cell, 2 is an integer cell.
	* @property {number} length - The maximum length a string can be in a char cell. Only relevant to character cells.
	* @property {number} size - The maximum number of elements the cell can hold.
	* @property {number} card - The cardinality pf the cell, or how many elements it currently holds. May also be read with SPICE.card(cell).
	* @property {number} isSet - Whether or not the cell is a set. Automatically changed when other functions are called.
	* @property {array} data - The data contained within the set. Accessed with cell.data[index] or cell.get_data[index].
	* @inner
	*/

	/**
	* @memberof SPICE
	* @typedef Cell
	* @type {object}
	* @description A special kind of array used in Spice that is mirrored in the C memory. See more [here.]{@link Cell}
	*/
	//This a javascript object that will be used to interact with SpiceCells
	function cell(dtype,length,size){
		this.pointer = this.Module._malloc(24 + void_ptr_size*2); //Mostly Ints (SpiceBool is an int) and 2 void pointers

		//0 is character cell
		//1 is double cell
		//2 is integer cell
		switch(dtype){
			case 'char':
			case 'character':
			case 'SpiceChar':
			case 0:
				dtype = 0;
				break;
			case 'double':
			case 'SpiceDouble':
			case 1:
				dtype = 1;
				break;
			case 'int':
			case 'integer':
			case 'SpiceInt':
			case 2:
				dtype = 2;
				break;
			default:
				console.error("Invalid cell type: " + dtype +". Must be 0 (char), 1 (double), or 2 (integer).");
				break;
		}

		/*
			Variables inside the Javascript object of a SpiceCell exist to easily access the values of
			the object in C memory without having to leave Javascript.
			These should not be changed manually as doing so will have no effect on  the actual object in C memory

			These functions are for accessing values and keeping the javascript object the same as the C object
		*/

		this.dtype = dtype;
		this.Module.setValue(this.pointer,dtype,integer_type);
		this.get_dtype = function(){
			return this.Module.getValue(this.pointer,integer_type);
		}

		this.length = length;
		this.Module.setValue(this.pointer+integer_size,length,integer_type);
		this.get_length = function(){
			return this.Module.getValue(this.pointer+integer_size,integer_type);
		}

		this.size = size;
		this.Module.setValue(this.pointer+2*integer_size,size,integer_type);
		this.get_size = function(){
			return this.Module.getValue(this.pointer+2*integer_size,integer_type);
		}

		this.card = 0;
		this.Module.setValue(this.pointer+3*integer_size,0,integer_type);
		this.get_card = function(){
			return this.Module.getValue(this.pointer+3*integer_size,integer_type);
		}

		this.isSet = 1;
		this.Module.setValue(this.pointer+4*integer_size,1,integer_type);
		this.get_isSet = function(){
			return this.Module.getValue(this.pointer+4*integer_size,integer_type);
		}

		//adjustable size cells are not currently implemented so this will just always be false
		this.adjust = 0;
		this.Module.setValue(this.pointer+5*integer_size,0,integer_type);
		this.get_adjust = function(){
			return 0;
		}

		this.init = 0;
		this.Module.setValue(this.pointer+6*integer_size,0,integer_type);
		this.get_init = function(){
			return this.Module.getValue(this.pointer+6*integer_size,integer_type);
		}

		//Figure out how large of an array the cell will have
		var data_size;
		if(this.dtype == 0){//character
			//A two dimensional array or [SPICE_CONTROLSIZE + size][length]
			data_size = (SPICE_CELL_CONTROL_SIZE + size) * length;
		} else if (this.dtype == 1){//double
			data_size = 8 * size;
		} else if (this.dtype == 2){//integer
			data_size = integer_size * size;
		}

		//Save the pointers to the array of the cell
		this.base_ptr;
		this.data_ptr;
		if(this.dtype == 0){
			this.base_ptr = this.Module._malloc(data_size + SPICE_CELL_CONTROL_SIZE);
			this.data_ptr = this.base_ptr + SPICE_CELL_CONTROL_SIZE;
		} else if(this.dtype == 1){
			this.base_ptr = this.Module._malloc(data_size + SPICE_CELL_CONTROL_SIZE * 8);
			this.data_ptr = this.base_ptr + SPICE_CELL_CONTROL_SIZE * 8;
		} else  {
			this.base_ptr = this.Module._malloc(data_size + SPICE_CELL_CONTROL_SIZE * integer_size);
			this.data_ptr = this.base_ptr + SPICE_CELL_CONTROL_SIZE * integer_size;
		}	
		this.Module.setValue(this.pointer+7*integer_size,this.base_ptr,'*');
		this.Module.setValue(this.pointer+7*integer_size+void_ptr_size,this.data_ptr,'*');
		this.data = [];

		this.get_data = function(){
			this.data = [];
			for(var i = 0;i < this.card;i++){
				if(this.dtype == 0){
					this.data[i] = this.Module.Pointer_stringify(this.data_ptr+this.length*i);
				} else if(this.dtype == 1) {
					this.data[i] = this.Module.getValue(this.data_ptr+8*i,'double')
				} else {
					this.data[i] = this.Module.getValue(this.data_ptr+integer_size*i,integer_type)
				}
			}
			return this.data;
		}

		this.set_vals_from_my_pointer= function(){
			this.dtype = this.get_dtype();
			this.length = this.get_length();
			this.size = this.get_size();
			this.card = this.get_card();
			this.isSet = this.get_isSet();
			this.adjust = this.get_adjust();
			this.init = this.get_init();
			this.base_ptr = this.Module.getValue(this.pointer+7*integer_size,'*');
			this.data_ptr = this.Module.getValue(this.pointer+7*integer_size+void_ptr_size,'*');
			this.data = this.get_data();
		}

		/*
			These are several javascript functions created to make interacting will cells easier and more like javascript
		*/

		/** @memberof Cell
		* @function append
		* @description Append a value to the end of a cell. This may mean that the cell is no longer a set or a window.
		* @arg {number|string} value - The value to append. Must be of the correct type for the cell.
		*/
		//Add an element to the end of a cell.
		this.append = function(value){
			switch(this.dtype){
				case 0:
					s.appndc(value,this);
					break;
				case 1:
					s.appndd(value,this);
					break;
				case 2:
					s.appndi(value,this);
					break;
				default:
					console.error("Invalid cell type: " + this.dtype +". Must be 0 (char), 1 (double), or 2 (integer).");
					break;
			}
		}

		/** @memberof Cell
		* @function free
		* @description Free the C memory held by a cell. The cell may then be safely nullified for garbage collection.
		*/
		//Free the memory used by this cell
		this.free = function(){
			this.Module._free(this.data_ptr);
			this.Module._free(this.base_ptr);
			this.Module._free(this.pointer);
			this.dtype = undefined;
			this.length = undefined;
			this.size = undefined;
			this.card = undefined;
			this.isSet = undefined;
			this.adjust = undefined;
			this.init = undefined;
			this.base_ptr = undefined;
			this.data_ptr = undefined;
			this.data = undefined;
			this.pointer = undefined;
		}

		/** @memberof Cell
		* @function insert
		* @description Insert an item in order into a set. May cause a double set to no longer be a window. Will error if the cell is not already a set!
		* @arg {number|string} value - The value to insert. Must be of the correct type for the set.
		*/
		//Add an element to a cell, preserving ascending order
		this.insert = function(value){
			switch(this.dtype){
				case 0:
					s.insrtc(value,this);
					break;
				case 1:
					s.insrtd(value,this);
					break;
				case 2:
					s.insrti(value,this);
					break;
				default:
					console.error("Invalid cell type: " + this.dtype +". Must be 0 (char), 1 (double), or 2 (integer).");
					break;
			}
		}

		/** @memberof Cell
		* @function ord
		* @description Find the index of an item in a set. Will error if the cell is not already a set!
		* @arg {number|string} value - The value to insert. Must be of the correct type for the set.
		* @returns {number} The index of value, or -1.
		*/
		//Return the index of an element in a set
		this.ord = function(value){
			switch(this.dtype){
				case 0:
					return s.ordcc(value,this);
					break;
				case 1:
					return s.ordd(value,this);
					break;
				case 2:
					return s.ordi(value,this);
					break;
				default:
					console.error("Invalid cell type: " + this.dtype +". Must be 0 (char), 1 (double), or 2 (integer).");
					break;
			}
		}

		/** @memberof Cell
		* @function remove
		* @description Remove an item from a set. May cause a double set to no longer be a window. Will error if the cell is not already a set!
		* @arg {number|string} value - The value to remove. Must be of the correct type for the set.
		*/
		//Remove an element from a cell
		this.remove = function(value){
			switch(this.dtype){
				case 0:
					s.removc(value,this);
					break;
				case 1:
					s.removd(value,this);
					break;
				case 2:
					s.removi(value,this);
					break;
				default:
					console.error("Invalid cell type: " + this.dtype +". Must be 0 (char), 1 (double), or 2 (integer).");
					break;
			}
		}

		/** @memberof Cell
		* @function set_element
		* @description Set the cell.data[index] to value. isSet will be set to 0 even if the cell is still technically a set afterwards. Call SPICE.valid(cell) to fix this if required.
		* @arg {number} index - The index of the value to change.
		* @arg {number | string} value - The value to be stored. Must be of the correct type for the cell.
		*/
		//Directly set the value of an element of a cell. isSet is set to 0
		this.set_element = function(index,value){
			s.set_cell_element(index,value,this);
		}

		/** @memberof Cell
		* @function set_size
		* @description Change the size of a cell. The cell will be emptied of all data.
		* @arg {number} value - The size to set the cell to.
		*/
		this.set_size = function(value){
			s.ssize(value,this);
		}
	}

	var s = {

	   /** @memberof SPICE
	   	* @func b1900
		* @desc Return the Julian Date corresponding to Besselian Date 1900.0.
		* @returns {number} 2415020.31352
		*/
		/*b1900:    Return the Julian Date corresponding to Besselian Date 1900.0.
		*/
		b1900: function(){
			return this.Module.ccall(
				'b1900_c',
				'number',
				[],
				[]
			);
		},

	   /** @memberof SPICE
	   	* @func b1950
		* @desc Return the Julian Date corresponding to Besselian Date 1950.0.
		* @returns {number} 2433282.42345905
		*/
		/*b1950:    Return the Julian Date corresponding to Besselian Date 1950.0.
		*/
		b1950: function(){
			return this.Module.ccall(
				'b1950_c',
				'number',
				[],
				[]
			);
		},

		/*bodc2n:    Translate the SPICE integer code of a body into a common name
		   for that body.
		*/
		/** @memberof SPICE
		* @func bodc2n
		* @desc Translate the SPICE integer code of a body into a common name
		* @param {number} code - The NAIF ID code of then body.
		* @returns {string | undefined} The name of the body if it exists, otherwise undefined.
		*/
		bodc2n: function(code){
			var name_ptr = this.Module._malloc(100);
			var found_ptr = this.Module._malloc(integer_size);
			this.Module.ccall(
				'bodc2n_c',
				null,
				["number","number","number","number",],
				[code,100,name_ptr,found_ptr,]
			);
			var found = this.Module.getValue(found_ptr,integer_type)
			var name = this.Module.Pointer_stringify(name_ptr);
			this.Module._free(name_ptr);
			this.Module._free(found_ptr);
			if(found){ //If name exists
				return name;//Return the name
			} else {
				return undefined;
			}
		},

		/*bodc2s:    
			Translate a body ID code to either the corresponding name or if no
		   name to ID code mapping exists, the string representation of the 
		   body ID value.
		*/
		/** @memberof SPICE
		* @func bodc2s
		* @desc Translate a body ID code to either the corresponding name or if no
		   name to ID code mapping exists, the string representation of the 
		   body ID value.
		* @param {number} code - The NAIF ID code of then body.
		* @returns {string} The name of the body if it exists, otherwise the number as a string.
		*/
		bodc2s: function(code){
			var name_ptr = this.Module._malloc(100);
			this.Module.ccall(
				'bodc2s_c',
				null,
				["number","number","number",],
				[code,100,name_ptr,]
			);
			var ret = this.Module.Pointer_stringify(name_ptr);
			this.Module._free(name_ptr);
			return ret; //Return name
		},

		/*boddef:    Define a body name/ID code pair for later translation via
		   bodn2c_c or bodc2n_c.
		*/
		/** @memberof SPICE
		* @todo Document and test this! 
		*/
		boddef: function(name,code){
			this.Module.ccall(
				'boddef_c',
				null,
				["string","number",],
				[name,code,]
			);
		},

		/*bodfnd:    Determine whether values exist for some item for any body
		   in the kernel pool.
		*/
		/** @memberof SPICE
		* @todo Document and test this! 
		*/
		bodfnd: function(body,item){
			return this.Module.ccall(
				'bodfnd_c',
				'number',
				['number','string',],
				[body,item,]
			);
		},

		/*bodn2c:    Translate the name of a body or object to the corresponding SPICE
		   integer ID code.
		*/
		/** @memberof SPICE
		* @func bodn2c
		* @desc Translate the name of a body or object to the corresponding SPICE integer ID code.
		* @param {name} name - The common name of the body.
		* @returns {number | undefined} The SPICE ID of the body if it exists, otherwise undefined.
		*/
		bodn2c: function(name){
			var code_ptr = this.Module._malloc(integer_size);
			var found_ptr = this.Module._malloc(integer_size);
			this.Module.ccall(
				'bodn2c_c',
				null,
				["string","number","number",],
				[name,code_ptr,found_ptr,]
			);
			var found = this.Module.getValue(found_ptr,integer_type);
			var code = this.Module.getValue(code_ptr,integer_type);
			this.Module._free(found_ptr);
			this.Module._free(code_ptr);
			if(found){	//If code exists
				return code; //Return it
			} else {
				return undefined;
			}
		},

		/*bods2c:    Translate a string containing a body name or ID code to an integer
		   code.
		*/
		/** @memberof SPICE
		* @func bods2c
		* @desc Translate the name of a body or object to the corresponding SPICE integer ID code.
		* @param {name} name - The common name of a body or its code as a string.
		* @returns {number | undefined} If a body name was passed in, the SPICE ID of the body if it exists, otherwise undefined. If a string number was passed in, the number as an integer.
		*/
		bods2c: function(name){
			var code_ptr = this.Module._malloc(integer_size);
			var found_ptr = this.Module._malloc(integer_size);
			this.Module.ccall(
				'bods2c_c',
				null,
				["string","number","number",],
				[name,code_ptr,found_ptr,]
			);
			var found = this.Module.getValue(found_ptr,integer_type);
			var code = this.Module.getValue(code_ptr,integer_type); 
			this.Module._free(code_ptr);
			this.Module._free(found_ptr);

			if(found){	//If the code exists
				return code;//Return it
			} else {
				return undefined;
			} 

		},

		/*bodvcd:  
		   Fetch from the kernel pool the double precision values of an item
		   associated with a body, where the body is specified by an integer ID
		   code.
		 */
		/** @memberof SPICE
		* @todo Document and test this! 
		*/
		bodvcd: function(bodyid,item,maxn){
			var dim_ptr = this.Module._malloc(8);
			var values_ptr = this.Module._malloc(8*maxn);
			this.Module.ccall(
				'bodvcd_c',
				null,
				["number","string","number","number","number",],
				[bodyid,item,maxn,dim_ptr,values_ptr,]
			);
			var ret = [];
			for (var i = 0; i < this.Module.getValue(dim_ptr,integer_type); i++){
				ret.push(this.Module.getValue(values_ptr+i*8, 'double'));
			}
			this.Module._free(dim_ptr);
			this.Module._free(values_ptr);

			return ret;
		},

		/*bodvrd:  
		   Fetch from the kernel pool the double precision values  
		   of an item associated with a body. 
		 */
		/** @memberof SPICE
		* @todo Document and test this! 
		*/
		bodvrd: function(body, item, maxn) {
			var valuesptr = this.Module._malloc(8*maxn);
			var dimptr = this.Module._malloc(2);
			this.Module.ccall(
				'bodvrd_c',
				null,
				['string','string','number','number','number'],
				[body, item, maxn, dimptr, valuesptr]
			);
			var ret = [];
			for (var i = 0; i < this.Module.getValue(dimptr,integer_type); i++){
				ret.push(this.Module.getValue(valuesptr+i*8, 'double'));
			}
			this.Module._free(valuesptr);
			this.Module._free(dimptr);

			return ret;
		},

		/*ckgp:  
		   Get pointing (attitude) for a specified spacecraft clock time. 
		 */
		/** @memberof SPICE
		* @todo Document and test this! 
		*/
		/*ckgp: function(inst,sclkdp,tol,ref){
			var cmat_ptr = this.Module._malloc(72);
			var clkout_ptr = this.Module._malloc(8);
			var found_ptr = this.Module._malloc(integer_size);
			this.Module.ccall(
				'ckgp_c',
				null,
				["number","number","number","string","number","number","number",],
				[inst,sclkdp,tol,ref,cmat_ptr,clkout_ptr,found_ptr,]
			);
			var found = this.Module.getValue(found_ptr,integer_type);
			var clkout = this.Module.getValue(clkout_ptr,'double');
			var cmat = ptr_matrix(cmat_ptr);
			this.Module._free(found_ptr);
			this.Module._free(clkout_ptr);
			this.Module._free(cmat_ptr);

 			if(found){
				return {'cmat':cmat,'clkout':clkout};
			} else {
				return undefined;
			}
		},*/

		/*ckgpav:  
		   Get pointing (attitude) and angular velocity for a specified 
		   spacecraft clock time.
		 */
		/** @memberof SPICE
		* @todo Document and test this! 
		*/
		/*ckgpav: function(inst,sclkdp,tol,ref){
			var cmat_ptr = this.Module._malloc(72);
			var av_ptr = this.Module._malloc(24);
			var clkout_ptr = this.Module._malloc(8);
			var found_ptr = this.Module._malloc(integer_size);
			this.Module.ccall(
				'ckgpav_c',
				null,
				["number","number","number","string","number","number","number","number",],
				[inst,sclkdp,tol,ref,cmat_ptr,av_ptr,clkout_ptr,found_ptr,]
			);
			var found = this.Module.getValue(found_ptr,integer_type); 
			var clkout = this.Module.getValue(clkout_ptr,'double');
			var av = [];
			for(var i = 0;i < 3;i++){
				av.push(this.Module.getValue(av_ptr+i*8,'double'));
			}
			var cmat = ptr_matrix(cmat_ptr);
			this.Module._free(found_ptr);
			this.Module._free(clkout_ptr);
			this.Module._free(av_ptr);
			this.Module._free(cmat_ptr);

			if(found){
				return {'cmat':cmat,'av':av,'clkout':clkout};
			} else {
				return undefined;
			}
		},*/

		/*convrt:  
		    Take a measurement X, the units associated with 
		    X, and units to which X should be converted; return Y --- 
		    the value of the measurement in the output units. 
		 */
		/** @memberof SPICE
		* @func convrt
		* @desc Take a measurement X, the units associated with X, and units to which X should be converted; return the value of the measurement in the output units. 
		* @param {number} x - The number in units of in_var to convert.
		* @param {string} in_var - The kind of units x is in. Acceptable units are: 

              Angles:                 "RADIANS" 
                                      "DEGREES" 
                                      "ARCMINUTES" 
                                      "ARCSECONDS" 
                                      "HOURANGLE" 
                                      "MINUTEANGLE" 
                                      "SECONDANGLE" 

              Metric Distances:       "METERS" 
                                      "KM" 
                                      "CM" 
                                      "MM" 

              English Distances:      "FEET" 
                                      "INCHES" 
                                      "YARDS" 
                                      "STATUTE_MILES" 
                                      "NAUTICAL_MILES" 

              Astrometric Distances:  "AU" 
                                      "PARSECS" 
                                      "LIGHTSECS" 
                                      "LIGHTYEARS" julian lightyears 

              Time:                   "SECONDS" 
                                      "MINUTES" 
                                      "HOURS" 
                                      "DAYS" 
                                      "JULIAN_YEARS" 
                                      "TROPICAL_YEARS" 
                                      "YEARS" (same as julian years) 


              The case of the string in is not significant.
        * @param {string} out - The kind of units for the output to be in. The same kinds of units are valid.
        * @returns {number} The value of x measure in the new units.
		*/
		convrt: function(x,in_var,out){
			var y_ptr = this.Module._malloc(8);
			this.Module.ccall(
				'convrt_c',
				null,
				["number","string","string","number"],
				[x,in_var,out,y_ptr]
			);
			var ret = this.Module.getValue(y_ptr,'double');
			this.Module._free(y_ptr);
			return ret;
		},

		/** @memberof SPICE
		* @func deltet
		* @desc Return the value of Delta ET (ET-UTC) for an input epoch.
		* @param {number} epoch - Input epoch (seconds past J2000).
		* @param {string} eptype - Type of input epoch ("UTC" or "ET"). "UTC": epoch is in UTC seconds past J2000 UTC. "ET": epoch is in Ephemeris seconds past J2000 TDB.
		* @returns {number} Delta ET (ET-UTC) at input epoch
		*/
		deltet: function(epoch,eptype){
			var delta_ptr = this.Module._malloc(8);
			this.Module.ccall(
				'deltet_c',
				null,
				["number","string","number",],
				[epoch,eptype,delta_ptr,]
			);
			var ret = this.Module.getValue(delta_ptr,'double');
			this.Module._free(delta_ptr);
			return ret;
		},

		/*erract:    Retrieve or set the default error action.
		*/
		/** @memberof SPICE
		* @todo Document and test this! 
		*/
		erract: function(op,action){
			return Module.ccall(
				'erract_c',
				null,
				["string","number","string",],
				[op,100,action,]
			);
		},

		 /*Calculate the time derivative of the separation angle between
   		two input states, S1 and S2.
   		*/
   		/** @memberof SPICE
		* @todo Document and test this! 
		*/
		 /*dvsep: function(s1,s2){ 
		 	var s1_ptr = arrayToMemory(s1,'double');
			var s2_ptr = arrayToMemory(s2,'double');
		 	var ret = this.Module.ccall(
		 		'dvsep_c',
		 		'number',
		 		["number","number"],
		 		[s1_ptr,s2_ptr]
		 	);
		 	this.Module._free(s1_ptr);
		 	this.Module._free(s2_ptr);

		 	return ret;
		 },*/

		/*et2lst: 
		   Given an ephemeris epoch, compute the local solar time for 
		   an object on the surface of a body at a specified longitude. 
		 */
		/** @memberof SPICE
		* @func et2lst
		* @summary Given an ephemeris epoch, compute the local true solar time for an object on the surface of a body at a specified longitude. 
		* @desc  In the planetographic coordinate system, longitude is defined using
   the spin sense of the body.  Longitude is positive to the west if
   the spin is prograde and positive to the east if the spin is
   retrograde.  The spin sense is given by the sign of the first degree
   term of the time-dependent polynomial for the body's prime meridian
   Euler angle "W":  the spin is retrograde if this term is negative
   and prograde otherwise.  For the sun, planets, most natural
   satellites, and selected asteroids, the polynomial expression for W
   may be found in a SPICE PCK kernel.

   The earth, moon, and sun are exceptions: planetographic longitude
   is measured positive east for these bodies.
		* @param {number} et - The time to convert in Ephemeris seconds past J2000.
		* @param {number} body - The NAIF ID of the body to find the local solar time on.
		* @param {number} lon - The longitude to observe from, measured in radians.
		* @param {string} type - "PLANETOCENTRIC" or "PLANETOGRAPHIC".
		* @returns {object} An object with the following valued: hr - the number of hours (24 hours lock), mn - the number of minutes, sc - the number of seconds, time - the local true solar time string in a 24 hour clock, and ampm - then local true solar time string in a 12 hour clock.
		*/
		et2lst: function(et,body,lon,type){
			var hr_ptr = this.Module._malloc(integer_size);
			var mn_ptr = this.Module._malloc(integer_size);
			var sc_ptr = this.Module._malloc(integer_size);
			var time_ptr = this.Module._malloc(100);
			var ampm_ptr = this.Module._malloc(100);
			this.Module.ccall(
				'et2lst_c',
				null,
				["number","number","number","string","number","number","number","number","number","number","number",],
				[et,body,lon,type,100,100,hr_ptr,mn_ptr,sc_ptr,time_ptr,ampm_ptr,]
			);
			var ampm = this.Module.Pointer_stringify(ampm_ptr);
			var time = this.Module.Pointer_stringify(time_ptr);
			var sc = this.Module.getValue(sc_ptr,integer_type);
			var mn = this.Module.getValue(mn_ptr,integer_type);
			var hr = this.Module.getValue(hr_ptr,integer_type);
			this.Module._free(hr_ptr);
			this.Module._free(mn_ptr);
			this.Module._free(sc_ptr);
			this.Module._free(time_ptr);
			this.Module._free(ampm_ptr);

			return {'hr':hr,'mn':mn,'sc':sc,'time':time,'ampm':ampm,};
		},

		/** @memberof SPICE
		* @func et2utc
		* @desc Convert an input time from ephemeris seconds past J2000 to Calendar, Day-of-Year, or Julian Date format, UTC.
		* @param {number} et - Input epoch, given in ephemeris seconds past J2000.
		* @param {string} format - Format of output epoch. May be any of the following:
		*
        *        "C" - Calendar format, UTC.
		*
        *        "D" - Day-of-Year format, UTC.
		*
        *        "J" - Julian Date format, UTC.
		*
        *        "ISOC" - ISO Calendar format, UTC.
		*
        *        "ISOD" - ISO Day-of-Year format, UTC.
        * @param {number} prec - Digits of precision in fractional seconds or days. Must be between 0 and 14, inclusive. Determines to how many decimal places the UTC time will be calculated.
        * @returns {string} The corresponding time in UTC.
		*/
		et2utc: function(et,format,prec){
			var utcstr_ptr = this.Module._malloc(100);
			this.Module.ccall(
				'et2utc_c',
				null,
				["number","string","number","number","number",],
				[et,format,prec,100,utcstr_ptr,]
			);
			var ret = this.Module.Pointer_stringify(utcstr_ptr); 
			this.Module._free(utcstr_ptr);
			return ret;
		},

		/*etcal:    Convert from an ephemeris epoch measured in seconds past
		   the epoch of J2000 to a calendar string format using a
		   formal calendar free of leapseconds.
		*/
		/** @memberof SPICE
		* @func etcal
		* @desc Convert from an ephemeris epoch measured in seconds past the epoch of J2000 to a calendar string format using a formal calendar free of leapseconds.
		* @param {number} et - An ephemeris epoch in seconds past J2000
		* @ returns {string} The corresponding time in calendar format (Year Month Day Time)
		*/
		etcal: function(et){
			var string_ptr = this.Module._malloc(100);
			this.Module.ccall(
				'etcal_c',
				null,
				["number","number","number",],
				[et,100,string_ptr,]
			);
			var ret = this.Module.Pointer_stringify(string_ptr);
			this.Module._free(string_ptr);
			return ret;
		},

		/*failed: True if an error condition has been signaled via sigerr_c.
  		failed_c is the CSPICE status indicator
   		*/
   		/** @memberof SPICE
		* @todo Document and test this! 
		*/
   		failed: function(){
   			return Module.ccall(
   				'failed_c',
   				'number',
   				[],
   				[]
   			);
   		},

		// Provide SPICE one or more kernels to load
		/** @memberof SPICE
		* @func furnsh(kernelPaths)/furnish
		* @desc Load one or more SPICE kernels into a program. Files must exists in the memory system or an error will occur.
		* @param {string | array} kernelPaths - Path or array of paths to kernel files.
		*/
		furnsh: function(kernelPaths) {
			if(typeof(kernelPaths) == "string"){
				kernelPaths = [kernelPaths];
			}
			for(var i = 0; i < kernelPaths.length;i++){
				this.Module.ccall(
					'furnsh_c',
					null,
					["string"],
					[kernelPaths[i]]
				);
			}
		},

		/*getmsg:  
		   Retrieve the current short error message, 
		   the explanation of the short error message, or the 
		   long error message. 
		 */
		getmsg: function(option){
			var msg_ptr = Module._malloc(1841);
			Module.ccall(
				'getmsg_c',
				null,
				["string","number","number",],
				[option,1841,msg_ptr,]
			);
			var ret = Module.Pointer_stringify(msg_ptr);
			Module._free(msg_ptr);
			return ret;
		},

		/*j1900:    Return the Julian Date of 1899 DEC 31 12:00:00 (1900 JAN 0.5).
		*/
		/** @memberof SPICE
	   	* @func j1900
		* @desc Return the Julian Date of 1899 DEC 31 12:00:00 (1900 JAN 0.5).
		* @returns {number} 2415020.0
		*/
		j1900: function(){
			return this.Module.ccall(
				'j1900_c',
				'number',
				[],
				[]
			);
		},

		/*j1950:    Return the Julian Date of 1950 JAN 01 00:00:00 (1950 JAN 1.0).
		*/
		/** @memberof SPICE
	   	* @func j1950
		* @desc Return the Julian Date of 1950 JAN 01 00:00:00 (1950 JAN 1.0).
		* @returns {number} 2433282.5
		*/
		j1950: function(){
			return this.Module.ccall(
				'j1950_c',
				'number',
				[],
				[]
			);
		},

		/*j2000:    Return the Julian Date of 2000 JAN 01 12:00:00 (2000 JAN 1.5).
		*/
		/** @memberof SPICE
	   	* @func j2000
		* @desc Return the Julian Date of 2000 JAN 01 12:00:00 (2000 JAN 1.5).
		* @returns {number} 2451545.0
		*/
		j2000: function(){
			return this.Module.ccall(
				'j2000_c',
				'number',
				[],
				[]
			);
		},

		/*j2100:    Return the Julian Date of 2100 JAN 01 12:00:00 (2100 JAN 1.5).
		*/
		/** @memberof SPICE
	   	* @func j2100
		* @desc Return the Julian Date of 2100 JAN 01 12:00:00 (2100 JAN 1.5).
		* @returns {number} 2488070.0
		*/
		j2100: function(){
			return this.Module.ccall(
				'j2100_c',
				'number',
				[],
				[]
			);
		},

		/*jyear:    Return the number of seconds in a julian year.
		*/
		/** @memberof SPICE
	   	* @func jyear
		* @desc Return the number of seconds in a julian year.
		* @returns {number} 31557600
		*/
		jyear: function(){
			return this.Module.ccall(
				'jyear_c',
				'number',
				[],
				[]
			);
		},

		/*lspcn:  
		   Compute L_s, the planetocentric longitude of the sun, as seen 
		   from a specified body. 
		 */
		/** @memberof SPICE
		* @todo Document and test this! 
		*/
		/*lspcn: function(body,et,abcorr){
			return this.Module.ccall(
				'lspcn_c',
				'number',
				['string','number','string',],
				[body,et,abcorr,]
			);
		},*/

		/*ltime:  
		   This routine computes the transmit (or receive) time 
		   of a signal at a specified target, given the receive 
		   (or transmit) time at a specified observer. The elapsed 
		   time between transmit and receive is also returned. 
		 */
		/** @memberof SPICE
		* @todo Document and test this! 
		*/
		ltime: function(etobs,obs,dir,targ){
			var ettarg_ptr = this.Module._malloc(8);
			var elapsd_ptr = this.Module._malloc(8);
			this.Module.ccall(
				'ltime_c',
				null,
				["number","number","string","number","number","number",],
				[etobs,obs,dir,targ,ettarg_ptr,elapsd_ptr,]
			);
			var elapsd = this.Module.getValue(elapsd_ptr,'double');
			var ettarg = this.Module.getValue(ettarg_ptr,'double');
			this.Module._free(elapsd_ptr);
			this.Module._free(ettarg_ptr);
			return {'ettarg':ettarg,'elapsd':elapsd,};
		},

		/*occult:    
			Determines the occultation condition (not occulted, partially,
		   	etc.) of one target relative to another target as seen by
		   	an observer at a given time.
		*/
		/** @memberof SPICE
		* @todo Document and test this! 
		*/
		/*occult: function(target1,shape1,frame1,target2,shape2,frame2,abcorr,observer,et){
			var occult_code_ptr = this.Module._malloc(integer_size);
			this.Module.ccall(
				'occult_c',
				null,
				["string","string","string","string","string","string","string","string","number","number",],
				[target1,shape1,frame1,target2,shape2,frame2,abcorr,observer,et,occult_code_ptr,]
			);
			var ret = this.Module.getValue(occult_code_ptr,integer_type);
			this.Module._free(occult_code_ptr);
			return ret;
		},*/

		/*oscelt:
		   Determine the set of osculating conic orbital elements that
		   corresponds to the state (position, velocity) of a body at
		   some epoch.
		*/
		/** @memberof SPICE
		* @todo Document and test this! 
		*/
		/*oscelt: function(state,et,mu){
			var state_ptr = arrayToMemory(state,'double');
			var elts_ptr = this.Module._malloc(64);
			this.Module.ccall(
				'oscelt_c',
				null,
				["number","number","number","number",],
				[state_ptr,et,mu,elts_ptr,]
			);
			var elts = [];
			for(var i = 0; i < 8;i++){
				elts.push(this.Module.getValue(elts_ptr+(i*8),'double'));
			}
			this.Module._free(elts_ptr);
			this.Module._free(state_ptr);

			return elts;
		},*/

		/*prop2b:    Given a central mass and the state of massless body at time t_0,
		   this routine determines the state as predicted by a two-body
		   force model at time t_0 + dt.
		*/
		/** @memberof SPICE
		* @todo Document and test this! 
		*/
		/*prop2b: function(gm,pvinit,dt){
			var pvinit_ptr = arrayToMemory(pvinit,'double');
			var pvprop_ptr = this.Module._malloc(48);
			this.Module.ccall(
				'prop2b_c',
				null,
				["number","number","number","number",],
				[gm,pvinit_ptr,dt,pvprop_ptr,]
			);
			var pvprop = [];
			for(var i = 0; i < 6;i++){
				pvprop.push(this.Module.getValue(pvprop_ptr+(i*8),'double'));
			}
			this.Module._free(pvprop_ptr);
			this.Module._free(pvinit_ptr);

			return pvprop;
		},*/

		/*reset:    
		   Reset the CSPICE error status to a value of "no error."
		   As a result, the status routine, failed_c, will return a value
		   of SPICEFALSE
		*/
		/** @memberof SPICE
		* @todo Document and test this! 
		*/
		reset: function(){
			Module.ccall(
				'reset_c',
				null,
				[],
				[]
			);
		},

		/*scdecd:  
		   Convert double precision encoding of spacecraft clock time into 
		   a character representation. 
		 */
		/** @memberof SPICE
		* @func scdecd
		* @desc Spacecraft - decode: Convert double precision encoding of spacecraft clock time into a character representation. 
		* @param {number} sc - NAIF ID of the spacecraft.
		* @param {number} sclkdp - SCLK time to convert in ticks.
		* @returns {string} The character encoding of time sclkdp for spacecraft sc.
		*/
		scdecd: function(sc,sclkdp){
			var sclkch_ptr = this.Module._malloc(100);
			this.Module.ccall(
				'scdecd_c',
				null,
				["number","number","number","number",],
				[sc,sclkdp,100,sclkch_ptr,]
			);
			var ret = this.Module.Pointer_stringify(sclkch_ptr);
			this.Module._free(sclkch_ptr);
			return ret;
		},

		/*sce2c:  
		   Convert ephemeris seconds past J2000 (ET) to continuous encoded  
		   spacecraft clock (`ticks').  Non-integral tick values may be 
		   returned. 
		 */
		/** @memberof SPICE
		* @func sce2c
		* @desc Spacecraft - ephemeris to clock: Convert ephemeris seconds past J2000 (ET) to continuous encoded spacecraft clock (`ticks').  Non-integral tick values may be returned. 
		* @param {number} sc - NAIF ID of the spacecraft.
		* @param {number} et - Ephemeris seconds past J2000
		* @returns {number} The corresponding SCLK time for spacecraft sc in clock ticks.
		*/
		sce2c: function(sc,et){
			var sclkdp_ptr = this.Module._malloc(8);
			this.Module.ccall(
				'sce2c_c',
				null,
				["number","number","number",],
				[sc,et,sclkdp_ptr,]
			);
			var ret = this.Module.getValue(sclkdp_ptr,'double');
			this.Module._free(sclkdp_ptr);
			return ret;
		},

		/*sce2s:  
		   Convert an epoch specified as ephemeris seconds past J2000 (ET) to a
		   character string representation of a spacecraft clock value (SCLK).
		*/
		/** @memberof SPICE
		* @func sce2s
		* @desc Spacecraft - ephemeris to clock string: Convert an epoch specified as ephemeris seconds past J2000 (ET) to a character string representation of a spacecraft clock value (SCLK).
		* @param {number} sc - NAIF ID of the spacecraft.
		* @param {number} et - Ephemeris seconds past J2000
		* @returns {string} The corresponding SCLK time for spacecraft sc in SLCK string encoding.
		*/
		sce2s: function(sc,et){
			var sclkch_ptr = this.Module._malloc(100);
			this.Module.ccall(
				'sce2s_c',
				null,
				["number","number","number","number",],
				[sc,et,100,sclkch_ptr,]
			);
			var ret = this.Module.Pointer_stringify(sclkch_ptr); 
			this.Module._free(sclkch_ptr);
			return ret;
		},

		/*sce2t:    
		   Convert ephemeris seconds past J2000 (ET) to integral
		   encoded spacecraft clock (`ticks'). For conversion to
		   fractional ticks, (required for C-kernel production), see
		   the routine sce2c_c.
		  */
		/** @memberof SPICE
		* @func sce2t
		* @desc Spacecraft - ephemeris to ticks: Convert ephemeris seconds past J2000 (ET) to integral encoded spacecraft clock (`ticks'). For conversion to fractional ticks, (required for C-kernel production), see the routine sce2c.
		* @param {number} sc - NAIF ID of the spacecraft.
		* @param {number} et - Ephemeris seconds past J2000
		* @returns {number} The corresponding SCLK time for spacecraft sc in clock ticks to the closest integer.
		*/
		sce2t: function(sc,et){
			var sclkdp_ptr = this.Module._malloc(8);
			this.Module.ccall(
				'sce2t_c',
				null,
				["number","number","number",],
				[sc,et,sclkdp_ptr,]
			);
			var ret = this.Module.getValue(sclkdp_ptr,'double');
			this.Module._free(sclkdp_ptr);
			return ret;
		},

		/*scencd:  
		   Encode character representation of spacecraft clock time into a 
		   double precision number. 
		 */
		/** @memberof SPICE
		* @func scencd
		* @desc Spacecraft - encode: Encode character representation of spacecraft clock time into a double precision number. 
		* @param {number} sc - NAIF ID of the spacecraft.
		* @param {number} sclkch - SCLK time in character encoding.
		* @returns {number} Sclkch in spacecraft ticks.
		*/
		scencd: function(sc,sclkch){
			var sclkdp_ptr = this.Module._malloc(8);
			this.Module.ccall(
				'scencd_c',
				null,
				["number","string","number",],
				[sc,sclkch,sclkdp_ptr,]
			);
			var ret = this.Module.getValue(sclkdp_ptr,'double');
			this.Module._free(sclkdp_ptr);
			return ret;
		},

		/*scfmt:  
		   Convert encoded spacecraft clock ticks to character clock format. 
		 */
		/** @memberof SPICE
		* @func scfmt
		* @desc Spacecraft - format: Convert encoded spacecraft clock ticks to character clock format. 
		* @param {number} sc - NAIF ID of the spacecraft.
		* @param {number} ticks - SCLK time (in ticks) to convert.
		* @returns {string} A string encoding of time ticks for spacecraft sc. Note the important difference between scfmt and scdecd. scdecd converts some number of ticks since the spacecraft clock start 
		* time to a character string which includes a partition number. scfmt, which is called by scdecd, does not make use of partition information. 
		*/
		scfmt: function(sc,ticks){
			var clkstr_ptr = this.Module._malloc(100);
			this.Module.ccall(
				'scfmt_c',
				null,
				["number","number","number","number",],
				[sc,ticks,100,clkstr_ptr,]
			);
			var ret = this.Module.Pointer_stringify(clkstr_ptr);
			this.Module._free(clkstr_ptr);
			return ret;
		},

		/*scpart:  
		   Get spacecraft clock partition information from a spacecraft 
		   clock kernel file. 
		 */
		/** @memberof SPICE
		* @func scpart
		* @desc Get spacecraft clock partition information from a spacecraft clock kernel file. 
		* @param {number} sc - NAIF ID of the spacecraft.
		* @returns {object} An object containing two arrays: pstart and pstop. pstart contains the list of partition start times for spacecraft sc and pstop contains the partition stop times.
		*/
		scpart: function(sc){
			var nparts_ptr = this.Module._malloc(integer_size);
			var pstart_ptr = this.Module._malloc(9999*8);
			var pstop_ptr = this.Module._malloc(9999*8);
			this.Module.ccall(
				'scpart_c',
				null,
				["number","number","number","number",],
				[sc,nparts_ptr,pstart_ptr,pstop_ptr,]
			);
			var pstop = [];
			var pstart = [];
			for(var i = 0;i < this.Module.getValue(nparts_ptr,integer_type);i++){
				pstop.push(this.Module.getValue(pstop_ptr+i*8,'double'));
				pstart.push(this.Module.getValue(pstart_ptr+i*8,'double'));
			}
			this.Module._free(nparts_ptr);
			this.Module._free(pstart_ptr);
			this.Module._free(pstop_ptr);

			return {'pstart':pstart,'pstop':pstop,};
		},

		/*scs2e:  
		   Convert a spacecraft clock string to ephemeris seconds past 
		   J2000 (ET). 
		 */
		/** @memberof SPICE
		* @func scs2e
		* @desc Spacecraft - string to ephemeris. Convert a spacecraft clock string to ephemeris seconds past J2000 (ET). 
		* @param {number} sc - NAIF ID of the spacecraft.
		* @param {string} sclkch - String encoded SCLK time
		* @returns {number} The corresponding time in ET seconds past J2000
		*/
		scs2e: function(sc,sclkch){
			var et_ptr = this.Module._malloc(8);
			this.Module.ccall(
				'scs2e_c',
				null,
				["number","string","number",],
				[sc,sclkch,et_ptr,]
			);
			var ret = this.Module.getValue(et_ptr,'double');
			this.Module._free(et_ptr);
			return ret;
		},
		
		/*sct2e:  
		   Convert encoded spacecraft clock (`ticks') to ephemeris 
		   seconds past J2000 (ET). 
		 */
		/** @memberof SPICE
		* @func sct2e
		* @desc Spacecraft - ticks to ephemeris. Convert encoded spacecraft clock (`ticks') to ephemeris seconds past J2000 (ET). 
		* @param {number} sc - NAIF ID of the spacecraft.
		* @param {number} sclkdp - SCLK time in ticks
		* @returns {number} The corresponding time in ET seconds past J2000
		*/
		sct2e: function(sc,sclkdp){
			var et_ptr = this.Module._malloc(8);
			this.Module.ccall(
				'sct2e_c',
				null,
				["number","number","number",],
				[sc,sclkdp,et_ptr,]
			);
			var ret = this.Module.getValue(et_ptr,'double');
			this.Module._free(et_ptr);
			return ret;	
		},

		/*sctiks:  
		   Convert a spacecraft clock format string to number of "ticks". 
		 */
		/** @memberof SPICE
		* @func sctiks
		* @desc Spacecraft - ticks: Convert character representation of spacecraft clock time into a double precision number of ticks.
		* @param {number} sc - NAIF ID of the spacecraft.
		* @param {number} clkstr - SCLK time in character encoding.
		* @returns {number} Corresponding time in SCLK ticks. Note the important difference between scencd and sctiks. scencd converts a clock string to the number of ticks it represents 
		* since the beginning of the mission, and so uses partition information. sctiks_c just converts to absolute ticks. 
		*/
		sctiks: function(sc,clkstr){
			var ticks_ptr = this.Module._malloc(8);
			this.Module.ccall(
				'sctiks_c',
				null,
				["number","string","number",],
				[sc,clkstr,ticks_ptr,]
			);
			var ret = this.Module.getValue(ticks_ptr,'double');
			this.Module._free(ticks_ptr);
			return ret;
		},

		/*spd:    Return the number of seconds in a day.
		*/
		/** @memberof SPICE
	   	* @func spd
		* @desc Return the number of seconds in a day.
		* @returns {number} 86400
		*/
		spd: function(){
			return this.Module.ccall(
				'spd_c',
				'number',
				[],
				[]
			);
		},

		/*str2et:    Convert a string representing an epoch to a double precision
		   value representing the number of TDB seconds past the J2000
		   epoch corresponding to the input epoch.
		*/
		/** @memberof SPICE
		* @func str2et
		* @desc Convert a string representing an epoch in UTC to a double precision value representing the number of TDB seconds past the J2000 epoch corresponding to the input epoch.
		* @param {string} str - A UTC epoch in calendar format
		* @returns {number} The corresponding time in ET seconds past J2000.
		*/
		str2et: function(str){
			var et_ptr = this.Module._malloc(8);
			this.Module.ccall(
				'str2et_c',
				null,
				["string","number",],
				[str,et_ptr,]
			);
			var ret = this.Module.getValue(et_ptr,'double');
			this.Module._free(et_ptr);
			return ret;
		},

		/*timdef:
		   Set and retrieve the defaults associated with calendar
		   input strings.
		*/
		/** @memberof SPICE
		* @todo Document and test this! 
		*/
		timdef: function(action,item,value){
			var value_ptr = this.Module._malloc(100);
			this.Module.writeStringToMemory(value,value_ptr)
			this.Module.ccall(
				'timdef_c',
				null,
				["string","string","number","number",],
				[action,item,100,value_ptr]
			);

			var ret = this.Module.Pointer_stringify(value_ptr);
			this.Module._free(value_ptr);
			return ret;
		},

		/*timout:    
		   This routine converts an input epoch represented in TDB seconds
		   past the TDB epoch of J2000 to a character string formatted to
		   the specifications of a user's format picture.
		*/
		/** @memberof SPICE
		* @func timout
		* @desc This routine converts an input epoch represented in TDB seconds past the TDB epoch of J2000 to a character string formatted to the specifications of a user's format picture.
		* @param {number} et - Time in ET seconds past J2000.
		* @param {string} pictur - The format describing how the time should returned. For example, "Mon DD, YYYY AP:MN:SC AMPM" might result in "Nov 19, 2014 06:12:08 P.M.".
		* @returns {string} The time formatted to fit to pictur.
		*/
		timout: function(et,pictur){
			var output_ptr = this.Module._malloc(100);
			this.Module.ccall(
				'timout_c',
				null,
				["number","string","number","number",],
				[et,pictur,100,output_ptr,]
			);
			var ret = this.Module.Pointer_stringify(output_ptr);
			this.Module._free(output_ptr);
			return ret;
		},

		 /*tparse:  
		   Parse a time string and return seconds past the J2000 epoch 
		   on a formal calendar. 
		 */
		/** @memberof SPICE
		* @todo Document and test this! 
		*/
		tparse: function(string){
			var sp2000_ptr = this.Module._malloc(8);
			var errmsg_ptr = this.Module._malloc(2000);
			this.Module.ccall(
				'tparse_c',
				null,
				["string","number","number","number",],
				[string,2000,sp2000_ptr,errmsg_ptr,]
			);
			var errmsg = this.Module.Pointer_stringify(errmsg_ptr);
			var sp2000 = this.Module.getValue(sp2000_ptr,'double');
			this.Module._free(errmsg_ptr);
			this.Module._free(sp2000_ptr);

			if(errmsg == ""){
				return sp2000;      //If string correctly parses return the value, otherwise return undefined and output the error message
			} else {
				console.error(errmsg);
				return undefined;
			}
		},

		/*tpictr:    
		   Given a sample time string, create a time format picture
		   suitable for use by the routine timout_c.
		*/
		/** @memberof SPICE
		* @func tpictr 
		* @desc Given a sample time string, create a time format picture suitable for use by the routine timout.
		* @param {string} sample - A time string that conforms to the desired format. For example, "Oct 24, 1994 23:45:12 PM" becomes "Mon DD, YYYY AP:MN:SC AMPM".
		* @returns {string} A correctly formatted picture to be passed into timout for time conversion.
		*/
		tpictr: function(sample){
			var picture_ptr = this.Module._malloc(100);
			var ok_ptr = this.Module._malloc(integer_size);
			var errmsg_ptr = this.Module._malloc(2000);
			this.Module.ccall(
				'tpictr_c',
				null,
				["string","number","number","number","number","number",],
				[sample,100,2000,picture_ptr,ok_ptr,errmsg_ptr,]
			);
			var ret = this.Module.Pointer_stringify(picture_ptr); 
			var ok = this.Module.getValue(ok_ptr,integer_type);
			var errmsg = this.Module.Pointer_stringify(errmsg_ptr);
			this.Module._free(picture_ptr);
			this.Module._free(ok_ptr);
			this.Module._free(errmsg_ptr);

			if(ok){ //if correctly parsed		
				return ret; //return the picture
			} else {
				console.error(errmsg); //Error
				return undefined;
			}
		},

		/*tsetyr:   Set the lower bound on the 100 year range
		*/
		/** @memberof SPICE
		* @todo Document and test this! 
		*/
		tsetyr: function(year){
			this.Module.ccall(
				'tsetyr_c',
				null,
				["number",],
				[year,]
			);
		},

		/*tyear:  
		   Return the number of seconds in a tropical year. 
		 */
		/** @memberof SPICE
	   	* @func tyear
		* @desc Return the number of seconds in a tropical year. 
		* @returns {number} 31556925.9747
		*/
		tyear: function(){
			return this.Module.ccall(
				'tyear_c',
				'number',
				[],
				[]
			);
		},

		/*unitim:    Transform time from one uniform scale to another.  The uniform
		   time scales are TAI, TDT, TDB, ET, JED, JDTDB, JDTDT.
		*/
		/** @memberof SPICE
		* @fund unitim
		* @desc Transform time from one uniform scale to another. The uniform time scales are TAI, TDT, TDB, ET, JED, JDTDB, JDTDT.
		* @param {number} epoch - The epoch to convert from
		* @param {string} insys - The time system the input epoch is in ("TAI", "TDT", "TDB", "ET", "JED", "JDTDB", or "JDTDT").
		* @param {string} outsys - The time system the output should be in ("TAI", "TDT", "TDB", "ET", "JED", "JDTDB", or "JDTDT").
		* @returns {number} The corresponding time in the outsys scale.
		*/
		unitim: function(epoch,insys,outsys){
			return this.Module.ccall(
				'unitim_c',
				'number',
				['number','string','string',],
				[epoch,insys,outsys,]
			);
		},

		/*utc2et:    Convert an input time from Calendar or Julian Date format, UTC,
		   to ephemeris seconds past J2000.
		*/
		/** @memberof SPICE
		* @func utc2et
		* @desc Convert an input time from Calendar or Julian Date format, UTC, to ephemeris seconds past J2000.
		* @param {string} utcstr - A UTC time in calendar or Julian date format
		* @returns {number} The corresponding time in ET seconds past J2000.
		*/
		utc2et: function(utcstr){
			var et_ptr = this.Module._malloc(8);
			this.Module.ccall(
				'utc2et_c',
				null,
				["string","number",],
				[utcstr,et_ptr,]
			);
			var ret = this.Module.getValue(et_ptr,'double');
			this.Module._free(et_ptr);
			return ret;
		}

	};
	// Aliases
	s.furnish = s.furnsh;

	// Derived

	/** @memberof SPICE
	* @func et2str
	* @desc Convert an ET in seconds past J2000 into a calendar format.
	* @param {number} et - An ET time in seconds past J2000
	* @returns {string} The time in calendar format.
	*/
	s.et2str = function(et) {
		return s.et2utc(et,"ISOC",3) + "Z";
	};

	/** @memberof SPICE
	* @func date2et
	* @desc Convert a Javascript Date into ET time.
	* @param {Date} date - A Javascript Date object.
	* @returns {number} The corresponding time ET seconds past J2000.
	*/
	s.date2et = function(date) {

		var pad = function(nm){
			if(nm < 10) return ("0" + nm);
			return nm + "";
		}

		if (!date)
			date = new Date();
		var fyr = date.getUTCFullYear();
		var mth = (date.getUTCMonth()+1);
		var day = date.getUTCDate();
		var hrs = date.getUTCHours();
		var mns = date.getUTCMinutes();
		var sec = date.getUTCSeconds();
		var msc = (date.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 8);
		var str = fyr+"-"+pad(mth)+"-"+pad(day)+"T"+pad(hrs)+":"+pad(mns)+":"+pad(sec)+"."+msc;
		var out = s.str2et(str);
		return out;
	}

	/** @memberof SPICE
	* @func et2date
	* @desc Convert an ET time into a Javascript date.
	* @param {number} et - An ET time in seconds past J2000.
	* @returns {Date} A Javascript Date object.
	*/
	s.et2date = function(et) {
		var d = new Date(s.et2str(et));
		return d;
	};

	/*
		These functions are used to create SpiceCells, which are essentially resizable (up to a point) arrays with a bit of extra info.
		Initialization of SPiceCells was originally done the macros, but we do not have access to those
		Instead, these functions accomplish what the macros did
	*/
	s.new_cell = function(dtype,length,size,isSet){
		return new cell(dtype,length,size,isSet);
	}

	/** @memberof SPICE
	* @func new_char_cell
	* @desc Create and return a new character cell.
	* @param {number} length - Max length of the strings the cell can hold.
	* @param {number} size - Max number of elements the cell can hold.
	* @returns {object} A new character cell.
	*/
	s.new_char_cell = function(length,size){
		if(length < 6){
			//Due to the way SpiceCells work, the minimum allowable length of a char cell's strings is 5
			length = 6;
		}
		return s.new_cell(0,length,size,1);
	}

	/** @memberof SPICE
	* @func new_double_cell
	* @desc Create and return a new double cell.
	* @param {number} size - Max number of elements the cell can hold.
	* @returns {object} A new double cell.
	*/
	s.new_double_cell = function(size){
		return s.new_cell(1,0,size,1); 
	}

	/** @memberof SPICE
	* @func new_int_cell
	* @desc Create and return a new integer cell.
	* @param {number} size - Max number of elements the cell can hold.
	* @returns {object} A new integer cell.
	*/
	s.new_int_cell = function(size){
		return s.new_cell(2,0,size,1);
	}
	
	s.set_cell_element = function(index,val,cell){
		//Manually set the value of of a cell at an index
		if(cell.dtype == 0) {//char cell
			this.Module.writeStringToMemory(val.substring(0,cell.length-1),cell.data_ptr+index*cell.length);
		} else if (cell.dtype == 1) { //double cell
			this.Module.setValue(cell.data_ptr+8*index,val,'double')
		} else if (cell.dtype == 2) { //integer cell
			this.Module.setValue(cell.data_ptr+integer_size*index,val,integer_type);
		} else {
			console.error("Cell has an invalid datatype: " + cell.dtype + ". Must be 0 (char), 1 (double), or 2 (integer).");
		}

		//Can no longer guarantee that the cell has all unique elements in ascending order, to set isSet to 0
		this.Module.setValue(cell.pointer+4*integer_size,0,integer_type);

		cell.set_vals_from_my_pointer();
	}

	/* Since there is not enough memory to preload all files, this function is available to
		request the server for additional required files. An XMLHttpRequest is made to
		the server for the specified file path which is them downloaded, placed into
		the file system, and furnished. 
		Xhr_callback is called after each load and furnishing, passed the status and arguments
		callback is called after the final one loads after xhr_callback
	*/
	/** @memberof SPICE
	* @desc Send an XMLHttpRequest to the server for a kernel or list of kernels. The server must handle it and send the correct file to be loaded in to the file system. Only functions in a browser.
	* @func load_from_web
	* @param {string | array} kernelPaths - A string path or array of paths. An XMLHttpRequest for a binary file will be made for each path. When a response is received,
	* the file will be stored in the file system a the same path.
	* @param {function} callback - callback(status,error) is called after EACH XMLHttpRequest receives a response. It is passed the status and the error (if there is one).
	*/
	s.furnish_via_xhr_request = function(kernelPaths,xhr_callback,callback){
		if(typeof(kernelPaths) == "string"){
			kernelPaths = [kernelPaths];
		}
		var total_load_num = kernelPaths.length;
		var load_num = 0;
		for(var i = 0; i < kernelPaths.length;i++){
			(function (){
				//Create the necessary path in order to save the file
				var splitPath = kernelPaths[i].split("/");
				var pathStr = ""
				for(var ii = 0;ii < splitPath.length-1;ii++){
					pathStr += "/"+splitPath[ii];
					//There does not appear to be a simple way in this.FS to check if a directory exists or is duplicated, so just try and recover if an error occurs (the directory already exists)
					try{
						s.FS.mkdir(pathStr);
					} catch(e){
						//nope
					}
				}
				var fileStr = splitPath[splitPath.length-1];
				//Create a request to download the file. The server receives an XMLHttpRequest and must deal with it
				var xhr = new XMLHttpRequest();
				xhr.open('GET',kernelPaths[i], true);
				//Many kernel files are binary data, so much expect non-text data
				xhr.responseType = 'arraybuffer';

				xhr.onload = function(e) {
				  if (this.status == 200) {
				    // save the data as an array of unsigned integers
				    var data = new Uint8Array(this.response);
				    //Save the file
				    s.FS.createDataFile(pathStr,fileStr,data,true,true);
				    s.furnish(pathStr + "/" + fileStr);
				  }
				  load_num += 1;
				  xhr_callback(this.status,e);
				  if(load_num == total_load_num) callback();
				};

				xhr.send();
			})();
		}
	}

	s.furnish_via_preload_file_data = function(path,buffer){
		var splitPath = path.split("/");
		var pathStr = ""
		for(var ii = 0;ii < splitPath.length-1;ii++){
			if(ii != 0 )pathStr += "/";
			pathStr += splitPath[ii];
			//There does not appear to be a simple way in this. FS to check if a directory exists or is duplicated, so just try and recover if an error occurs (the directory already exists)
			try{
				s.FS.mkdir(pathStr);
			} catch(e){
				//nope
			}
		}
		var fileStr = splitPath[splitPath.length-1];
		s.FS.createDataFile(pathStr,fileStr,buffer,true,true);
		s.furnish(pathStr + "/" + fileStr);
	}

	s.Module = null;
	s.FS = null;

	/** @memberof SPICE
	* @desc Furnish a a kernel file save on the OS when running in node. To function, 'var foo = require("fs")' is required and SPICE.setup(bar,foo) must be called.
	* @func node_furnish
	* @param {string} path - The relative path to the kernel file.
	*/
	s.node_furnish = function(path){
		var buffer = new Uint8Array(this.FS.readFileSync(path));
		var save_path = path.split("/").slice(-1)[0];
		//console.log(save_path);
		this.Module.FS_createDataFile("/",save_path,buffer,true,true,true);
		this.furnsh(save_path);
	}

	s.is_ready = false;
	s.report_then_reset = false;


	/** @memberof SPICE
	* @desc Set the object that holds the c code. Required to be called before SPICE can be used. In browsers, use 'SPICE.setup(Module,FS)', in node use whatever your requires are saved to.
	* @func setup
	* @param {object} cspice - the object that is the cspice object, Module in browsers and whatever it was required as in nodejs
	* @param {bool} node - true if running in nodejs, false if a browser
	*/
	s.setup = function(cspice,filesystem){//,node){
		// this.Module = cspice;
		// this.FS = filesystem;
	}		
	
	/** @memberof SPICE
	* @desc A wrapper functions around convrt that's spelled correctly
	*/
	s.convert = function(x,in_var,out){
		return s.convrt(x,in_var,out);
	}

	s.set_error_report_then_reset = function(){
		s.report_then_reset = true;
		s.erract('SET','REPORT');
	}

	s.unset_error_report_then_reset = function(action){
		s.report_then_reset = false;
		s.erract('SET',action);
	}

	s.chronos_call = function(cmdlin,inptim){
		var outtim_ptr = Module._malloc(100);
		var intptr = Module._malloc(8);

		Module.setValue(intptr,1,"i32");
		Module.ccall(
			'cronos_',
			"number",
			["string","number","string","number","number","number","number"],
			[cmdlin,intptr,inptim,outtim_ptr,cmdlin.length,inptim.length,100]
		);
		var ret = Module.Pointer_stringify(outtim_ptr);
		Module._free(outtim_ptr);
		return ret;
	}

	s.ltst2et = function(ltst,landingtime,body,scid,sol1index){
		return parseFloat(s.chronos_call("-from lst -to et -totype SECONDS -CENTER " + body + " -landingtime " + landingtime + "  -sc " + scid + " -sol1index " + sol1index + "",ltst));
	}

	s.et2ltst = function(et,landingtime,body,scid,sol1index){
		var str = s.chronos_call("-from et -fromtype SECONDS -to lst -CENTER " + body + " -landingtime " + landingtime + "  -sc " + scid + " -sol1index " + sol1index + "","" + et);
		return str.slice(0, -1).trim(); //Take off the ~100 trailing whitespace chars
	}

	s.et2lsun = function(et,landingtime,body,scid,sol1index){
		var str = s.chronos_call("-from et -fromtype SECONDS -to lst -totype LSUN -CENTER " + body + " -landingtime " + landingtime + "  -sc " + scid + " -sol1index " + sol1index + "","" + et);
		return str.slice(0, -1).trim(); //Take off the ~100 trailing whitespace chars
	}
	
	s.Module = require('./cspice.js');
	s.FS = s.Module.get_fs(); //require('fs');

	return s;
})();

module.exports = SPICE;