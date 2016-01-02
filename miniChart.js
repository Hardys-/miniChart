/*!
 * miniChart.js
 * Version: 1.0
 *
 * Copyright 2015 Hao Hu
 * Released under the MIT license
 * https://github.com/Hardys-/miniChart
 */

/*
miniChart Object = {
	"animattion": true / false,
  "canvas": canvas Object,
  "chartType": pie/line/bar,
  "feedback":true,    //interactive when mouse on
	"title": ["title of the chart","title font"],
  "lines":[15,15,"rgba(163,212,214,0.6)","rgba(70,70,70,0.2)",true/false, true/false],
  "frameStyle":["line/frame/none", width],
  "frameFillStyle":  "rgba(0,0,0,0.8)",
	"max":true/false,   //mark the maximum value
	"min":true/false,   //mark the minimum value
  "tagFillStyle":"rgba(19,127,150,0.85)",

  "labels":[label1..label10], //mark label of each value, respectively
  "labelsFont":"15px Calibri",
  "labelStyle":"rgba(170,170,170,0.8)",

	"data":[
		{ "title": titleOne,
		  "font":[size,family,weight,style],
			"color": "rgba(0,0,0,0.8)",
			"values":[1,2,3,4,5,6,7,8,9,0];
		},
		{ "title": titleTwo,
		  "font":[size,family,weight,style],
			"color": "rgba(0,0,0,0.8)",
			"values":[1,2,3,4,5,6,7,8,9,0],
		},
		{ "title": titleThree,
		  "font":[size,family,weight,style],
			"color": "rgba(0,0,0,0.8)",
			"values":[1,2,3,4,5,6,7,8,9,0],
		}
	]
}
*/

(function(window) {
    var methods = {},
				object,
        canvas,topic,chart,                                                     //canvas properties
        init,
        MAX,MIN,AVE,                                                            //data properties
        len,hei,space;                                                          //chart properties

		//set method
		methods.setObject = function(_object) {
        // Set the property & value
				object = format(_object);
        canvas = _object.canvas;
        chart = _object.canvas.getContext("2d");
        MIN = findMin(object.data);
        MAX = findMax(object.data);
        len = Math.ceil(canvas.width * 0.8);
        hei = Math.ceil(canvas.height * 0.8);
        space = Math.ceil(canvas.width * 0.08);
        return this;
    };

    // draw the chart
    methods.go = function(){
				drawFrame(object.lines,object.title,object.frameStyle,object.frameFillStyle);
        if (object.chartType == "bar") {barChart(object.data);}
        else if (object.chartType == "line") { lineChart(object.data);}
        else if (object.chartType == "pie") { pieChart(object.data);}
		}

    // Init method setting the topic and returning the methods.
    init = function(_topic) {
        topic = _topic;
        return methods;
    };

    // Exposure when being used in an AMD environment, e.g. RequireJS
    if (typeof define === 'function' && define.amd) {
        define(function() {
            return init;
        });
        return;
    }

    // Exposure when being used with NodeJS
    if ('undefined' !== typeof module && module.exports) {
        module.exports = init;
        return;
    }

    // Last-in-the-line exposure to the window, if it exists
    window.miniChart = init;


    /*begin of a set of functions*/
    function drawFrame(lineStyle,title,frame,fillStyle){ //hor: # of hor lines; ver: # of ver lines.
      /*Relative value for diff resolution*/
      ver = lineStyle[1];
    	/*Draw frame*/
      chart.fillStyle = fillStyle;
      chart.fillRect(space, space, len, hei);
      chart.fill();
      if (frame[0] == "frame"){
      	chart.clearRect(space+frame[1],space+frame[1],len-frame[1]*2,hei-frame[1]*2);
      }else if(frame[0] == "none"){
        chart.clearRect(0,0,canvas.width,canvas.height);
      }else{
        chart.clearRect(space+frame[1],space,len,hei-frame[1]);
      }

    	/*Draw Ver line*/
    	chart.strokeStyle = lineStyle[3];
    	chart.lineWidth=2;
    	chart.beginPath();
    	for(i = 1; i < ver; i++){
    		chart.moveTo(i*len/ver+space-1,space+frame[1]+26);
    		chart.lineTo(i*len/ver+space-1,space-frame[1]+hei);
    	}
    	chart.stroke();

    	/*Draw Hor line & label*/
      var chartTop = findTop(MAX);
      var chartBom = (MIN > 0)? 0: MIN;
      var grids = lineStyle[0];//default value

      chart.font = "10px Calibri";
      chart.fillStyle ="#373838";
      chart.strokeStyle = lineStyle[2];
      chart.lineWidth = 1;
      chart.beginPath();
      for(i = 0; i <= grids  ; i++){
        var txt = (i*((chartTop-chartBom)/ grids)+chartBom).toFixed(2);
        chart.fillText(txt, 5, hei+space - i*(hei-30)/grids - frame[1] + 2);
        if(lineStyle[4] && i>0){
          chart.moveTo(space+frame[1],Math.round(hei+space - i*(hei-30)/grids - frame[1]));
          chart.lineTo(space-frame[1]+len,Math.round(hei+space - i*(hei-30)/grids - frame[1]));
        }
      }
    	chart.stroke();

      //char title
      var fp = (isNaN(parseInt(object.title[1])))?6:Math.round(parseInt(object.title[1]) *0.3);//default font size is 20px
      var titleX = Math.round(canvas.width/2)-object.title[0].length*fp;
      chart.fillStyle = fillStyle;
      chart.font=object.title[1];
      chart.fillText(object.title[0],titleX,space+22);
      chart.fill;
    }

    function drawTag(posX,posY,tagValue){
      posX +=15;
      posY -=18;

      /*Draw the point*/
      chart.strokeStyle = object.frameFillStyle;
      chart.beginPath();
      chart.moveTo(posX-15,posY+18);
      chart.lineTo(posX,posY);
      chart.stroke();
      var r, g, b;
      var rgbaValue = object.tagFillStyle.substring(5, object.tagFillStyle.length - 1).split(",");
      r = rgbaValue[0];
      g = (rgbaValue[1]> 15)? rgbaValue[1] - 15 : 0;
      b = (rgbaValue[2]> 15)? rgbaValue[2] - 15 : 0;
      chart.fillStyle = "rgba("+r+","+g+","+b+",0.9)";
      chart.beginPath();
      chart.arc(posX, posY, 2, 0, 2 * Math.PI);
      chart.fill();

      /*Draw the tag*/
      chart.beginPath();
      chart.moveTo(posX+4,posY-4);
      chart.lineTo(posX+10,posY-8);
      chart.lineTo(posX+10,posY+8);
      chart.lineTo(posX+4, posY+4);
      chart.closePath();
      chart.fill();
      chart.fillStyle = object.tagFillStyle;
      chart.beginPath();
      chart.fillRect(posX+10, posY-8, Math.round(tagValue.toString().length*8+5), 16);
      chart.fill();
      /*Draw the text*/
      chart.beginPath();
      chart.font = "8px Calibri";
      chart.fillStyle ="#ffffff";
      chart.fillText(tagValue,posX+12,posY+3);
    }

    function barChart(data){
      var barLen = (data[0].values !== "undifined")? Math.ceil(len / (data[0].values.length* data.length*1.5)):0; // 0.5 for
      var barMove = Math.ceil(barLen * data.length *0.8 *1.5 + barLen*0.2);

      var chartBase = Math.ceil(canvas.width * 0.08)+Math.ceil(canvas.height * 0.8)-object.frameStyle[1];
      var chartBom = (MIN > 0)? 0: MIN;
      var scale = ((hei - 30)/(findTop(MAX) - chartBom )).toFixed(2);
      var barY = (MIN > 0)? chartBase : chartBase + Math.round(MIN*scale); //start Y pos
      var chartX = Math.ceil(canvas.width * 0.08)+object.frameStyle[1]; //start X pos

      /*draw bars*/
      for(i = 0; i < data.length ; i ++){
          for(j = 0; j < data[i].values.length; j++){
            var barHei = Math.ceil(scale*data[i].values[j]);                   //set the height for the bar
            var barX = Math.ceil(chartX+Math.ceil(barLen*0.9)+j*barMove+i*barLen*0.8);
            if(object.max && data[i].values[j] == MAX ){drawTag(Math.round(barX+barLen/2),barY-barHei,MAX);}
            if(object.max && data[i].values[j] == MIN){drawTag(Math.round(barX+barLen/2),barY-barHei,MIN);}
            chart.fillStyle = data[i].color;                                     //set the color for current bar
            chart.fillRect(barX,barY-barHei,barLen,barHei);
            chart.fill;
          }
      }

      /*offset*/
      if(MIN < 0){
        chart.font = "10px Calibri";
      	chart.fillStyle ="#373838";
        chart.clearRect(0,barY-12,Math.ceil(canvas.width * 0.08),12);
        chart.fillText("0.00", 5, barY+2);
        chart.fill();
        chart.strokeStyle = (typeof object.frameFillStyle !== "undefined")? object.frameFillStyle:"rgba(19,127,150,0.8)";
        chart.lineWidth = 1;
        chart.beginPath();
        chart.moveTo(chartX, barY);
        chart.lineTo(chartX+len - 20 , barY);
        chart.stroke();
      }

      /*draw labels*/
      var labelX = 0;
      var fp = (isNaN(parseInt(object.labelsFont)))?12:Math.round(parseInt(object.labelsFont) *0.6); //font pixel, 0.6 is the scale of convert px to pixel
      var num = Math.round(barMove/fp); //how many chars can be put in the place,
      chart.font = object.labelsFont;
      chart.fillStyle = object.labelStyle;
      for(index in object.labels){
          var txtLen = object.labels[index].length;
          var txtMove = (barMove - barLen*0.8 > txtLen * fp)?Math.ceil((barMove - txtLen * fp - barLen*0.9) / 2): 0;
          var txt = (txtLen > num)? object.labels[index].substring(0,num-1)+"..":object.labels[index];
          chart.fillText(txt, txtMove + labelX + chartX + Math.ceil(barLen*0.9) ,space+hei+18);
          labelX += barMove;
      }
      chart.fill;
    }

    function format(obj){
      var rslt = { //default values
        "animattion": true,
        "chartType": "bar",
        "feedback":true,    //interactive when mouse on
        "title":["","20 Calibri"],
        "lines":[4,0,"rgba(163,212,214,0.6)","rgba(70,70,70,0.2)",false,false],
        "frameStyle":["line", 2],
        "frameFillStyle":  "rgba(171,171,171,0.8)",
        "max":true,   //mark the maximum value
        "min":true,   //mark the minimum value
        "tagFillStyle":"rgba(19,127,150,0.85)",
        "labels":[],  //mark label of each value, respectively
        "labelsFont":"15px Calibri",
        "labelStyle":"rgba(64,64,64,0.8)",
        "data":[]
      };

      if(typeof obj.animation !== "undefined") rslt.animation = obj.animation;
      if(typeof obj.chartType !== "undefined") rslt.chartType = obj.chartType;
      if(typeof obj.feedback !== "undefined") rslt.feedback = obj.feedback;
      if(typeof obj.title !== "undefined") rslt.title = obj.title;
      if(typeof obj.lines !== "undefined") rslt.lines = obj.lines;
      if(typeof obj.frameStyle !== "undefined") rslt.frameStyle = obj.frameStyle;
      if(typeof obj.frameFillStyle !== "undefined") rslt.frameFillStyle = obj.frameFillStyle;
      if(typeof obj.max !== "undefined") rslt.max = obj.max;
      if(typeof obj.min !== "undefined") rslt.min = obj.min;
      if(typeof obj.tagFillStyle !== "undefined") rslt.tagFillStyle = obj.tagFillStyle;

      if(typeof obj.labels !== "undefined") {
        rslt.labels = obj.labels;
      }else{
        var labelsArray = [];
        if(typeof obj.data[0].values !=='undefined'){                                  //check if the values exists
          for(i = 0 ; i < obj.data[0].values.length; i++){
            labelsArray.push("data"+(i+1));
          }
        }
        rslt.labels = labelsArray;
      }

      if(typeof obj.labelsFont !== "undefined") rslt.labelsFont = obj.labelsFont;
      if(typeof obj.labelStyle !== "undefined") rslt.labelStyle = obj.labelStyle;
      if(typeof obj.data !== "undefined") rslt.data = obj.data;
      return rslt;
    }

    function lineChart(data){}

    function pieChart(data){}

    function findMax(list){
        var ori = list[0].values[0];
        var sum = 0, count = 0;
        for(i = 0 ; i < list.length; i++){
            for( j = 0; j < list[i].values.length; j++){
              count++;
              sum += list[i].values[j];
              if(list[i].values[j] > ori) ori = list[i].values[j];
            }
        }
        AVE = (sum/count).toFixed(2);
        return ori;
    }

    function findMin(list){
      var ori = list[0].values[0];
      for(i = 0 ; i < list.length; i++){
          for( j = 0; j < list[i].values.length; j++){
            if(list[i].values[j] < ori) ori = list[i].values[j];
          }
      }
      return ori;
    }

    function findTop(input){
    	var result = 1;
      var hi = input;
      while(hi > 1){
      	hi /= 10;
        result *= 10;
      }
      var scale = result/10;
      return Math.floor(input / scale + 1 ) * scale;
    }
    /*end of function set*/

// This line either passes the `window` as an argument or
// an empty Object-literal if `window` is not defined.
}(('undefined' !== typeof window) ? window : {}));


/*
function drawFrame(temp,time,tempHigh){

}
/*Draw the text   *//*
function drawText(temp,tempHigh,tempLow){
	var canvas = document.getElementById("myCanvas");
	var chart = canvas.getContext("2d");
	hei = Math.ceil($("#myCanvas").height() * 0.8);
  /*Refresh*//*
  chart.fillStyle="#ffffff";
  chart.fillRect(0, 0, 42, 50 + hei);
  chart.fill();
	chart.beginPath();
	chart.font = "10px Calibri";
	chart.fillStyle ="#373838";
	chart.fillText("Celsius: C",15,20);
	for(i = 0; i <= temp  ; i++){
		var txt = (tempHigh-i*((tempHigh-tempLow)/ temp)).toFixed(2);
		chart.fillText(txt,15,i*hei/temp+48);
	}
}
/*drawTag draw a tag, at Xth grid, temp with a label of text*//*
function drawTag(X,curTemp,text){
	var canvas = document.getElementById("myCanvas");
	var chart = canvas.getContext("2d");
  var len = Math.ceil($("#myCanvas").width() * 0.9);
  var hei = Math.ceil($("#myCanvas").height() * 0.8);
  var x = Math.ceil((X-0.5)*len/time+46 + 15) ; //x is the time line position
  var y = (tempHigh - curTemp)*(hei/(tempHigh-tempLow))+44 - 18; //y1 is the temp1 line position
	/*Draw the point*//*
  chart.strokeStyle = "rgba(70,70,70,0.15)";
  chart.beginPath();
  chart.moveTo(x-15,y+18);
  chart.lineTo(x,y);
  chart.stroke();
	chart.fillStyle = "#137f96";
	chart.beginPath();
	chart.arc(x, y, 2, 0, 2 * Math.PI);
	chart.fill();
	/*Draw the tag*//*
	chart.beginPath();
	chart.moveTo(x+4,y-4);
	chart.lineTo(x+10,y-8);
	chart.lineTo(x+10,y+8);
	chart.lineTo(x+4, y+4);
	chart.closePath();
	chart.fill();
  chart.fillStyle = "rgba(19,127,150,0.85)";
	chart.beginPath();
  chart.fillRect(x+10, y-8, 35, 16);
  chart.fill();
	//Draw the text
	chart.beginPath();
	chart.font = "8px Calibri";
	chart.fillStyle ="#ffffff";
	chart.fillText(text,x+12,y+2);
}
/*drawTag draw a label, at position(x,y) with a label of id*//*
function drawLabel(X,temp2,text,rgba){
	var canvas = document.getElementById("myCanvas");
	var chart = canvas.getContext("2d");
  var len = Math.ceil($("#myCanvas").width() * 0.9);
  var y = (tempHigh - temp2)*(hei/(tempHigh-tempLow))+52; //y is the temp position
  var x = Math.ceil((X-0.5)*len/time+46) ; //x is the time line position
  /*Draw the arrow*//*
	chart.fillStyle = rgba;
	chart.beginPath();
	chart.moveTo(x-3,y+3);
	chart.lineTo(x,y-3);
	chart.lineTo(x+3,y+3);
  chart.closePath();
  chart.fill();
  //Draw the text
  chart.fillStyle ="rgba(0,0,0,0.6)";
	chart.beginPath();
	chart.font = "nomal 12px Arial";
	chart.fillText(text,x+6,y+3);
  chart.closePath();
  chart.fill();
}
/*drawLine(temp1,temp2,rgb) temp1,temp2: points; rgb: rgb color, X:point2 time line *//*
function drawLine(temp1,temp2,X,rgb,w,type){
	var canvas = document.getElementById("myCanvas");
	var chart = canvas.getContext("2d");
	len = Math.ceil($("#myCanvas").width() * 0.9);
	hei = Math.ceil($("#myCanvas").height() * 0.8);
	if (temp1 == -274 && temp2 != -274){
		var x1 = Math.ceil((X-1.5)*len/time+46) ; //x1 is the time line position
		var y1 = (tempHigh - temp1)*(hei/(tempHigh-tempLow))+44; //y1 is the temp1 line position
		chart.fillStyle = rgb;
		/*Draw point1*//*
		chart.beginPath();
    chart.lineWidth = w;
		chart.arc(x1, y1, 3, 0, 2 * Math.PI);
		chart.fill();
	}
	else{
		var x1 = Math.ceil((X-1.5)*len/time+46) ; //x1 is the time line position
		var x2 = Math.ceil((X-0.5)*len/time+46) ; //x2 is the time line position
		var y1 = (tempHigh - temp1)*(hei/(tempHigh-tempLow))+44; //y1 is the temp1 line position
		var y2 = (tempHigh - temp2)*(hei/(tempHigh-tempLow))+44; //y2 is the temp1 line position
    /*Draw Line*//*
    chart.strokeStyle = rgb;
    chart.lineWidth = w;
    chart.beginPath();
    chart.moveTo(x1+1,y1);
    chart.lineTo(x2-1,y2);
    chart.closePath();
    chart.stroke();
    if(type == 1){ //regular line
  		/*Draw point1*//*
      chart.fillStyle = rgb;
      chart.lineWidth = w;
  		chart.beginPath();
  		chart.arc(x1, y1, 3, 0, 2 * Math.PI);
      chart.closePath();
  		chart.fill();
  		/*Draw point2*//*
      chart.lineWidth = w;
  		chart.beginPath();
  		chart.arc(x2, y2, 3, 0, 2 * Math.PI);
      chart.closePath();
  		chart.fill();
    };
	}
}
function drawAveLine(msg,ave){
  for (i = 0; i< msg.length; i++){
    for( j =0; j< msg[i].temp.length; j++){
      if(ave[j][0] > -274){
        ave[j][0] += msg[i].temp[j];
        ave[j][1] +=1;
      }else{
        ave[j]=[msg[i].temp[j],1];
      }
    }
  };
  for(i = ave.length - time; i < ave.length-1; i++){ //draw ave line
    drawLine((ave[i][0]/ave[i][1]).toFixed(2),(ave[i+1][0]/ave[i+1][1]).toFixed(2),i+2-(20-time),"rgba(204,0,0,0.5)",2,2);
    //insertAverage((ave[i][0]/ave[i][1]).toFixed(2));//insert to database
  }
  drawLabel(1,(ave[ave.length-time][0]/ave[ave.length-time][1]).toFixed(2),"Average","rgba(204,0,0,0.5)");
}
function drawMouseInfo(){//draw temp & time info on Canvas
  var canvas = document.getElementById('myCanvas');
  var chart = canvas.getContext('2d');
  var len = Math.ceil($("#myCanvas").width() * 0.9);
  var hei = Math.ceil($("#myCanvas").height() * 0.8);
  function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        };
      };
  function writeMessage(canvas, message) {
    var chart = canvas.getContext('2d');
        chart.clearRect(len-45, 5, 180, 32);
        chart.font = '12px Calibri';
        chart.fillStyle = "rgba(19,127,150,0.6)";
        chart.fillText(message, len-45, 32);
      };
  function searchPrint(X,tempValue,mousePos){// given the position of mouse and searchthedata
    $("#mouseInfoTag").css({"display":"none"});
    for( i = 0; i < Gmsg.length; i++){
      if(Math.abs(Gmsg[i].temp[X-1+(20-time)] - tempValue) * Math.ceil(hei/(tempHigh-tempLow)) < 2 ) {
        var tempComp = " + 0.00";
        var tempClass = "tempClass1";
        var diff = Gmsg[i].temp[X-1+(20-time)] - ave[X-1+(20-time)][0]/ave[X-1+(20-time)][1];
        var d = new Date(Gmsg[i].startTime);
        var curTime = d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
        if(diff > 0){tempComp = " +"+ diff.toFixed(2)+"&#8593";}
        else{tempComp = " "+ diff.toFixed(2)+"&#8595"; tempClass = "tempClass2"}
        var mouseInfo = "<p class = \"infoId\">ID: "+Gmsg[i].id +"</p><p>Temp.: "+Gmsg[i].temp[X-1+(20-time)]+
                        "*C </p><p>Start at: "+ curTime +"</p><p class = \""+tempClass+"\">Ave. "+ tempComp +"</p>"
        $("#mouseInfoTag").html(mouseInfo);
        var rect = canvas.getBoundingClientRect();
        var x = mousePos.x + rect.left - 35;
        var y = mousePos.y + rect.top + 10; //10 pixer offset
        $("#mouseInfoTag").css({"left":x,"top":y,"display":"block"});
        chart.fillStyle= "#ffffff"//.replace("0.8", "0.3"); lighter color
        chart.beginPath();
        chart.arc(Math.ceil((X-1+0.5)*len/time+46),(tempHigh - Gmsg[i].temp[X-1+(20-time)])*(hei/(tempHigh-tempLow))+44,7,0,2*Math.PI);
        chart.fill();
        chart.fillStyle= Gmsg[i].rgba//.replace("0.8", "0.3"); lighter color
        chart.beginPath();
        chart.arc(Math.ceil((X-1+0.5)*len/time+46),(tempHigh - Gmsg[i].temp[X-1+(20-time)])*(hei/(tempHigh-tempLow))+44,5,0,2*Math.PI);
        chart.fill();
        chart.fillStyle= "#ffffff"//.replace("0.8", "0.3"); lighter color
        chart.beginPath();
        chart.arc(Math.ceil((X-1+0.5)*len/time+46),(tempHigh - Gmsg[i].temp[X-1+(20-time)])*(hei/(tempHigh-tempLow))+44,3,0,2*Math.PI);
        chart.fill();
      }
    }
  };
  canvas.addEventListener('mousemove', function(evt) {
        var mousePos = getMousePos(canvas, evt);
        var m1 = "";//message 1: Time
        var m2 = (tempHigh-(mousePos.y- 44)/(hei/(tempHigh-tempLow))).toFixed(2);//message 1: Temp
        //y1 = (tempHigh - temp1)*(hei/(tempHigh-tempLow))+44
        var message =  'Temperature: ' + m2;
        writeMessage(canvas, message);
        searchPrint(Math.ceil((mousePos.x - 46)/(len/time)),m2,mousePos);
      }, false);
};
/*end of canvas library*/
