function makePie() {
    var data = [ { name: "Jim", votes: 12 },
                 { name: "Sue", votes: 5 },
                 { name: "Bob", votes: 21 },
                 { name: "Ann", votes: 17 },
                 { name: "Dan", votes: 3 } ];
                 
    // creates instance of the pie layout, configures it, and invokes on dataset. (transforms the data)
    // returns an array of objects with one object for each record in original dataset. Each contains reference to original data, start and end angles of associated slice
    var pie = d3.pie().value(d=>d.votes).padAngle(0.025)( data );

    // creates and configures an arc generator. Used to take transformed dataset and create svg path
    var arcMkr = d3.arc().innerRadius( 50 ).outerRadius( 140 )
        .cornerRadius(10);

    // creates a scale object that associates a colour with each pie element (drawn from built-in scheme 'd3.schemePastel2' (defines set of gentle colors))
    // scaleOrdinal maps discrete domain values to discrete range values
    var scC = d3.scaleOrdinal( d3.schemePastel2 ) 
        .domain( pie.map(d=>d.index) ) 

    // selects destination element, appends g element and moves into position
    var g = d3.select( "#pie" )
        .append( "g" ).attr( "transform", "translate(300, 150)" )

    g.selectAll( "path" ).data( pie ).enter().append( "path" ) // binds
        .attr( "d", arcMkr ) // invokes generator
        .attr( "fill", d=>scC(d.index) ).attr( "stroke", "grey" );

    // adds text labels to slices
    g.selectAll( "text" ).data( pie ).enter().append( "text" ) 
        .text( d => d.data.name )
        .attr( "x", d=>arcMkr.innerRadius(70).centroid(d)[0] ) // centroid() returns coordinates of center of each pie slice. Here we are moving label towards rim
        .attr( "y", d=>arcMkr.innerRadius(70).centroid(d)[1] )
        .attr( "font-family", "sans-serif" ).attr( "font-size", 14 )
        .attr( "text-anchor", "middle" );
}