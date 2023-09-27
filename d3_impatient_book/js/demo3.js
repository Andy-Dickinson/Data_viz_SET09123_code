// Makes use of reusing a function so there is less redundant code
// Because these functions are defined inside of makeDemo3(), they have access to the variables in that scope.

function makeDemo3() {
    d3.tsv( "./data_files/examples-multiple.tsv") // data loaded
        .then( function( data ) {
            var svg = d3.select( "svg" ); // selects svg element and assigns to variable which can be called

            var pxX = svg.attr( "width" ); // query svg element for its size. Many D3 functions can work as setters (2nd parameter is value to set named) as well as getters (if only 1 argument). 
            var pxY = svg.attr( "height" );



            var makeScale = function( accessor, range ) { // wrapper to reduce D3 function calls
                return d3.scaleLinear()
                    .domain( d3.extent( data, accessor ) )
                    .range( range ).nice(); // nice() function extends range to nearest "round" values
            }


            // scale functions set to variables making use of wrapper above
            var scX = makeScale( d => d["x"], [0, pxX] );
            var scY1 = makeScale( d => d["y1"], [pxY, 0] );
            var scY2 = makeScale( d => d["y2"], [pxY, 0] );



            // bundles all commands necessary to plot a single data set - creates circles for individual data points as well as connect them
            // This is a "component" function - takes selection as first argument. Important mechanism for encapsulation and code reuse in D3.
            var drawData = function( g, accessor, curve ) { // g = selection instance (typically <g>) - container for graphical elements

                // draw circles
                g.selectAll( "circle" ).data(data).enter()
                    .append( "circle" )
                    .attr( "r", 5 )
                    .attr( "cx", d => scX(d["x"]) )
                    .attr( "cy", accessor );

                // draw lines
                var lnMkr = d3.line().curve( curve ) // defines what kind of curve should be used to connecdt consecutive points. Straight lines are the default
                    .x( d => scX(d["x"]) ).y( accessor );

                g.append( "path" ).attr( "fill", "none" )
                    .attr( "d", lnMkr( data ) );
            }


            // Creates 2 <g> container elements, one for each data set
            var g1 = svg.append( "g" ); 
            var g2 = svg.append( "g" );


            // Invokes drawData() function whilst supplying one container element, an accessor describing the data set and the desired curve shape
            drawData( g1, d => scY1(d["y1"]), d3.curveStep ); 
            drawData( g2, d => scY2(d["y2"]), d3.curveNatural );


            // For each container, select desired graphical elements to be set their colour - D3 idiom: creating DOM elements is kept separate from configuring their appearance options
            g1.selectAll( "circle" ).attr( "fill", "green" );
            g1.selectAll( "path" ).attr( "stroke", "cyan" );

            g2.selectAll( "circle" ).attr( "fill", "blue" );
            g2.selectAll( "path" ).attr( "stroke", "red" );


            // Axis for first data set drawn on left side of graph, showing ticks on right so they are inside the graph
            var axMkr = d3.axisRight( scY1 ); 
            axMkr( svg.append("g") ); // d3.axisRight requires an SVG container as its argument - elements of axis are added as children of this container (component function)


            // Axis for 2nd data set on right side of graph, so ticks must be shown on left to be within the graph
            axMkr = d3.axisLeft( scY2 );

            // This axis must be moved to appropriate location using SVG transform attribute
            svg.append( "g" )
                .attr( "transform", "translate(" + pxX + ",0)" ) 
                .call( axMkr ); // Instead of calling axMkr function explicitly (as above), function is passed as argument to call() function. 


            // Function calls can be interchanged as shown here to draw axis
            svg.append( "g" ).call( d3.axisTop( scX ) )
                .attr( "transform", "translate(0," + pxY + ")" );
        } );
}