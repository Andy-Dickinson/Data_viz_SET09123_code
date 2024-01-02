// building charts from classes

'use strict';

// imports classes
import BarChart from './BarChart.js';
import BubbleChart from './BubbleChart.js';
import LineChart from './LineChart.js';
import Pie_donut from './Pienut.js';
import Scatter from './Scatter.js';
import UKMap from "./UKMap.js";

let dogsData = [{breed:'Golden Retriever', count:8653, weight: 39.5, height: 56},
    {breed:'Alaskan Malamute', count:261, weight: 36, height: 61},
    {breed:'Newfoundland', count:577, weight: 67.5, height: 68.5},
    {breed:'Siberian Husky', count:391, weight: 21.5, height: 55.5},
    {breed:'Shiba Inu', count:434, weight: 9, height: 38},
    {breed:'Keeshond', count:82, weight: 17.5, height: 44},
    {breed:'Australian Shepherd', count:255, weight: 24, height: 52},
    {breed:'Border Collie', count:1718, weight: 16, height: 51},
    {breed:'German Shepherd', count:7067, weight: 31, height: 60},
    {breed:'Swiss Shepherd', count:110, weight: 32.5, height: 60.5}]





// Create instances of Bar Chart
let barchart1 = new BarChart('div#bar1', [50,50,70,30], 900);

// Render data for barChart using the render method
// binds on and x-axis category taken from breed, y-axis: count
// now carried out below under lab 6
// barchart1.render(dogsData, 'breed', 'count', {x_title:"Breed", y_title:"Registration count"});

// Example of applying styles, colors, and other attributes based on the data
// NOTE however that this will take priority over highlighting
// d3.select('div#bar1')
//     .selectAll('g.chart').selectAll('rect.bar').style('fill', d => d['count'] < 400 ? '#ba4a53' : null)
//     .style('stroke', d => d['count'] < 400 ? '#381619' : null)
//     .style('stroke-width', '2px');


    


// Bubble Chart
let bubblechart1 = new BubbleChart('div#bubble1', [50,50,70,30], 900);
// binds on 'breed', x-axis: weight, y-axis: height, radius: count
// now rendered below in lab 6
// bubblechart1.render(dogsData, 'breed', 'weight', 'height', 'count', {x_title:"Weight", y_title:"Height"}); // Use the same data as bar chart

// data driven styling
// d3.select('div#bubble1')
//     .selectAll('g.chart').selectAll('circle.bubble').style('fill', d => d['count'] < 400 ? '#ba4a53' : null)
//     .style('stroke', d => d['count'] < 400 ? '#381619' : null)
//     .style('stroke-width', '2px');








// y = year, c = registration counts
let grHistoric =[[{y:2011,c:8081},
                  {y:2012,c:7085},
                  {y:2013,c:7117},
                  {y:2014,c:6977},
                  {y:2015,c:6928},
                  {y:2016,c:7232},
                  {y:2017,c:7846},
                  {y:2018,c:7794},
                  {y:2019,c:8422},
                  {y:2020,c:8653}],
                [{y:2011,c:8081},
                {y:2012,c:5000},
                {y:2013,c:5500},
                {y:2006,c:6066},
                {y:2015,c:6928},
                {y:2016,c:7232},
                {y:2017,c:4032},
                {y:2022,c:6666},
                {y:2019,c:5011},
                {y:2020,c:7000}],
                [{ y: 2017, c: 5224 },
                { y: 2016, c: 7151 },
                { y: 2012, c: 5372 },
                { y: 2010, c: 8593 },
                { y: 2018, c: 6423 },
                { y: 2019, c: 7315 },
                { y: 2015, c: 6037 },
                { y: 2014, c: 6732 },
                { y: 2013, c: 5142 },
                { y: 2020, c: 7507 }]
]; 
/*
*/
/*
let grHistoric =[{y:2011,c:8081},
    {y:2012,c:7085},
    {y:2013,c:7117},
    {y:2014,c:6977},
    {y:2018,c:7794},
    {y:2019,c:8422},
    {y:2015,c:6928},
    {y:2016,c:7232},
    {y:2017,c:7846},
    {y:2020,c:8653}]; 
/*
*/


// Line chart
// now rendered below
let linechart1 = new LineChart('div#line1', [50,50,70,30], 900);
// linechart1.render(grHistoric, 'y', 'c', ["Line 1", "Line 2", "Line 3"], {x_title:'Year', y_title:'Registration Count', include_x_domain_zero:false, include_y_domain_zero:false, axis_pad:[1,1,500,0], nice:false});




// Pie chart
// now rendered below under lab 6
let pie1 = new Pie_donut('div#pie_donut1', [50,50,70,30], 900);
// pie1.render(dogsData, 'breed', 'count');





// Scatter chart
let scat1 = new Scatter('div#scatter1', [50,50,70,30], 900);
scat1.render(grHistoric, 'y', 'c', ['s1', 's2', 's3'], {x_title:'Year', y_title:'Registration Count', axis_pad:[1,1,500,0], include_x_domain_zero:false, include_y_domain_zero:false, nice:true, dot_size:7});




// lab 5 -----------------------------------------------------------------------------------------------------------------

// Loading data from a file

// modern approach, can write in more synchronous style, await pauses execution of code while waits for operation (data to load)
async function loadData() {
    try {
        // does not strictly need to be in a function, can be from here -------------------
        let dataset = await d3.csv('data/sales.csv', d=>{
            return {
                location: d.location,                           // unchanged
                client: d.client,                               // unchanged
                salesrep: d.salesrep,                           // unchanged
                paid: d.paid === 'Yes',                         // parsed to bool
                reimbursed: d.reimbursed === 'Yes',             // parsed to bool
                sales: parseInt(d.sales),                       // parsed to int
                expenses: parseInt(d.expenses),                 // parsed to int
                profits: parseInt(d.sales)-parseInt(d.expenses) // new attribute
            }
        });

    // Once the data is loaded and processed, log it to the console
    console.log('Loaded data:');
    console.log(dataset);

    // can use dataset in here or return it, but note need to wait for an async function 

    return dataset;
    // to here ----------------------------
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

// need to wait for async functions
let salesData = await loadData();


// more traditional way, "Promise pattern", .then is specified what to do after operation (data has loaded) with a callback 
let ds_var;
d3.csv('data/sales.csv', d => {
    return {
        location: d.location,
        client: d.client,
        salesrep: d.salesrep,
        paid: d.paid === 'Yes',
        reimbursed: d.reimbursed === 'Yes',
        sales: parseInt(d.sales),
        expenses: parseInt(d.expenses),
        profits: parseInt(d.sales) - parseInt(d.expenses)
    }
})
.then(dataset => {
    // Handle the dataset after it's loaded and processed
    ds_var = dataset;
    // To use ds_var outside this block, would need to call any function that uses it from here
})
// does not strictly need to have catch
.catch(error => {
    // Handle any errors that occur during the loading or processing
    console.error('An error occurred:', error);
});


console.log("");


// Questions using data operations to answer:

// Find the lists of unique Sales Rep, Locations and Clients.
let reps = Array.from(new Set(salesData.map(d=>d.salesrep))); // gets all salesreps, then puts them in a set, and turns into an array
        console.log('Unique salesreps: ', reps);

let clients = Array.from(new Set(salesData.map(d=>d.client)));
        console.log('Unique clients: ', clients);
        
let locs = Array.from(new Set(salesData.map(d=>d.location)));
        console.log('Unique locations: ', locs);

console.log("");



// Find the number of sales for which payment has been received.
let nSalesPaid = salesData.filter(d=>d.paid).length; // filters and keeps the data 'paid' (only present if it was yes in dataset), then gets length
        console.log('Number of sales paid: ', nSalesPaid);
// can also do using d3.sum:
const sales_pay_rec = d3.sum(salesData, d => d.paid ? 1 : 0);

console.log("");



// Group the dataset entries by Sales Rep and then Locations.
let byRepLoc1 = d3.group(salesData, d=>d.salesrep, d=>d.location); // returns a map
let byRepLoc2 = d3.groups(salesData, d=>d.salesrep, d=>d.location); // returns an array
let byRepLoc3 = d3.flatGroup(salesData, d=>d.salesrep, d=>d.location); // returns a flat array of [key0, key1, …, values] instead of nested maps; useful for iterating over all groups
        console.log('Data by salesrep and location:');
        console.log("group: ", byRepLoc1);
        console.log("groups: ", byRepLoc2);
        console.log("flatGroup: ", byRepLoc3);

        console.log("groupVar.get('Harry') - salesRep: ", byRepLoc1.get("Harry")); // retrieving by salesrep
        console.log("groupsVar[0]: ", byRepLoc2[0]); // retrieving from array
        console.log("flatGroupVar[0]: ", byRepLoc3[0]);

console.log("");



// Group the dataset entries by Client and then Locations and get the number of entries in each group.
let salesByClientLoc1 = d3.rollup(salesData, v=>v.length, d=>d.client, d=>d.location); // Groups and reduces the specified iterable of values into an InternMap from key to reduced value, here there are 6 'H' Client with 'Glasgow' location....groups by client, then location, then reduces that by the length to a single value (mapped by client then location to get 6)
let salesByClientLoc2 = d3.rollups(salesData, v=>v.length, d=>d.client, d=>d.location); //  returns an array of [key, value] entries instead of a map, when more than one key (as here), then nested array of [key, value] entries
let salesByClientLoc3 = d3.flatRollup(salesData, v=>v.length, d=>d.client, d=>d.location); //returns a flat array of [key0, key1, …, value] instead of nested maps; useful for iterating over all groups
        console.log('Number of sales by client and location:');
        console.log("rollup: ", salesByClientLoc1);
        console.log("rollups: ", salesByClientLoc2);
        console.log("flatRollup: ", salesByClientLoc3);

        console.log("rollupVar.get('H') - client: ", salesByClientLoc1.get("H")); // retrieving from map by client
        console.log("rollupVar.get('H').get('Glasgow'): ", salesByClientLoc1.get("H").get("Glasgow")); // retireiving from nested map, clients city data
        console.log("rollupsVar[0]: ", salesByClientLoc2[0]); // retrieving from array
        console.log("flatRollupVar: ", salesByClientLoc3[0]); // retrieving from flat array
        
console.log("");



// Distribute the entries into 10 equally-sized categories based on the Expenses values.
let bin = d3.bin().thresholds(10).value(d=>d.expenses); // defines generator - weird behaviour on thresholds count, it is approximate - 4 produces 4 arrays, 10 produces 9, 11 produces 16 ????????????????????????????????????????????????
let expensesBin = bin(salesData); // applies generator to data
        console.log('Distribution of expenses: ', expensesBin);
        console.log(expensesBin.length);

console.log("");




// Get the average Sales value per Location.
let avgSalesByLoc = d3.rollups(salesData, v=>d3.mean(v,d=>d.sales), d=>d.location); // groups by location, then gets mean sales value and returns as array
        console.log('Average sales by location: ', avgSalesByLoc);

console.log("");



// Get the maximum Expenses value by Sales Rep and Location.
let maxExpByRepLoc = d3.flatRollup(salesData, v=>d3.max(v,d=>d.expenses), d=>d.salesrep, d=>d.location); // groups by salesrep, then location, then gets max expenses and returns as flat array
        console.log('Max expenses by salesrep and location: ', maxExpByRepLoc);

console.log("");



// Get the total reimbursed Expenses value by Sales Rep.
let totalMoneyReimbursedByRep = d3.rollup(salesData.filter(d=>d.reimbursed), v=>d3.sum(v,d=>d.expenses), d=>d.salesrep); // groups by salesrep, then gets sum of expenses, and then filters and keeps those that were reimbursed, returns as map
let totalMoneyClaimedNotReimbursedByRep = d3.rollup(salesData.filter(d=>!d.reimbursed), v=>d3.sum(v,d=>d.expenses), d=>d.salesrep); // returns expenses claimed which have not yet been reimbursed by sales rep
let totalMoneyClaimedByRep= d3.rollup(salesData, v=>d3.sum(v,d=>d.expenses), d=>d.salesrep);
        console.log('Total expenses reimbursed by salesrep: ', totalMoneyReimbursedByRep);
        console.log("Total claimed but not yet reimbursed by salesrep: ", totalMoneyClaimedNotReimbursedByRep);
        console.log("Total claimed by rep: ", totalMoneyClaimedByRep);

console.log("");



// Find the Client and Sales value of the entry with the highest Sales in Glasgow.
let maxSalesClientGlasgow = d3.greatest(salesData.filter(d=>d.location=='Glasgow'), d=>d.sales); // greatest used with a comparator vs max which uses an accessor, here filters by location and keeps Glasgow, then gets greatest sales value. Returns as dict
        console.log('Client with max sales in Glasgow: ', maxSalesClientGlasgow);
        console.log("client: ", maxSalesClientGlasgow['client']);  // can access returned data as a normal dict
        console.log(`client: ${maxSalesClientGlasgow.client} sales: ${maxSalesClientGlasgow.sales}`); // or dot operator (used here with literal templates)

console.log("");



// Get a new array of entries, with the names of Sales Rep and their reimbursement percentage (reimbursed expenses / total expenses).
let totalExpensesByRep = d3.rollup(salesData, v=>d3.sum(v,d=>d.expenses), d=>d.salesrep); // groups by salesrep and sums their expenses, returns as map
let format = d3.format('.2'); // sets format
let rateReimbursedByRep = reps.map(d=>{return {rep:d, reimbursedRate:format(totalMoneyReimbursedByRep.get(d)/totalExpensesByRep.get(d))}}); // uses an anonymous or arrow function that serves as a callback function, uses map from rollup functions (one defined earlier, other above) to get total reimbursed / total expenses for each rep (also defined earlier as array), value is then formatted
console.log('Reimbursed rate by salesrep: ', rateReimbursedByRep);

console.log("");



// Get the entry with a Sales value closest to £3,456 in Aberdeen.
let sortedSalesAberdeen = d3.sort(salesData.filter(d=>d.location=='Aberdeen'), d=>d.sales) // filters by location (Aberdeen), then sorts by sales (assending order)
let closestSalesIndex = d3.bisector(d=>d.sales).center(sortedSalesAberdeen, 3456) // bisector.center returns index closest to 3456 from sortedSalesAberdeen looking at the datas sales values 
        console.log('Closest sales to 3456 in Aberdeen: ', sortedSalesAberdeen[closestSalesIndex]); // obtains corresponding dict obj

console.log("");



// Get the entry that appears both in the top 10 sales done in Inverness and the top 10 sales done by James (by Sales value).
let topSalesInverness = d3.sort(salesData.filter(d=>d.location=='Inverness'), (a,b)=>d3.descending(a.sales,b.sales)).filter((d,i)=>i<10); // filters data by location Inverness, then sorts data in decending order of sales (larges first), and filters the top 10
let topSalesJames = d3.sort(salesData.filter(d=>d.salesrep=='James'), (a,b)=>d3.descending(a.sales,b.sales)).filter((d,i)=>i<10); // filters data by sales rep James, then sorts in decending order (largest first), and filters the top 10
let commonEntries = d3.intersection(topSalesInverness, topSalesJames); // intersection returns a new InternSet containing every (distinct) value that appears in all of the given iterables
        console.log('Sales top 10 James and top 10 Inverness: ', Array.from(commonEntries)); // converts to Array

console.log("");

// ------------------------------------------------------------------------------------------------------------------------





// Lab 6 ------------------------------------------------------------------------------------------------------------------

// highlight bars with breed = Golden Retriver or Newfoundland
// barchart1.highlightBars(['Golden Retriever', 'Newfoundland'], 'breed');

// barchart1.setClickBar(k=>{barchart1.highlightBars([k]);});

// remove all highlight
// barchart1.highlightBars();


// define callbacks and assigns them to visualisations 
// not sure how to implement these just yet?????
// let highlight = function(event, data){
//     barchart1.highlightBars([data.k]);
//     bubblechart1.highlightBubbles([data.k]);
// }

// let rmvHightlight = function(event, data) {
//     barchart1.highlightBars();
//     bubblechart1.highlightBubbles();
// }

// barchart1.setOverBar(highlight)
//     .setOutBar(rmvHighlight);



// can dynamiclly set toooltip: .setTooltip(d => `${barchart1.getInterSel()}: ${d[barchart1.getInterSel()]}`)

barchart1
    .render(dogsData, 'breed', 'count', {x_title:"Breed", y_title:"Registration count"})
    .setTooltip(d => `Breed: ${d.breed} - Count: ${d.count}`)
    .setMouseover(k => {barchart1.highlightSelection([k]);})
    .setMouseout(k => {barchart1.highlightSelection();});
    

bubblechart1
    .render(dogsData, 'breed', 'weight', 'height', 'count', {x_title:"Weight", y_title:"Height"})
    .setTooltip(d => `Breed: ${d.breed} - Weight: ${d.weight} - Height: ${d.height} - Count: ${d.count}`)
    .setMouseover(k => {bubblechart1.highlightSelection([k]);})
    .setMouseout(k => {bubblechart1.highlightSelection();});




pie1
    .render(dogsData, 'breed', 'count')
    .setTooltip(d => `Breed: ${d.breed} - Count: ${d.count}`)
    .setMouseover(k => {pie1.highlightSelection([k]);})
    .setMouseout(k => {pie1.highlightSelection();});



linechart1.render(grHistoric, 'y', 'c', ["Line 1", "Line 2", "Line 3"], {x_title:'Year', y_title:'Registration Count', include_x_domain_zero:false,             include_y_domain_zero:false, axis_pad:[1,1,500,0], nice:false})
        .setTooltip(d => `Year: ${d.y} - Count: ${d.c}`)
        .setMouseover(k => {linechart1.highlightSelection([k]);})
        .setMouseout(k => {linechart1.highlightSelection();})
        .setTooltipLine((d,i) => `Dataset: ${i+1}`)
        .setMouseoverLine(k => {linechart1.highlightSelectionLine([k]);})
        .setMouseoutLine(k => {linechart1.highlightSelectionLine();});










// Map
let map = new UKMap('div#map', 590,389);