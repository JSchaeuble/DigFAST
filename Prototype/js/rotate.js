
//Listener for rotation buttons:
var timeout, rotation_aclockwise=$('#rot_left'), rotation_clockwise=$('#rot_right') ;
rotation_aclockwise.mousedown(function(){
    timeout = setInterval(function(){
        rotateRect(lastMovedId,-1);
    }, 40);
    return false;
});
rotation_clockwise.mousedown(function(){
    timeout = setInterval(function(){
        rotateRect(lastMovedId,1);
    }, 40);
    return false;
});
$(document).mouseup(function(){
    clearInterval(timeout);
    return false;
});


//Rotation function:
function rotateRect(rectId,angles) {
	var result = $.grep(rectangles, function(e){ return e.myId == rectId; });
	
	if(result[0].rotAngle+parseInt(angles) < 0 ){result[0].rotAngle=360-result[0].rotAngle;}else{
		result[0].rotAngle=parseInt(result[0].rotAngle)+parseInt(angles);
	}
	result[0].draw();
	result[0].scaleFont();
	updateTEIcoordinates(rectId.replace('_rect',''));
	/*the children-lines inherit their rotation from the parent zone, 
	but they still rotate to their own upper left corner! The problem here is,
	that TEI doesnt allow line rotation, therefore if you want to have line rotation
	a line has to be nested in a rotated zone. Since TEI does not make clear statements
	on what the rotation point is, in this project we decided to inherit the parent-zones
	rotation angle but to keep the upper left corner of each rectangle as a rotation center*/
	rotateChildLines(rectId.replace('_rect',''));
}

function rotateChildLines(parentZone){
	var parEl=teiDoc.getElementById(parentZone).getElementsByTagName('line');
	for (i=0; i<parEl.length; ++i){
		var lineId=parEl[i].id+'_rect';
		var result=$.grep(rectangles, function(e){ return e.myId == lineId; });
		//redraw and scaleFont of rectangles
		result[0].draw();
		result[0].scaleFont();
	}
}







