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

function onDeviceReady() {
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
	$('#gemeindeliste').html('');
	console.log('gemeindeliste füllen');
	db.transaction(function(tx) {
		tx.executeSql("SELECT id, kurz, ort FROM gemeinde ORDER BY ort", [], function(tx,rs) {
			for (var i = 0; i < rs.rows.length; i++) {
				var gemeinde = rs.rows.item(i);
				$('#gemeindeliste').append('<li><a href="#gemeinde" onclick="setGemeinde(\''+gemeinde.id+'\')">'+gemeinde.kurz+' '+gemeinde.ort+'</a></li>');
			}
		});
	});
}

function setGemeinde(id) {
	console.log('gemeindedaten füllen');
	db.transaction(function(tx) {
		tx.executeSql("SELECT * FROM gemeinde WHERE id = '"+id+"'", [], function(tx,rs) {
			for (var i = 0; i < rs.rows.length; i++) {
				var gemeinde = rs.rows.item(i);
				$('#gemeindename').html(gemeinde.lang+' &bdquo;'+gemeinde.patron+'&ldquo;');
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
				});
			}
			else {
				db.transaction(function(tx) {
					console.log('Lösche Fav');
					tx.executeSql('DELETE FROM fav WHERE id = \''+id+'\';');
				}, function (tx, err) { 
					console.log("Rückgabe: "+tx.code+' '+tx.message); 
				});
			}
		});
	});
}
/*
$(document).ready(function() {
onDeviceReady();
});
*/
app.initialize();