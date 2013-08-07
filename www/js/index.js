/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var db = {};
var dataversion = '1';
var lat = 50.71860920392487;
var lon = 10.88554345;
var monat = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
var wochentag = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
var weekday = ['SU','MO','TU','WE','TH','FR','SA','SU'];

		

function testJson(json) {
	try {
		JSON.stringify(json);
	} catch (e) {
//		console.log(json);
		return false;
	}
	return true;
}

function sortEvents(a,b) {
	if(a.data('dtstart') < b.data('dtstart')) { return -1; }
	if(a.data('dtstart') > b.data('dtstart')) { return 1; }
	return 0;
}

function isset(object) {
	if(typeof object === 'undefined') {
		return false;
	}
	if(typeof object === null) {
		return false;
	}
	return true;
}

function htmlentities(value){
	if (value) {
		return $('<div />').text(value).html();
	} else {
		return '';
	}
}
		
function getWeekdayNo(wd) {
	if( wd == 'SU'){ return 0;}
	if( wd == 'MO'){ return 1;}
	if( wd == 'TU'){ return 2;}
	if( wd == 'WE'){ return 3;}
	if( wd == 'TH'){ return 4;}
	if( wd == 'FR'){ return 5;}
	if( wd == 'SA'){ return 6;}
	return 7;
}

function rString(r) {
	if(!isset(r.freq)) { return 'keine'; }
	if(r.freq == 'd') {
		if(isset(r.interval) && Math.floor(r.interval) > 1) {
			return "alle "+Math.floor(r.interval)+" Tage";
		}
		else {
			return "t&auml;glich";
		}
	}
	if(r.freq == 'w') {
		var string = [];
		var day = [];
		if(isset(r.byday)) { day = r.byday.toString().split(','); }
		for(var i = 0; i < day.length; i++) {
			if( day[i] == 'MO'){string.push('montags');}
			if( day[i] == 'TU'){string.push('dienstags');}
			if( day[i] == 'WE'){string.push('mittwochs');}
			if( day[i] == 'TH'){string.push('donnerstags');}
			if( day[i] == 'FR'){string.push('freitags');}
			if( day[i] == 'SA'){string.push('samstags');}
			if( day[i] == 'SU'){string.push('sonntags');}
		}
		if(string.length > 0) {
			if(isset(r.interval) && Math.floor(r.interval) > 1) {
				return string.join(', ')+' jede '+Math.floor(r.interval)+'. Woche';
			}
			else {
				return string.join(', ')+' jede Woche';
			}
		}
		if(isset(r.interval) && Math.floor(r.interval) > 1) {
			return 'jede '+Math.floor(r.interval)+'. Woche';
		}
		else {
			return 'w&ouml;chentlich';
		}
	}
	if(r.freq == 'm') {
		var string = [];
		var day = [];
		if(isset(r.byday)) { 
			day = r.byday.toString().split(',');
			var pattr = /^([+-]?\d+)([A-Z]{2})$/;
			for(var i = 0; i < day.length; i++) {
				var d = pattr.exec(day[i]);
				if(d.length == 3) {
					if( d[2] == 'MO'){string.push(Math.ceil(d[1])+'. Montag');}
					if( d[2] == 'TU'){string.push(Math.ceil(d[1])+'. Dienstag');}
					if( d[2] == 'WE'){string.push(Math.ceil(d[1])+'. Mittwoch');}
					if( d[2] == 'TH'){string.push(Math.ceil(d[1])+'. Donnerstag');}
					if( d[2] == 'FR'){string.push(Math.ceil(d[1])+'. Freitag');}
					if( d[2] == 'SA'){string.push(Math.ceil(d[1])+'. Samstag');}
					if( d[2] == 'SU'){string.push(Math.ceil(d[1])+'. Sonntag');}
				}
			}
			if(string.length > 0) {
				if(isset(r.interval) && Math.floor(r.interval) > 1) {
					return "am "+string.join('., ')+' jeden '+Math.floor(r.interval)+'. Monat';
				}
				else {
					return "am "+string.join('., ')+' jeden Monat';
				}
			}
		}
		if(isset(r.bymonthday)) {
			day = r.bymonthday.toString().split(',');
			for(var i = 0; i < day.length; i++) {
				if(Math.ceil(day[i]) > -32 && Math.ceil(day[i]) < 32) { string.push(Math.ceil(day[i])+"."); }
			}
			if(string.length > 0) {
				if(isset(r.interval) && Math.floor(r.interval) > 1) {
					return "am "+string.join(', ')+' jeden '+Math.floor(r.interval)+'. Monat';
				}
				else {
					return "am "+string.join(', ')+' jeden Monat';
				}
			}
		}
		if(isset(r.interval) && Math.floor(r.interval) > 1) {
			return 'jeden '+Math.floor(r.interval)+'. Monat';
		}
		else {
			return 'monatlich';
		}
	}
	if(r.freq == 'y') {
		// Jahrestag
		if(isset(r.bymonth) && Math.ceil(r.bymonth) > 0 && Math.ceil(r.bymonth) < 13 && isset(r.bymonthday) && Math.ceil(r.bymonthday) > -32 && Math.ceil(r.bymonthday) < 32) {
			var day = r.bymonthday.toString().split(',');
			var month = r.bymonth.toString().split(',');
			var monthstring = [];
			var daystring = [];
			for(var i = 0; i < day.length; i++) {
				if(Math.ceil(day[i])>-32 && Math.ceil(day[i])<32) {daystring.push(day[i]+'.');}
			}
			for(var i = 0; i < month.length; i++) {
				if(Math.ceil(month[i])>0 && Math.ceil(month[i])<13) {monthstring.push(monat[month[i]-1]);}
			}
			if(monthstring.length > 0 && daystring > 0) {
				if(isset(r.interval) && Math.floor(r.interval) > 1) {
					return daystring.join(', ')+' im '+monthstring.join(', ')+' alle '+Math.floor(r.interval)+' Jahre';
				}
				else {
					return daystring.join(', ')+' im '+monthstring.join(', ')+' jedes Jahr';
				}
			}
		}
		// Tag in der x. Woche
		if(isset(r.byweekno) && isset(r.byday)) {
			var week = r.byweekno.toString().split(',');
			var day = r.byday.toString().split(',');
			var string = [];
			var daystring = [];
			for(var i = 0; i < day.length; i++) {
				if( day[i] == 'MO'){daystring.push('montags');}
				if( day[i] == 'TU'){daystring.push('dienstags');}
				if( day[i] == 'WE'){daystring.push('mittwochs');}
				if( day[i] == 'TH'){daystring.push('donnerstags');}
				if( day[i] == 'FR'){daystring.push('freitags');}
				if( day[i] == 'SA'){daystring.push('samstags');}
				if( day[i] == 'SU'){daystring.push('sonntags');}
			}
			for(var i = 0; i < week.length; i++) {
				var w = Math.ceil(week[i]);
				if(w > -54 && w < 54) {
					if(daystring.length > 0) {
						string.push(daystring.join(', ')+' jede '+w+'. Woche');
					} else {
						string.push('jede '+w+'. Woche');
					}
				}
			}
			if(string.length > 0) {
				if(isset(r.interval) && Math.floor(r.interval) > 1) {
					return string.join(', ')+' alle '+Math.floor(r.interval)+' Jahre';
				}
				else {
					return string.join('., ')+' jedes Jahr';
				}
			}
		}
		// x. Wochentag (kann unterschiedlich sein, muss aber nicht)
		if(isset(r.byday)) {
			var dstring = [];
			var day = r.byday.toString().split(',');
			var pattr = /^([+-]?\d+)([A-Z]{2})$/;
			for(var i = 0; i < day.length; i++) {
				var d = pattr.exec(day[i]);
				if(d.length == 3 && Math.ceil(d[1]) > -54 && Math.ceil(d[1]) < 54) {
					if( d[2] == 'MO'){dstring.push(Math.ceil(d[1])+'. Montag');}
					if( d[2] == 'TU'){dstring.push(Math.ceil(d[1])+'. Dienstag');}
					if( d[2] == 'WE'){dstring.push(Math.ceil(d[1])+'. Mittwoch');}
					if( d[2] == 'TH'){dstring.push(Math.ceil(d[1])+'. Donnerstag');}
					if( d[2] == 'FR'){dstring.push(Math.ceil(d[1])+'. Freitag');}
					if( d[2] == 'SA'){dstring.push(Math.ceil(d[1])+'. Samstag');}
					if( d[2] == 'SU'){dstring.push(Math.ceil(d[1])+'. Sonntag');}
				}
			}
			if(dstring.length > 0) {
				if(isset(r.interval) && Math.floor(r.interval) > 1) {
					return "am "+dstring.join('., ')+' jedes '+Math.floor(r.interval)+'. Jahr';
				}
				else {
					return "am "+dstring.join('., ')+' jedes Jahr';
				}
			}
		}
		if(isset(r.interval) && Math.floor(r.interval) > 1) {
			return "alle "+Math.floor(r.interval)+" Jahre";
		}
		else {
			return "j&auml;hrlich";
		}
	}
	return 'keine';
}

function rNewStart(start,r,rend) {
	start = new Date(start);
	if(!isset(r.freq) || ( start > rend && rend > 0)) { return 0; }
	start = new Date(start);
	var now = new Date();
	if(start > now) { 
		return start; 
	}
	if(r.freq == 'd') {
		var i = 1;
		if(isset(r.interval) && Math.floor(r.interval) > 1) {
			i = Math.floor(r.interval);
		}
		start = start.setDate(start.getDate()+i);
		return rNewStart(start,r,rend);
	}
	if(r.freq == 'w') {
		var day = [];
		if(isset(r.byday)) { day = r.byday.toString().split(','); }
		var weekday = 7;
		var lWeekday = 7;
		for(var i = 0; i < day.length; i++) {
			if( day[i] == 'MO' && start.getDay() < 1 && weekday > 1){weekday = 1;}
			if( day[i] == 'TU' && start.getDay() < 2 && weekday > 2){weekday = 2;}
			if( day[i] == 'WE' && start.getDay() < 3 && weekday > 3){weekday = 3;}
			if( day[i] == 'TH' && start.getDay() < 4 && weekday > 4){weekday = 4;}
			if( day[i] == 'FR' && start.getDay() < 5 && weekday > 5){weekday = 5;}
			if( day[i] == 'SA' && start.getDay() < 6 && weekday > 6){weekday = 6;}
			if( day[i] == 'SU' && start.getDay() < 0 && weekday > 0){weekday = 0;}
			
			if( day[i] == 'MO' && lWeekday > 1){lWeekday = 1;}
			if( day[i] == 'TU' && lWeekday > 2){lWeekday = 2;}
			if( day[i] == 'WE' && lWeekday > 3){lWeekday = 3;}
			if( day[i] == 'TH' && lWeekday > 4){lWeekday = 4;}
			if( day[i] == 'FR' && lWeekday > 5){lWeekday = 5;}
			if( day[i] == 'SA' && lWeekday > 6){lWeekday = 6;}
			if( day[i] == 'SU' && lWeekday > 0){lWeekday = 0;}
			
		}
		var i = 1;
		if(isset(r.interval) && Math.floor(r.interval) > 1) {
			i = Math.floor(r.interval);
		}
		if(lWeekday == 7) {
			return rNewStart(start.setDate(start.getDate() + i*7),r,rend);
		}
		if(weekday == 7) {
			return rNewStart(start.setDate(start.getDate()-start.getDay()+lWeekday+i*7),r,rend);
		}
		return rNewStart(start.setDate(start.getDate() + ((weekday-start.getDay()))),r,rend);
	}
	if(r.freq == 'm') {
		var day = [];
		if(isset(r.byday)) {
			var f = new Date(start.getFullYear(),start.getMonth(),1,start.getHours(),start.getMinutes());
			var l = new Date(start.getFullYear(),start.getMonth()+1,0,start.getHours(),start.getMinutes());
			var monthday = 32;
			day = r.byday.toString().split(',');
			var pattr = /^([+-]?\d+)([A-Z]{2})$/;
			for(var i = 0; i < day.length; i++) {
				var d = pattr.exec(day[i]);
				if(d.length == 3 && Math.ceil(d[1])<6 && Math.ceil(d[1])>-6) {
					var wd = getWeekdayNo(d[2]);
					if ( wd == 7 ) {continue;}
					var newDay = new Date(start.getFullYear(),start.getMonth(),1,start.getHours(),start.getMinutes());
					if(Math.ceil(d[1])<0) {
						if(wd > l.getDay()) {
							newDay.setDate(l.getDate()-(7-wd+l.getDay())+7*(Math.ceil(d[1])+1));
						}
						else{
							newDay.setDate(l.getDate()+wd-l.getDay()+7*(Math.ceil(d[1])+1));
						}
						if(newDay.getDate() < monthday && newDay > start) {monthday = newDay.getDate();}
					}
					if(Math.ceil(d[1])>0) {
						if(wd < f.getDay()) {
							newDay.setDate(8+wd-f.getDay()+7*(Math.ceil(d[1])-1));
						}
						else{
							newDay.setDate(1+wd-f.getDay()+7*(Math.ceil(d[1])-1));
						}
						if(newDay.getDate() < monthday && newDay > start) {monthday = newDay.getDate();}
					}
				}
			}
			if(start.getDate() < monthday && monthday < 32) {
				var next = new Date(start.getFullYear(),start.getMonth(),monthday,start.getHours(),start.getMinutes());
				return rNewStart(next,r,rend);
			}
			// vom nächsten Montag den Tag rausbekommen
			var m = start.getMonth()+1;
			if(Math.ceil(r.interval)>1) { m = start.getMonth()+Math.ceil(r.interval); }
			f = new Date(start.getFullYear(),m,1,start.getHours(),start.getMinutes());
			l = new Date(start.getFullYear(),m+1,0,start.getHours(),start.getMinutes());
			for(var i = 0; i < day.length; i++) {
				var d = pattr.exec(day[i]);
				if(d.length == 3 && Math.ceil(d[1])<6 && Math.ceil(d[1])>-6) {
					var wd = getWeekdayNo(d[2]);
					if ( wd == 7 ) {continue;}
					var newDay = new Date(start.getFullYear(),m,1,start.getHours(),start.getMinutes());
					var hm = newDay.getMonth();
					if(Math.ceil(d[1])<0) {
						if(wd > l.getDay()) {
							newDay.setDate(l.getDate()-((7+l.getDay()-wd)-7*(Math.ceil(d[1])+1)));
						}
						else{
							newDay.setDate(l.getDate()-((l.getDay()-wd)-7*(Math.ceil(d[1])+1)));
						}
						if(newDay.getDate() < monthday && newDay.getMonth() == hm) {monthday = newDay.getDate();}
					}
					if(Math.ceil(d[1])>0) {
						if(wd < f.getDay()) {
							newDay.setDate(8-(f.getDay()-wd)+7*(Math.ceil(d[1])-1));
						}
						else{
							newDay.setDate(1+(wd-f.getDay())+7*(Math.ceil(d[1])-1));
						}
						if(newDay.getDate() < monthday && newDay.getMonth() == hm) {monthday = newDay.getDate();}
					}
				}
			}
			if(monthday < 32) {
				var next = new Date(start.getFullYear(),m,monthday,start.getHours(),start.getMinutes());
				return rNewStart(next,r,rend);
			}
		}
		if(isset(r.bymonthday)) {
			var l = new Date(start.getFullYear(),start.getMonth()+1,0,start.getHours(),start.getMinutes());
			var lastOfMonth = l.getDate();
			day = r.bymonthday.toString().split(',');
			var monthday = 32;
			var lmonthday = 32;
			var lmmonthday = 0;
			for(var i = 0; i < day.length; i++) {
				if(Math.ceil(day[i]) > -32 && Math.ceil(day[i]) < 32 && Math.ceil(day[i]) != 0) { 
					if(Math.ceil(day[i])>start.getDate() || (Math.ceil(day[i])<0 && Math.ceil(day[i])+lastOfMonth>start.getDate())) {
						if(Math.ceil(day[i]) > 0 && monthday > Math.ceil(day[i])) {monthday = Math.ceil(day[i]);}
						if(Math.ceil(day[i]) < 0 && monthday > Math.ceil(day[i])+lastOfMonth+1) {monthday = Math.ceil(day[i])+lastOfMonth+1;}
					}
					if(Math.ceil(day[i]) > 0 && lmonthday > Math.ceil(day[i])) {lmonthday = Math.ceil(day[i]);}
					if(Math.ceil(day[i]) < 0 && lmmonthday > Math.ceil(day[i])) {lmmonthday = Math.ceil(day[i]);}
				}
			}
			if(monthday < 32) {
				start.setDate(monthday);
				return rNewStart(start,r,rend);
			}
			if(lmonthday < 32 || lmmonthday < 0) {
				var i = 1;
				if(isset(r.interval) && Math.floor(r.interval) > 1) { i = Math.floor(r.interval); }
				var n1 = new Date(start.getFullYear(),start.getMonth()+i,lmonthday,start.getHours(),start.getMinutes());
				var n2 = new Date(start.getFullYear(),start.getMonth()+i+1,lmmonthday+1,start.getHours(),start.getMinutes());
				if(n1<n2) {
					return rNewStart(n1,r,rend);
				}
				else {
					return rNewStart(n2,r,rend);
				}
			}
		}
		var i = 1;
		if(isset(r.interval) && Math.floor(r.interval) > 1) {
			i = Math.floor(r.interval);
		}
		var next = new Date(start.getFullYear(),start.getMonth()+i,start.getDate(),start.getHours(),start.getMinutes());
		return rNewStart(next,r,rend);
	}
	if(r.freq == 'y') {
		// Jahrestag
		if(isset(r.bymonth) && Math.ceil(r.bymonth) > 0 && Math.ceil(r.bymonth) < 13 && isset(r.bymonthday) && Math.ceil(r.bymonthday) > -32 && Math.ceil(r.bymonthday) < 32) {
			var day = r.bymonthday.toString().split(',');
			var month = r.bymonth.toString().split(',');
			var interval = 1;
			if(isset(r.interval) && Math.floor(r.interval) > 1) {
				interval = Math.floor(r.interval);
			}
			var lastOfMonth = new Date(start.getFullYear(), start.getMonth()+1,0,start.getHours(),start.getMinutes());
			var monthday = 32;
			var monthstring = [];
			var daystring = [];
			for(var i = 0; i < day.length; i++) {
				if(Math.ceil(day[i])>-32 && Math.ceil(day[i])<0 && Math.ceil(day[i])<(start.getDate()-lastOfMonth.getDate()) && monthday > lastOfMonth.getDate()+Math.ceil(day[i])) {
					monthday = lastOfMonth.getDate()+Math.ceil(day[i]);
				}
				if(Math.ceil(day[i])>0 && Math.ceil(day[i])<32 && Math.ceil(day[i])>start.getDate() && monthday > Math.ceil(day[i])) {
					monthday = Math.ceil(day[i]);
				}
			}
			if(monthday < 32) {
				var next = new Date(start.getFullYear(),start.getMonth(),monthday,start.getHours(),start.getMinutes());
				return rNewStart(next,r,rend);
			}
			var lowestMonth = 13;
			var nextMonth = 13;					
			for(var i = 0; i < month.length; i++) {
				if(Math.ceil(month[i])>0 && Math.ceil(month[i])<13) {
					lowestMonth = lowestMonth > Math.ceil(month[i]) ? Math.ceil(month[i]) : lowestMonth;
					nextMonth = (nextMonth > Math.ceil(month[i]) && Math.ceil(month[i]) > (start.getMonth()+1) ) ? Math.ceil(month[i]) : nextMonth;
				}
			}
			//Abbruch falls Regeln falsch
			if(lowestMonth == 13 && nextMonth == 13) { return 0; }
			var firstOfNextMonth = {};
			var lastOfNextMonth = {};
			if(nextMonth < 13) {
				firstOfNextMonth = new Date(start.getFullYear(), nextMonth-1,1,start.getHours(),start.getMinutes());
				lastOfNextMonth = new Date(start.getFullYear(), nextMonth,0,start.getHours(),start.getMinutes());
			}
			else {
				firstOfNextMonth = new Date(start.getFullYear()+interval, lowestMonth-1,1,start.getHours(),start.getMinutes());
				lastOfNextMonth = new Date(start.getFullYear()+interval, lowestMonth,0,start.getHours(),start.getMinutes());
			}
			for(var i = 0; i < day.length; i++) {
				if(Math.ceil(day[i])>-32 && Math.ceil(day[i])<0 && Math.ceil(day[i])<(start.getDate()-lastOfNextMonth.getDate()) && monthday > lastOfNextMonth.getDate()+Math.ceil(day[i])) {
					monthday = lastOfNextMonth.getDate()+Math.ceil(day[i]);
				}
				if(Math.ceil(day[i])>0 && Math.ceil(day[i])<32 && monthday > Math.ceil(day[i])) {
					monthday = Math.ceil(day[i]);
				}
			}
			if(monthday < 32) {
				var next = new Date(firstOfNextMonth.getFullYear(),firstOfNextMonth.getMonth(),monthday,firstOfNextMonth.getHours(),firstOfNextMonth.getMinutes());
				return rNewStart(next,r,rend);
			}
			else { return 0; }
		}
		// Tag in der x. Woche
		if(isset(r.byweekno) && isset(r.byday)) {
			var week = r.byweekno.toString().split(',');
			var day = r.byday.toString().split(',');
			var nextWeekday = 8;
			var firstWeekday = 8;
			for(var i = 0; i < day.length; i++) {
				var wd = getWeekdayNo(day[i]);
				var h1 = start.getDay() == 0 ? 7 : start.getDay();
				if(wd == 7) {continue;}
				if(wd == 0) {wd=7;}
				if(wd > h1 && wd < nextWeekday) { nextWeekday = wd; }
				if(wd < firstWeekday) { firstWeekday = wd; }
			}
			if( nextWeekday < 8 ) {
				var h1 = start.getDay() == 0 ? 7 : start.getDay();
				var next = new Date(start.getFullYear(),start.getMonth(),start.getDate()+(nextWeekday - h1),start.getHours(),start.getMinutes());
				if(next>start) { return rNewStart(next,r,rend);}
			}
			if(firstWeekday == 8) { return 0;}
			var weekdayDiff = start.getDay() == 0 ? 7 - firstWeekday : start.getDay() - firstWeekday;
			var nextweek = 54;
			var interval = 1;
			if(isset(r.interval) && Math.floor(r.interval) > 1) {
				interval = Math.floor(r.interval);
			}
			var firstNextWeek = new Date(start.getFullYear()+interval,0,1,start.getHours(),start.getMinutes());
			if(firstNextWeek.getWeek() == 1) {
					firstNextWeek.setDate(2-firstNextWeek.getDay());
			}
			else {
				if(firstNextWeek.getDay() === 0) {
					firstNextWeek.setDate(2);
				}
				else {
					firstNextWeek.setDate(9-firstNextWeek.getDay());
				}
			}
			var lastNextWeek = new Date(start.getFullYear()+interval,11,31,start.getHours(),start.getMinutes());
			if(lastNextWeek.getWeek() == 1) {
				lastNextWeek.setDate(31-6-lastNextWeek.getDay());
			}
			else {
				if(lastNextWeek.getDay() === 0) {
					lastNextWeek.setDate(25);
				}
				else {
					lastNextWeek.setDate(32-lastNextWeek.getDay());
				}
			}
			var lastWeek = new Date(start.getFullYear(),11,31,start.getHours(),start.getMinutes());
			if(lastWeek.getWeek() == 1) {
				lastWeek.setDate(31-6-lastWeek.getDay());
			}
			else {
				if(lastWeek.getDay() === 0) {
					lastWeek.setDate(25);
				}
				else {
					lastWeek.setDate(32-lastWeek.getDay());
				}
			}
			var nextWeek = 54;
			var firstWeek = 54;
			for(var i = 0; i < week.length; i++) {
				var w = Math.ceil(week[i]);
				if(w > -54 && w < 54) {
					if(w < 0) {
						if(nextWeek > (lastWeek.getWeek() + w + 1) && start.getWeek() > (lastWeek.getWeek() + w + 1)) {
							nextWeek = (lastWeek.getWeek() + w + 1);
						}
						if(firstWeek > (lastNextWeek.getWeek() + w + 1)) {
							firstWeek = (lastNextWeek.getWeek() + w + 1);
						}
					}
					if(w > 0) {
						if(nextWeek > w && start.getWeek() < w) {
							nextWeek = w;
						}
						if(firstWeek > w) {
							firstWeek = w;
						}
					}
				}
			}
			if(nextWeek < 54 && nextWeek > start.getWeek()) {
				var h1 = (start.getDay() == 0 ? 7 : start.getDay());
				start.setDate(start.getDate()+7*nextWeek-h1+firstWeekday);
				return rNewStart(start,r,rend);
			}
			if(firstWeek==54) {return 0;}
			firstNextWeek.setDate(firstNextWeek.getDate()+(7*(firstWeek-1))+firstWeekday-1);
			if(firstNextWeek>start) {
				return rNewStart(firstNextWeek,r,rend);
			}
		}
		// x. Wochentag (kann unterschiedlich sein, muss aber nicht)
		if(isset(r.byday)) {
			var firstOfYear = new Date(start.getFullYear(),0,1,start.getHours(),start.getMinutes());
			var lastOfYear = new Date(start.getFullYear()+1,0,0,start.getHours(),start.getMinutes());
			var yearDays = (lastOfYear - firstOfYear)/(24*60*60*1000)+1;
			var interval = 1;
			if(isset(r.interval) && Math.floor(r.interval) > 1) {
				interval = Math.floor(r.interval);
			}
			var firstOfNextYear = new Date(start.getFullYear()+interval,0,1,start.getHours(),start.getMinutes());
			var lastOfNextYear = new Date(start.getFullYear()+interval+1,0,0,start.getHours(),start.getMinutes());
			var nextYearDays = (lastOfNextYear - firstOfNextYear)/(24*60*60*1000)+1;
			var day = r.byday.toString().split(',');
			var pattr = /^([+-]?\d+)([A-Z]{2})$/;
			var nextYearDay = 54*7;
			var nextNextYearDay = 54*7;
			for(var i = 0; i < day.length; i++) {
				var d = pattr.exec(day[i]);
				if(d.length == 3 && Math.ceil(d[1]) > -54 && Math.ceil(d[1]) < 54) {
					var wd = getWeekdayNo(d[2]);
					if ( wd == 7 ) {continue;}
					if(Math.ceil(d[1]) > 0 && wd >= firstOfYear.getDay() && nextYearDay > (1+wd-firstOfYear.getDay()+(Math.ceil(d[1])-1)*7)) {
						nextYearDay = wd-firstOfYear.getDay()+((Math.ceil(d[1])-1)*7)+1;
					}
					if(Math.ceil(d[1]) > 0 && wd < firstOfYear.getDay() && nextYearDay > (8+wd-firstOfYear.getDay()+(Math.ceil(d[1])-1)*7)) {
						nextYearDay = 8+wd-firstOfYear.getDay()+((Math.ceil(d[1])-1)*7);
					}
					if(Math.ceil(d[1]) < 0 && wd <= lastOfYear.getDay() && nextYearDay > (yearDays-(lastOfYear.getDay()-wd-((Math.ceil(d[1])-1)*7)))) {
						nextYearDay = yearDays-(lastOfYear.getDay()-wd-((Math.ceil(d[1])-1)*7));
					}
					if(Math.ceil(d[1]) < 0 && wd > lastOfYear.getDay() && nextYearDay > (yearDays-7+wd-lastOfYear.getDay()+((Math.ceil(d[1])+1)*7))) {
						nextYearDay = yearDays-7+wd-lastOfYear.getDay()+((Math.ceil(d[1])+1)*7);
					}
					if(Math.ceil(d[1]) > 0 && wd >= firstOfNextYear.getDay() && nextNextYearDay > (1+wd-firstOfNextYear.getDay()+(Math.ceil(d[1])-1)*7)) {
						nextNextYearDay = wd-firstOfNextYear.getDay()+((Math.ceil(d[1])-1)*7)+1;
					}
					if(Math.ceil(d[1]) > 0 && wd < firstOfNextYear.getDay() && nextNextYearDay > (8+wd-firstOfNextYear.getDay()+(Math.ceil(d[1])-1)*7)) {
						nextNextYearDay = 8+wd-firstOfNextYear.getDay()+((Math.ceil(d[1])-1)*7);
					}
					if(Math.ceil(d[1]) < 0 && wd <= lastOfNextYear.getDay() && nextNextYearDay > (nextYearDays-(lastOfNextYear.getDay()-wd-((Math.ceil(d[1])+1)*7)))) {
						nextNextYearDay = nextYearDays-(lastOfNextYear.getDay()-wd-((Math.ceil(d[1])+1)*7));
					}
					if(Math.ceil(d[1]) < 0 && wd > lastOfNextYear.getDay() && nextNextYearDay > (nextYearDays-7+wd-lastOfNextYear.getDay()+((Math.ceil(d[1])+1)*7))) {
						nextNextYearDay = (nextYearDays-7+wd-lastOfNextYear.getDay()+((Math.ceil(d[1])+1)*7));
					}
				}
			}
			if(nextYearDay < (54*7)) {
				var next = new Date(firstOfYear.getFullYear(),0,nextYearDay,start.getHours(),start.getMinutes());
				if(next>start) {
					return rNewStart(next,r,rend);
				}
			}
			if(nextNextYearDay < (54*7)) {
				var next = new Date(firstOfNextYear.getFullYear(),0,nextNextYearDay,start.getHours(),start.getMinutes());
				if(next>start) {
					return rNewStart(next,r,rend);
				}
			}
		}				
		var i = 1;
		if(isset(r.interval) && Math.floor(r.interval) > 1) {
			i = Math.floor(r.interval);
		}
		var next = new Date(start.getFullYear()+i,start.getMonth(),start.getDate(),start.getHours(),start.getMinutes());
		return rNewStart(next,r,rend);
	}
	return 0;
}


var afterSqlPeople = [];
var afterSqlPlace = [];
dataImport = function(data,id) {
//	console.log(id + " ZusatzdatenImport");
//	console.log(data);
	db.transaction(function(tx) {
		// alte Daten löschen
		tx.executeSql('DELETE FROM event WHERE id = \''+id+'\';');
		tx.executeSql('DELETE FROM people WHERE id = \''+id+'\';');
		tx.executeSql('DELETE FROM additional WHERE id = \''+id+'\';');
		tx.executeSql('DELETE FROM place WHERE id = \''+id+'\';');
		
		// Zusatzdaten
		if(data.additional) {
			if(isset(data.additional.url) && data.additional.url.toString().match(/^https?:\/\/.+/i)) { tx.executeSql("INSERT INTO additional (id,key,value) VALUES (?,?,?);", [id,'url',htmlentities(data.additional.url)]); }
			if(isset(data.additional.mail) && data.additional.mail.toString().match(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i)) { tx.executeSql("INSERT INTO additional (id,key,value) VALUES (?,?,?);", [id,'mail',htmlentities(data.additional.mail)]); }
			if(isset(data.additional.facebook) && data.additional.facebook.toString().match(/^[a-z\d\.]{5,}$/)) { 
				$.getJSON( 'http://graph.facebook.com/'+data.additional.facebook, 
					(function(thisid) {
						return function(data) {
							if(isset(data.link)) {
								db.transaction(function(tx2) {
									tx2.executeSql("INSERT INTO additional (id,key,value) VALUES (?,?,?);",[thisid,'facebook',data.link]);
								});
							}
						};
					}(gemeinde.id)));
			}
			if(isset(data.additional.twitter) && data.additional.twitter.toString().match(/^[A-Za-z0-9_]{1,15}$/i)) { tx.executeSql("INSERT INTO additional (id,key,value) VALUES (?,?,?);",[id,'twitter','https://www.twitter.com/'+htmlentities(data.additional.twitter.toString())]); }
			if(isset(data.additional.google) && data.additional.google.toString().match(/^[a-z\d\.]{5,}$/)) { tx.executeSql("INSERT INTO additional (id,key,value) VALUES (?,?,?);",[id,'google','https://plus.google.com/'+htmlentities(data.additional.google.toString())]); }
			if(isset(data.additional.logo) && data.additional.logo.toString().match(/^https?:\/\/.*(png|jpg|jpeg|gif|bmp)$/i)) { tx.executeSql("INSERT INTO additional (id,key,value) VALUES (?,?,?);",[id,'logo',htmlentities(data.additional.logo)]); }
			if(isset(data.additional.tel)) { tx.executeSql("INSERT INTO additional (id,key,value) VALUES (?,?,?);",[id,'tel',htmlentities(data.additional.tel)]); }
			if(isset(data.additional.fax)) { tx.executeSql("INSERT INTO additional (id,key,value) VALUES (?,?,?);",[id,'fax',htmlentities(data.additional.fax)]); }
		}
		
		// Ansprechpartner
		if(isset(data.people) && (data.people.length > 0)) {
			for(var i = 0; i < data.people.length; i++) {
				var people = data.people[i];
				if(isset(people.name)) {
					var name = htmlentities(people.name);
					var title = isset(people.title) ? htmlentities(people.title) : null;
					var adresse = isset(people.adresse) ? htmlentities(people.adresse) : null;
					var lat = isset(people.lat) ? htmlentities(people.lat) : null;
					var lon = isset(people.lon) ? htmlentities(people.lon) : null;
					var email = isset(people.mail) ? htmlentities(people.mail) : null;
					var tel = isset(people.tel) ? htmlentities(people.tel) : null;
					var fax = isset(people.fax) ? htmlentities(people.fax) : null;
					var twitter = isset(people.twitter) && people.twitter.toString().match(/^[a-z0-9_]{1,15}$/i) ? 'https://www.twitter.com/'+htmlentities(people.twitter) : null;
					var google = isset(people.google) && people.google.toString().match(/^[a-z\d\.]{5,}$/) ? 'https://plus.google.com/'+htmlentities(people.google) : null;
					var mobil = isset(people.mobil) ? htmlentities(people.mobil) : null;
					var pic = isset(people.pic) ? htmlentities(people.pic) : null;
					var desc = isset(people.desc) ? htmlentities(people.desc) : null;
					if(isset(people.dend)) {
						var now = new Date();
						if(now > people.dend*1000) { continue; }
					}
					var facebook = isset(people.facebook) && people.facebook.toString().match(/^[a-z\d\.]{5,}$/) ? id+'-'+i : null;
					tx.executeSql("INSERT INTO people (id,name,adresse,lat,lon,email,telefon,fax,mobil,twitter,google,facebook,pic,position,desc) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);",[id,name,adresse,lat,lon,email,tel,fax,mobil,twitter,google,facebook,pic,title,desc]);
					if(isset(people.facebook) && people.facebook.toString().match(/^[a-z\d\.]{5,}$/)) { 
						$.getJSON( 'http://graph.facebook.com/'+people.facebook, 
							(function(thisid,thisi) {
								return function(data) {
//									console.log(data);
									if(isset(data.link)) {
										afterSqlPeople.push([data.link , thisid+'-'+thisi]);
									}
									else if (isset(data.username) ){
										afterSqlPeople.push(['https://www.facebook.com/'+data.username , thisid+'-'+thisi]);
									}
								};
							}(id,i)));
					}
				}
			}
		}
		
		// Veranstaltungen
		if(isset(data.event)&&(data.event.length > 0)) {
			for(var i = 0; i < data.event.length; i++) {
				var event = data.event[i];
				if(isset(event.title) && isset(event.dtstart)) {
					var title = htmlentities(event.title);
					var dtstart = event.dtstart;
					var dtend = isset(event.dtend) ? event.dtend : event.dtstart;
					var recurrence = isset(event.recurrence) && testJson(event.recurrence) ? JSON.stringify(event.recurrence) : null;
					var rend = isset(event.rend) ? event.rend*1000 : null;
					var desc = isset(event.desc) ? htmlentities(event.desc) : null;
					var costs = isset(event.costs) ? htmlentities(event.costs) : null;
					var url = isset(event.url) ? htmlentities(event.url) : null;
					var pic = isset(event.pic) ? htmlentities(event.pic) : null;
					var google = isset(event.google) && event.google.toString().match(/^[a-z\d\.]{5,}$/) ? 'https://plus.google.com/'+htmlentities(event.google) : null;
					var facebook = isset(event.facebook) && event.facebook.toString().match(/^[0-9]{5,}$/) ? 'https://www.facebook.com/events/'+htmlentities(event.facebook) : null;
					var adress = isset(event.adress) ? htmlentities(event.adress) : null;
					var summary = isset(event.summary) ? htmlentities(event.summary) : null;
					var lat = isset(event.lat) ? htmlentities(event.lat) : null;
					var lon = isset(event.lon) ? htmlentities(event.lon) : null;
					var jetzt = new Date();
					//console.log([id,id+"-"+i,title,summary,adress,lat,lon,facebook,google,pic,url,costs,0,dtstart,dtend,recurrence,rend,jetzt.getTime()]);
					if((jetzt.getTime() < dtend*1000)||(jetzt.getTime() < rend)||(isset(event.recurrence)&&!isset(event.rend))) {
//						console.log('insert into db: '+title);
						tx.executeSql("INSERT INTO event (id, eid, title, summary, adress, lat, lon, facebook, google, pic, url, costs, subevent, dtstart, dtend, recurrence, rend) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);",[id,id+"-"+i,title,summary,adress,lat,lon,facebook,google,pic,url,costs,'root',dtstart,dtend,recurrence,rend]);
						if(isset(event.subevent)&&(event.subevent.length>0)) {
							for(var j = 0; j < event.subevent.length; j++) {
								var subevent = event.subevent[j];
								if(isset(subevent.title) && isset(subevent.dtstart)) {
									var stitle = htmlentities(subevent.title);
									var sdtstart = (subevent.dtstart > event.dtstart ) ? ((subevent.dtstart > event.dtend ) ? (htmlentities(subevent.dtstart)) : htmlentities(event.dtstart)) : htmlentities(event.dtstart);
									var sdtstart = dtstart;
									if(subevent.dtstart < event.dtstart) { sdtstart = dtstart; }
										else { if(subevent.dtstart > event.dtend) { sdtstart = dtend; }
											sdtstart = htmlentities(subevent.dtstart);
										}
									var sdtend = sdtstart;
									if(isset(subevent.dtend)) {
										if(subevent.dtend < subevent.dtstart) { sdtend = sdtstart; }
										else {	if(subevent.dtend > event.dtend) { sdtend = dtend; }
											sdtend = htmlentities(subevent.dtend);
										}
									}
									var sdesc = isset(subevent.desc) ? htmlentities(subevent.desc) : null;
									var scosts = isset(subevent.costs) ? htmlentities(subevent.costs) : null;
									var surl = isset(subevent.url) ? htmlentities(subevent.url) : null;
									var spic = isset(subevent.pic) ? htmlentities(subevent.pic) : null;
									var sgoogle = isset(subevent.google) && subevent.google.toString().match(/^[a-z\d\.]{5,}$/) ? 'https://plus.google.com/'+htmlentities(subevent.google) : null;
									var sfacebook = isset(subevent.facebook) && subevent.facebook.toString().match(/^[0-9]{5,}$/) ? 'https://www.facebook.com/events/'+htmlentities(subevent.facebook) : null;
									var sadress = isset(subevent.adress) ? htmlentities(subevent.adress) : null;
									var ssummary = isset(subevent.summary) ? htmlentities(subevent.summary) : null;
									var slat = isset(subevent.lat) ? htmlentities(subevent.lat) : null;
									var slon = isset(subevent.lon) ? htmlentities(subevent.lon) : null;
									if((jetzt.getTime() < sdtend*1000)||(jetzt.getTime() < srend*1000)) {
										tx.executeSql("INSERT INTO event (id, eid, title, summary, adress, lat, lon, facebook, google, pic, url, costs, subevent, dtstart, dtend, recurrence, rend) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);",[id,id+"-"+i+"-"+j,stitle,ssummary,sadress,slat,slon,sfacebook,sgoogle,spic,surl,scosts,id+"-"+i,sdtstart,sdtend,null,null]);
									}
								}
							}
						}
					}
				}
			}
		}
		
		// Orte
		if(isset(data.place)&&(data.place.length > 0)) {
			for(var i = 0; i < data.place.length; i++) {
				var place = data.place[i];
				if (isset(place.name) && isset(place.adress) && isset(place.lat) && isset(place.lon)) {
					var name = htmlentities(place.name);
					var adresse = isset(place.adress) ? htmlentities(place.adress) : null;
					var lat = isset(place.lat) ? htmlentities(place.lat) : null;
					var lon = isset(place.lon) ? htmlentities(place.lon) : null;
					var email = isset(place.email) ? htmlentities(place.email) : null;
					var telefon = isset(place.tel) ? htmlentities(place.tel) : null;
					var fax = isset(place.fax) ? htmlentities(place.fax) : null;
					var pic = isset(place.pic) ? htmlentities(place.pic) : null;
					var desc = isset(place.desc) ? htmlentities(place.desc) : null;
					var google = isset(place.google) && place.google.toString().match(/^[a-z\d\.]{5,}$/) ? 'https://plus.google.com/'+htmlentities(place.google) : null;
					var pic = isset(place.pic) ? htmlentities(place.pic) : null;
					var desc = isset(place.desc) ? htmlentities(place.desc) : null;
					var facebook = isset(place.facebook) && place.facebook.toString().match(/^[a-z\d\.]{5,}$/) ? id+'-'+i : null;
					tx.executeSql("INSERT INTO place (id,name,adresse,lat,lon,email,telefon,fax,google,facebook,pic,desc) VALUES (?,?,?,?,?,?,?,?,?,?,?,?);",[id,name,adresse,lat,lon,email,tel,fax,google,facebook,pic,desc]);
					if(isset(place.facebook) && place.facebook.toString().match(/^[a-z\d\.]{5,}$/)) { 
						$.getJSON( 'http://graph.facebook.com/'+place.facebook, 
							(function(thisid,thisi) {
								return function(data) {
//									console.log(data);
									if(isset(data.link)) {
										afterSqlPeople.push([data.link , thisid+'-'+thisi]);
									}
									else if (isset(data.username) ){
										afterSqlPeople.push(['https://www.facebook.com/'+data.username , thisid+'-'+thisi]);
									}
								};
							}(id,i)));
					}
				}
			}
		}
	}, function (tx, err) {
		console.log(tx); 
		console.log(err); 
		console.log("Rückgabe: "+tx.code+' '+tx.message); 
	}, afterSql);
}

function afterSql() {
	window.setTimeout(function(){
//		console.log(afterSqlPeople);	
		db.transaction(function(tx) {
			for (var i = 0; i < afterSqlPeople.length; i++ ) {
				tx.executeSql("UPDATE people SET facebook = ? WHERE facebook = ?;",afterSqlPeople[i]);
			}
			for (var i = 0; i < afterSqlPlace.length; i++ ) {
				tx.executeSql("UPDATE place SET facebook = ? WHERE facebook = ?;",afterSqlPlace[i]);
			}
		}, function (tx, err) { 
			console.log(tx); 
			console.log(err); 
			console.log("Rückgabe: "+tx.code+' '+tx.message); 
		}, gemeindefill);
	}, 1500);
}

function generateSpecialData(id,prefix) {
//	console.log('GENERATE DATA');
	db.transaction(function(tx) {
		// Zusatzdaten
		$('#'+prefix+'_additional').html('');
		tx.executeSql("SELECT * FROM additional WHERE id = '"+id+"'" , [], function(tx,rs) {
			$("#"+prefix+"_additional").html("");
			$("#"+prefix+"_facebook").addClass("hidden");
			$("#"+prefix+"_twitter").addClass("hidden");
			$("#"+prefix+"_google").addClass("hidden");
			$("#"+prefix+"_logo").addClass("hidden");
			for (var i = 0; i < rs.rows.length; i++) {
				var zusatz = rs.rows.item(i);
				if(zusatz.key == 'tel') {
					var pc = $('<a class="iconTel" data-inline="true" data-role="button" href="tel:'+zusatz.value+'">'+zusatz.value+'</a>');
					$("#"+prefix+"_additional").append(pc);
				}
				if(zusatz.key == 'fax') {
					var pc = $('<a class="iconFax" data-inline="true" data-role="button" href="tel:'+zusatz.value+'">'+zusatz.value+'</a>');
					$("#"+prefix+"_additional").append(pc);
				}
				if(zusatz.key == 'url') {
					var pc = $('<a class="iconWWW" data-inline="true" target="_blank" data-role="button" href="'+zusatz.value+'">'+zusatz.value.replace(/^http[s]?\:\/\/(www\.)?/gi, "")+'</a>');
					$("#"+prefix+"_additional").append(pc);
				}
				if(zusatz.key == 'mail') {
					var pc = $('<a class="iconMail" data-inline="true" data-role="button" href="mailto:'+zusatz.value+'">'+zusatz.value+'</a>');
					$("#"+prefix+"_additional").append(pc);
				}
				if(zusatz.key == 'facebook') { $('#'+prefix+'_facebook').attr('href',zusatz.value).removeClass('hidden'); }
				if(zusatz.key == 'twitter') { $('#'+prefix+'_twitter').attr('href',zusatz.value).removeClass('hidden'); }
				if(zusatz.key == 'google') { $('#'+prefix+'_google').attr('href',zusatz.value).removeClass('hidden'); }
				if(zusatz.key == 'logo') { $('#'+prefix+'_logo').attr('src',zusatz.value).removeClass('hidden'); }
			}
			$('#'+prefix+'_additional').trigger( "create" );
		});
		// Veranstaltungen
		tx.executeSql("SELECT * FROM event WHERE id = '"+id+"' AND subevent = 'root';" , [], function(tx,rs) {
//			console.log(rs.rows);
			if(rs.rows.length>0) {
				// Collapse Menü erstellen
				var cmenu = $('<div/>').attr('data-role',"collapsible").append($('<h3>').html('Veranstaltungen'));
				var events = [];
				for (var i = 0; i < rs.rows.length; i++) {
					var event = rs.rows.item(i);
					var d = new Date(event.dtstart*1000);
					var offset = 0;
					var pcontent = $('<div/>').attr('data-role',"collapsible").attr('id',prefix+'-'+event.eid).attr('data-dtstart',event.dtstart*1000);
					if((event.recurrence!=null)&&(event.recurrence.length>0)) {
						var rend = 0;
						if((event.rend!=null)&&(event.rend.length>0)) {rend = event.rend; }
						var start = rNewStart(d,JSON.parse(event.recurrence),rend);
						if( start === 0 ) { continue;}
						if((start.getHours()==0)&&(start.getMinutes()==0)) {
							pcontent.html('<h3>'+event.title+' ('+(start.getDate() < 10 ? '0' + start.getDate() : start.getDate())+'.'+(start.getMonth() < 9 ? '0' + (start.getMonth()+1) : start.getMonth()+1 )+'.'+start.getFullYear()+')</h3>').attr('data-dtstart',start*1);
							if((event.pic!=null)&&(event.pic.length>0)) { pcontent.append('<div><img src=\''+event.pic+'\' style="float:left;max-width:50%;max-height:150px;" /></div>'); }
							pcontent.append('<p><b>Beginn:</b> '+(start.getDate() < 10 ? '0' + start.getDate() : start.getDate())+'.'+(start.getMonth() < 9 ? '0' + (start.getMonth() +1) : (start.getMonth()+1))+'.'+start.getFullYear()+'</p>');
						}
						else {
							pcontent.html('<h3>'+event.title+' ('+(start.getDate() < 10 ? '0' + start.getDate() : start.getDate())+'.'+(start.getMonth() < 9 ? '0' + (start.getMonth() +1) : (start.getMonth()+1))+'.'+start.getFullYear()+' '+(start.getHours() < 10 ? '0' + start.getHours() : start.getHours())+":"+(start.getMinutes() < 10 ? '0' + start.getMinutes() : start.getMinutes())+')</h3>').attr('data-dtstart',start*1);
							if((event.pic!=null)&&(event.pic.length>0)) { pcontent.append('<div><img src=\''+event.pic+'\' style="float:left;max-width:50%;max-height:150px;" /></div>'); }
							pcontent.append('<p><b>Beginn:</b> '+(start.getDate() < 10 ? '0' + start.getDate() : start.getDate())+'.'+(start.getMonth() < 9 ? '0' + (start.getMonth() +1) : (start.getMonth()+1))+'.'+start.getFullYear()+' '+(start.getHours() < 10 ? '0' + start.getHours() : start.getHours())+":"+(start.getMinutes() < 10 ? '0' + start.getMinutes() : start.getMinutes())+'</p>');
						}
						offset = (start.valueOf()-d.valueOf());
						if(isset(event.dtend)) {
							var end = new Date(event.dtend*1000);
							end = new Date(end.valueOf() + offset);
							if((start.getHours()==0)&&(start.getMinutes()==0)&&(end.getHours()==0)&&(end.getMinutes()==0)) {
								pcontent.append('<p><b>Ende:</b> '+(end.getDate() < 10 ? '0' + end.getDate() : end.getDate())+'.'+(end.getMonth() < 9 ? '0' + (end.getMonth() +1) : (end.getMonth()+1))+'.'+end.getFullYear()+'</p>');
							}
							else {
								pcontent.append('<p><b>Ende:</b> '+(end.getDate() < 10 ? '0' + end.getDate() : end.getDate())+'.'+(end.getMonth() < 9 ? '0' + (end.getMonth() +1) : (end.getMonth()+1))+'.'+end.getFullYear()+' '+(end.getHours() < 10 ? '0' + end.getHours() : end.getHours())+":"+(end.getMinutes() < 10 ? '0' + end.getMinutes() : end.getMinutes())+'</p>');
							}
						}
						pcontent.append('<p><b>Wiederholungsregel:</b> '+rString(JSON.parse(event.recurrence))+'</p>');
					} else {
						if((d.getHours()==0)&&(d.getMinutes()==0)) {
							pcontent.html('<h3>'+event.title+' ('+(d.getDate() < 10 ? '0' + d.getDate() : d.getDate())+'.'+(d.getMonth() < 9 ? '0' + (d.getMonth()+1) : d.getMonth()+1 )+'.'+d.getFullYear()+')</h3>').attr('data-dtstart',d*1);
							if((event.pic!=null)&&(event.pic.length>0)) { pcontent.append('<div><img src=\''+event.pic+'\' style="float:left;max-width:50%;max-height:150px;" /></div>'); }
							pcontent.append('<p><b>Beginn:</b> '+(d.getDate() < 10 ? '0' + d.getDate() : d.getDate())+'.'+(d.getMonth() < 9 ? '0' + (d.getMonth() +1) : (d.getMonth()+1))+'.'+d.getFullYear()+'</p>');
						}
						else {
							pcontent.html('<h3>'+event.title+' ('+(d.getDate() < 10 ? '0' + d.getDate() : d.getDate())+'.'+(d.getMonth() < 9 ? '0' + (d.getMonth() +1) : (d.getMonth()+1))+'.'+d.getFullYear()+' '+(d.getHours() < 10 ? '0' + d.getHours() : d.getHours())+":"+(d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes())+')</h3>').attr('data-dtstart',d*1);
							if((event.pic!=null)&&(event.pic.length>0)) { pcontent.append('<div><img src=\''+event.pic+'\' style="float:left;max-width:50%;max-height:150px;" /></div>'); }
							pcontent.append('<p><b>Beginn:</b> '+(d.getDate() < 10 ? '0' + d.getDate() : d.getDate())+'.'+(d.getMonth() < 9 ? '0' + (d.getMonth() +1) : (d.getMonth()+1))+'.'+d.getFullYear()+' '+(d.getHours() < 10 ? '0' + d.getHours() : d.getHours())+":"+(d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes())+'</p>');
						}
						if(isset(event.dtend)) { 
							var end = new Date(event.dtend*1000);
							if((d.getHours()==0)&&(d.getMinutes()==0)&&(end.getHours()==0)&&(end.getMinutes()==0)) {
								pcontent.append('<p><b>Ende:</b> '+(end.getDate() < 10 ? '0' + end.getDate() : end.getDate())+'.'+(end.getMonth() < 9 ? '0' + (end.getMonth() +1) : (end.getMonth()+1))+'.'+end.getFullYear()+'</p>');
							}
							else {
								pcontent.append('<p><b>Ende:</b> '+(end.getDate() < 10 ? '0' + end.getDate() : end.getDate())+'.'+(end.getMonth() < 9 ? '0' + (end.getMonth() +1) : (end.getMonth()+1))+'.'+end.getFullYear()+' '+(end.getHours() < 10 ? '0' + end.getHours() : end.getHours())+":"+(end.getMinutes() < 10 ? '0' + end.getMinutes() : end.getMinutes())+'</p>');
							}
						}
					}
					pcontent.attr('data-offset',offset);
					if((event.summary != null)&&(event.summary.length > 0)) { pcontent.append('<p>'+event.summary+'</p>'); }
					if((event.adress!=null)&&(event.adress.length>0)&&(event.lat!=0)&&(event.lon!=0)) {
						var pc = $('<a class="iconPlace" data-inline="true" data-role="button" href="geo:'+event.lat+','+event.lon+'">'+event.adress+'</a>');
						pcontent.append(pc);
					}
					if((event.url!=null)&&(event.url.length>0)) {
						var pc = $('<a class="iconWWW" data-inline="true" data-role="button" href="'+event.url+'">'+event.url.replace(/^http[s]?\:\/\/(www\.)?/gi, "")+'</a>');
						pcontent.append(pc);
					}
					if((event.facebook!=null)&&(event.facebook.length>0)) {
						var pc = $('<a class="iconFacebook" target="_blank" data-inline="true" data-role="button" href="'+event.facebook+'"> </a>');
						pcontent.append(pc);
					}
					if((event.google!=null)&&(event.google.length>0)) {
						var pc = $('<a class="iconGoogle" target="_blank" data-inline="true" data-role="button" href="'+event.google+'"> </a>');
						pcontent.append(pc);
					}
					if((event.costs!=null)&&(event.costs>0)) {
						var pc = $('<a class="iconCosts" data-inline="true" data-role="button">'+event.costs+'&euro;</a>');
						pcontent.append(pc);
					}
					if((event.pic!=null)&&(event.pic.length>0)) { pcontent.append($('<br style="clear:both;" />')); }
					tx.executeSql("SELECT * FROM event WHERE id = '"+id+"' AND subevent ='"+event.eid+"';" , [], function(tx2,rs2) {
						if(rs2.rows.length>0) {
							// Collapse Menü erstellen
							var soffset = $('#'+prefix+'-'+event.eid).data( "offset" );
							for (var j = 0; j < rs2.rows.length; j++) {
								var sevent = rs2.rows.item(j);
								var d = new Date(sevent.dtstart*1000+soffset);
								var spcontent = $('<div/>').attr('data-role',"collapsible");
								if((d.getHours()==0)&&(d.getMinutes()==0)) {
									spcontent.html('<h3>'+sevent.title+' ('+(d.getDate() < 10 ? '0' + d.getDate() : d.getDate())+'.'+(d.getMonth() < 10 ? '0' + d.getMonth() : d.getMonth())+'.'+d.getFullYear()+')</h3>');
									if((sevent.pic!=null)&&(sevent.pic.length>0)) { spcontent.append('<div><img src=\''+sevent.pic+'\' style="float:left;max-width:50%;max-height:150px;" /></div>'); }
									spcontent.append('<p><b>Beginn:</b> '+(d.getDate() < 10 ? '0' + d.getDate() : d.getDate())+'.'+(d.getMonth() < 9 ? '0' + (d.getMonth() +1) : (d.getMonth()+1))+'.'+d.getFullYear()+'</p>');
								}
								else {
									spcontent.html('<h3>'+sevent.title+' ('+(d.getDate() < 10 ? '0' + d.getDate() : d.getDate())+'.'+(d.getMonth() < 10 ? '0' + d.getMonth() : d.getMonth())+'.'+d.getFullYear()+' '+(d.getHours() < 10 ? '0' + d.getHours() : d.getHours())+":"+(d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes())+')</h3>');
									if((sevent.pic!=null)&&(sevent.pic.length>0)) { spcontent.append('<div><img src=\''+sevent.pic+'\' style="float:left;max-width:50%;max-height:150px;" /></div>'); }
									spcontent.append('<p><b>Beginn:</b> '+(d.getDate() < 10 ? '0' + d.getDate() : d.getDate())+'.'+(d.getMonth() < 9 ? '0' + (d.getMonth() +1) : (d.getMonth()+1))+'.'+d.getFullYear()+' '+(d.getHours() < 10 ? '0' + d.getHours() : d.getHours())+":"+(d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes())+'</p>');
								}
								
								if(isset(sevent.dtend)) { 
									var end = new Date(sevent.dtend*1000+soffset);
									spcontent.append('<p><b>Ende:</b> '+(end.getDate() < 10 ? '0' + end.getDate() : end.getDate())+'.'+(end.getMonth() < 9 ? '0' + (end.getMonth() +1) : (end.getMonth()+1))+'.'+end.getFullYear()+' '+(end.getHours() < 10 ? '0' + end.getHours() : end.getHours())+":"+(end.getMinutes() < 10 ? '0' + end.getMinutes() : end.getMinutes())+'</p>');
								}
								if((sevent.summary!=null)&&(sevent.summary.length>0)) { spcontent.append('<p>'+sevent.summary+'</p>'); }
//								console.log(sevent);
								if((sevent.adress!=null)&&(sevent.adress.length>0)&&(sevent.lat!=0)&&(sevent.lon!=0)) {
//									console.log("ORT: "+sevent.adress);
									var pc = $('<div><a class="iconPlace" data-inline="true" data-role="button" href="geo:'+sevent.lat+','+sevent.lon+'">'+sevent.adress+'</a></div>');
									spcontent.append(pc);
								}
								if((sevent.url!=null)&&(sevent.url.length>0)) {
									var pc = $('<a class="iconWWW" data-inline="true" data-role="button" href="'+sevent.url+'">'+sevent.url.replace(/^http[s]?\:\/\/(www\.)?/gi, "")+'</a>');
									spcontent.append(pc);
								}
								if((sevent.facebook!=null)&&(sevent.facebook.length>0)) {
									var pc = $('<a class="iconFacebook" target="_blank" data-inline="true" data-role="button" href="'+sevent.facebook+'"> </a>');
									spcontent.append(pc);
								}
								if((sevent.google!=null)&&(sevent.google.length>0)) {
									var pc = $('<a class="iconGoogle" target="_blank" data-inline="true" data-role="button" href="'+sevent.google+'"> </a>');
									spcontent.append(pc);
								}
								if((sevent.costs!=null)&&(sevent.costs>0)) {
									var pc = $('<a class="iconCosts" target="_blank" data-inline="true" data-role="button">'+sevent.costs+'&euro;</a>');
									spcontent.append(pc);
								}
								$('#'+prefix+'-'+event.eid+' > div.ui-collapsible-content').append(spcontent);
								if((sevent.pic!=null)&&(sevent.pic.length>0)) { $('#'+prefix+'-'+event.eid+' > div.ui-collapsible-content').append($('<br style="clear:both;" />')); }
							}
							$('#'+prefix+'-'+event.eid).trigger( "create" );
						}
					});
					events.push(pcontent);
				}
				events.sort(sortEvents);
				for(var j = 0; j < events.length; j++) { cmenu.append(events[j]); }
//				console.log('#'+prefix+'_event');
				$('#'+prefix+'_event').html(cmenu);
				$('#'+prefix+'_event').trigger( "create" );
			}
		});
		// Ansprechpartner
		tx.executeSql("SELECT * FROM people WHERE id = '"+id+"'" , [], function(tx,rs) {
			if(rs.rows.length>0) {
				// Collapse Menü erstellen
				var cmenu = $('<div/>').attr('data-role',"collapsible").append($('<h3>').html('Ansprechpartner'));
				for (var i = 0; i < rs.rows.length; i++) {
					var people = rs.rows.item(i);
					var pcontent = $('<div/>').attr('data-role',"collapsible");
					if(people.position.length>0) {
						pcontent.html('<h3>'+people.name+' ('+people.position+')</h3>');
					}
					else {
						pcontent.html('<h3>'+people.name+'</h3>');
					}
					if((people.pic!=null)&&(people.pic.length>0)) { pcontent.append('<div><img src=\''+people.pic+'\' style="float:left;max-width:50%;max-height:150px;" /></div>'); }
					if((people.desc != null)&&(people.desc.length > 0)) { pcontent.append('<p>'+people.desc+'</p>'); }
					if((people.adress!=null)&&(people.adress.length>0)&&(people.lat!=0)&&(people.lon!=0)) {
						var pc = $('<a class="iconPlace" data-inline="true" data-role="button" href="geo:'+people.lat+','+people.lon+'">'+people.adress+'</a>');
						pcontent.append(pc);
					}
					if((people.url!=null)&&(people.url.length>0)) {
						var pc = $('<a class="iconWWW" data-inline="true" data-role="button" href="'+people.url+'">'+people.url.replace(/^http[s]?\:\/\/(www\.)?/gi, "")+'</a>');
						pcontent.append(pc);
					}
					if((people.telefon!=null)&&(people.telefon.length>0)) {
						var pc = $('<a class="iconTel" data-inline="true" data-role="button" href="tel:'+people.telefon+'">'+people.telefon+'</a>');
						pcontent.append(pc);
					}
					if((people.mobil!=null)&&(people.mobil.length>0)) {
						var pc = $('<a class="iconMobil" data-inline="true" data-role="button" href="tel:'+people.mobil+'">'+people.mobil+'</a>');
						pcontent.append(pc);
					}
					if((people.fax!=null)&&(people.fax.length>0)) {
						var pc = $('<a class="iconFax" data-inline="true" data-role="button" href="tel:'+people.fax+'">'+people.fax+'</a>');
						pcontent.append(pc);
					}
					if((people.email!=null)&&(people.email.length>0)) {
						var pc = $('<a class="iconMail" data-inline="true" data-role="button" href="mailto:'+people.email+'">'+people.email+'</a>');
						pcontent.append(pc);
					}
					if((people.facebook!=null)&&(people.facebook.length>0)) {
						var pc = $('<a class="iconFacebook" target="_blank" data-inline="true" data-role="button" href="'+people.facebook+'"> </a>');
						pcontent.append(pc);
					}
					if((people.google!=null)&&(people.google.length>0)) {
						var pc = $('<a class="iconGoogle" target="_blank" data-inline="true" data-role="button" href="'+people.google+'"> </a>');
						pcontent.append(pc);
					}
					if((people.pic!=null)&&(people.pic.length>0)) { pcontent.append($('<br style="clear:both;" />')); }
					cmenu.append(pcontent);
				}
//				console.log('#'+prefix+'_people');
				$('#'+prefix+'_people').html(cmenu);
				$('#'+prefix+'_people').trigger( "create" );
			}
		});
		// Orte
		tx.executeSql("SELECT * FROM place WHERE id = '"+id+"'" , [], function(tx,rs) {
			for (var i = 0; i < rs.rows.length; i++) {
				var gemeinde = rs.rows.item(i);
			}
		});
	});
}

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
		onDeviceReady();
        app.receivedEvent('deviceready');	
    }
};

function geolocationSuccess(position) {
	lat = position.coords.latitude;
	lon = position.coords.longitude;
	localStorage.setItem("lat", lat);
	localStorage.setItem("lon", lon);
//	console.log('lat: '+lat);
	gemeindefill();
}

function onDeviceReady() {

	$('#fav').bind('pageshow', function() {
//		console.log('show nearby');
		$('#fav_gemeindeliste').listview();
		$('#fav_gemeindeliste').listview('refresh');
	});
	// Geo-Daten
	if(localStorage.getItem("lat")) {
		lat = localStorage.getItem("lat");
		lon = localStorage.getItem("lon");
	}
	navigator.geolocation.getCurrentPosition(geolocationSuccess);
	
	// Datenbankverbindung
	//console.log('Datenbankverbindung');
	db = window.openDatabase("kath", "1.0", "Sync Demo DB", 200000);
	//console.log('Datenbankverbindung erledigt');
	$('#gemeindeliste').append('<li><a href="#">oh oh</a></li>');
	// Tabellen erstellen
	//console.log('Tabellen erstellen');
	db.transaction(function(tx) {
		$('#gemeindeliste').append('<li><a href="#">oje</a></li>');
		if(!isset(localStorage.getItem("dataInfo")) || localStorage.getItem("dataInfo") == '' || global_json.dataInfo > localStorage.getItem("dataInfo")) {
			tx.executeSql('DROP TABLE dataInfo;');
			tx.executeSql('DROP TABLE gemeinde;');
			tx.executeSql('DROP TABLE additional;');
			tx.executeSql('DROP TABLE place;');
			tx.executeSql('DROP TABLE people;');
			tx.executeSql('DROP TABLE event;');
			localStorage.setItem("dataInfo", global_json.dataInfo);
		}
		tx.executeSql('CREATE TABLE IF NOT EXISTS dataInfo (id TEXT PRIMARY KEY, data TEXT)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS gemeinde (id TEXT PRIMARY KEY, kurz TEXT NOT NULL, lang TEXT NOT NULL, strasse TEXT NOT NULL, ort TEXT NOT NULL, plz TEXT NOT NULL, patron TEXT, url TEXT, configurl TEXT, lat REAL, lon REAL)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS fav (id TEXT PRIMARY KEY)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS place (id TEXT NOT NULL, name TEXT NOT NULL, adresse TEXT NOT NULL, lat REAL NOT NULL, lon REAL NOT NULL, email TEXT, telefon TEXT, fax TEXT, pic TEXT, desc TEXT, facebook TEXT, google TEXT)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS people (id TEXT NOT NULL, name TEXT NOT NULL, adresse TEXT, lat REAL, lon REAL, email TEXT, telefon TEXT, fax TEXT, mobil TEXT, facebook TEXT, twitter TEXT, google TEXT, pic TEXT, position TEXT, desc TEXT)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS event (id TEXT NOT NULL, eid TEXT PRIMARY KEY, title TEXT NOT NULL, summary TEXT, adress TEXT, lat REAL, lon REAL, facebook TEXT, google TEXT, pic TEXT, url TEXT, costs TEXT, subevent TEXT, dtstart TEXT NOT NULL, dtend TEXT, recurrence TEXT, rend TEXT)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS additional (id TEXT NOT NULL, key TEXT NOT NULL, value TEXT NOT NULL)');
	});
	
	// Prüfe Datenversion
	//console.log('Prüfe Datenversion');
	db.transaction(function(tx) {
		tx.executeSql("SELECT id FROM dataInfo WHERE id = 'version' AND data < 1" , [], function(tx,rs) {
	//		console.log('Soviele gibt es: '+rs.rows.length);
			if(rs.rows.length == 0) {
	//			console.log('Hole lokale JSON');
				//$.getScript('js/data.js');
				db.transaction(function(tx) {
					tx.executeSql('INSERT OR REPLACE INTO dataInfo (id, data) values (\'version\', \''+global_json.dataInfo.version+'\')');
					tx.executeSql('DROP TABLE gemeinde');
					tx.executeSql('CREATE TABLE gemeinde (id TEXT PRIMARY KEY, kurz TEXT NOT NULL, lang TEXT NOT NULL, strasse TEXT NOT NULL, ort TEXT NOT NULL, plz TEXT NOT NULL, patron TEXT, url TEXT, configurl TEXT, lat REAL, lon REAL)');
//					console.log(global_json);
					for(var i = 0; i < global_json.gemeinde.length; i++) {
						var gemeinde = global_json.gemeinde[i];
						if(!isset(gemeinde)) { 
//							console.log(i+': unset'); 
							continue;
						}
						var id = isset(gemeinde.id) ? gemeinde.id : "";
						var kurz = isset(gemeinde.kurz) ? gemeinde.kurz : "";
						var lang = isset(gemeinde.lang) ? gemeinde.lang : "";
						var strasse = isset(gemeinde.strasse) ? gemeinde.strasse : "";
						var ort = isset(gemeinde.ort) ? gemeinde.ort : "";
						var plz = isset(gemeinde.plz) ? gemeinde.plz : "";
						var patron = isset(gemeinde.patron) ? gemeinde.patron : "";
						var url = isset(gemeinde.url) ? gemeinde.url : "";
						var configurl = null;
						if(isset(gemeinde.configurl)) { 
							$.getJSON( gemeinde.configurl, 
								(function(thisi) {
									return function(data) {
										dataImport(data,thisi);
									};
								}(gemeinde.id)));
							configurl = gemeinde.configurl;
						}
						var lat = isset(gemeinde.lat) ? gemeinde.lat : "";
						var lon = isset(gemeinde.lon) ? gemeinde.lon : "";
					
	//					console.log('INSERT OR REPLACE INTO gemeinde (id, kurz, lang, strasse, ort, plz, patron, url, configurl, lat, lon) values (\''+id+'\', \''+kurz+'\', \''+lang+'\', \''+strasse+'\', \''+ort+'\', \''+plz+'\', \''+patron+'\', \''+url+'\', \''+configurl+'\', \''+lat+'\', \''+lon+'\');');
						tx.executeSql('INSERT OR REPLACE INTO gemeinde (id, kurz, lang, strasse, ort, plz, patron, url, configurl, lat, lon) values (\''+id+'\', \''+kurz+'\', \''+lang+'\', \''+strasse+'\', \''+ort+'\', \''+plz+'\', \''+patron+'\', \''+url+'\', \''+configurl+'\', \''+lat+'\', \''+lon+'\');');
					}
					gemeindefill();
				}, function (tx, err) { 
	//				console.log("Rückgabe: "+tx.code+' '+tx.message); 
				} );
			}
		});
		gemeindefill();
	});
	
	// AKH-Daten updaten
//	console.log('AKH updaten');
	$.getJSON( 'http://erstikalender.info/akh2.json', function(json){
		dataImport(json,'akh'); 
	});
	generateSpecialData('akh','akh');
}

var gemeindefillBool = 0;
function gemeindefill(hBool) {
	if(hBool == null) { hBool = 0; }
	if(gemeindefillBool-hBool > 1 || hBool > 30) { return true; }
	if(hBool > 1 && gemeindefillBool-hBool < 1 ) { return true; }
	if(gemeindefillBool-hBool == 1) {
		gemeindefillBool++;
//		console.log('gemeindefill');
		window.setTimeout(function(){gemeindefill(hBool+1);}, 1000);
	}
	gemeindefillBool = 1;
	var kurzestrecke = 10000;
	var nextksg = '';
	//console.log('gemeindeliste füllen');
	db.transaction(function(tx) {
		tx.executeSql("SELECT id, kurz, ort, lat, lon FROM gemeinde ORDER BY ort", [], function(tx,rs) {
			$('#gemeindeliste').html('');
			for (var i = 0; i < rs.rows.length; i++) {
				var gemeinde = rs.rows.item(i);
				//console.log('gemeindeliste einfüllen:'+gemeinde.id);
				var strecke = entfernungBerechnen(gemeinde.lat,gemeinde.lon);
				$('#gemeindeliste').append($('<li/>').html($('<a/>').attr('href','#gemeinde').attr('data-gemeindeid',gemeinde.id).click(function(){setGemeinde($(this).data('gemeindeid'));}).html(gemeinde.kurz+' '+gemeinde.ort+' <span class="ui-li-count">'+strecke+'km</span>')));
				if(strecke < kurzestrecke) { 
					nextksg = gemeinde.id;
					kurzestrecke = strecke;
				}
				//console.log(gemeinde.id+': '+strecke+' km');
			}
			
			setGemeinde(nextksg,'main');
		});
		// Favoriten aufbauen
	}, function() { gemeindefillBool = 0; makeFavList();},function() { gemeindefillBool = 0; makeFavList();});
}

function setGemeinde(id,prefix) {
	if(!isset(prefix)) { prefix = "";}
	//console.log('gemeindedaten füllen');
	db.transaction(function(tx) {
		tx.executeSql("SELECT * FROM gemeinde WHERE id = '"+id+"'", [], function(tx,rs) {
			for (var i = 0; i < rs.rows.length; i++) {
				var gemeinde = rs.rows.item(i);
				$('#'+prefix+'gemeindename').html(gemeinde.lang);
				if(gemeinde.patron.length > 0) { $('#'+prefix+'gemeindename').append(' &bdquo;'+gemeinde.patron+'&ldquo;');}	
				$('#'+prefix+'gemeindeadresse').html('<strong>'+gemeinde.kurz+' '+gemeinde.ort+'</strong><br/>'+gemeinde.strasse+'<br/>'+gemeinde.plz+' '+gemeinde.ort);
				if(gemeinde.url !== null && gemeinde.url.length > 0) {
					$('#'+prefix+'gemeindeadresse').append('<br/><br/><a class="iconWWW" data-inline="true" data-role="button" target="_blank" href=\''+gemeinde.url+'\'>'+gemeinde.url.replace(/^http[s]?\:\/\/(www\.)?/gi, "")+'</a>');
				}
				$('#'+prefix+'gemeindebleiste_karte').attr('href','geo:'+gemeinde.lat+','+gemeinde.lon);
				if(gemeinde.configurl !== null && gemeinde.configurl.length > 0 && gemeinde.configurl !== 'null' ) { 
					$('#'+prefix+'gemeindebleiste_zusatz').attr('data-configurl',escape(gemeinde.configurl)).attr('data-prefix',escape(prefix)).attr('data-id',escape(id)).click(
						function(){
//							console.log($(this).data('configurl'));
							$.getJSON( unescape($(this).data('configurl')), 
								(function(thisprefix,thisid) {
									return function(data) {
										dataImport(data,thisid);
										setGemeinde(thisid, thisprefix);
									};
								}($(this).data('prefix'),$(this).data('id'))));
						}
					);
				}
				else {$('#'+prefix+'gemeindebleiste_zusatz').addClass('hidden');}
				$('#'+prefix+'gemeindebleiste_fav').attr('onclick','makeFav("'+gemeinde.id+'")');
				//$('#gemeindebleiste').html('<a href="geo:'+gemeinde.lat+','+gemeinde.lon+'" data-icon="map" data-role="button">Karte</a>');
			}
		});
		tx.executeSql("SELECT id FROM fav WHERE id = '"+id+"'" , [], function(tx,rs) {
			//console.log('Soviele gibt es: '+rs.rows.length);
			if(rs.rows.length == 0) {
				$('#'+prefix+'gemeindebleiste_fav').removeClass('ui-btn-active');
			}
			else {
				$('#'+prefix+'gemeindebleiste_fav').addClass('ui-btn-active');
			}
		});
	});
	generateSpecialData(id,prefix);
}

function makeFav(id) {
	db.transaction(function(tx) {
		tx.executeSql("SELECT id FROM fav WHERE id = '"+id+"'" , [], function(tx,rs) {
			//console.log('Soviele gibt es: '+rs.rows.length);
			if(rs.rows.length == 0) {
				db.transaction(function(tx) {
					//console.log('Erstelle Fav');
					tx.executeSql('INSERT INTO fav (id) values (\''+id+'\');');
					window.setTimeout(makeFavList, 500);
				});
			}
			else {
				db.transaction(function(tx) {
					//console.log('Lösche Fav');
					tx.executeSql('DELETE FROM fav WHERE id = \''+id+'\';');
					window.setTimeout(makeFavList, 500);
				}, function (tx, err) { 
					//console.log("Rückgabe: "+tx.code+' '+tx.message); 
				});
			}
		});
	});
}

var FavListBool = 0;
function makeFavList(hBool) {
	if(hBool == null) { hBool = 0; }
	if(FavListBool-hBool > 1 || hBool > 30) { return true; }
	if(hBool > 1 && FavListBool-hBool < 1 ) { return true; }
	if(FavListBool-hBool == 1) {
		FavListBool++;
//		console.log('favlist');
		window.setTimeout(function(){makeFavList(hBool+1);}, 1000);
	}
	FavListBool = 1;
	db.transaction(function(tx) {
		tx.executeSql("SELECT id FROM fav ORDER BY id" , [], function(tx,rs) {
			//console.log('Soviele gibt es: '+rs.rows.length);
			for(var i = 0; i < rs.rows.length; i++) {
				var favgemeinde = rs.rows.item(i);
				//console.log('fav: '+favgemeinde.id);
				$('#fav_gemeindeliste').html('');
				tx.executeSql("SELECT * FROM gemeinde WHERE id = ?;", [favgemeinde.id], function(tx2,rs2) {
					for (var j = 0; j < rs2.rows.length; j++) {
						var gemeinde = rs2.rows.item(j);
						//console.log('gemeindeliste einfüllen:'+gemeinde.id);
						var strecke = entfernungBerechnen(gemeinde.lat,gemeinde.lon);
						$('#fav_gemeindeliste').append($('<li/>').html($('<a/>').attr('href','#gemeinde').attr('data-gemeindeid',gemeinde.id).click(function(){setGemeinde($(this).data('gemeindeid'));}).html(gemeinde.kurz+' '+gemeinde.ort+' <span class="ui-li-count">'+strecke+'km</span>')));
						//console.log(gemeinde.id+': '+strecke+' km');
					}
				});
			}
		});
	}, function() { FavListBool = 0;},function() { FavListBool = 0;});
}

function entfernungBerechnen(lat2,lon2) {
	erdRadius = 6371; 
	meineLongitude = lon * (Math.PI/180);
	meineLatitude = lat * (Math.PI/180);
	lon2 = lon2 * (Math.PI/180);
	lat2 = lat2 * (Math.PI/180);
	x0 = meineLongitude * erdRadius * Math.cos(meineLatitude);
	y0 = meineLatitude * erdRadius;
	x1 = lon2 * erdRadius * Math.cos(lat2);
	y1 = lat2 * erdRadius;
	dx = x0 - x1;
	dy = y0 - y1;
	return Math.round(Math.sqrt((dx*dx) + (dy*dy)));
	return Math.round(d*10)/10;
};
/*
$(document).ready(function() {
	onDeviceReady();
	if(isset(custom_json)) {
//		console.log(custom_json); 
		dataImport(custom_json,'test');
	}
});
*/
app.initialize();
