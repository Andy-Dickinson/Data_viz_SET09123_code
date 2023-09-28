function makeUpdate() {

    // datasets - each consists of x & y coordinates, followed by color (used as key when binding the data)
    var ds1 = [ [2, 3, "green"], [1, 2, "red"], [2, 1, "blue"],
                [3, 2, "yellow"] ];
    var ds2 = [ [1, 1, "red"], [3, 3, "black"], [1, 3, "lime"],
                [3, 1, "blue"]];

    // scales to map data values to screen coordinates
    var scX = d3.scaleLinear().domain([1, 3]).range([100, 200]), 
        scY = d3.scaleLinear().domain([1, 3]).range([50, 100]);

    // handle on svg element
    var svg = d3.select( "#update" );


    // event handler function
    svg.on( "click", function() {
        [ ds1, ds2 ] = [ ds2, ds1 ]; // respones to user click, swap datasets

        var cs = svg.selectAll( "circle" ).data( ds1, d=>d[2] ); // bind new dataset to existing circle elements using color name as key

        cs.exit().remove(); // remove elements no longer bound to data

        cs = cs.enter().append( "circle" ) // create new elements for data points that are new
            .attr( "r", 5 ).attr( "fill", d=>d[2] )
            .merge( cs ); // merge existing elements retained from earlier selection into newly created element selection - combination treated as current selection going forwards. This prevents overwritting
            
        cs.attr( "cx", d=>scX(d[0]) ).attr( "cy", d=>scY(d[1]) ); // update all elements using bound data values
    } );

    svg.dispatch( "click" ); // synthetic click event to trigger event handler when page is first loaded
}