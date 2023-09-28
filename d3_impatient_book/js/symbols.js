function makeSymbols() {

    // defines a dataset consisting of x and y coordinates and additional value
    var data = [ { "x": 40, "y": 0, "val": "A" }, 
                { "x": 80, "y": 30, "val": "A" },
                { "x": 120, "y": -10, "val": "B" },
                { "x": 160, "y": 15, "val": "A" },
                { "x": 200, "y": 0, "val": "C" },
                { "x": 240, "y": 10, "val": "B" } ];

    var symMkr = d3.symbol().size(81).type( d3.symbolStar ); // d3.symbol() function returns a symbol generator instance. Configure size (proportional to symbols area, not radius) and select star shape as type
    var scY = d3.scaleLinear().domain([-10,30]).range([80,40]); // scales values (specifically for the y values), inverted range to compensate for upside-down SVG graphics

    d3.select( "#symbols" ).append( "g" ) // initial selection, holds symbols on left of graph and kept sepearte from ones on right
        .selectAll( "path" ).data(data).enter().append( "path" ) // binds data and creates a new path element for each data point
        .attr( "d", symMkr ) // populates d attribute of previously created path element using the symbol generator (supplied as a function - automatically invoked for each data point)
        .attr( "fill", "red" )
        .attr( "transform", // moves each newly created path element to final position through svg transform using the scale object to calculate vertical offset
            d=>"translate(" + d["x"] + "," + scY(d["y"]) + ")" );


    var scT = d3.scaleOrdinal(d3.symbols).domain(["A","B","C"]); // for right side of graph, shape is set according to 3rd column of dataset. ordinal (or discrete) scale essentially hashmap that associates each value in the input domain with a value in the array d3.symbols of avaliable symbol shapes

    d3.select( "#symbols" )
        .append( "g" ).attr( "transform", "translate(300,0)" ) // appends g element and shifts to the right (shift will also apply to all children of g element)
        .selectAll( "path" ).data( data ).enter().append( "path" )
        .attr( "d", d => symMkr.type( scT(d["val"]) )() ) // reuse symbol generator instance, each time invoked, type is set explicitly based on value from dataset
        .attr( "fill", "none" ) // these symbols only have outlines, no fill
        .attr( "stroke", "blue" ).attr( "stroke-width", 2 )
        .attr( "transform", // moves each symbol into position as above. Does not need changing as entire g element has been shifted to avoid overprinting stars on left 
            d=>"translate(" + d["x"] + "," + scY(d["y"]) + ")" );
   }