function drawGauge(gaugeRadius,minVal,maxVal,needleVal,tickSpaceMinVal,tickSpaceMajVal, vizBoxID, gaugeUnits) {
    //Set defaults if not supplied
    if(gaugeRadius==undefined){gaugeRadius=200}
    if(minVal==undefined){minVal=200}
    if(maxVal==undefined){maxVal=300}
    if(tickSpaceMinVal==undefined){tickSpaceMinVal=1}
    if(tickSpaceMajVal==undefined){tickSpaceMajVal=10}
    if(vizBoxID==undefined){vizBoxID="vizBox"}
    if(needleVal==undefined)(needleVal=CONFIGsave.zeroNeedleAngle[0]*1)
    if(gaugeUnits==undefined)(gaugeUnits="€/t")
    

    //Get fixed configuration items
    var padding=CONFIGsave.padding[0]*gaugeRadius,
        edgeWidth=CONFIGsave.edgeWidth[0]*gaugeRadius,
        tickEdgeGap=CONFIGsave.tickEdgeGap[0]*gaugeRadius,
        tickLengthMaj=CONFIGsave.tickLengthMaj[0]*gaugeRadius,
        tickLengthMin=CONFIGsave.tickLengthMin[0]*gaugeRadius,
        needleTickGap=CONFIGsave.needleTickGap[0]*gaugeRadius,
        needleLengthNeg=CONFIGsave.needleLengthNeg[0]*gaugeRadius,
        pivotRadius=CONFIGsave.pivotRadius[0]*gaugeRadius,
        ticknessGaugeBasis=CONFIGsave.ticknessGaugeBasis[0]*1,
        needleWidth=CONFIGsave.needleWidth[0]*(gaugeRadius/ticknessGaugeBasis),
        tickWidthMaj=CONFIGsave.tickWidthMaj[0]*(gaugeRadius/ticknessGaugeBasis),
        tickWidthMin=CONFIGsave.tickWidthMin[0]*(gaugeRadius/ticknessGaugeBasis),
        labelFontSize=CONFIGsave.labelFontSize[0]*(gaugeRadius/ticknessGaugeBasis),
        zeroTickAngle=CONFIGsave.zeroTickAngle[0]*1,
        maxTickAngle=CONFIGsave.maxTickAngle[0]*1,
        zeroNeedleAngle=CONFIGsave.zeroNeedleAngle[0]*1,
        maxNeedleAngle=CONFIGsave.maxNeedleAngle[0]*1;
    
    //Calculate required values
    var needleLengthPos=gaugeRadius-padding-edgeWidth-tickEdgeGap-tickLengthMaj-needleTickGap,
        needlePathLength=needleLengthNeg+needleLengthPos,
        needlePathStart=needleLengthNeg*(-1),
        tickStartMaj = gaugeRadius-padding-edgeWidth-tickEdgeGap-tickLengthMaj,
        tickStartMin = gaugeRadius-padding-edgeWidth-tickEdgeGap-tickLengthMin,
        labelStart=tickStartMaj-labelFontSize,
        innerEdgeRadius = gaugeRadius-padding-edgeWidth,
        outerEdgeRadius = gaugeRadius-padding,
        originX=gaugeRadius,
        originY=gaugeRadius;
    
    if(labelFontSize<6){labelFontSize=0}
        
    //Define a linear scale to convert values to needle displacement angle (degrees)
    var valueScale = d3.scale.linear()
            .domain([minVal,maxVal])
            .range([zeroTickAngle,maxTickAngle]);
    
    //Calculate tick mark angles (degrees)
    var counter=0,
        tickAnglesMaj=[],
        tickAnglesMin=[],
        tickSpacingMajDeg = valueScale(tickSpaceMajVal)-valueScale(0),
        tickSpacingMinDeg = valueScale(tickSpaceMinVal)-valueScale(0);
    
    for (var i=zeroTickAngle;i<=maxTickAngle;i=i+tickSpacingMajDeg)
        { 
            tickAnglesMaj.push(zeroTickAngle+(tickSpacingMajDeg*counter))
            counter++
        }
    
    counter=0
    
    for (var i=zeroTickAngle;i<=maxTickAngle;i=i+tickSpacingMinDeg)
        { 
            //Check for an existing major tick angle
            var exists=0
            tickAnglesMaj.forEach(function(d){
                if((zeroTickAngle+(tickSpacingMinDeg*counter))==d){exists=1}
            })
            
            if(exists==0){tickAnglesMin.push(zeroTickAngle+(tickSpacingMinDeg*counter))}
            counter++
        }

    
    //Calculate major tick mark label text
    counter=0
    var tickLabelText=[];
    
    for (var i=zeroTickAngle;i<=maxTickAngle;i=i+tickSpacingMajDeg)
        { 
            tickLabelText.push(minVal+(tickSpaceMajVal*counter))
            counter++
        }    
    
    
    //Clear any existing SVG content from the holder
    $("#SVGbox-"+vizBoxID).remove();
    
    
    //Add the svg content holder to the visualisation box element in the document (vizbox)
    var svgWidth=gaugeRadius*2,
        svgHeight=gaugeRadius*2;
        

    
    var svg = d3.select("#"+vizBoxID)
        .append("svg")
        .attr("id", "SVGbox-"+vizBoxID)
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .attr({'xmlns': 'http://www.w3.org/2000/svg','xmlns:xmlns:xlink': 'http://www.w3.org/1999/xlink'});
    
    
    //Draw the circles that make up the edge of the gauge
    var circleGroup = svg.append("svg:g")
            .attr("id","circles")
    var outerC = circleGroup.append("svg:circle")
            .attr("cx", originX)
            .attr("cy", originY)
            .attr("r", outerEdgeRadius)
            .style("fill", "#3D7EDB")
            .style("stroke", "none");
    var innerC = circleGroup.append("svg:circle")
            .attr("cx", originX)
            .attr("cy", originY)
            .attr("r", innerEdgeRadius)
            .style("fill", "#fff")
            .style("stroke", "none");
    
    //Draw the circle for the needle 'pivot'
    var pivotC = circleGroup.append("svg:circle")
            .attr("cx", originX)
            .attr("cy", originY)
            .attr("r", pivotRadius)
            .style("fill", "#999")
            .style("stroke", "none");
    
    
    //Define two functions for calculating the coordinates of the major & minor tick mark paths
    tickCalcMaj = function() {	
        function pathCalc(d,i) {
            //Offset the tick mark angle so zero is vertically down, then convert to radians
            var tickAngle=d+90,
                tickAngleRad=dToR(tickAngle);

            var y1=originY+(tickStartMaj*Math.sin(tickAngleRad)),
                y2=originY+((tickStartMaj+tickLengthMaj)*Math.sin(tickAngleRad)),
                x1=originX+(tickStartMaj*Math.cos(tickAngleRad)),
                x2=originX+((tickStartMaj+tickLengthMaj)*Math.cos(tickAngleRad)),
                
                lineData = [{"x": x1, "y": y1}, {"x": x2, "y": y2}];

            //Use a D3.JS path generator
            var lineFunc=d3.svg.line()
                .x(function(d) { return d.x; })
                .y(function(d) { return d.y; });

            var lineSVG=lineFunc(lineData)

            return lineSVG
        }
        return pathCalc;
    };
    
    tickCalcMin = function() {	
        function pathCalc(d,i) {
            //Offset the tick mark angle so zero is vertically down, then convert to radians
            var tickAngle=d+90,
                tickAngleRad=dToR(tickAngle);

            var y1=originY+(tickStartMin*Math.sin(tickAngleRad)),
                y2=originY+((tickStartMin+tickLengthMin)*Math.sin(tickAngleRad)),
                x1=originX+(tickStartMin*Math.cos(tickAngleRad)),
                x2=originX+((tickStartMin+tickLengthMin)*Math.cos(tickAngleRad)),
                
                lineData = [{"x": x1, "y": y1}, {"x": x2, "y": y2}];

            //Use a D3.JS path generator
            var lineFunc=d3.svg.line()
                .x(function(d) { return d.x; })
                .y(function(d) { return d.y; });

            var lineSVG=lineFunc(lineData)

            return lineSVG
        }
        return pathCalc;
    };    
    
   var pathTickMaj = tickCalcMaj(),
        pathTickMin = tickCalcMin();

    
    //Add a group to hold the ticks
    var ticks = svg.append("svg:g")
                .attr("id","tickMarks")
    
    //Add a groups for major and minor ticks (minor first, so majors overlay)
    var ticksMin = ticks.append("svg:g")
                .attr("id","minorTickMarks")
    var ticksMaj = ticks.append("svg:g")
                .attr("id","majorTickMarks")

    
    //Draw the tick marks 
    var tickMin = ticksMin.selectAll("path")
                .data(tickAnglesMin)
                .enter().append("path")
                .attr("d", pathTickMin)
                .style("stroke", "#000")
                .style("stroke-width", tickWidthMin+"px");    
    var tickMaj = ticksMaj.selectAll("path")
                .data(tickAnglesMaj)
                .enter().append("path")
                .attr("d", pathTickMaj)
                .style("stroke", "#3d7edb")
                .style("stroke-width", tickWidthMaj+"px");  
    
    
        
    
    //Define functions to calcuate the positions of the labels for the tick marks
    function labelXcalc(d,i){
        var tickAngle=d+90,
            tickAngleRad=dToR(tickAngle),
            labelW=labelFontSize/(tickLabelText[i].toString().length/2)
            x1=originX+((labelStart-labelW)*Math.cos(tickAngleRad));
        return x1
    }
    function labelYcalc(d,i){
        var tickAngle=d+90,
            tickAngleRad=dToR(tickAngle),
            y1=originY+((labelStart)*Math.sin(tickAngleRad))+(labelFontSize/2);        
        return y1
    }    
    
    //Add labels for major tick marks
    var tickLabels = svg.append("svg:g")
                .attr("id","tickLabels")
    var tickLabel = tickLabels.selectAll("text")
                .data(tickAnglesMaj)
                .enter().append("text")
                .attr("x",function(d,i){return labelXcalc(d,i)})
                .attr("y",function(d,i){return labelYcalc(d,i)})	
                .attr("font-size", labelFontSize) 
                .attr("text-anchor", "middle")
                .style("fill",function(d) {"#000"})
                .style("font-weight", "bold")
                .attr("font-family", '"Myriad Pro", Gotham, "Helvetica Neue", Helvetica, Arial, sans-serif')
                .text(function(d,i) {return tickLabelText[i]})
    
    //Add label for units
    var unitLabels = svg.append("svg:g")
                .attr("id","unitLabels")
    var unitsLabel = unitLabels.selectAll("text")
                .data([0])
                .enter().append("text")
                .attr("x",function(d,i){return labelXcalc(d,i)})
                .attr("y",function(d,i){return labelYcalc(d,i)})	
                .attr("font-size", labelFontSize*1.5) 
                .attr("text-anchor", "middle")
                .style("fill",function(d) {"#000"})
                .style("font-weight", "bold")
                .attr("font-family", '"Myriad Pro", Gotham, "Helvetica Neue", Helvetica, Arial, sans-serif')
                .text(gaugeUnits)           

    //Draw needle
    var needleAngle=[zeroNeedleAngle]
    
    //Define a function for calculating the coordinates of the needle paths (see tick mark equivalent)
    needleCalc = function() {	
            function pathCalc(d,i) {
                
                var nAngleRad=dToR(d+90)
                
                var y1=originY+(needlePathStart*Math.sin(nAngleRad)),
                    y2=originY+((needlePathStart+needlePathLength)*Math.sin(nAngleRad)),
                    x1=originX+(needlePathStart*Math.cos(nAngleRad)),
                    x2=originX+((needlePathStart+needlePathLength)*Math.cos(nAngleRad)),
                    
                    lineData = [{"x": x1, "y": y1}, {"x": x2, "y": y2}];
                
                var lineFunc=d3.svg.line()
                    .x(function(d) { return d.x; })
                    .y(function(d) { return d.y; });
                
                var lineSVG=lineFunc(lineData)
                return lineSVG 
            }
        return pathCalc;
    };
    
    var pathNeedle = needleCalc();

    //Add a group to hold the needle path
    var needleGroup = svg.append("svg:g")
        .attr("id","needle")
    
    //Draw the needle path
    var needlePath = needleGroup.selectAll("path")
        .data(needleAngle)
        .enter().append("path")
        .attr("d", pathNeedle)
        .style("stroke", "#3D7EDB")
        .style("stroke-width", needleWidth+"px");  
    
    
    //Animate the transistion of the needle to its starting value
    needlePath.transition()
        .duration(1000)
        //.delay(0)
        .ease("elastic",1,0.9)
        //.attr("transform", function(d) 
        .attrTween("transform", function(d,i,a)
        {
            needleAngle=valueScale(needleVal)
            
            //Check for min/max ends of the needle
            if (needleAngle > maxTickAngle){needleAngle = maxNeedleAngle}
            if (needleAngle < zeroTickAngle){needleAngle = zeroNeedleAngle}
            var needleCentre = originX+","+originY,
                needleRot=needleAngle-zeroNeedleAngle
            return d3.interpolateString("rotate(0,"+needleCentre+")", "rotate("+needleRot+","+needleCentre+")")
              
        });

    
    unitsLabel.transition()
    .duration(1000)
    .ease("elastic",1,0.9)
    .tween("text", function(d) {
        var i = d3.interpolateString(minVal, needleVal)

        return function(t) {
            this.textContent = Math.round(i(t))+" "+gaugeUnits;
        };
    });
    
    
    
    
    this.updateGauge=function(newVal) {
        //Set default values if necessary
        if(newVal==undefined)(minVal)


        //Animate the transistion of the needle to its new value
        var needlePath = needleGroup.selectAll("path"),
            oldVal=needleVal
        needlePath.transition()
            .duration(1000)
            .ease("elastic",1,0.9)
            //.delay(0)
            //.ease("linear")
            //.attr("transform", function(d) 
            .attrTween("transform", function(d,i,a)
            {
                needleAngleOld=valueScale(oldVal)-zeroNeedleAngle
                needleAngleNew=valueScale(newVal)-zeroNeedleAngle

                //Check for min/max ends of the needle
                if (needleAngleOld+zeroNeedleAngle > maxTickAngle){needleAngleOld = maxNeedleAngle-zeroNeedleAngle}
                if (needleAngleOld+zeroNeedleAngle < zeroTickAngle){needleAngleOld = 0}
                if (needleAngleNew+zeroNeedleAngle > maxTickAngle){needleAngleNew = maxNeedleAngle-zeroNeedleAngle}
                if (needleAngleNew+zeroNeedleAngle < zeroTickAngle){needleAngleNew = 0}
                var needleCentre = originX+","+originY
                return d3.interpolateString("rotate("+needleAngleOld+","+needleCentre+")", "rotate("+needleAngleNew+","+needleCentre+")")

            });
        
        unitsLabel.transition()
            .duration(1000)
            .ease("elastic",1,0.9)
            .tween("text", function(d) {
                var i = d3.interpolateString(oldVal, newVal)
                
                return function(t) {
                    this.textContent = Math.round(i(t))+" "+gaugeUnits;
                };
        });
        
        //Update the current value
        needleVal=newVal


    }
    
    this.updateScale=function(newMin,newMax){
        
        
    }
    

    
    
    
    
    
}




function dToR(angleDeg){
    //Turns an angle in degrees to radians
    var angleRad=angleDeg*(Math.PI/180); 
    return angleRad;
}
