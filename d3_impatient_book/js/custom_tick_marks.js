function makeTicks() {
    // creates a scale object
    var sc = d3.scaleLinear().domain( [0,10] ).range( [0,200] ); 

    // top left: default settings - plain axis component
    d3.select( "#ticks" ).append( "g" )
        .attr( "transform", "translate( 50,75)" )
        .call( d3.axisBottom(sc) );

    // bottom left: additional decimal in labels
    d3.select( "#ticks" ).append( "g" ) 
        .attr( "transform", "translate( 50,200)" )
        .call( d3.axisBottom(sc).tickFormat( d3.format(".1f") ) ) // tickFormat requires a formatter obj, hence d3.format() function called to produce a formatter instance
        .selectAll( "text" )
        .filter( (d,i)=>i%2!=0 ).attr( "visibility", "hidden" ); // hides every second tick label to allow room for additional digit

    // top right: minor and major tick marks, add label for axis
    // Draws axis twice to show different tick marks
    d3.select( "#ticks" ).append( "g" )
        .attr( "transform", "translate(350,75)" )
        .call( d3.axisBottom(sc).tickSize(3).tickFormat( ()=>"" ) ); // surpress generation of labels first time
    d3.select( "#ticks" ).append( "g" )
        .attr( "transform", "translate(350,75)" )
        .call( d3.axisBottom( sc ).ticks(2) ) // tick size defaults to 6, so longer than above and no need to specify
        .append( "text" ).text( "Metric" )  // axis label, uses scale object to calculate its position
        .attr( "x", sc(5) ).attr("y", 35 )
        .attr( "font-size", 12 ).attr( "fill", "black" );

    // bottom right: custom appearance
    var g = d3.select( "#ticks" ).append( "g" ) //5
        .attr( "transform", "translate(350,200)" )
        .call( d3.axisBottom(sc).tickPadding( 5 ) ); // increases padding (moves text vertically from lines) due to increased text size
    g.select( ".domain" ).attr( "visibility", "hidden" ); // hides horizontal bar
    g.selectAll( ".tick" ).select( "line" ) // selects vertical tick lines
        .attr( "stroke", "red" ).attr( "stroke-width", 2 );
    g.selectAll( "text" ).attr( "font-size", 14 ); // increases tick text size
}