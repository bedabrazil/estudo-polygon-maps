/*
 * Developed by The Beda Brazil 
 * www.bedabrazil.com
 * 02.09.2016
 */

function PolygonCreator(map, locations){
  this.map = map;
  this.locations = locations;
  this.pen = new Pen(this.map, this.locations);
  var thisOjb = this;
  this.event = google.maps.event.addListener(thisOjb.map,'click',function(event){
    thisOjb.pen.draw(event.latLng);
  });
  this.showData = function(){
    return this.pen.getData();
  }
  this.showLocations = function(){
    return this.pen.getLocations();
  }
  this.showColor = function(){
    return this.pen.getColor();
  }
  this.destroy = function(){
    this.pen.deleteMis();
    if(null!=this.pen.polygon){
      this.pen.polygon.remove();
    }
    google.maps.event.removeListener(this.event);
  }
}
function Pen(map, locations){
  this.map = map;
  this.locations = locations;
  this.listOfDots = new Array();
  this.polyline = null;
  this.polygon = null;
  this.currentDot = null;
  this.draw = function(latLng){
    if(null != this.polygon){
      alert('Click Reset to draw another');
    }else{
      if(this.currentDot != null && this.listOfDots.length > 1 && this.currentDot == this.listOfDots[0]){
        this.drawPloygon(this.listOfDots);
      }else{
        if(null != this.polyline){
          this.polyline.remove();
        }
        var dot = new Dot(latLng, this.map, this);
        this.listOfDots.push(dot);
        if(this.listOfDots.length > 1){
          this.polyline = new Line(this.listOfDots,this.map);
        }
      }
    }
  }
  this.drawPloygon = function(listOfDots, color, des, id){
    this.polygon = new Polygon(listOfDots, this.map, this,color, des,id);
    this.deleteMis();
  }
  this.deleteMis = function(){
    $.each(this.listOfDots, function(index,value){
      value.remove();
    });
    this.listOfDots.length = 0;
    if(null != this.polyline){
      this.polyline.remove();
      this.polyline = null;
    }
  }
  this.cancel = function(){
    if(null != this.polygon){
      (this.polygon.remove());
    }
    this.polygon = null;
    this.deleteMis();
  }
  this.setCurrentDot = function(dot){
    this.currentDot = dot;
  }
  this.getListOfDots = function(){
    return this.listOfDots;
  }
  this.getData = function(){
    if(this.polygon!=null){
      var data = "";
      var paths = this.polygon.getPlots();
      paths.getAt(0).forEach(function(value,index){
        data += (value.toString());
      });
      return data;
    }else{
      return null;
    }
  }
  this.getLocations = function(){
    self = this;
    if(this.polygon != null){
      var data = "";
      this.locations.forEach(function(val, i){
        var coords =  new google.maps.LatLng(+val[0], +val[1]);
        data += self.polygon.containsLatLng(coords) ? "Lat: "+coords.lat()+", Lng: "+coords.lng()+"<br>" : 'N/A<br>';        
      });
      return data;
    }else{
      return null;
    }
  }  
  this.getColor = function(){
    if(this.polygon!=null){
      var color = this.polygon.getColor(); 
      return color;
    }else{
      return null;
    }
  }
}
function Dot(latLng, map, pen){
  this.latLng = latLng;
  this.parent = pen;
  this.markerObj = new google.maps.Marker({
    position: this.latLng,
    map:map
  });
  this.addListener = function(){
    var parent = this.parent;
    var thisMarker = this.markerObj;
    var thisDot = this;
    google.maps.event.addListener(thisMarker,'click',function(){
      parent.setCurrentDot(thisDot);
      parent.draw(thisMarker.getPosition());
    });
  }
  this.addListener();
  this.getLatLng = function(){
    return this.latLng;
  }
  this.getMarkerObj = function(){
    return this.markerObj;
  }
  this.remove = function(){
    this.markerObj.setMap(null);
  }
}
function Line(listOfDots, map){
  this.listOfDots = listOfDots;
  this.map = map;
  this.coords = new Array();
  this.polylineObj = null;
  if(this.listOfDots.length > 1){
    var thisObj = this;
    $.each(this.listOfDots,function(index,value){
      thisObj.coords.push(value.getLatLng());
    });
    this.polylineObj = new google.maps.Polyline({
      path: this.coords,
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 2,
      map: this.map
    });
  }
  this.remove = function(){
    this.polylineObj.setMap(null);
  }
}
function Polygon(listOfDots, map, pen, color){
  this.listOfDots = listOfDots;
  this.map = map;
  this.coords = new Array();
  this.parent = pen;
  this.des = 'Hello';
  var thisObj = this;
  $.each(this.listOfDots,function(index,value){
    thisObj.coords.push(value.getLatLng());
  });
  this.polygonObj = new google.maps.Polygon({
    paths: this.coords,
    strokeColor: "#000000",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#000000",
    fillOpacity: 0.35,
    clickable: false,
    editable: true,
    map: this.map
  });
  this.remove = function(){
    this.info.remove();
    this.polygonObj.setMap(null);
  }
  this.getContent = function(){
    return this.des;
  }
  this.getBounds = function(latLng) {
    var bounds = new google.maps.LatLngBounds(),
      paths = this.polygonObj.getPaths(), path, p, i;
    for (p = 0; p < paths.getLength(); p++) {
      path = paths.getAt(p);
      for (i = 0; i < path.getLength(); i++) {
        bounds.extend(path.getAt(i));
      }
    }
    return bounds;
  }  
  this.containsLatLng = function(latLng) {
    // Exclude points outside of bounds as there is no way they are in the poly
    var inPoly = false,
      bounds, lat, lng,
      numPaths, p, path, numPoints,
      i, j, vertex1, vertex2;

    // Arguments are a pair of lat, lng variables
    if (arguments.length == 2) {
      if (
        typeof arguments[0] == "number" &&
        typeof arguments[1] == "number"
      ) {
        lat = arguments[0];
        lng = arguments[1];
      }
    } else if (arguments.length == 1) {
      bounds = this.getBounds();

      if (!bounds && !bounds.contains(latLng)) {
        return false;
      }
      lat = latLng.lat();
      lng = latLng.lng();
    } else {
      console.log("Wrong number of inputs in google.maps.Polygon.prototype.contains.LatLng");
    }

    // Raycast point in polygon method

    numPaths = this.polygonObj.getPaths().getLength();
    for (p = 0; p < numPaths; p++) {
      path = this.polygonObj.getPaths().getAt(p);
      numPoints = path.getLength();
      j = numPoints - 1;

      for (i = 0; i < numPoints; i++) {
        vertex1 = path.getAt(i);
        vertex2 = path.getAt(j);
        if(vertex1.lng() <  lng && vertex2.lng() >= lng || vertex2.lng() <  lng && vertex1.lng() >= lng){
          if(vertex1.lat() + (lng - vertex1.lng()) / (vertex2.lng() - vertex1.lng()) * (vertex2.lat() - vertex1.lat()) < lat){
            inPoly = !inPoly;
          }
        }
        j = i;
      }
    }
    return inPoly;
  }
  this.getPolygonObj = function(){
    return this.polygonObj;
  }
  this.getListOfDots = function(){
    return this.listOfDots;
  }
  this.getPlots = function(){
    return this.polygonObj.getPaths();
  }
  this.getColor = function(){
    return this.getPolygonObj().fillColor;
  }
  this.setColor = function(color){
    return this.getPolygonObj().setOptions({
      fillColor: color,
      strokeColor: color,
      strokeWeight:2
    });
  }
  this.info = new Info(this,this.map);
  this.addListener = function(){
    var info = this.info;
    var thisPolygon = this.polygonObj;
    google.maps.event.addListener(thisPolygon,'rightclick',function(event){
      info.show(event.latLng);
    });
  }
  this.addListener();
}
function Info(polygon,map){
  this.parent = polygon;
  this.map = map;
  this.color = document.createElement('input');
  this.button = document.createElement('input');
  $(this.button).attr('type','button');
  $(this.button).val("Change Color");
  var thisOjb = this;
  this.changeColor = function(){
    thisOjb.parent.setColor($(thisOjb.color).val());
  }
  this.getContent = function(){
    var content = document.createElement('div');
    $(this.color).val(this.parent.getColor());
    $(this.button).click(function(){
      thisObj.changeColor();
    });
    $(content).append(this.color);
    $(content).append(this.button);
    return content;
  }
  thisObj = this;
  this.infoWidObj = new google.maps.InfoWindow({
    content: thisObj.getContent()
  });
  this.show = function(latLng){
    this.infoWidObj.setPosition(latLng);
    this.infoWidObj.open(this.map);
  }
  this.remove = function(){
    this.infoWidObj.close();
  }
}