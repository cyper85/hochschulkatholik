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

var db = null;
var dataversion = 1;

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
		// Datenbankverbindung
		db = window.openDataBase("Hochschulkatholik","1.0","App Datenbank",1000000);
		
		// Tabellen erstellen
		db.transaction(function(tx) {
			tx.executeSql('CREATE TABLE IF NOT EXISTS dataInfo (id TEXT PRIMARY KEY, data TEXT)');
			tx.executeSql('CREATE TABLE IF NOT EXISTS gemeinde (id TEXT PRIMARY KEY, kurz TEXT NOT NULL, lang TEXT NOT NULL, strasse TEXT NOT NULL, ort TEXT NOT NULL, plz TEXT NOT NULL, patron TEXT, url TEXT, lat REAL, lon REAL)');
			tx.executeSql('CREATE TABLE IF NOT EXISTS akhVeranstaltung (id TEXT PRIMARY KEY, start INTEGER NOT NULL, ende TEXT NOT NULL, titel TEXT NOT NULL, adresse TEXT NOT NULL, beschreibung TEXT, foto TEXT, lat REAL, lon REAL)');
		});
		
		// Prüfe Datenversion
		db.transaction(function(tx) {
			tx.executeSql("SELECT id FROM dataInfo WHERE id = 'version' AND data < "+dataVersion, [], function(tx,rs) {
				if(rs.rows.length > 0) {
					$.get(url:'data.json',success:function(data){
						var json = $.parseJSON(data);
						db.transaction(function(tx) {
							tx.executeSql('INSERT OR REPLACE INTO dataInfo (id, data) values (\'version\', \''+json.dataInfo.version+'\')');
							tx.executeSql('DROP TABLE gemeinde');
							tx.executeSql('CREATE TABLE gemeinde (id TEXT PRIMARY KEY, kurz TEXT NOT NULL, lang TEXT NOT NULL, strasse TEXT NOT NULL, ort TEXT NOT NULL, plz TEXT NOT NULL, patron TEXT, url TEXT, lat REAL, lon REAL)');
						});
						for(var i = 0; i < json.gemeinde.length; i++) {
							var gemeinde = json.gemeinde[i];
							var id = (typeof gemeinde.id != 'undefined') ? gemeinde.id : "";
							var kurz = (typeof gemeinde.kurz != 'undefined') ? gemeinde.kurz : "";
							var lang = (typeof gemeinde.lang != 'undefined') ? gemeinde.lang : "";
							var strasse = (typeof gemeinde.strasse != 'undefined') ? gemeinde.strasse : "";
							var ort = (typeof gemeinde.ort != 'undefined') ? gemeinde.ort : "";
							var plz = (typeof gemeinde.plz != 'undefined') ? gemeinde.plz : "";
							var patron = (typeof gemeinde.patron != 'undefined') ? gemeinde.patron : "";
							var url = (typeof gemeinde.url != 'undefined') ? gemeinde.url : "";
							var lat = (typeof gemeinde.lat != 'undefined') ? gemeinde.lat : "";
							var lon = (typeof gemeinde.lon != 'undefined') ? gemeinde.lon : "";
							db.transaction(function(tx) {
								tx.executeSql('INSERT OR REPLACE INTO gemeinde (id, kurz, lang, strasse, ort, plz, patron, url, lat, lon) values (\''+id+'\', \''+kurz+'\', \''+lang+'\', \''+strasse+'\', \''+ort+'\', \''+plz+'\', \''+patron+'\', \''+url+'\', \''+lat+'\', \''+lon+'\')');
							});
						}
					});
				}
			});
		});
		
        app.receivedEvent('deviceready');
		
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

function initDB(tx) {
	
}

function checkVersion(tx) {
	tx.executeSql("SELECT id FROM dataInfo WHERE id = 'version' AND data < "+dataVersion, [], checkSuccess, checkError);
}

function successCB() {}


function errorCB(err) {
}

function checkSuccess(tx, results) {
	if(results.rows.length > 0) {
		initDatabase();
	}
}

function checkError(err) {
	initDatabase();
}

function initDatabase() {
	$.get(url:'data.json',success:function(data){
		var json = $.parseJSON(data);
		
		$('#shortlink').attr("href",json.short);
	});
}