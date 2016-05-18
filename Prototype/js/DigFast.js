var currentText;
var lastMovedId;

var svgCanvas = document.querySelector('#myCanvas'),
    svgNS = 'http://www.w3.org/2000/svg',
    rectangles = [];
    //teiNS='http://www.tei-c.org/ns/1.0';
var parentgroup = document.createElementNS(svgNS, 'g');
	 parentgroup.setAttribute('id','scalingParent');
	 svgCanvas.appendChild(parentgroup);

    
var TEIcontents;
 
//constructor for a new rectangle. x/y is its Startpoint, w and h its dimension, svgCanvas the SVG-node to add it to, myId is its Id. 
function Rectangle (x, y, w, h, svgCanvas, myId, myText, rotationAngle) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.myId=myId.replace('_jstree','_rect');
  this.myangle=0;
  this.stroke = 2;
  this.rotAngle=rotationAngle;
  
  //a rectangle is not just a svg:rect but a svg:g with a svg:rect and a svg:text nested into it.
  this.el = document.createElementNS(svgNS, 'rect');
  this.el.setAttribute('data-index', rectangles.length);
  	
  this.texti = document.createElementNS(svgNS, 'text');
  if(myText==''){
  		this.texti.textContent=document.getElementById(myId).innerHTML;} 
  else{
  		this.texti.textContent=myText;}
  
  this.myg = document.createElementNS(svgNS, 'g');
  this.myg.setAttribute('id', this.myId);
  this.myg.setAttribute('transform','rotate('+rotationAngle+','+x+','+y+')');
  this.myg.setAttribute('class','element_'+myText);

  this.myg.appendChild(this.texti);
  this.myg.appendChild(this.el);
       
  rectangles.push(this);

  this.draw();
  svgCanvas.getElementById('scalingParent').appendChild(this.myg);
  this.scaleFont();
  this.el.setAttribute('onmousedown', 'setActive("'+myId.replace('_jstree','')+'")'); //runs without _rect
  setActive(myId.replace('_jstree',''));//runs without _rect
}

//draws the rectangle, should always be called before "scaleFont()", because the BBox in scaleFont() is only available after the rectangle has been placed on the SVG
Rectangle.prototype.draw = function () {
	if(this.myId.indexOf('line') > -1){
		var parZone= closestAncestor(teiDoc.getElementById(this.myId.replace('_rect','')),'zone');
		if (parZone) {
			this.myg.setAttribute('transform','rotate('+parZone.getAttribute('rotate')+','+this.x+','+this.y+')');
			//alert(parZone.getAttribute('rotate'));
			}
	}else{
	this.myg.setAttribute('transform','rotate('+this.rotAngle+','+this.x+','+this.y+')');}
  this.el.setAttribute('x', this.x);
  this.el.setAttribute('y', this.y);
  this.el.setAttribute('width' , this.w);
  this.el.setAttribute('height', this.h);
  this.el.setAttribute('stroke-width', this.stroke);
  this.el.setAttribute('rx', 5);
  this.el.setAttribute('ry', 5);
  
  this.texti.setAttribute('x', 0);//+10);
  this.texti.setAttribute('y', -2.5);//+20);
  
  //set the rectangle active if it has already been appended (otherwise its the first draw)
  if(document.getElementById(this.myId)){
  	setActive(this.myId);
  }
}

//scales the font roughly into the rectangle, 
//TODO:this function has a huge potential for further development
Rectangle.prototype.scaleFont = function(){
	//some maths for font scaling.
   var textNode = this.texti;
   var bb = textNode.getBBox();
   var widthTransform = this.w / (1.1*bb.width); //the factor 1.1 keeps the box 10% wider than the font
   var heightTransform = this.h / (1.1*bb.height);
   var value = widthTransform < heightTransform ? widthTransform : heightTransform;
   
   this.texti.setAttribute('x',0);
   this.texti.setAttribute('y',-2.5); //-2.5 seems to give a good distance from bottom and top for most lines...
   var vertX = this.x+(3*this.stroke); //keeps the font 3*the border away from the rectangle (vertically and horizontally)
   var vertY = this.y+this.h-(3*this.stroke);
   if(this.texti.textContent!=""){
   this.texti.setAttribute("transform", "matrix("+value+", 0, 0, "+value+", "+vertX+","+vertY+")");}		
	}


//sets the active element in the tree and on the svg
function setActive(idToSet) {
	activateRectangle(idToSet);
	var recId=idToSet+"_rect";
	if(document.getElementById(recId)){
		$('#html1').jstree('deselect_all');
		$('#html1').jstree('select_node',idToSet+"_jstree");
		$("#html1").jstree("open_node", idToSet+"_jstree");
		}
}


/*function to find closest ancestor of given selector, taken from stackoverflow*/
function closestAncestor(el, selector) {
    var matchesFn;
    // find vendor prefix
    ['matches','webkitMatchesSelector','mozMatchesSelector','msMatchesSelector','oMatchesSelector'].some(function(fn) {
        if (typeof document.body[fn] == 'function') {
            matchesFn = fn;
            return true;
        }
        return false;
    })
    // traverse parents
    while (el!==null) {
        parent = el.parentElement;
        if (parent!==null && parent[matchesFn](selector)) {
            return parent;
        }
        el = parent;
    }
    return null;
}


/*function activates a rectangle on the svg canvas*/
function activateRectangle(idToSet){
	//alert(idToSet);
var idWithRect= idToSet+'_rect';
if(document.getElementById(idWithRect)){
	if(document.getElementById(lastMovedId)){
		//if the last active rectangle is locked, only remove active-rectangle, but keep it locked...
		if(isLocked(lastMovedId)){
			document.getElementById(lastMovedId).getElementsByTagName('rect')[0].setAttributeNS(null,'class', 'locked-rectangle');
		//...else remove active-rectangle but keep it and unlocked "edit-rectangle"
		}else{
			document.getElementById(lastMovedId).getElementsByTagName('rect')[0].setAttributeNS(null,'class', 'edit-rectangle');}
		}
	//set "lastMovedId" to the new rectangle
	lastMovedId=idWithRect;
	if(isLocked(lastMovedId)){
		document.getElementById(idWithRect).getElementsByTagName('rect')[0].setAttribute('class', 'active-rectangle locked-rectangle');
	}else{
		document.getElementById(idWithRect).getElementsByTagName('rect')[0].setAttribute('class', 'active-rectangle edit-rectangle');}
	//activateParentGroupRectangles(idToSet);
}/*else{
	var temp=document.getElementById(lastMovedId).getElementsByTagName('rect')[0].getAttribute('class').replace('active-rectangle','');
	document.getElementById(lastMovedId).getElementsByTagName('rect')[0].setAttribute('class',temp);
}*/
}	

function deactivateRectangle(){
	var temp=document.getElementById(lastMovedId).getElementsByTagName('rect')[0].getAttribute('class').replace('active-rectangle','');
	document.getElementById(lastMovedId).getElementsByTagName('rect')[0].setAttribute('class',temp);
}

/*function does not yet work, it is meant to mark/highlight the parent group of elements on the canvas by giving a css class*/
function activateParentGroupRectangles(idToSet){
	var myTeiId= idToSet.toString().replace('_jstree','');
	if(idToSet.indexOf('zone')>-1 || idToSet.indexOf('line')>-1)
	{
		var ancientSurface =  $('#'+myTeiId).attr('id');
		//alert(myTeiId+' - '+ancientSurface);//hlight closest parent surface
	} 	
}



interact('.edit-rectangle')
  .draggable({
    max: Infinity,
    onmove: function (event) {
      var rectangle = rectangles[event.target.getAttribute('data-index')];
      rectangle.x += (event.dx/scalingFactor);
      rectangle.y += (event.dy/scalingFactor);
	  
      rectangle.draw();
      rectangle.scaleFont();
    },
	//TEI coordinates are updated AFTER the object is moved, otherwise there are too many updates on the cost of runtime
	onend: function (event) {
	  updateTEIcoordinates(rectangles[event.target.getAttribute('data-index')].myId.replace("_rect",""));
	  //myg.setAttribute('transform','rotate('+rotationAngle+','+x+','+y+')');
	}
  })
  .resizable({
    edges: { left: false, right: true, bottom: true, top: false },
    max: Infinity,
    onmove: function (event) {
      var rectangle = rectangles[event.target.getAttribute('data-index')];
      rectangle.w = Math.max(rectangle.w + (event.dx/scalingFactor), 10);
      rectangle.h = Math.max(rectangle.h + (event.dy/scalingFactor), 10);
      rectangle.draw();
      rectangle.scaleFont();
    },
	//TEI coordinates are updates AFTER the object is moved, otherwise there are too many updates on the cost of runtime
	onend: function (event) {
	  updateTEIcoordinates(rectangles[event.target.getAttribute('data-index')].myId.replace("_rect",""));
	}
  });


interact.maxInteractions(Infinity);

/*Function to set the text of a rectangle (change)*/
function setRectText(anchorId, newText){
	var recId=anchorId.replace('_jstree','_rect');
	$('#'+recId+'>text').text(newText);
	var result = $.grep(rectangles, function(e){ return e.myId == recId; });
	result[0].scaleFont();
	
}



/*Function to get the text of a rectangle*/
function getRectText(anchorId){
	var rectId=anchorId.replace('_jstree','_rect');
	var teiId=anchorId.replace('_jstree','');
	var testText= $('#'+rectId).text();
	return (testText);
}

function setTeiText(elemId,newtext){
	$(teiDoc.getElementById(elemId.replace('_jstree',''))).text(newtext);
}		

/*gets the text under a given TEI element id*/
function getTeiText(treeId){
	return $(teiDoc.getElementById(treeId.replace('_jstree',''))).text();
}

/*this function*/
function addProfileDesc(){
			$('#dia_stage').hide();
			addTeiElement('profileDesc','teiHeader','last','profileDesc');
				addTeiElement('creation','profileDesc','last','creation');
}


/*if image is selected (in case there was none found in the TEI-file or file system) this image is drawn on the screen. TODO: adjust image and SVG dimensions!*/
var origHeight=0;
var origWidth=0;
var scalingFactor=1.0;


function addImageToSVG(event){
  var selectedFile = event.target.files[0];
  var reader = new FileReader();

  var imgtag = document.getElementById("myimage");
  imgtag.title = selectedFile.name;
  
  var svgtag = document.getElementById("myCanvas");
  //everything that has to be processed after the file has been loaded goes into here:
  reader.onload = function(event) {
  	 $('#editContainer').css('display','inline');
  	 var image= new Image();
  	 image.src=event.target.result;
  	 image.onload = function(){
  	 	//put image on screen
		//imgtag.src = image.src;
  	 	//set image size, question: should this size be taken from the TEI or from the image? scaling?
		imgtag.width = this.width;
		imgtag.height = this.height;
		$(svgtag).attr("viewBox","0 0 "+imgtag.width +" "+imgtag.height);
  	 	$(svgtag).attr({width:this.width,height:this.height});
		
		var imLink = image.src;
		var svgimg = document.createElementNS(svgNS, 'image');
	
			svgimg.setAttributeNS(null,'height',this.height);
			svgimg.setAttributeNS(null,'width',this.width);
			svgimg.setAttributeNS('http://www.w3.org/1999/xlink','href', image.src);
			svgimg.setAttributeNS(null,'x','0');
			svgimg.setAttributeNS(null,'y','0');
			svgimg.setAttributeNS(null, 'visibility', 'visible');
			svgCanvas.getElementById('scalingParent').appendChild(svgimg);
		
		
  	 	//set global origHeight and origSize for Scaling Functions
  	 	origHeight=this.height;
  	 	origWidth=this.width;
  	 	
  	 	//placeTEIrects();
  	 	}
  };

  reader.readAsDataURL(selectedFile);
}






function processImageFile(event) {
  var selectedFile = event.target.files[0];
  var reader = new FileReader();

  var imgtag = document.getElementById("myimage");
  imgtag.title = selectedFile.name;
  
  var svgtag = document.getElementById("myCanvas");
  //everything that has to be processed after the file has been loaded goes into here:
  reader.onload = function(event) {
  	 $('#editContainer').css('display','inline');
  	 var image= new Image();
  	 image.src=event.target.result;
  	 image.onload = function(){
  	 	//put image on screen
  	 	imgtag.src = image.src;
  	 	//set image size, question: should this size be taken from the TEI or from the image? scaling?
  	 	imgtag.width = this.width;
  	 	imgtag.height = this.height;
		$(svgtag).attr("viewBox","0 0 "+imgtag.width +" "+imgtag.height);
  	 	$(svgtag).attr({width:this.width,height:this.height});
  	 	
  	 	//set global origHeight and origSize for Scaling Functions
  	 	origHeight=this.height;
  	 	origWidth=this.width;
  	 	
  	 	placeTEIrects();
  	 	}
  };
  reader.readAsDataURL(selectedFile);
}


//updates the coordinates of a zone in the TEI after it was changed on the SVG
function updateTEIcoordinates(passedId){
	var zoneId=passedId+'_rect';
	var ulx=parseInt($('#'+zoneId).find('rect').attr("x")),
		 uly=parseInt($('#'+zoneId).find('rect').attr("y")),
		 lrx=ulx+parseInt($('#'+zoneId).find('rect').attr("width")),
		 lry=uly+parseInt($('#'+zoneId).find('rect').attr("height"));
		 

		 $(teiDoc).find('#'+passedId).attr({
		 'ulx':ulx,
		 'uly':uly,
		 'lrx':lrx,
		 'lry':lry
		 });
		 
		 //if its a zone, also update the @rotate attribute!
		 if(passedId.indexOf('zone') > -1){
			 var result = $.grep(rectangles, function(e){ return e.myId == zoneId; });
			  $(teiDoc).find('#'+passedId).attr({
				'rotate':result[0].rotAngle});
		 }
		 
}



//places all tei:zones that already have coordinates given onto the SVG
function placeTEIrects(){
	$(TEIcontents).find('zone').each(function(){
		if($(this).attr("ulx") && $(this).attr("uly") && $(this).attr("lrx") && $(this).attr("lry")){
			var myX= parseInt($(this).attr("ulx"));
			var myY= parseInt($(this).attr("uly"));	
			
			var myId= $(this).attr("id");	
			
			var myheight= parseInt($(this).attr("lry"))-myY;
			var mywidth = parseInt($(this).attr("lrx"))-myX;
			
			
			//if zone has a rotation attribute set them
			var rotAngle=parseInt(ghf0);
			if($(this).attr('rotation')){
				rotAngle=parseInt($(this).attr('rotation'));}
			
			var myText= $(this).text();
			if(myText!=""){
				new Rectangle(myX, myY, mywidth, myheight, svgCanvas,myId, myText,rotAngle);
				//$('.rot_img').css("display","inline");
			}
		}
	}
	);
	

}


/*Function to delete a selected Element from TEI, SVG, jsTree and rectangles[] */
function deleteSelected(evt){
	var selectedA = $("#html1").jstree().get_selected();
	var superId=selectedA[0].replace('_jstree','');
	if(superId.indexOf('line') > -1 || 
		superId.indexOf('surface') > -1 || 
		superId.indexOf('zone') > -1 || 
		superId.indexOf('del') > -1 || 
		superId.indexOf('add') > -1 || 
		superId.indexOf('surfaceGrp') > -1){
			var r= confirm("Are you sure you want to delete this element and all its children?");
			if(r == true){
					//remove from jstree
					$('#html1').jstree("delete_node",selectedA[0]);
					//remove element and all its children from SVG Canvas
					var allChildren = Array.prototype.slice.call(teiDoc.getElementById(superId).querySelectorAll("*"),0);
					allChildren.forEach(function(myEl){$('#'+myEl.id+'_rect').remove();});
					$('#'+superId+'_rect').remove();
					//remove from TEI file
					$(teiDoc).find('#'+superId).remove();
					//TODO: remove from rectangles[]
					//TODO: select parent or other element
			} 
	}else{
		alert("This element can't be deleted!");
	}
}

/*locks or unlocks a rectangle on the svg canvas*/
function toggleElementLocker(evt){
	var selectedA = $("#html1").jstree().get_selected();
	var superId=selectedA[0].replace('_jstree','_rect');
	if(document.getElementById(superId)){
		if(isLocked(superId)){
			document.getElementById(superId).getElementsByTagName('rect')[0].setAttributeNS(null,'class', 'active-rectangle edit-rectangle');
		}else{
			document.getElementById(superId).getElementsByTagName('rect')[0].setAttributeNS(null,'class', 'locked-rectangle');
		}
	}
}
//checks if a rectangle on the svg canvas is marked as locked
function isLocked(myid){
	if(document.getElementById(myid) && document.getElementById(myid).getElementsByTagName('rect')[0].getAttributeNS(null,'class')){
		return(document.getElementById(myid).getElementsByTagName('rect')[0].getAttributeNS(null,'class').indexOf('locked-rectangle') > -1 )
	}else {
		return(false);
	}
}

/*function to be called when a new TEI file has been selected. Calls functions to check the TEI file and (in case its valid for our needs) processes it)*/
var TEIparsed;

function processTEIfile(evt) {
    //Retrieve the first (and only!) File from the FileList object
    var f = evt.target.files[0]; 

    if (f) {
      var r = new FileReader();
      
      //everything that has to be processed after the file has been loaded goes into here:
      r.onload = function(e) { 
	     TEIcontents = e.target.result;
        var xmlDoc = $.parseXML( TEIcontents );
  			TEIparsed = $( xmlDoc );
  			//if root element is TEI, to be replaced by if "isUsableTEI(xmlDoc)", TODO: write "isUsableTEI()"
  			if(xmlDoc.documentElement.tagName=='TEI'){
				//TODO: check if image-links (one or more!) are given in the TEI, if so, check if image can be found on filesystem (can only be loaded on server system)
				$('#teiSelection').css("display",'none');
				$('#imageSelection').css('display','inline');
  				
				var link=TEIparsed.find('graphic').attr("url");

  			}else{
      	alert("This is not a TEI File. Please select another file." + xmlDoc.documentElement.tagName);}
      
      }
      r.readAsText(f);
    } else { 
      alert("Failed to load file");
    }
  }


//adds the CSS information to style the rectangles to the SVG file
function addCSStoSVG(){
	var defsElement=document.createElementNS(svgNS,'defs'),
		 styleElement=document.createElementNS(svgNS,'style');
		 styleElement.setAttribute('type','text/css');
		 styleElement.innerHTML="rect{fill:grey;fill-opacity: 0.2;stroke:#8AC007;stroke-opacity:1;}";		 
		 defsElement.appendChild(styleElement);
		 svgCanvas.insertBefore(defsElement,svgCanvas.firstChild);
	}


/*function to download the svg file at any point. The same function could probably be used to download the TEI file at any stage. TODO: adjust it by using parameters!*/
function onSVGdownload() {
	 addCSStoSVG();
	 imageScale(0);
    var textToWrite = new XMLSerializer().serializeToString(svgCanvas);
    var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
    var fileNameToSaveAs = 'output.svg'//Your filename;

    var downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
   
        // Firefox requires the link to be added to the DOM
        // before it can be clicked.
        downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
        //downloadLink.onclick = destroyClickedElement;
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
   

    downloadLink.click();
}


function onTEIdownload() {
	//var root = TEIparsed.find("TEI").get(0);
	var serializer = new XMLSerializer(); 
	
	//jQuery.merge() for deep copy! otherwise ids are removed in working instance as well
	var parsetotext = serializer.serializeToString(teiDoc);
	//remove id via regex and add linebreak between elements
	var out = parsetotext.replace(/ id="[^"]*"/g,'').replace(/></g,">\n<");
	
	var textFileAsBlob = new Blob([out], {type:'text/xml'});
	var fileNameToSaveAs = 'output.xml';
	
	var downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
    
        // Firefox requires the link to be added to the DOM
        // before it can be clicked.
        downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
        //downloadLink.onclick = destroyClickedElement;
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
  
    downloadLink.click();

}




/*function to scale the image, 
a factor of +1 will scale the image to 110% of its previous size 
a factor of -1 will scale the image 90% of its previous size
a factor of 0 will reset the image to the Original Size
*/
function scaleCanvas(factor){
	var imgtag = document.getElementById("myimage");
	if(factor==0){
		scalingFactor= 1.0;
	}else{
		scalingFactor=(1+factor*0.1)*scalingFactor;
	}
	setSvgScale();
}
	
function setSvgScale() {
	$("#myCanvas").attr("width",scalingFactor*origWidth);
	$("#myCanvas").attr("height",scalingFactor*origHeight);
	$("#myCanvas").find('g[id="scalingParent"]').attr("transform","scale(" + scalingFactor +")");
}
