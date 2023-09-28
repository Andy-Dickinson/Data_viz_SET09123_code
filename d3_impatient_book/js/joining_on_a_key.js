function makeKeys() {
    var ds1 = [["Mary", 1], ["Jane", 4], ["Anne", 2]]; // original dataset
    var ds2 = [["Anne", 5], ["Jane", 3]]; // new dataset - note incomplete and order of items is different to original

    var scX = d3.scaleLinear().domain([0, 6]).range([50, 300]),
        scY = d3.scaleLinear().domain([0, 3]).range([50, 150]);

    var j = -1, k = -1; // keeps track of vertical position of text label and circle

    var svg = d3.select( "#key" ); // active svg element as Selection

    svg.selectAll( "text" ) // creates text labels
        .data(ds1).enter().append( "text" )
        .attr( "x", 20 ).attr( "y", d=>scY(++j) ).text( d=>d[0] );

    svg.selectAll("circle").data(ds1).enter().append( "circle" ) // creats circles and initial positions
        .attr( "r", 5 ).attr( "fill", "red" )
        .attr( "cx", d=>scX(d[1]) ).attr( "cy", d=>scY(++k)-5 );


    // event handler function
    svg.on( "click", function() {
        var cs = svg.selectAll( "circle" ).data( ds2, d=>d[0] );  // new dataset bound to selection of circle elements. 2nd argument to data() function defines the key on which data items will be joined

        cs.transition().duration(1000).attr("cx", d=>scX(d[1]) ); // smooth transition from old positions to new
        cs.exit().attr( "fill", "blue" ); // exit() selection now populated with Mary's node, since last call to data(), no data point was bound to this node - gave it new colour
    } );
}