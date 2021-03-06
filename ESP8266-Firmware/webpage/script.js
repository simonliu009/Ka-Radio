var content = "Content-type",
	ctype = "application/x-www-form-urlencoded",
	cjson = "application/json";
var intervalid , websocket,urlmonitor , e, playing = false, curtab = "tab-content1",stchanged = false,maxStation = 255;
const karadio = "Karadio";

function openwebsocket(){	
	websocket = new WebSocket("ws://"+window.location.host+"/");
	console.log("url:"+"ws://"+window.location.host+"/");

	websocket.onmessage = function (event) {
	try{	
	    var arr = JSON.parse(event.data);		
		console.log("onmessage:"+event.data);
		if (arr["meta"] == "") 
		{ document.getElementById('meta').innerHTML = karadio;setMainHeight(curtab);}
		if (arr["meta"]) {	document.getElementById('meta').innerHTML = arr["meta"].replace(/\\/g,"");setMainHeight(curtab);}
		if (arr["wsvol"]) onRangeVolChange(arr['wsvol'],false); 
		if (arr["wsicy"]) icyResp(arr["wsicy"]); 
		if (arr["wssound"]) soundResp(arr["wssound"]); 
		if (arr["monitor"]) playMonitor(arr["monitor"]); 
		if (arr["wsstation"]) wsplayStation(arr["wsstation"]); 
	} catch(e){ console.log("error"+e);}
}

	websocket.onopen = function (event) {
		console.log("Open, url:"+"ws://"+window.location.host+"/");
//		console.log("onopen websocket: "+websocket);
		if(window.timerID){ /* a setInterval has been fired */
		window.clearInterval(window.timerID);
		window.timerID=0;}
		refresh();
	}
	websocket.onclose = function (event) {
		console.log("onclose code: "+event.code);
		console.log("onclose reason: "+event.reason);
		if(!window.timerID){ /* avoid firing a new setInterval, after one has been done */
		window.timerID=setInterval(function(){checkwebsocket()}, 2000);
		}	
	}	
	websocket.onerror = function(event) {
	// handle error event
		console.log("onerror reason: "+event.reason);
		websocket.close();
	}
}
function wsplayStation($arr){
	document.getElementById('stationsSelect').selectedIndex = $arr;
}

function playMonitor($arr){
	urlmonitor = "";
	urlmonitor = $arr;	
	if (playing)
	{
		monitor = document.getElementById("audio");	
		if (urlmonitor.endsWith("/"))
			monitor.src = urlmonitor+";";
		else monitor.src = urlmonitor;	
		monitor.play();
	}
}	
function mplay(){
	monitor = document.getElementById("audio");
	if (urlmonitor.endsWith("/"))
		monitor.src = urlmonitor+";";
	else monitor.src = urlmonitor;
	monitor.volume = document.getElementById("volm_range").value / 100;
	while (monitor.networkState == 2);
	monitor.play();
	playing = true;	
	monitor.muted = false;
}	

function monerror()
{
		monitor = document.getElementById("audio");
		console.log("monitor error1 "+ monitor.error.code);
}	
function mstop(){
		monitor = document.getElementById("audio");	
		monitor.muted = true;
		monitor.src = 'http://karadio.karawin.fr/silence-1sec.mp3';
		playing = false;
}	
function mpause(){
		monitor = document.getElementById("audio");	
		monitor.pause();
}	
function mvol($val){
	monitor = document.getElementById("audio");
	monitor.volume= $val;
}	

function checkwebsocket() {
	if (typeof websocket == 'undefined') openwebsocket();	
	else 
	{
		if (websocket.readyState == websocket.CLOSED) openwebsocket();	
		else if (websocket.readyState == websocket.OPEN) websocket.send("opencheck");
	}	
}	

//check for a valid ip	
function chkip($this)
{
  if ( /^([0-9]+\.){3}[0-9]+$/.test($this.value) ) $this.style.color = "green";
  else $this.style.color = "red";
}  

function clickdhcp() {
  if (document.getElementById("dhcp").checked)
  {
    document.getElementById("ip").setAttribute("disabled","") ;
    document.getElementById("mask").setAttribute("disabled","") ;
    document.getElementById("gw").setAttribute("disabled","") ;
  } else {
      document.getElementById("ip").removeAttribute("disabled") ;
      document.getElementById("mask").removeAttribute("disabled") ;
      document.getElementById("gw").removeAttribute("disabled") ;
  }
}  

function valid() {
	wifi(1);
    alert("System reboot. Please change your browser address to the new one.");
}

function labelSleep(label){
	document.getElementById('sleepdelay').value = label;	
}
function startSleep(){
	var val = document.getElementById('sleepdelay').value;
	if(Number.isInteger(parseInt(val,10))){
		websocket.send("startSleep=" + val+"&");
		labelSleep("Started, Good night!");
		window.setTimeout(labelSleep, 3000 ,val);	
	} else
	{
		labelSleep("Error, try again");
		window.setTimeout(labelSleep, 2000 ,"1");
	}	
}
function stopSleep(){
	var a = document.getElementById("sleepdelay").value;
    websocket.send("stopSleep");
    labelSleep("Stopped");
    window.setTimeout(labelSleep, 2000, a);	
}

function promptworking(label) {
	document.getElementById('meta').innerHTML = label;
	if (label == "") {document.getElementById('meta').innerHTML = karadio; refresh();}
}

function saveTextAsFile()
{
	var output = '',id,textFileAsBlob,downloadLink,fileName; 
//	for (var key in localStorage) {
	for (id =0;id<maxStation ;id++) {
//	output = output+(localStorage[key])+'\n';
	output = output+(localStorage[id])+'\n';
	}
	fileName = document.getElementById('filesave').value;
	if (fileName == "")
		alert("Please give a file name");
	else {	
		textFileAsBlob = new Blob([output], {type:'text/plain'}),
		downloadLink =  document.createElement("a");
		downloadLink.style.display = "none";
		downloadLink.setAttribute("download", fileName);
		document.body.appendChild(downloadLink);

		if(window.navigator.msSaveOrOpenBlob)
			downloadLink.addEventListener("click",function(){
                window.navigator.msSaveBlob(textFileAsBlob, fileName);
            });
		else	if ('URL' in window)
			downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
		else 	
				downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
		downloadLink.click();
	}
}

function full(){
	if (document.getElementById('Full').checked)
	{
		if ((document.getElementById('not1').innerHTML =="")&& (document.getElementById('not1').innerHTML ==""))	
			document.getElementById('lnot1').style.display = "none";
			else 	document.getElementById('lnot1').style.display = "inline-block";	
			
		if (document.getElementById('bitr').innerHTML =="")
			document.getElementById('lbitr').style.display = "none";
			else 	document.getElementById('lbitr').style.display = "inline-block";
			
		if (document.getElementById('descr').innerHTML =="")
			document.getElementById('ldescr').style.display = "none";
			else 	document.getElementById('ldescr').style.display = "inline-block";		

		if (document.getElementById('genre').innerHTML =="")
			document.getElementById('lgenre').style.display = "none";
			else 	document.getElementById('lgenre').style.display = "inline-block";	
			
	} else
	{
		document.getElementById('lnot1').style.display = "none";	
		document.getElementById('lbitr').style.display = "none";
		document.getElementById('ldescr').style.display = "none";
		document.getElementById('lgenre').style.display = "none";
	}
	setMainHeight("tab-content1");
}
	
function icyResp(arr) {			
			if ((arr["descr"] =="")||(!document.getElementById('Full').checked))
				document.getElementById('ldescr').style.display = "none";
			else 	document.getElementById('ldescr').style.display = "inline-block";
			document.getElementById('descr').innerHTML = arr["descr"].replace(/\\/g,"");			
			document.getElementById('name').innerHTML = arr["name"].replace(/\\/g,"");
			if ((arr["bitr"] =="")||(!document.getElementById('Full').checked)){	document.getElementById('lbitr').style.display = "none";}
			else 	document.getElementById('lbitr').style.display = "inline-block";
			document.getElementById('bitr').innerHTML = arr["bitr"].replace(/\\/g,"") + " kB/s";
			if (arr["bitr"] =="") document.getElementById('bitr').innerHTML="";
			if (((arr["not1"] =="")&& (arr["not2"] ==""))||(!document.getElementById('Full').checked))	document.getElementById('lnot1').style.display = "none";
			else 	document.getElementById('lnot1').style.display = "inline-block";	
			document.getElementById('not1').innerHTML = arr["not1"].replace(/\\/g,"").replace(/^<BR>/,"");
			document.getElementById('not2').innerHTML = arr["not2"].replace(/\\/g,"");
			if ((arr["genre"] =="")||(!document.getElementById('Full').checked))
				document.getElementById('lgenre').style.display = "none";
			else 	document.getElementById('lgenre').style.display = "inline-block";	
			document.getElementById('genre').innerHTML = arr["genre"].replace(/\\/g,"");
			if (arr["url1"] =="")
			{	
				document.getElementById('lurl').style.display = "none";
				document.getElementById('icon').style.display = "none";
			}	
			else 
			{	
				document.getElementById('lurl').style.display = "inline-block";
				document.getElementById('icon').style.display = "inline-block";
				$url = arr["url1"].replace(/\\/g,"").replace(/ /g,"");
				if ($url == 'http://www.icecast.org/') 
					document.getElementById('icon').src = "/logo.png";
				else document.getElementById('icon').src =  "http://www.google.com/s2/favicons?domain_url="+$url;
			}	
			$url = arr["url1"].replace(/\\/g,"");
			document.getElementById('url1').innerHTML = $url;
			document.getElementById('url2').href = $url;
			if (arr["meta"] == "") 
				{ document.getElementById('meta').innerHTML = karadio;setMainHeight(curtab);}			
			if (arr["meta"]) document.getElementById('meta').innerHTML = arr["meta"].replace(/\\/g,"");
//					else document.getElementById('meta').innerHTML = karadio;

			setMainHeight(curtab); 
}	
function soundResp(arr) {			
			document.getElementById('vol_range').value = arr["vol"].replace(/\\/g,"");
			document.getElementById('treble_range').value = arr["treb"].replace(/\\/g,"");
			document.getElementById('bass_range').value = arr["bass"].replace(/\\/g,"");
			document.getElementById('treblefreq_range').value = arr["tfreq"].replace(/\\/g,"");
			document.getElementById('bassfreq_range').value = arr["bfreq"].replace(/\\/g,"");
			document.getElementById('spacial_range').value = arr["spac"].replace(/\\/g,"");
			onRangeVolChange(document.getElementById('vol_range').value,false);
			onRangeChange('treble_range', 'treble_span', 1.5, false,true);
			onRangeChange('bass_range', 'bass_span', 1, false,true);
			onRangeChangeFreqTreble('treblefreq_range', 'treblefreq_span', 1, false,true);
			onRangeChangeFreqBass('bassfreq_range', 'bassfreq_span', 10, false,true);
			onRangeChangeSpatial('spacial_range', 'spacial_span', true);
}	
function refresh() {
	xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && xhr.status == 200) {
			try{
				var arr = JSON.parse(xhr.responseText);
				icyResp(arr);
				soundResp(arr);
			} catch(e){console.log("error"+e);}
		}
	}
	try{	
		websocket.send("monitor");
		xhr.open("POST","icy",false);
		xhr.setRequestHeader(content,cjson);
		xhr.send();
	} catch(e){console.log("error"+e);}
}
// change the theme
function theme(){
	websocket.send("theme");
	window.location.reload(true); // force reload from the server
}

function onRangeChange($range, $spanid, $mul, $rotate, $nosave) {
	var val = document.getElementById($range).value;
	if($rotate) val = document.getElementById($range).max - val;
	document.getElementById($spanid).innerHTML = (val * $mul) + " dB";
	if( typeof($nosave) == 'undefined' )saveSoundSettings();
}
function onRangeChangeFreqTreble($range, $spanid, $mul, $rotate, $nosave) {
	var val = document.getElementById($range).value;
	if($rotate) val = document.getElementById($range).max - val;
	document.getElementById($spanid).innerHTML = "From "+(val * $mul) + " kHz";
	if( typeof($nosave) == 'undefined' )saveSoundSettings();
}
function onRangeChangeFreqBass($range, $spanid, $mul, $rotate, $nosave) {
	var val = document.getElementById($range).value;
	if($rotate) val = document.getElementById($range).max - val;
	document.getElementById($spanid).innerHTML = "Under "+(val * $mul) + " Hz";
	if( typeof($nosave) == 'undefined' )saveSoundSettings();
}
function onRangeChangeSpatial($range, $spanid, $nosave) {
	var val = document.getElementById($range).value,
	 label;
	switch (val){
		case '0': label="Off";break;
		case '1': label="Minimal";break;
		case '2': label="Normal";break;
		case '3': label="Maximal";break;	
	}
	document.getElementById($spanid).innerHTML = label;
	if( typeof($nosave) == 'undefined' )saveSoundSettings();
}
function logValue(value) {
//Log(128/(Midi Volume + 1)) * (-10) * (Max dB below 0/(-24.04))
	var log = Number(value )+ 1;
	var val= Math.round((Math.log10(255/log) * 105.54571334));
//	console.log("Value= "+value+"   log de val="+log+" "+255/log +"  = "+Math.log10(255/log)  +"   new value= "+val );
	return val;
}
function onRangeVolChange($value,$local) {
	var value = logValue($value);
	document.getElementById('vol1_span').innerHTML = (value * -0.5) + " dB";
	document.getElementById('vol_span').innerHTML = (value * -0.5) + " dB";
	document.getElementById('vol_range').value = $value;
	document.getElementById('vol1_range').value = $value;
	 if ($local &&websocket.readyState == websocket.OPEN) websocket.send("wsvol=" + $value+"&");
/*	if ($local)
	{
		xhr = new XMLHttpRequest();
		xhr.open("POST","soundvol",false);
		xhr.setRequestHeader(content,ctype);
		xhr.send(  "vol=" + $value+"&");
	}*/
}
function wifi(valid) {
	xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && xhr.status == 200) {	
			var arr = JSON.parse(xhr.responseText);
			document.getElementById('ssid').value = arr["ssid"];
			document.getElementById('passwd').value = arr["pasw"];
			document.getElementById('ip').value = arr["ip"];
			chkip(document.getElementById('ip'));
			document.getElementById('mask').value = arr["msk"];
			chkip(document.getElementById('mask'));
			document.getElementById('gw').value = arr["gw"];
			chkip(document.getElementById('gw'));
			if (arr["dhcp"] == "1")
				document.getElementById("dhcp").setAttribute("checked","");
			else
				document.getElementById("dhcp").removeAttribute("checked") ;
			clickdhcp();
		}
	}
	xhr.open("POST","wifi",false);
	xhr.setRequestHeader(content,ctype);
	xhr.send("valid=" + valid +"&ssid=" + document.getElementById('ssid').value + "&pasw=" + document.getElementById('passwd').value + "&ip=" + document.getElementById('ip').value+"&msk=" + document.getElementById('mask').value+"&gw=" + document.getElementById('gw').value+"&dhcp=" + document.getElementById('dhcp').checked+"&");
}
function instantPlay() {
	try{
		xhr = new XMLHttpRequest();
		xhr.open("POST","instant_play",false);
		xhr.setRequestHeader(content,ctype);
		if (!(document.getElementById('instant_path').value.substring(0, 1) === "/")) document.getElementById('instant_path').value = "/" + document.getElementById('instant_path').value;
		document.getElementById('instant_url').value = document.getElementById('instant_url').value.replace(/^https?:\/\//,'');
		xhr.send("url=" + document.getElementById('instant_url').value + "&port=" + document.getElementById('instant_port').value + "&path=" + document.getElementById('instant_path').value+"&");
	} catch(e){console.log("error"+e);}
}


function prevStation() {
	var select= document.getElementById('stationsSelect').selectedIndex ;
	if (select >0)
	{
		document.getElementById('stationsSelect').selectedIndex = select - 1;
		Select();
	}
}
function nextStation() {
	var select= document.getElementById('stationsSelect').selectedIndex ;
	if (select < document.getElementById('stationsSelect').length - 1)
	{
		document.getElementById('stationsSelect').selectedIndex = select + 1;
		Select();
	}
}
function autoplay() {
	try{		
		xhr.open("POST","auto",false);
		xhr.setRequestHeader(content,ctype);
		xhr.send("id=" +document.getElementById('aplay').checked+"&");		
	} catch(e){console.log("error"+e);}	
}
function Select() {
	if (document.getElementById('aplay').checked)
		 playStation() ;
}

function playStation() {
	var select,id;
	try{
//	checkwebsocket();
		mpause();
		select = document.getElementById('stationsSelect');
		id = select.options[select.selectedIndex].id;
		localStorage.setItem('selindexstore', select.selectedIndex.toString());
		xhr = new XMLHttpRequest();
		xhr.open("POST","play",false);
		xhr.setRequestHeader(content,ctype);
		xhr.send("id=" + id+"&");
	} catch(e){console.log("error"+e);}
}
function stopStation() {
	var select = document.getElementById('stationsSelect');
//	checkwebsocket();
	mstop();
	localStorage.setItem('selindexstore', select.options.selectedIndex.toString());
	try{
		xhr = new XMLHttpRequest();
		xhr.open("POST","stop",false);
		xhr.setRequestHeader(content,ctype);
		xhr.send();
	} catch(e){console.log("error"+e);}
}
function saveSoundSettings() {
	xhr = new XMLHttpRequest();
	xhr.open("POST","sound",false);
	xhr.setRequestHeader(content,ctype);
	xhr.send(
	           "&bass=" + document.getElementById('bass_range').value 
			 +"&treble=" + document.getElementById('treble_range').value
	         + "&bassfreq=" + document.getElementById('bassfreq_range').value 
			 + "&treblefreq=" + document.getElementById('treblefreq_range').value
			 + "&spacial=" + document.getElementById('spacial_range').value
			 + "&");
}
function saveStation() {
	var file = document.getElementById('add_path').value,
		url = document.getElementById('add_url').value;
	if (!(file.substring(0, 1) === "/")) file = "/" + file;
	url = url.replace(/^https?:\/\//,'');
	try{
		xhr = new XMLHttpRequest();
		xhr.open("POST","setStation",false);
		xhr.setRequestHeader(content,ctype);
		xhr.send("nb=" + 1+"&id=" + document.getElementById('add_slot').value + "&url=" + url + "&name=" + document.getElementById('add_name').value + "&file=" + file + "&port=" + document.getElementById('add_port').value+"&&");
		localStorage.setItem(document.getElementById('add_slot').value,"{\"Name\":\""+document.getElementById('add_name').value+"\",\"URL\":\""+url+"\",\"File\":\""+file+"\",\"Port\":\""+document.getElementById('add_port').value+"\"}");
	} catch(e){console.log("error "+e);}
	abortStation(); // to erase the edit field
	loadStations();
	loadStationsList(maxStation);
}
function abortStation() {
	document.getElementById('editStationDiv').style.display = "none";
	setMainHeight("tab-content2");
}
function editStation(id) {
	var arr; 
	function cpedit(arr) {
			document.getElementById('add_url').value = arr["URL"];
			document.getElementById('add_name').value = arr["Name"];
			document.getElementById('add_path').value = arr["File"];
			if (arr["Port"] == "0") arr["Port"] = "80";
			document.getElementById('add_port').value = arr["Port"];
			document.getElementById('editStationDiv').style.display = "block";
			setMainHeight("tab-content2");
	}
	document.getElementById('add_slot').value = id;
	idstr = id.toString();			
	if (localStorage.getItem(idstr) != null)
	{	
		
		try{
			arr = JSON.parse(localStorage.getItem(idstr));
		} catch(e){console.log("error"+e);}
		cpedit(arr);
	}
	else {
		xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && xhr.status == 200) {
			try{
				arr = JSON.parse(xhr.responseText);
			} catch(e){console.log("error"+e);}
			cpedit(arr);
		}
	}
	xhr.open("POST","getStation",false);
	xhr.setRequestHeader(content,ctype);
	xhr.send("idgp=" + id+"&");
	}
}

function refreshList() {
	promptworking("Working.. Please Wait");
	intervalid =window.setTimeout(refreshListtemp, 2);
}
function refreshListtemp() {
	
	localStorage.clear();
	loadStationsList(maxStation);
//	window.location.reload(false);
	promptworking("");
	refresh();
}
function clearList() {
		promptworking("Working.. Please Wait");
	if (confirm("Warning: This will clear all stations.\n Be sure to save station before.\nClear now?"))
	{
		xhr = new XMLHttpRequest();
		xhr.open("POST","clear",false);
		xhr.setRequestHeader(content,ctype);
		xhr.send( );
		refreshList();
		window.setTimeout(loadStations, 5);
	}
	else 	promptworking("");
}	
/*
function removeOptions(selectbox)
{
    var i;
    for(i = selectbox.options.length - 1 ; i >= 0 ; i--)
    {
        selectbox.remove(i);
    }
}
*/

function upgrade()
{
	if (websocket.readyState == websocket.OPEN) websocket.send("upgrade");	
	alert("Rebooting to the new release\nPlease refresh the page in few seconds.");
}
function checkhistory()
{
    if (window.XDomainRequest) {
        xhr = new XDomainRequest(); 
    } else if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest(); 
    }
	 xhr.onload = function() {
		document.getElementById('History').innerHTML = xhr.responseText;	
    }
	xhr.open("GET","http://KaraDio.karawin.fr/history.php", false);
	try{
		xhr.send(null );
	}catch(e){;}
}
//load the version and history html
function checkversion()
{
    if (window.XDomainRequest) {
        xhr = new XDomainRequest(); 
    } else if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest(); 
    }
	 xhr.onload = function() {
		document.getElementById('Version').innerHTML = xhr.responseText;	
    }
	xhr.open("GET","http://KaraDio.karawin.fr/version.php", false);
	try{
		xhr.send(null );
	}catch(e){;}
	checkhistory();
}

// refresh the stations list by reading in the webradio
function downloadStations()
{
	var i,indmax,tosend,arr,reader,lines,line,file;
	if (window.File && window.FileReader && window.FileList && window.Blob) {
		reader = new FileReader();
		xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			promptworking("Working.. Please Wait"); // some time to display promptworking
		}
		reader.onload = function(e){
			function fillInfo(ind,arri){
				tosend = tosend+"&id="+ind + "&url="+arri["URL"] +"&name="+ arri["Name"]+ "&file="+arri["File"] + "&port=" + arri["Port"]+"&";
				localStorage.setItem(ind,"{\"Name\":\""+arri["Name"]+"\",\"URL\":\""+arri["URL"] +"\",\"File\":\""+arri["File"]+"\",\"Port\":\""+arri["Port"]+"\"}");
			}	
			// Entire file
			//console.log(this.result);
			// By lines
			lines = this.result.split('\n');
			localStorage.clear();
			indmax = 7;
			line = 0;
			try {
				tosend =  "nb=" + indmax;
				for (i = 0 ; i< indmax;i++)
				{
					arr = JSON.parse(lines[i]);
					fillInfo(i,arr);
				}				
				xhr.open("POST","setStation",false);
				xhr.setRequestHeader(content,ctype);
				console.log("post "+tosend);
				xhr.send(tosend);
				} catch (e){console.log("error "+e);}
//			}
			indmax = 8;
			for(line = 7; line < lines.length; line+=indmax){				
//				console.log(lines[line]);
				try {
				tosend =  "nb=" + indmax;
				for (i = 0 ; i< indmax;i++)
				{
					arr = JSON.parse(lines[line+i]);
					fillInfo(line+i,arr);
				}
				xhr.open("POST","setStation",false);
				xhr.setRequestHeader(content,ctype);
				xhr.send(tosend);
				} catch (e){console.log("error "+e);}
			}
			loadStationsList(maxStation);		

		};
		file = document.getElementById('fileload').files[0];
		if (file==null) alert("Please select a file");
		else {			
//			stopStation();
			promptworking("Working.. Please Wait");		
			reader.readAsText(file);			
		}
	}	
}	
function dragStart(ev) {
    ev.dataTransfer.setData("Text", ev.target.id);
}

function moveNodes(a, b){
	var pa1= a.parentNode, sib= b.nextSibling,txt;
	if(sib=== a) sib= sib.nextSibling;
	pa1.insertBefore(a, b);
	txt = 0 ; 
	for (txt=0;txt<maxStation;txt++)
	{
		pa1.rows[txt].cells[0].innerText = txt.toString();
		pa1.rows[txt].cells[5].innerHTML = "<a href=\"#\" onClick=\"editStation("+ txt.toString()+")\">Edit</a>";
	}
	stchanged = true;
	document.getElementById("stsave").disabled = false;
}
function dragDrop(ev) {
    ev.preventDefault();
    var TRStart = document.getElementById(ev.dataTransfer.getData("text"));
    var TRDrop = document.getElementById(ev.currentTarget.id);
    moveNodes(TRStart,TRDrop);
}
function allowDrop(ev) {
    ev.preventDefault();
}
function stChanged()
{
	var i,indmax,tosend,index,tbody = document.getElementById("stationsTable").getElementsByTagName('tbody')[0];
	function fillInfo(ind){
				id=tbody.rows[ind].cells[0].innerText;
				name=tbody.rows[ind].cells[1].innerText;
				url=tbody.rows[ind].cells[2].innerText;
				file=tbody.rows[ind].cells[3].innerText;
				port= tbody.rows[ind].cells[4].innerText;
				localStorage.setItem(id,"{\"Name\":\""+name+"\",\"URL\":\""+url +"\",\"File\":\""+file+"\",\"Port\":\""+port+"\"}");
				tosend = tosend+"&id="+id + "&url="+ url+"&name="+ name+ "&file="+file + "&port=" +port+"&";
	}
	promptworking("Working.. Please Wait"); // some time to display promptworking
	if (stchanged && confirm("The list is modified. Do you want to save the modified list?"))
	{
		xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
		}
		promptworking("Working.. Please Wait"); // some time to display promptworking
		localStorage.clear();	
		indmax = 7;
		index = 0;	
		{
			try {
				tosend = "nb=" + indmax;
				for (i = 0; i<indmax; i++)
					fillInfo(index+i);
				xhr.open("POST","setStation",false);
				xhr.setRequestHeader(content,ctype);
				xhr.send(tosend);
			} catch (e){console.log("error "+e);}		
		}
		indmax = 8;
		for (index = 7; index < maxStation; index+=indmax)
		{
			try {
				tosend = "nb=" + indmax;
				for (i = 0 ; i< indmax;i++)
					fillInfo(index+i);
				xhr.open("POST","setStation",false);
				xhr.setRequestHeader(content,ctype);
				xhr.send(tosend);
			} catch (e){console.log("error "+e);}		
		}
		loadStationsList(maxStation);		
	}
	stchanged = false;
	document.getElementById("stsave").disabled = true;
	promptworking("");
	setMainHeight(curtab);
}
//Load the Stations table
function loadStations(/*page*/) {
	var new_tbody = document.createElement('tbody'),
//		id = 16 * (page-1),tr,td,key,arr,old_tbody;
	id = 0;
	function cploadStations(id,arr) {
			tr = document.createElement('TR'),
			td = document.createElement('TD');
			tr.draggable="true";
			tr.id = "tr"+id.toString();
			tr.ondragstart=dragStart;
			tr.ondrop=dragDrop;
			tr.ondragover=allowDrop;
			td.appendChild(document.createTextNode(id ));
//			td.style.width = "8%";
			tr.appendChild(td);
			for(key in arr){
				td = document.createElement('TD');
				td.style="word-break: break-all;overflow-wrap: break-word; word-wrap: break-word;";
				if(arr[key].length > 64) arr[key] = "Error";
				td.appendChild(document.createTextNode(arr[key]));
				tr.appendChild(td);
			}
			td = document.createElement('TD');
			td.innerHTML = "<a href=\"#\" onClick=\"editStation("+id+")\">Edit</a>";
			tr.appendChild(td);
			new_tbody.appendChild(tr);
	}	
//	for(id; id < 16*page; id++) {
	for(id; id < maxStation; id++) {
		idstr = id.toString();		
		if (localStorage.getItem(idstr) != null)
		{	
			try{
				arr = JSON.parse(localStorage.getItem(idstr));
			} catch (e){console.log("error"+e);}			
			cploadStations(id,arr);
		}
		else
		try {
			xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4 && xhr.status == 200) {
					try{
						arr = JSON.parse(xhr.responseText);
					} catch (e){console.log("error"+e);}	
					localStorage.setItem(idstr,xhr.responseText);
					cploadStations(id,arr);
				}
			}
			xhr.open("POST","getStation",false);
			xhr.setRequestHeader(content,ctype);
			xhr.send("idgp=" + id+"&");
		} catch(e){console.log("error"+e);id--;}
	}

	old_tbody = document.getElementById("stationsTable").getElementsByTagName('tbody')[0];
	old_tbody.parentNode.replaceChild(new_tbody, old_tbody);
	setMainHeight("tab-content2");
}

//Load the selection with all stations
function loadStationsList(max) {
	var foundNull = false,id,opt,arr,select, liste= [],i;
	select = document.getElementById("stationsSelect");
    for(i = select.options.length - 1 ; i >= 0 ; i--)
    {
        select.remove(i);
    }
	function cploadStationsList(id,arr) {
		foundNull = false;
			if(arr["Name"].length > 0) 
			{
				opt = document.createElement('option');
				opt.appendChild(document.createTextNode(id+": \t"+arr["Name"]));
				opt.id = id;
				select.appendChild(opt);
			} else foundNull = true;
			return foundNull;
	}		
	select.disabled = true;
	promptworking("Working.. Please Wait");
	for(id=0; id<max; id++) {
//		if (foundNull) break;
		idstr = id.toString();
		if (localStorage.getItem(idstr) != null)
		{	
			try {
				arr = JSON.parse(localStorage.getItem(idstr));
			} catch(e){console.log("error"+e);}
//			foundNull = cploadStationsList(id,arr);
			liste.push(arr);
		}
		else
		try {
			xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function() {			
				if (xhr.readyState == 4 && xhr.status == 200) {
					try {
						arr = JSON.parse(xhr.responseText);
					} catch(e){console.log("error"+e);}
					localStorage.setItem(idstr,xhr.responseText);
//					foundNull = cploadStationsList(id,arr);
					liste.push(arr);
				}
			}
			xhr.open("POST","getStation",false);
			xhr.setRequestHeader(content,ctype);
			xhr.send("idgp=" + id+"&");
		} catch(e){console.log("error"+e); id--;}
	}
	

	var map = liste.map(function(e, i) {
		return { index: i, value: e.Name.toLowerCase() };
	})
/*	map.sort(function(a, b) {
		return +(a.value > b.value) || +(a.value === b.value) - 1;
	});
*/
	// on utilise un objet final pour les résultats
	var result = map.map(function(e){
		return {index: e.index, value:liste[e.index]};
});	
	for(id=0; id < maxStation; id++) {
		foundNull = cploadStationsList(result[id].index,result[id].value);
	}	
	
	promptworking("");
	select.disabled = false;
	select.options.selectedIndex= parseInt(localStorage.getItem('selindexstore'));
//	getSelIndex();
}
/*	
function getSelIndex() {
		xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200) {
				console.log("JSON: " + xhr.responseText);
				var arr = JSON.parse(xhr.responseText);
				if(arr["Index"].length > 0) {
					document.getElementById("stationsSelect").options.selectedIndex = arr["Index"];
					document.getElementById("stationsSelect").disabled = false;
					console.log("selIndex received " + arr["Index"]);
				} 
			}
		}
		xhr.open("POST","getSelIndex",false);
		xhr.setRequestHeader(content,ctype);
		xhr.send();	
}	*/
function setMainHeight(name) {
	var minh = window.innerHeight,
		h = document.getElementById(name).scrollHeight + 200 ;
	if(h<minh) h = minh;
	document.getElementById("MAIN").style.height = h +"px";
//	checkwebsocket();
}

document.addEventListener("DOMContentLoaded", function() {
	document.getElementById("tab1").addEventListener("click", function() {
			if (stchanged) stChanged();
			refresh();
			curtab = "tab-content1";
			setMainHeight(curtab);
		});
	document.getElementById("tab2").addEventListener("click", function() {
			if (stchanged) stChanged();
			loadStations(/*1*/);
			curtab = "tab-content2";
			intervalid =window.setTimeout(setMainHeight,1,curtab );			
		});
	document.getElementById("tab3").addEventListener("click", function() {
			if (stchanged) stChanged();
			curtab = "tab-content3";
			wifi(0) ;
			checkversion();
			setMainHeight(curtab);	
		});
	if (intervalid != 0)  window.clearTimeout(intervalid);
	intervalid = 0;
	loadStationsList(maxStation);
	checkwebsocket();
	refresh();
	wifi(0) ;
	checkversion();
	setMainHeight(curtab);
	promptworking("");
});
