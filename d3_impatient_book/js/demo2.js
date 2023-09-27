// may need to change 'onload' on index.html

function makeDemo2() {
    d3.tsv( "./data_files/examples-multiple.tsv" )
        .then( function( data ) {
            // assigns the size of the embedded SVG area to variables
            var pxX = 600, pxY = 300;



            // data scale functions -----------------------------
            var scX = d3.scaleLinear() // scales input domain to an output range
                .domain( d3.extent(data, d => d["x"] ) ) // extent function returns the greatest and smallest values using an accessor function
                .range( [8, pxX-8] ); // output allows circles to fit within the chart (max scale: 8px in to edge_of_chart-8px)
            var scY1 = d3.scaleLinear() // scale for 2nd column of data (y1)
                .domain(d3.extent(data, d => d["y1"] ))
                .range( [pxY-8, 8] ); // inverted output range for y-axis to compensate for upside-down orientation of SVG coordinate system
            var scY2 = d3.scaleLinear() // scale for 3rd column of data (y2)
                .domain( d3.extent(data, d => d["y2"] ) )
                .range( [pxY-8, 8] );



            // adds circles based on datasets ------------------------

            // selects svg elements to add symbols for first data set (x vs y1)
            d3.select( "svg" )
                .append( "g" ).attr( "id", "ds1" ) // logical grouping enabling reference to all symbols for the first data set and to distinguish them from the second data set. Here has the id 'ds1'
                .selectAll( "circle" ) // empty placeholder collection - children of 'g' element
                .data(data).enter().append("circle")
                .attr( "r", 5).attr( "fill", "green" ) // fixed styles applied directly to each circle element
                .attr( "cx", d => scX(d["x"]) ) // data scale function applied to data before returned
                .attr( "cy", d => scY1(d["y1"]) ); 

            // 2nd data set (x vs y2)
            d3.select( "svg" ) 
                .append( "g" ).attr( "id", "ds2" )
                .attr( "fill", "purple" ) // fill attribute applied to g element, this is then inherited by its children (the circles)
                .selectAll( "circle" ) // the 'g' element above prevents the 'selectAll' method from selecting the circles from dataset 1 and overwritting the data
                .data(data).enter().append("circle")
                .attr( "r", 5 )
                .attr( "cx", d => scX(d["x"]) )
                .attr( "cy", d => scY2(d["y2"]) ); // accessor function picks out appropriate column for 2nd dataset



            
            // line generator ---------------------------------------

            var lineMaker = d3.line()  // returns a function object which, given a dataset, produces a string suitable for the d attribute of the SVG path element
                .x( d => scX( d["x"] ) ) // accessor function to pick out horizontal (and below - vertical) cooridinates for each data point
                .y( d => scY1( d["y1"] ) );



                            
            // Draw line --------------------------------------------
            
            d3.select( "#ds1" ) // selects g element based on id attribute
                .append( "path" ) // path element added as child of g group for first data set
                .attr( "fill", "none" ).attr( "stroke", "red" )
                .attr( "d", lineMaker(data) ); // d attribute set by invoking the line generator on the dataset



            // Reuse line generator ---------------------------------   
                
            lineMaker.y( d => scY2( d["y2"] ) ); // reuse line generator by specifying new accessor function for 2nd dataset



            // Draw line --------------------------------------------

            d3.select( "#ds2" ) 
                .append( "path" ) // path element for 2nd dataset appended
                .attr( "fill", "none" ).attr( "stroke", "cyan" )
                .attr( "d", lineMaker(data) );

            // d3.select( "#ds2" ).attr( "fill", "red" );  // Because the symbol colours for 2nd dataset was defined on the parent element (not on individual circles as with ds1), possible to change them all by applying to the g element (uncomment to see)
            // Not possible in the same way with ds1 - would have to change each individually
            d3.select( "#ds1" ).attr( "fill", "red" );
            // NOTE - this only applies to appearence options that are inherited. Not possible to change e.g. radius or shape in this way, would again need to apply to each element individually
        } );
}