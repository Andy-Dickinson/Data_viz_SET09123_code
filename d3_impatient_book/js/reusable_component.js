// A component is a function that takes a Selection instance as its first argument
// components are not 'things', they are 'actions', although often the action results in a thing being added to the DOM tree 
// - components do not return the elements it creates, but adds them directly to the DOM tree

// component to create labeled rectangles (text boxes)
function sticker( sel, label ) {

    // create and configure rectangle as child of supplied selection centered at the origin
    sel.append( "rect" ).attr( "rx", 5 ).attr( "ry", 5 )
        .attr( "width", 70 ).attr( "height", 30 )
        .attr( "x", -35 ).attr( "y", -15 ) // coordinates of upper left corner
        .attr( "fill", "none" ).attr( "stroke", "blue" )
        .classed( "frame", true );

    // create and configure text element and assign name
    sel.append( "text" ).attr( "x", 0 ).attr( "y", 5 )
        .attr( "text-anchor", "middle" ) // mid point of text string used as current text position
        .attr( "font-family", "sans-serif" ).attr( "font-size", 14 )
        .classed( "label", true )
        .text( label ? label : d => d ); // if 2nd argument has been supplied, use it as label, otherwise use data bound to current node
   }


function makeSticker() {
    var labels = [ "Hello", "World", "How", "Are", "You?" ];
    var scX = d3.scaleLinear()
        .domain( [0, labels.length-1] ).range( [100, 500] );
    var scY = d3.scaleLinear()
        .domain( [0, labels.length-1] ).range( [50, 200] );

    // uses comoponent with bound data
    d3.select( "#sticker" ) 
        .selectAll( "g" ).data( labels ).enter().append( "g" )
        .attr( "transform",
            (d,i) => "translate(" + scX(i) + "," + scY(i) + ")" ) // uses functions above to scale data and move relevent object to coordinantes as per scale
        .call( sticker ); // executes sticker() function supplying current selection - call function automatically injects current selection as first argument

    // uses component without bound data
    d3.select( "#sticker" ).append( "g" )
        .attr( "transform", "translate(75,200)" ) // moves to supplied coordinates
        .call( sticker, "I'm fine!" ) // text to use in label - call also returns current selection allowing chaining
        .selectAll( ".label" ).attr( "fill", "red" );
}
