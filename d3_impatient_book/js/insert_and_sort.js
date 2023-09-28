function insert_sort() {
    var data = [ "Jane", "Anne", "Mary" ];

    var ul = d3.select( "#sort" );
    ul.selectAll( "li" ).data( data ).enter().append( "li" ) // unordered list is populated from dataset
        .text( d=>d );
    
    // insert on mouse enter
    var once; // used to make sure new items are only added to the list once

    // first of 2 event handlers - mouse enters area occupied by the list, Lucy is inserted at position 2, Lisa is inserted in first-child position
    ul.on( "mouseenter", function() { 
        if( once ) { return; }
        once = 1;
        ul.insert( "li", ":nth-child(2)" ) // position where new list items are to be inserted is specified through pseudo-classes. The :nth-child() pseudo-class starts counting at 1
            .datum( "Lucy" ).text( "Lucy" ); // set data bound to each element and setting visible text needs to be done separately when using insert()
        ul.insert( "li", ":first-child" ) // another element is added in front of the entire list, pushing the previously added element from the second to the third position (evaluated at the time the pseudo-class is applied)
            .datum( "Lisa" ).text( "Lisa" );
    } );

    // sort on click
    ul.on( "click", function() { 
        ul.selectAll( "li" ).sort( (a,b)=>( a<b?1:b<a?-1:0 ) ); // on mouse click, elements are sorted in decending order based on value of data bound to them
    } );
}