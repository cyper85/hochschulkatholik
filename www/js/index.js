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
	console.log('Position ermitteln');
	navigator.geolocation.getCurrentPosition(geolocationSuccess);
	
	// Datenbankverbindung
	console.log('Datenbankverbindung');
	db = window.openDatabase("kath", "1.0", "Sync Demo DB", 200000);
	console.log('Datenbankverbindung erledigt');
	
	$('#gemeindeliste').append('<li><a href="#">oh oh</a></li>');
	// Tabellen erstellen
	console.log('Tabellen erstellen');
	db.transaction(function(tx) {
	$('#gemeindeliste').append('<li><a href="#">oje</a></li>');
		tx.executeSql('CREATE TABLE IF NOT EXISTS dataInfo (id TEXT PRIMARY KEY, data TEXT)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS gemeinde (id TEXT PRIMARY KEY, kurz TEXT NOT NULL, lang TEXT NOT NULL, strasse TEXT NOT NULL, ort TEXT NOT NULL, plz TEXT NOT NULL, patron TEXT, url TEXT, configurl TEXT, lat REAL, lon REAL)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS akhVeranstaltung (id TEXT PRIMARY KEY, start INTEGER NOT NULL, ende TEXT NOT NULL, titel TEXT NOT NULL, adresse TEXT NOT NULL, beschreibung TEXT, foto TEXT, lat REAL, lon REAL)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS fav (id TEXT PRIMARY KEY)');
	});
	
	// Prüfe Datenversion
	console.log('Prüfe Datenversion');
	db.transaction(function(tx) {
		tx.executeSql("SELECT id FROM dataInfo WHERE id = 'version' AND data < 1" , [], function(tx,rs) {
			console.log('Soviele gibt es: '+rs.rows.length);
			if(rs.rows.length == 0) {
				console.log('Hole lokale JSON');
				//$.getScript('js/data.js');
				db.transaction(function(tx) {
					tx.executeSql('INSERT OR REPLACE INTO dataInfo (id, data) values (\'version\', \''+global_json.dataInfo.version+'\')');
					tx.executeSql('DROP TABLE gemeinde');
					tx.executeSql('CREATE TABLE gemeinde (id TEXT PRIMARY KEY, kurz TEXT NOT NULL, lang TEXT NOT NULL, strasse TEXT NOT NULL, ort TEXT NOT NULL, plz TEXT NOT NULL, patron TEXT, url TEXT, configurl TEXT, lat REAL, lon REAL)');
					for(var i = 0; i < global_json.gemeinde.length; i++) {
						console.log('Daten für: '+global_json.gemeinde[i].id);
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
					
						console.log('INSERT OR REPLACE INTO gemeinde (id, kurz, lang, strasse, ort, plz, patron, url, configurl, lat, lon) values (\''+id+'\', \''+kurz+'\', \''+lang+'\', \''+strasse+'\', \''+ort+'\', \''+plz+'\', \''+patron+'\', \''+url+'\', \''+configurl+'\', \''+lat+'\', \''+lon+'\');');
						tx.executeSql('INSERT OR REPLACE INTO gemeinde (id, kurz, lang, strasse, ort, plz, patron, url, configurl, lat, lon) values (\''+id+'\', \''+kurz+'\', \''+lang+'\', \''+strasse+'\', \''+ort+'\', \''+plz+'\', \''+patron+'\', \''+url+'\', \''+configurl+'\', \''+lat+'\', \''+lon+'\');');
					}
					gemeindefill();
				}, function (tx, err) { 
					console.log("Rückgabe: "+tx.code+' '+tx.message); 
				} );
			}
		});
		gemeindefill();
	});
}

function gemeindefill() {
	var kurzestrecke = 10000;
	var nextksg = '';
	$('#gemeindeliste').html('');
	console.log('gemeindeliste füllen');
	db.transaction(function(tx) {
		tx.executeSql("SELECT id, kurz, ort, lat, lon FROM gemeinde ORDER BY ort", [], function(tx,rs) {
			for (var i = 0; i < rs.rows.length; i++) {
				var gemeinde = rs.rows.item(i);
				console.log('gemeindeliste einfüllen:'+gemeinde.id);
				var strecke = entfernungBerechnen(gemeinde.lat,gemeinde.lon);
				$('#gemeindeliste').append('<li><a href="#gemeinde" onclick="setGemeinde(\''+gemeinde.id+'\')">'+gemeinde.kurz+' '+gemeinde.ort+' <span class="ui-li-count">'+strecke+'km</span></a></li>');
				if(strecke < kurzestrecke) { 
					nextksg = gemeinde.id;
					kurzestrecke = strecke;
				}
				console.log(gemeinde.id+': '+strecke+' km');
			}
			console.log('gemeindedaten füllen');
			tx.executeSql("SELECT * FROM gemeinde WHERE id = '"+nextksg+"'", [], function(tx,rs) {
				for (var i = 0; i < rs.rows.length; i++) {
					var gemeinde = rs.rows.item(i);
					$('#maingemeindename').html(gemeinde.lang);
					if(gemeinde.patron.length > 0) { $('#maingemeindename').append(' &bdquo;'+gemeinde.patron+'&ldquo;');}
					$('#maingemeindeadresse').html('<strong>'+gemeinde.kurz+' '+gemeinde.ort+'</strong><br/>'+gemeinde.strasse+'<br/>'+gemeinde.plz+' '+gemeinde.ort+'<br/><br/><a href=\''+gemeinde.url+'\'>'+gemeinde.url+'</a>');
					$('#maingemeindebleiste_karte').attr('href','geo:'+gemeinde.lat+','+gemeinde.lon);
					if(gemeinde.configurl.length > 0 ) { $('#maingemeindebleiste_zusatz').attr('onclick',''); }
					else {$('#maingemeindebleiste_zusatz').addClass('hidden');}
					$('#maingemeindebleiste_fav').attr('onclick','makeFav("'+gemeinde.id+'")');
					//$('#gemeindebleiste').html('<a href="geo:'+gemeinde.lat+','+gemeinde.lon+'" data-icon="map" data-role="button">Karte</a>');
				}
			});
			tx.executeSql("SELECT id FROM fav WHERE id = '"+nextksg+"'" , [], function(tx,rs) {
				console.log('Soviele gibt es: '+rs.rows.length);
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
	console.log('gemeindedaten füllen');
	db.transaction(function(tx) {
		tx.executeSql("SELECT * FROM gemeinde WHERE id = '"+id+"'", [], function(tx,rs) {
			for (var i = 0; i < rs.rows.length; i++) {
				var gemeinde = rs.rows.item(i);
				$('#gemeindename').html(gemeinde.lang);
				if(gemeinde.patron.length > 0) { $('#gemeindename').append(' &bdquo;'+gemeinde.patron+'&ldquo;');}	
				$('#gemeindeadresse').html('<strong>'+gemeinde.kurz+' '+gemeinde.ort+'</strong><br/>'+gemeinde.strasse+'<br/>'+gemeinde.plz+' '+gemeinde.ort+'<br/><br/><a href=\''+gemeinde.url+'\'>'+gemeinde.url+'</a>');
				$('#gemeindebleiste_karte').attr('href','geo:'+gemeinde.lat+','+gemeinde.lon);
				if(gemeinde.configurl.length > 0 ) { $('#gemeindebleiste_zusatz').attr('onclick',''); }
				else {$('#gemeindebleiste_zusatz').addClass('hidden');}
				$('#gemeindebleiste_fav').attr('onclick','makeFav("'+gemeinde.id+'")');
				//$('#gemeindebleiste').html('<a href="geo:'+gemeinde.lat+','+gemeinde.lon+'" data-icon="map" data-role="button">Karte</a>');
			}
		});
		tx.executeSql("SELECT id FROM fav WHERE id = '"+id+"'" , [], function(tx,rs) {
			console.log('Soviele gibt es: '+rs.rows.length);
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
			console.log('Soviele gibt es: '+rs.rows.length);
			if(rs.rows.length == 0) {
				db.transaction(function(tx) {
					console.log('Erstelle Fav');
					tx.executeSql('INSERT INTO fav (id) values (\''+id+'\');');
					makeFavList();
				});
			}
			else {
				db.transaction(function(tx) {
					console.log('Lösche Fav');
					tx.executeSql('DELETE FROM fav WHERE id = \''+id+'\';');
					makeFavList();
				}, function (tx, err) { 
					console.log("Rückgabe: "+tx.code+' '+tx.message); 
				});
			}
		});
	});
}

function makeFavList() {
	$('#fav_content').html('');
	db.transaction(function(tx) {
		tx.executeSql("SELECT id FROM fav ORDER BY id" , [], function(tx,rs) {
			console.log('Soviele gibt es: '+rs.rows.length);
			for(var i = 0; i < rs.rows.length; i++) {
				var favgemeinde = rs.rows.item(i);
				console.log('fav: '+favgemeinde.id);
					console.log('fav: '+favgemeinde.id);
					tx.executeSql("SELECT * FROM gemeinde WHERE id = '"+favgemeinde.id+"'", [], function(tx2,rs2) {
						for (var j = 0; j < rs2.rows.length; j++) {
							var g = rs2.rows.item(j);
							console.log('fav: '+g.id);
							var title = $('<h2/>').html(g.kurz+' '+g.ort);
							var name = $('<h3/>').html(g.lang);
							if(g.patron.length > 0) { name.append(' &bdquo;'+g.patron+'&ldquo;');}
							var adresse = $('<p/>').html('<strong>'+g.kurz+' '+g.ort+'</strong><br/>'+g.strasse+'<br/>'+g.plz+' '+g.ort+'<br/><br/><a href=\''+g.url+'\'>'+g.url+'</a>');
							var geo = $('<a/>').attr('href','geo:'+g.lat+','+g.lon).attr('class','CustomIconButton').attr('data-role',"button").html('p');
							var zdata = $('<a/>').attr('href','#').attr('class','CustomIconButton').attr('data-role',"button").html('i');
							if(g.configurl.length > 0 ) { zdata.attr('onclick',''); }
							else {zdata.addClass('hidden');}
							var fav = $('<a/>').attr('href','#').attr('class','CustomIconButton').attr('data-role',"button").addClass('ui-btn-active').html('s').click(function () {makeFav(g.id)});
							var bleiste = $('<div/>').attr('data-role',"controlgroup").attr('data-type','horizontal').append(geo).append(zdata).append(fav);
							var p = $('<p/>').append(name).append(adresse).append(bleiste);
							var collapsrow = $('<div/>').attr('data-role',"collapsible").append(title).append(p).addClass('favCollaps');
							$('#fav_content').append(collapsrow);
						}
						console.log('refresh collaps');
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

function akhJSON(json) {
	$('#akh_people').html('<h2>Ansprechpartner</h2>');
	$.each(json.people, function(index, value) {
		console.log(value.name);
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
		console.log(value.title+' '+value.dtstart);
		var d = new Date(value.dtstart);
		var pcontent = $('<div/>').attr('data-role',"collapsible").html('<h3>'+value.title+' ('+d.getDate()+'.'+d.getMonth()+'.'+d.getFullYear()+')</h3>');
		if(typeof value.pic != 'undefined') { pcontent.append('<div><img src=\''+value.pic+'\' style="float:left;max-width:50%;max-height:150px;" /></div>'); }
		if(typeof value.desc != 'undefined') { pcontent.append('<p>'+value.desc+'</p>'); }
		if((typeof value.adress != 'undefined')&&(typeof value.lat != 'undefined')&&(typeof value.lon != 'undefined')) {
			var pc = $('<div><a class="iconPlace" data-inline="true" data-role="button" href="geo:'+value.lat+','+value.lon+'">'+value.adress+'</a></div>');
			pcontent.append(pc);
		}
		$('#akh_event').append(pcontent);
	});
	$('#akh_content').trigger( "create" );
}

$(document).ready(function() {
onDeviceReady();
});

app.initialize();