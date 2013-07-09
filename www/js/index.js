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
var lat = 50;
var lon = 10;

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
		if((typeof data.additional != 'undefined')&&(data.additional.length > 0)) {
			if(typeof data.additional.url != 'undefined') { tx.executeSql("INSERT INTO additional (id,key,value) VALUES (?,?,?);", [id,'url',data.additional.url]); }
			if(typeof data.additional.facebook != 'undefined') { tx.executeSql("INSERT INTO additional (id,key,value) VALUES (?,?,?);",[id,'facebook',data.additional.facebook]); }
			if(typeof data.additional.twitter != 'undefined') { tx.executeSql("INSERT INTO additional (id,key,value) VALUES (?,?,?);",[id,'twitter',data.additional.twitter]); }
			if(typeof data.additional.google != 'undefined') { tx.executeSql("INSERT INTO additional (id,key,value) VALUES (?,?,?);",[id,'google',data.additional.google]); }
			if(typeof data.additional.logo != 'undefined') { tx.executeSql("INSERT INTO additional (id,key,value) VALUES (?,?,?);",[id,'logo',data.additional.logo]); }
		}
		
		// Ansprechpartner
		if((typeof data.people != 'undefined')&&(data.people.length > 0)) {
			for(var i = 0; i < data.people.length; i++) {
				var people = data.people[i];
				if(typeof people.name != 'undefined') {
					var name = people.name;
					var adresse = (typeof people.adresse != 'undefined') ? people.adresse : null;
					var lat = (typeof people.lat != 'undefined') ? people.lat : null;
					var lon = (typeof people.lon != 'undefined') ? people.lon : null;
					var email = (typeof people.mail != 'undefined') ? people.mail : null;
					var tel = (typeof people.tel != 'undefined') ? people.tel : null;
					var fax = (typeof people.fax != 'undefined') ? people.fax : null;
					var facebook = (typeof people.facebook != 'undefined') ? people.facebook : null;
					var twitter = (typeof people.twitter != 'undefined') ? people.twitter : null;
					var google = (typeof people.google != 'undefined') ? people.google : null;
					var mobil = (typeof people.mobil != 'undefined') ? people.mobil : null;
					var pic = (typeof people.pic != 'undefined') ? people.pic : null;
					var title = (typeof people.title != 'undefined') ? people.title : null;
					var desc = (typeof people.desc != 'undefined') ? people.desc : null;
					tx.executeSql("INSERT INTO people (id,name,adresse,lat,lon,email,telefon,fax,mobil,facebook,twitter,google,pic,position,desc) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);",[id,name,adresse,lat,lon,email,tel,fax,mobil,facebook,twitter,google,pic,title,desc]);
				}
			}
		}
		
		// Veranstaltungen
		if((typeof data.event != 'undefined')&&(data.event.length > 0)) {
			for(var i = 0; i < data.event.length; i++) {
				var event = data.event[i];
				if((typeof event.title != 'undefined')&&(typeof event.dtstart != 'undefined')) {
					var title = event.title;
					var dtstart = event.dtstart;
					var dtend = (typeof event.dtend != 'undefined') ? event.dtend : event.dtstart;
					var recurrence = (typeof event.recurrence != 'undefined') ? event.recurrence : null;
					var rend = (typeof event.rend != 'undefined') ? event.rend : event.dtstart;
					var desc = (typeof event.desc != 'undefined') ? event.desc : null;
					var costs = (typeof event.costs != 'undefined') ? event.costs : null;
					var url = (typeof event.url != 'undefined') ? event.url : null;
					var pic = (typeof event.pic != 'undefined') ? event.pic : null;
					var facebook = (typeof event.facebook != 'undefined') ? event.facebook : null;
					var google = (typeof event.google != 'undefined') ? event.google : null;
					var adress = (typeof event.adress != 'undefined') ? event.adress : null;
					var summary = (typeof event.summary != 'undefined') ? event.summary : null;
					var lat = (typeof event.lat != 'undefined') ? event.lat : null;
					var lon = (typeof event.lon != 'undefined') ? event.lon : null;
					var jetzt = new Date();
					//console.log([id,id+"-"+i,title,summary,adress,lat,lon,facebook,google,pic,url,costs,0,dtstart,dtend,recurrence,rend,jetzt.getTime()]);
					if((jetzt.getTime() < dtend*1000)||(jetzt.getTime() < rend*1000)||((typeof event.recurrence != 'undefined')&&(typeof event.rend == 'undefined'))) {
						console.log('insert into db');
						tx.executeSql("INSERT INTO event (id, eid, title, summary, adress, lat, lon, facebook, google, pic, url, costs, subevent, dtstart, dtend, recurrence, rend) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);",[id,id+"-"+i,title,summary,adress,lat,lon,facebook,google,pic,url,costs,'root',dtstart,dtend,recurrence,rend]);
						if((typeof event.subevent != 'undefined')&&(event.subevent.length>0)) {
							for(var j = 0; j < event.subevent.length; j++) {
								var subevent = event.subevent[j];
								if((typeof subevent.title != 'undefined')&&(typeof subevent.dtstart != 'undefined')) {
									var stitle = subevent.title;
									var sdtstart = subevent.dtstart;
									var sdtend = (typeof subevent.dtend != 'undefined') ? subevent.dtend : subevent.dtstart;
									var srecurrence = (typeof subevent.recurrence != 'undefined') ? subevent.recurrence : null;
									var srend = (typeof subevent.rend != 'undefined') ? subevent.rend : subevent.dtstart;
									var sdesc = (typeof subevent.desc != 'undefined') ? subevent.desc : null;
									var scosts = (typeof subevent.costs != 'undefined') ? subevent.costs : null;
									var surl = (typeof subevent.url != 'undefined') ? subevent.url : null;
									var spic = (typeof subevent.pic != 'undefined') ? subevent.pic : null;
									var sfacebook = (typeof subevent.facebook != 'undefined') ? subevent.facebook : null;
									var sgoogle = (typeof subevent.google != 'undefined') ? subevent.google : null;
									var sadress = (typeof subevent.adress != 'undefined') ? subevent.adress : null;
									var ssummary = (typeof subevent.summary != 'undefined') ? subevent.summary : null;
									var slat = (typeof subevent.lat != 'undefined') ? subevent.lat : null;
									var slon = (typeof subevent.lon != 'undefined') ? subevent.lon : null;
									if((jetzt.getTime() < sdtend*1000)||(jetzt.getTime() < srend*1000)||((typeof subevent.recurrence != 'undefined')&&(typeof subevent.rend == 'undefined'))) {
										tx.executeSql("INSERT INTO event (id, eid, title, summary, adress, lat, lon, facebook, google, pic, url, costs, subevent, dtstart, dtend, recurrence, rend) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);",[id,id+"-"+i+"-"+j,stitle,ssummary,sadress,slat,slon,sfacebook,sgoogle,spic,surl,scosts,id+"-"+i,sdtstart,sdtend,srecurrence,srend]);
									}
								}
							}
						}
					}
				}
			}
		}
		
		// Orte
		if((typeof data.place != 'undefined')&&(data.place.length > 0)) {
			for(var i = 0; i < data.place.length; i++) {
				var place = data.place[i];
				if (typeof place.name != 'undefined') {
					var name = place.name;
					var adresse = (typeof place.adresse != 'undefined') ? place.adresse : null;
					var lat = (typeof place.lat != 'undefined') ? place.lat : null;
					var lon = (typeof place.lon != 'undefined') ? place.lon : null;
					var email = (typeof place.email != 'undefined') ? place.email : null;
					var telefon = (typeof place.telefon != 'undefined') ? place.telefon : null;
					var fax = (typeof place.fax != 'undefined') ? place.fax : null;
					var pic = (typeof place.pic != 'undefined') ? place.pic : null;
					var desc = (typeof place.desc != 'undefined') ? place.desc : null;
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
}

function onDeviceReady() {
	// Geo-Daten
	//console.log('Position ermitteln');
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
					for(var i = 0; i < global_json.gemeinde.length; i++) {
	//					console.log('Daten für: '+global_json.gemeinde[i].id);
						var gemeinde = global_json.gemeinde[i];
						var id = (typeof gemeinde.id != 'undefined') ? gemeinde.id : "";
						var kurz = (typeof gemeinde.kurz != 'undefined') ? gemeinde.kurz : "";
						var lang = (typeof gemeinde.lang != 'undefined') ? gemeinde.lang : "";
						var strasse = (typeof gemeinde.strasse != 'undefined') ? gemeinde.strasse : "";
						var ort = (typeof gemeinde.ort != 'undefined') ? gemeinde.ort : "";
						var plz = (typeof gemeinde.plz != 'undefined') ? gemeinde.plz : "";
						var patron = (typeof gemeinde.patron != 'undefined') ? gemeinde.patron : "";
						var url = (typeof gemeinde.url != 'undefined') ? gemeinde.url : "";
						var configurl = (typeof gemeinde.configurl != 'undefined') ? gemeinde.configurl : "";
						var lat = (typeof gemeinde.lat != 'undefined') ? gemeinde.lat : "";
						var lon = (typeof gemeinde.lon != 'undefined') ? gemeinde.lon : "";
					
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
		if(typeof value.pic != 'undefined') { pcontent.append('<div><img src=\''+value.pic+'\' style="float:left;max-width:50%;max-height:150px;" /></div>'); }
		if((typeof value.tel != 'undefined')||(typeof value.mail != 'undefined')) {
			var pc = $('<p/>');
			if(typeof value.tel != 'undefined') { pc.append('<a class="iconTel" data-inline="true" data-role="button" href=\'tel:'+value.tel+'\'>'+value.tel+'</a></div>'); }
			if(typeof value.mail != 'undefined') { pc.append('<a class="iconMail" data-inline="true" data-role="button" href=\'mailto:'+value.mail+'\'>'+value.mail+'</a></div></p>'); }
			pcontent.append(pc);
		}
		$('#akh_people').append(pcontent);
	});
	$.each(json.event, function(index, value) {
		//console.log(value.title+' '+value.dtstart);
		var d = new Date(value.dtstart);
		var pcontent = $('<div/>').attr('data-role',"collapsible").html('<h3>'+value.title+' ('+d.getDate()+'.'+d.getMonth()+'.'+d.getFullYear()+')</h3>');
		if(typeof value.pic != 'undefined') { pcontent.append('<div><img src=\''+value.pic+'\' style="float:left;max-width:50%;max-height:150px;" /></div>'); }
		if(typeof value.desc != 'undefined') { pcontent.append('<p>'+value.desc+'</p>'); }
		if((typeof value.adress != 'undefined')&&(typeof value.lat != 'undefined')&&(typeof value.lon != 'undefined')) {
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