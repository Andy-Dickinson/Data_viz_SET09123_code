function makeDemo1() {
    d3.tsv( "./data_files/examples-simple.tsv" )  // loads/fetches data 
        .then( function( data ) {   // The tsv() function, like all functions in the JavaScript Fetch API, returns a JavaScript Promise object. A Promise is an object that packages a result set and a callback, and invokes the callback when the result set is complete and ready for processing. A Promise provides the then() function to register the desired callback to invoke. The callback to be invoked when the file is loaded is defined as an anonymous function, which receives the content of the data file as argument.
            d3.select( "svg" )
                .selectAll( "circle" )  // Returns an 'empty' collectioin of <circle> elements. Creating a placeholder which we will subsequently fill
                .data( data )  // Associates the collection of <circle> elements with the data set. D3 attempts to establish a one-to-one correspondence between DOM elements and data points.
                .enter()  // D3 cannot associate each data point with a <circle> element (yet) because there aren't any, so collection returned is empty. However, D3 provides access to all surplus data points that could not be matched with DOM elements through the enter() function. The following commands will be invoked for each element in this "surplus" collection.
                .append( "circle" )  // appends a <circle> element to the collection of <circle> elements inside the SVG that was selected above with 'selectAll'
                .attr( "r", 5 ).attr( "fill", "red" )  // fixed attributes and styles are set (those that are not data-dependent)
                .attr( "cx", function(d) { return d["x"] } )  // position of each circle is chosen based on the value of its affiliated data point via 'accessor functions'
                .attr( "cy", function(d) { return d["y"] } );

                // Also note that the graph produced here is upside down (on the y axis) as SVG uses "graphical coordinates", the vertical axis runs top to bottom.
        } );
}