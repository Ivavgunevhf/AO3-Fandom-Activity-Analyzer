// Fandom Activity Analyzer
// REQUIRES: jQuery

// Date: 01/04/2021

// Runs of works pages and logs when the work was updated.
// Data is downloaded to user as a text file for them to 
// use for to analyze fandom activity during a time period.

// ***Note:*** Change seperator variable to whatever you need before running 
// the code default setting is % because AO3 uses , to seperate multiple authors.
// Find: CONFIG_SETTING to change variable values

if(jQuery('#data_download').length<=0){
	jQuery('#main').prepend('<textarea style="display:none" id="data_download"></textarea><h3>Stories to check</h3><textarea id="check_links"></textarea>');
	jQuery('#main ul.user').prepend('<button id="run_code">Run</button><button id="download_the_data">Download</button> <button id="show_textarea">Show Textarea</button>');
}

jQuery(document).on("click", "#download_the_data", function() {
	download(jQuery('#data_download').val(),new Date().toLocaleDateString()+'_'+'Story_Stats','text/plain');
});

jQuery(document).on("click", "#show_textarea", function() {
	jQuery('#data_download').toggle();
});

jQuery(document).on("click", "#run_code", function() {
	var array_of_links = $('#check_links').val().split('\n');
	var uniqueIDs = [];
	$.each(array_of_links, function(i, el){
		if($.inArray(el, uniqueIDs) === -1) uniqueIDs.push(el);
	});

	for (var x in uniqueIDs) {
		var story_ID = getStoryId(uniqueIDs[x]);
		//console.log(uniqueIDs[x], story_ID);

		if (story_ID!=undefined) {
			getStats(story_ID);
		}
	}
});

function getStoryId(url) {
	if (url!=''&&url.indexOf('/works/')>=0&&url.indexOf('archiveofourown.org')>=0) {
		return url.split('/works/')[1].split('/')[0];
	}
}

function getStats(work_id) {
	// CONFIG_SETTING
	var seperator='%';
	//var no_dates_before = new Date('2021-01-03'); // Disabled by default
	// END CONFIG_SETTING
	var today_date=new Date().toLocaleDateString();
	jQuery.get('https://archiveofourown.org/works/'+work_id+'/navigate', function(data){
		var heading = jQuery(data).find('#main h2').text().split('Chapter Index for ')[1].split(' by ');
		var title = heading[0];
		var author = heading[1];
		var chapter_counter=1;
		jQuery(data).find('#main ol.chapter li').each(function(){
			var line_date = new Date(jQuery(this).find('span').text().replace(/[\(\)]/g,''));
			var stuff = work_id+seperator+title+seperator+author+seperator+chapter_counter+seperator+jQuery(this).find('span').text().replace(/[\(\)]/g,'')+seperator+today_date+'\n';
			
			if (typeof no_dates_before !== 'undefined') {
				// Add only if occurs after no_dates_before
				if (dates.compare(line_date,no_dates_before)>=0) {
					//console.log(stuff);
					jQuery('#data_download').val(jQuery('#data_download').val()+stuff);
				}
			} else {
				jQuery('#data_download').val(jQuery('#data_download').val()+stuff);
			}

			// Keep the counter here.
			chapter_counter++;
		});
	});
}

// Function to download data to a file
// Code from Kanchu (https://stackoverflow.com/a/30832210)
function download(data, filename, type) {
	var file = new Blob([data], {type: type});
	if (window.navigator.msSaveOrOpenBlob) // IE10+
		window.navigator.msSaveOrOpenBlob(file, filename);
	else { // Others
		var a = document.createElement("a"),
		url = URL.createObjectURL(file);
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		setTimeout(function() {
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);
		}, 0); 
	}
}

// Source: http://stackoverflow.com/questions/497790
var dates = {
	convert:function(d) {
		// Converts the date in d to a date-object. The input can be:
		//   a date object: returned without modification
		//  an array      : Interpreted as [year,month,day]. NOTE: month is 0-11.
		//   a number     : Interpreted as number of milliseconds
		//                  since 1 Jan 1970 (a timestamp) 
		//   a string     : Any format supported by the javascript engine, like
		//                  "YYYY/MM/DD", "MM/DD/YYYY", "Jan 31 2009" etc.
		//  an object     : Interpreted as an object with year, month and date
		//                  attributes.  **NOTE** month is 0-11.
		return (
			d.constructor === Date ? d :
			d.constructor === Array ? new Date(d[0],d[1],d[2]) :
			d.constructor === Number ? new Date(d) :
			d.constructor === String ? new Date(d) :
			typeof d === "object" ? new Date(d.year,d.month,d.date) :
			NaN
		);
	},
	compare:function(a,b) {
		// Compare two dates (could be of any type supported by the convert
		// function above) and returns:
		//  -1 : if a < b
		//   0 : if a = b
		//   1 : if a > b
		// NaN : if a or b is an illegal date
		// NOTE: The code inside isFinite does an assignment (=).
		return (
			isFinite(a=this.convert(a).valueOf()) &&
			isFinite(b=this.convert(b).valueOf()) ?
			(a>b)-(a<b) :
			NaN
		);
	},
	inRange:function(d,start,end) {
		// Checks if date in d is between dates in start and end.
		// Returns a boolean or NaN:
		//    true  : if d is between start and end (inclusive)
		//    false : if d is before start or after end
		//    NaN   : if one or more of the dates is illegal.
		// NOTE: The code inside isFinite does an assignment (=).
		return (
			isFinite(d=this.convert(d).valueOf()) &&
			isFinite(start=this.convert(start).valueOf()) &&
			isFinite(end=this.convert(end).valueOf()) ?
			start <= d && d <= end :
			NaN
		);
	}
}
