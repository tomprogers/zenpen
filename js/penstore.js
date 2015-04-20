// data persistence
ZenPen = window.ZenPen || {};
ZenPen.penStore = (function() {

	// persistence data
	var pensDB, activePen;
	
	return {
		init: init,
		getPenList: getPenList,
		setActivePen: setActivePen,
		loadProp: loadPropertyOfActivePen,
		saveProp: savePropertyToActivePen,
		createNewPen: createNewPen
	};
	
	
	/**
	 * initializes the pen store
	 */
	function init() {
		loadState();
	}
	
	
	/**
	 * returns the list of stored pens
	 * @return {array} of { title, index }
	 */
	function getPenList() {
		var penList = [];
		for(var i = 0, iMax = pensDB.pens.length; i < iMax; i++) {
			penList.push({
				index: i,
				title: pensDB.pens[i].header.replace(/^\s+|\s+$/g, '')
			});
		}
		
		return penList;
	}
	
	
	/**
	 * changes which save slot is being manipulated
	 * @param {integer} penIndex - 0-based index at which to save the pen
	 */
	function setActivePen( penIndex ) {
		activePen = penIndex;
		pensDB.activePen = activePen;
		saveState();
		
		ZenPen.editor.loadState();
		ZenPen.ui.loadState();
	}
	
	
	/**
	 * retrieves a named property specific to the current pen
	 * @param  {string} propName - the name of the property whose value is desired
	 * @return {string} the value, if any, associated with the current pen
	 */
	function loadPropertyOfActivePen( propName ) {
		var pen = pensDB.pens[activePen];
		return ( pen && pen.hasOwnProperty(propName) ) ? pen[propName] : undefined;
	}
	
	
	/**
	 * saves a key-value pair such that it is associated with the current pen
	 * @param  {string} propName - the name under which to store the value
	 * @param     {any} propValue - the value to be stored
	 */
	function savePropertyToActivePen( propName, propValue ) {
		pensDB.pens[activePen][propName] = propValue;
		pensDB.pens[activePen].date_modified = new Date().getTime();
		saveState();
	}
	
	
	/**
	 * creates a new save slot, and makes it the active pen
	 */
	function createNewPen() {
		pensDB.pens.push({
			'header': 'New Pen',
			'content': '',
			'targetWordCount': 0,
			'date_created': new Date().getTime()
		});
		
		var newPenIndex = pensDB.pens.length - 1;
		setActivePen(newPenIndex);
	}
	
	
	/**
	 * writes the pensDB to localStorage
	 */
	function saveState() {
		localStorage[ 'persistenceVersion' ] = 'v2:pv+pens';
		localStorage[ 'pensDB' ] = JSON.stringify( pensDB );
	}
	
	
	/**
	 * loads the pensDB from localStorage
	 */
	function loadState() {
		
		if( localStorage[ 'persistenceVersion' ] == 'v2:pv+pens' ) {
			// v2 path, for returning v2 clients
			pensDB = JSON.parse(localStorage[ 'pensDB' ]);
			activePen = parseInt( pensDB.activePen );
			
		} else if(localStorage[ 'header' ]) {
			// v1 path for returning pre-v2 clients, includes migration to v2
			
			activePen = 0;
			pensDB = {
				activePen: activePen,
				pens: [
					{ 'header': localStorage[ 'header' ], 'content': localStorage[ 'content' ] }
				]
			};
			
		} else {
			// path for new clients
			activePen = 0;
			pensDB = {
				activePen: activePen,
				pens: [
					{}
				]
			};
		}
		saveState();
	}


})();
