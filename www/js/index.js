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

dataImport = function(data,id) {
	console.log(id + " ZusatzdatenImport");
	//console.log(data);
	db.transaction(function(tx) {
		// alte Daten löschen
		tx.executeSql('DELETE FROM event WHERE id = \''+id+'\';');
		tx.executeSql('DELETE FROM people WHERE id = \''+id+'\';');
		tx.executeSql('DELETE FROM additional WHERE id = \''+id+'\';');
		tx.executeSql('DELETE FROM place WHERE id = \''+id+'\';');
		
		// Zusatzdaten
		if(isset(data.additional) && data.additional.length > 0) {
			if(isset(data.additional.url)) { tx.executeSql("INSERT INTO additional (id,key,value) VALUES (?,?,?);", [id,'url',htmlentities(data.additional.url)]); }
			if(isset(data.additional.facebook)) { tx.executeSql("INSERT INTO additional (id,key,value) VALUES (?,?,?);",[id,'facebook',htmlentities(data.additional.facebook)]); }
			if(isset(data.additional.twitter)) { tx.executeSql("INSERT INTO additional (id,key,value) VALUES (?,?,?);",[id,'twitter',htmlentities(data.additional.twitter)]); }
			if(isset(data.additional.google)) { tx.executeSql("INSERT INTO additional (id,key,value) VALUES (?,?,?);",[id,'google',htmlentities(data.additional.google)]); }
			if(isset(data.additional.logo)) { tx.executeSql("INSERT INTO additional (id,key,value) VALUES (?,?,?);",[id,'logo',htmlentities(data.additional.logo)]); }
		}
		
		// Ansprechpartner
		if(isset(data.people) && (data.people.length > 0)) {
			for(var i = 0; i < data.people.length; i++) {
				var people = data.people[i];
				if(isset(people.name)) {
					var name = htmlentities(people.name);
					var adresse = isset(people.adresse) ? htmlentities(people.adresse) : null;
					var lat = isset(people.lat) ? htmlentities(people.lat) : null;
					var lon = isset(people.lon) ? htmlentities(people.lon) : null;
					var email = isset(people.mail) ? htmlentities(people.mail) : null;
					var tel = isset(people.tel) ? htmlentities(people.tel) : null;
					var fax = isset(people.fax) ? htmlentities(people.fax) : null;
					var facebook = isset(people.facebook) ? htmlentities(people.facebook) : null;
					var twitter = isset(people.twitter) ? htmlentities(people.twitter) : null;
					var google = isset(people.google) ? htmlentities(people.google) : null;
					var mobil = isset(people.mobil) ? htmlentities(people.mobil) : null;
					var pic = isset(people.pic) ? htmlentities(people.pic) : null;
					var title = isset(people.title) ? htmlentities(people.title) : null;
					var desc = isset(people.desc) ? htmlentities(people.desc) : null;
					if(isset(people.dend)) {
						var now = new Date();
						if(now > people.dend*1000) { continue; }
					}
					tx.executeSql("INSERT INTO people (id,name,adresse,lat,lon,email,telefon,fax,mobil,facebook,twitter,google,pic,position,desc) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);",[id,name,adresse,lat,lon,email,tel,fax,mobil,facebook,twitter,google,pic,title,desc]);
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
					var recurrence = isset(event.recurrence) ? event.recurrence : null;
					var rend = isset(event.rend) ? event.rend : event.dtstart;
					var desc = isset(event.desc) ? htmlentities(event.desc) : null;
					var costs = isset(event.costs) ? htmlentities(event.costs) : null;
					var url = isset(event.url) ? htmlentities(event.url) : null;
					var pic = isset(event.pic) ? htmlentities(event.pic) : null;
					var facebook = isset(event.facebook) ? htmlentities(event.facebook) : null;
					var google = isset(event.google) ? htmlentities(event.google) : null;
					var adress = isset(event.adress) ? htmlentities(event.adress) : null;
					var summary = isset(event.summary) ? htmlentities(event.summary) : null;
					var lat = isset(event.lat) ? htmlentities(event.lat) : null;
					var lon = isset(event.lon) ? htmlentities(event.lon) : null;
					var jetzt = new Date();
					//console.log([id,id+"-"+i,title,summary,adress,lat,lon,facebook,google,pic,url,costs,0,dtstart,dtend,recurrence,rend,jetzt.getTime()]);
					if((jetzt.getTime() < dtend*1000)||(jetzt.getTime() < rend*1000)||(isset(event.recurrence)&&!isset(event.rend))) {
						console.log('insert into db');
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
									var sfacebook = isset(subevent.facebook) ? htmlentities(subevent.facebook) : null;
									var sgoogle = isset(subevent.google) ? htmlentities(subevent.google) : null;
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
				if (isset(place.name)) {
					var name = htmlentities(place.name);
					var adresse = isset(place.adresse) ? htmlentities(place.adresse) : null;
					var lat = isset(place.lat) ? htmlentities(place.lat) : null;
					var lon = isset(place.lon) ? htmlentities(place.lon) : null;
					var email = isset(place.email) ? htmlentities(place.email) : null;
					var telefon = isset(place.telefon) ? htmlentities(place.telefon) : null;
					var fax = isset(place.fax) ? htmlentities(place.fax) : null;
					var pic = isset(place.pic) ? htmlentities(place.pic) : null;
					var desc = isset(place.desc) ? htmlentities(place.desc) : null;
					tx.executeSql("INSERT INTO place (id,name,adresse,lat,lon,email,telefon,fax,pic,position,desc) VALUES (?,?,?,?,?,?,?,?,?,?,?);",[id,name,adresse,lat,lon,email,telefon,fax,pic,desc]);
				}
			}
		}
	}, function (tx, err) { 
		console.log("Rückgabe: "+tx.code+' '+tx.message); 
	});
}

function generateSpecialData(id,prefix) {
	db.transaction(function(tx) {
		// Zusatzdaten
		tx.executeSql("SELECT * FROM additional WHERE id = '"+id+"'" , [], function(tx,rs) {
			$("#"+prefix+"zusatz").html("");
			for (var i = 0; i < rs.rows.length; i++) {
				var zusatz = rs.rows.item(i);
				if(zusatz.key == 'facebook') {
					var facebook = $('<a/>').attr('href',zusatz.value).attr('class','CustomIconButton').attr('data-role',"button").html('f');
					$("#"+prefix+"zusatz").append(facebook);
				}
				if(zusatz.key == 'google') {
					var facebook = $('<a/>').attr('href',zusatz.value).attr('class','CustomIconButton').attr('data-role',"button").html('g');
					$("#"+prefix+"zusatz").append(facebook);
				}
				if(zusatz.key == 'twitter') {
					var facebook = $('<a/>').attr('href',zusatz.value).attr('class','CustomIconButton').attr('data-role',"button").html('t');
					$("#"+prefix+"zusatz").append(facebook);
				}
			}
		});
		// Veranstaltungen
		tx.executeSql("SELECT * FROM event WHERE id = '"+id+"' AND subevent = 'root';" , [], function(tx,rs) {
			console.log(rs.rows);
			if(rs.rows.length>0) {
				// Collapse Menü erstellen
				var cmenu = $('<div/>').attr('data-role',"collapsible").append($('<h3>').html('Veranstaltungen'));
				for (var i = 0; i < rs.rows.length; i++) {
					var event = rs.rows.item(i);
					var d = new Date(event.dtstart*1000);
					var pcontent = $('<div/>').attr('data-role',"collapsible").attr('id',prefix+'-'+event.eid);
					if((d.getHours()==0)&&(d.getMinutes()==0)) {
						pcontent.html('<h3>'+event.title+' ('+(d.getDate() < 10 ? '0' + d.getDate() : d.getDate())+'.'+(d.getMonth() < 10 ? '0' + d.getMonth() : d.getMonth())+'.'+d.getFullYear()+')</h3>');
					}
					else {
						pcontent.html('<h3>'+event.title+' ('+(d.getDate() < 10 ? '0' + d.getDate() : d.getDate())+'.'+(d.getMonth() < 10 ? '0' + d.getMonth() : d.getMonth())+'.'+d.getFullYear()+' '+(d.getHours() < 10 ? '0' + d.getHours() : d.getHours())+":"+(d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes())+')</h3>');
					}
					if((event.pic!=null)&&(event.pic.length>0)) { pcontent.append('<div><img src=\''+event.pic+'\' style="float:left;max-width:50%;max-height:150px;" /></div>'); }
					if((event.summary != null)&&(event.summary.length > 0)) { pcontent.append('<p>'+event.summary+'</p>'); }
					if((event.adress!=null)&&(event.adress.length>0)&&(event.lat!=0)&&(event.lon!=0)) {
						var pc = $('<a class="iconPlace" data-inline="true" data-role="button" href="geo:'+event.lat+','+event.lon+';u='+event.adress+'">'+event.adress+'</a>');
						pcontent.append(pc);
					}
					if((event.url!=null)&&(event.url.length>0)) {
						var pc = $('<a class="iconWWW" data-inline="true" data-role="button" href="'+event.url+'">'+event.url.replace(/^http[s]?\:\/\/(www\.)?/gi, "")+'</a>');
						pcontent.append(pc);
					}
					if((event.facebook!=null)&&(event.facebook.length>0)) {
						var pc = $('<a class="iconFacebook" data-inline="true" data-role="button" href="'+event.facebook+'"> </a>');
						pcontent.append(pc);
					}
					if((event.google!=null)&&(event.google.length>0)) {
						var pc = $('<a class="iconGoogle" data-inline="true" data-role="button" href="'+event.google+'"> </a>');
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
							for (var j = 0; j < rs2.rows.length; j++) {
								var sevent = rs2.rows.item(j);
								var d = new Date(sevent.dtstart*1000);
								var spcontent = $('<div/>').attr('data-role',"collapsible");
								if((d.getHours()==0)&&(d.getMinutes()==0)) {
									spcontent.html('<h3>'+sevent.title+' ('+(d.getDate() < 10 ? '0' + d.getDate() : d.getDate())+'.'+(d.getMonth() < 10 ? '0' + d.getMonth() : d.getMonth())+'.'+d.getFullYear()+')</h3>');
								}
								else {
									spcontent.html('<h3>'+sevent.title+' ('+(d.getDate() < 10 ? '0' + d.getDate() : d.getDate())+'.'+(d.getMonth() < 10 ? '0' + d.getMonth() : d.getMonth())+'.'+d.getFullYear()+' '+(d.getHours() < 10 ? '0' + d.getHours() : d.getHours())+":"+(d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes())+')</h3>');
								}
								if((sevent.pic!=null)&&(sevent.pic.length>0)) { spcontent.append('<div><img src=\''+sevent.pic+'\' style="float:left;max-width:50%;max-height:150px;" /></div>'); }
								if((sevent.summary!=null)&&(sevent.summary.length>0)) { spcontent.append('<p>'+sevent.summary+'</p>'); }
								console.log(sevent);
								if((sevent.adress!=null)&&(sevent.adress.length>0)&&(sevent.lat!=0)&&(sevent.lon!=0)) {
									console.log("ORT: "+sevent.adress);
									var pc = $('<div><a class="iconPlace" data-inline="true" data-role="button" href="geo:'+sevent.lat+','+sevent.lon+';u='+sevent.adress+'">'+sevent.adress+'</a></div>');
									spcontent.append(pc);
								}
								if((sevent.url!=null)&&(sevent.url.length>0)) {
									var pc = $('<a class="iconWWW" data-inline="true" data-role="button" href="'+sevent.url+'">'+sevent.url.replace(/^http[s]?\:\/\/(www\.)?/gi, "")+'</a>');
									spcontent.append(pc);
								}
								if((sevent.facebook!=null)&&(sevent.facebook.length>0)) {
									var pc = $('<a class="iconFacebook" data-inline="true" data-role="button" href="'+sevent.facebook+'"> </a>');
									spcontent.append(pc);
								}
								if((sevent.google!=null)&&(sevent.google.length>0)) {
									var pc = $('<a class="iconGoogle" data-inline="true" data-role="button" href="'+sevent.google+'"> </a>');
									spcontent.append(pc);
								}
								if((sevent.costs!=null)&&(sevent.costs>0)) {
									var pc = $('<a class="iconCosts" data-inline="true" data-role="button">'+sevent.costs+'&euro;</a>');
									spcontent.append(pc);
								}
								$('#'+prefix+'-'+event.eid+' > div.ui-collapsible-content').append(spcontent);
								if((sevent.pic!=null)&&(sevent.pic.length>0)) { $('#'+prefix+'-'+event.eid+' > div.ui-collapsible-content').append($('<br style="clear:both;" />')); }
							}
							$('#'+prefix+'-'+event.eid).trigger( "create" );
						}
					});
					cmenu.append(pcontent);
				}
				console.log('#'+prefix+'_event');
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
						var pc = $('<a class="iconPlace" data-inline="true" data-role="button" href="geo:'+people.lat+','+people.lon+';u='+people.adress+'">'+people.adress+'</a>');
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
						var pc = $('<a class="iconFacebook" data-inline="true" data-role="button" href="'+people.facebook+'"> </a>');
						pcontent.append(pc);
					}
					if((people.google!=null)&&(people.google.length>0)) {
						var pc = $('<a class="iconGoogle" data-inline="true" data-role="button" href="'+people.google+'"> </a>');
						pcontent.append(pc);
					}
					if((people.pic!=null)&&(people.pic.length>0)) { pcontent.append($('<br style="clear:both;" />')); }
					cmenu.append(pcontent);
				}
				console.log('#'+prefix+'_people');
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
	console.log('lat: '+lat);
	gemeindefill();
}

function onDeviceReady() {
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
		tx.executeSql('CREATE TABLE IF NOT EXISTS dataInfo (id TEXT PRIMARY KEY, data TEXT)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS gemeinde (id TEXT PRIMARY KEY, kurz TEXT NOT NULL, lang TEXT NOT NULL, strasse TEXT NOT NULL, ort TEXT NOT NULL, plz TEXT NOT NULL, patron TEXT, url TEXT, configurl TEXT, lat REAL, lon REAL)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS fav (id TEXT PRIMARY KEY)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS place (id TEXT NOT NULL, name TEXT NOT NULL, adresse TEXT, lat REAL, lon REAL, email TEXT, telefon TEXT, fax TEXT, pic TEXT, desc TEXT)');
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
					console.log(global_json);
					for(var i = 0; i < global_json.gemeinde.length; i++) {
						var gemeinde = global_json.gemeinde[i];
						if(!isset(gemeinde)) { console.log(i+': unset'); continue;}
						var id = isset(gemeinde.id) ? gemeinde.id : "";
						var kurz = isset(gemeinde.kurz) ? gemeinde.kurz : "";
						var lang = isset(gemeinde.lang) ? gemeinde.lang : "";
						var strasse = isset(gemeinde.strasse) ? gemeinde.strasse : "";
						var ort = isset(gemeinde.ort) ? gemeinde.ort : "";
						var plz = isset(gemeinde.plz) ? gemeinde.plz : "";
						var patron = isset(gemeinde.patron) ? gemeinde.patron : "";
						var url = isset(gemeinde.url) ? gemeinde.url : "";
						var configurl = isset(gemeinde.configurl) ? gemeinde.configurl : "";
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
	console.log('AKH updaten');
	$.getJSON( 'http://erstikalender.info/akh2.json', function(json){
		dataImport(json,'akh'); 
	});
	generateSpecialData('akh','akh');
}

function gemeindefill() {
	var kurzestrecke = 10000;
	var nextksg = '';
	$('#gemeindeliste').html('');
	//console.log('gemeindeliste füllen');
	db.transaction(function(tx) {
		tx.executeSql("SELECT id, kurz, ort, lat, lon FROM gemeinde ORDER BY ort", [], function(tx,rs) {
			for (var i = 0; i < rs.rows.length; i++) {
				var gemeinde = rs.rows.item(i);
				//console.log('gemeindeliste einfüllen:'+gemeinde.id);
				var strecke = entfernungBerechnen(gemeinde.lat,gemeinde.lon);
				$('#gemeindeliste').append('<li><a href="#gemeinde" onclick="setGemeinde(\''+gemeinde.id+'\')">'+gemeinde.kurz+' '+gemeinde.ort+' <span class="ui-li-count">'+strecke+'km</span></a></li>');
				if(strecke < kurzestrecke) { 
					nextksg = gemeinde.id;
					kurzestrecke = strecke;
				}
				//console.log(gemeinde.id+': '+strecke+' km');
			}
			//console.log('gemeindedaten füllen');
			tx.executeSql("SELECT * FROM gemeinde WHERE id = '"+nextksg+"'", [], function(tx,rs) {
				for (var i = 0; i < rs.rows.length; i++) {
					var gemeinde = rs.rows.item(i);
					$('#maingemeindename').html(gemeinde.lang);
					if(gemeinde.patron.length > 0) { $('#maingemeindename').append(' &bdquo;'+gemeinde.patron+'&ldquo;');}
					$('#maingemeindeadresse').html('<strong>'+gemeinde.kurz+' '+gemeinde.ort+'</strong><br/>'+gemeinde.strasse+'<br/>'+gemeinde.plz+' '+gemeinde.ort+'<br/><br/><a href=\''+gemeinde.url+'\'>'+gemeinde.url+'</a>');
					$('#maingemeindebleiste_karte').attr('href','geo:'+gemeinde.lat+','+gemeinde.lon+';u='+$('#maingemeindename').html());
					if(gemeinde.configurl.length > 0 ) { $('#maingemeindebleiste_zusatz').attr('onclick',''); }
					else {$('#maingemeindebleiste_zusatz').addClass('hidden');}
					$('#maingemeindebleiste_fav').attr('onclick','makeFav("'+gemeinde.id+'")');
					//$('#gemeindebleiste').html('<a href="geo:'+gemeinde.lat+','+gemeinde.lon+'" data-icon="map" data-role="button">Karte</a>');
				}
			});
			tx.executeSql("SELECT id FROM fav WHERE id = '"+nextksg+"'" , [], function(tx,rs) {
				//console.log('Soviele gibt es: '+rs.rows.length);
				if(rs.rows.length == 0) {
					$('#maingemeindebleiste_fav').removeClass('ui-btn-active');
				}
				else {
					$('#maingemeindebleiste_fav').addClass('ui-btn-active');
				}
			});
		});
		// Favoriten aufbauen
		makeFavList();
	});
}

function setGemeinde(id) {
	//console.log('gemeindedaten füllen');
	db.transaction(function(tx) {
		tx.executeSql("SELECT * FROM gemeinde WHERE id = '"+id+"'", [], function(tx,rs) {
			for (var i = 0; i < rs.rows.length; i++) {
				var gemeinde = rs.rows.item(i);
				$('#gemeindename').html(gemeinde.lang);
				if(gemeinde.patron.length > 0) { $('#gemeindename').append(' &bdquo;'+gemeinde.patron+'&ldquo;');}	
				$('#gemeindeadresse').html('<strong>'+gemeinde.kurz+' '+gemeinde.ort+'</strong><br/>'+gemeinde.strasse+'<br/>'+gemeinde.plz+' '+gemeinde.ort+'<br/><br/><a href=\''+gemeinde.url+'\'>'+gemeinde.url+'</a>');
				$('#gemeindebleiste_karte').attr('href','geo:'+gemeinde.lat+','+gemeinde.lon+';u='+$('#gemeindename').html());
				if(gemeinde.configurl.length > 0 ) { $('#gemeindebleiste_zusatz').attr('onclick',''); }
				else {$('#gemeindebleiste_zusatz').addClass('hidden');}
				$('#gemeindebleiste_fav').attr('onclick','makeFav("'+gemeinde.id+'")');
				//$('#gemeindebleiste').html('<a href="geo:'+gemeinde.lat+','+gemeinde.lon+'" data-icon="map" data-role="button">Karte</a>');
			}
		});
		tx.executeSql("SELECT id FROM fav WHERE id = '"+id+"'" , [], function(tx,rs) {
			//console.log('Soviele gibt es: '+rs.rows.length);
			if(rs.rows.length == 0) {
				$('#gemeindebleiste_fav').removeClass('ui-btn-active');
			}
			else {
				$('#gemeindebleiste_fav').addClass('ui-btn-active');
			}
		});
	});
}

function makeFav(id) {
	db.transaction(function(tx) {
		tx.executeSql("SELECT id FROM fav WHERE id = '"+id+"'" , [], function(tx,rs) {
			//console.log('Soviele gibt es: '+rs.rows.length);
			if(rs.rows.length == 0) {
				db.transaction(function(tx) {
					//console.log('Erstelle Fav');
					tx.executeSql('INSERT INTO fav (id) values (\''+id+'\');');
					makeFavList();
				});
			}
			else {
				db.transaction(function(tx) {
					//console.log('Lösche Fav');
					tx.executeSql('DELETE FROM fav WHERE id = \''+id+'\';');
					makeFavList();
				}, function (tx, err) { 
					//console.log("Rückgabe: "+tx.code+' '+tx.message); 
				});
			}
		});
	});
}

function makeFavList() {
	$('#fav_content').html('');
	db.transaction(function(tx) {
		tx.executeSql("SELECT id FROM fav ORDER BY id" , [], function(tx,rs) {
			//console.log('Soviele gibt es: '+rs.rows.length);
			for(var i = 0; i < rs.rows.length; i++) {
				var favgemeinde = rs.rows.item(i);
				//console.log('fav: '+favgemeinde.id);
				tx.executeSql("SELECT * FROM gemeinde WHERE id = '"+favgemeinde.id+"'", [], function(tx2,rs2) {
					for (var j = 0; j < rs2.rows.length; j++) {
						var g = rs2.rows.item(j);
						//console.log('fav: '+g.id);
						var title = $('<h2/>').html(g.kurz+' '+g.ort);
						var name = $('<h3/>').html(g.lang);
						if(g.patron.length > 0) { name.append(' &bdquo;'+g.patron+'&ldquo;');}
						var adresse = $('<p/>').html('<strong>'+g.kurz+' '+g.ort+'</strong><br/>'+g.strasse+'<br/>'+g.plz+' '+g.ort+'<br/><br/><a href=\''+g.url+'\'>'+g.url+'</a>');
						var geo = $('<a/>').attr('href','geo:'+g.lat+','+g.lon+';u='+name.html()).attr('class','CustomIconButton').attr('data-role',"button").html('p');
						var zdata = $('<a/>').attr('href','#').attr('class','CustomIconButton').attr('data-role',"button").html('i');
						if(g.configurl.length > 0 ) { zdata.attr('onclick',''); }
						else {zdata.addClass('hidden');}
						var fav = $('<a/>').attr('href','#').attr('class','CustomIconButton').attr('data-role',"button").addClass('ui-btn-active').html('s').click(function () {makeFav(g.id)});
						var bleiste = $('<div/>').attr('data-role',"controlgroup").attr('data-type','horizontal').append(geo).append(zdata).append(fav);
						var p = $('<p/>').append(name).append(adresse).append(bleiste);
						var collapsrow = $('<div/>').attr('data-role',"collapsible").append(title).append(p).addClass('favCollaps');
						$('#fav_content').append(collapsrow);
					}
					//console.log('refresh collaps');
					$('#fav_content').trigger( "create" );
				});
			}
		});
	});
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

function akhJSON1(json) {
	$('#akh_people').html('<h2>Ansprechpartner</h2>');
	$.each(json.people, function(index, value) {
		//console.log(value.name);
		var pcontent = $('<div/>').attr('data-role',"collapsible").html('<h3>'+value.name+' ('+value.title+')</h3>');
		if(isset(value.pic)) { pcontent.append('<div><img src=\''+value.pic+'\' style="float:left;max-width:50%;max-height:150px;" /></div>'); }
		if(isset(value.tel) || isset(value.mail)) {
			var pc = $('<p/>');
			if(isset(value.tel)) { pc.append('<a class="iconTel" data-inline="true" data-role="button" href=\'tel:'+value.tel+'\'>'+value.tel+'</a></div>'); }
			if(isset(value.mail)) { pc.append('<a class="iconMail" data-inline="true" data-role="button" href=\'mailto:'+value.mail+'\'>'+value.mail+'</a></div></p>'); }
			pcontent.append(pc);
		}
		$('#akh_people').append(pcontent);
	});
	$.each(json.event, function(index, value) {
		//console.log(value.title+' '+value.dtstart);
		var d = new Date(value.dtstart);
		var pcontent = $('<div/>').attr('data-role',"collapsible").html('<h3>'+value.title+' ('+d.getDate()+'.'+d.getMonth()+'.'+d.getFullYear()+')</h3>');
		if(isset(value.pic)) { pcontent.append('<div><img src=\''+value.pic+'\' style="float:left;max-width:50%;max-height:150px;" /></div>'); }
		if(isset(value.desc)) { pcontent.append('<p>'+value.desc+'</p>'); }
		if( isset(value.adress) && isset(value.lat)&& isset(value.lon)) {
			var pc = $('<div><a class="iconPlace" data-inline="true" data-role="button" href="geo:'+value.lat+','+value.lon+';u='+value.adress+'">'+value.adress+'</a></div>');
			pcontent.append(pc);
		}
		$('#akh_event').append(pcontent);
	});
	$('#akh_content').trigger( "create" );
}

/*
$(document).ready(function() {
onDeviceReady();
});
*/

app.initialize();