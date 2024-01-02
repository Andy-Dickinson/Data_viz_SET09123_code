'use strict';

import Barchart from './visualisation/Barchart.js';
import Piechart from './visualisation/Piechart.js';

// Loading data
let salesData = await d3.csv('./data/sales.csv',
    // parsing function
    row=>{
        return {
            'client': row.client,                   // unchanged
            'location': row.location,               // unchanged
            'paid': row.paid==='Yes',               // parse boolean
            'sales': parseFloat(row.sales),         // parse number
            'rep': row.salesrep,                    // rename column
            'expenses': parseFloat(row.expenses),   // parse number
            'reimbursed': row.reimbursed==='Yes'    // parse boolean
        }
    });

console.log(salesData);

// reshape/transform data
let salesByCity = d3.rollups(salesData, v=>d3.sum(v, d=>d.sales), d=>d.location)
    .map(d=>{
        return {
            k: d[0],
            v: d[1]
        }
    })

console.log(salesByCity);

let expByCity = d3.rollups(salesData, v=>d3.sum(v, d=>d.expenses), d=>d.location)
    .map(d=>{
        return {
            k: d[0],
            v: d[1]
        }
    })

console.log(expByCity);

let expByRep = d3.rollups(salesData, v=>d3.sum(v, d=>d.expenses), d=>d.rep)
    .map(d=>{
        return {
            k: d[0],
            v: d[1]
        }
    })

console.log(expByRep);

let salesByPaid = d3.rollups(salesData, v=>d3.sum(v, d=>d.sales), d=>d.paid)
.map(d=>{
    return {
        k: d[0]?'Paid':'Not Paid',
        v: d[1]
    }
})

console.log(salesByPaid);

// number formats using a custom locale
let enUK = d3.formatLocale({
    decimal: '.',
    thousands: ',',
    grouping: [3],
    currency: ['£','']
});
let formatGBP = enUK.format('$,.2f');

// Initialise visualisations
let b1 = new Barchart('div#bar1', 700, 500, [10,20,50,20]);
let b2 = new Barchart('div#bar2', 400, 300, [10,20,50,20]);
let p1 = new Piechart('div#pie1', 500, 500, [0,0,40,40]);
let p2 = new Piechart('div#pie2', 300, 300, [10,10,20,30]);

// setup callbacks
let highlightCity = city=>{
    b1.highlightBars([city]);
    p1.highlightArcs([city]);
}
let resetHighlightCity = ()=>{
    b1.highlightBars();
    p1.highlightArcs();
}

// Render + customise visualisations
b1.setTooltip(d=>`City: ${d.k} - Total sales: ${formatGBP(d.v)}`)
    .setOver(highlightCity)
    .setOut(resetHighlightCity)
    .render(salesByCity);

p1.setTooltip(d=>`City: ${d.k} - Total expenses: ${formatGBP(d.v)}`)
    .setOver(highlightCity)
    .setOut(resetHighlightCity)
    .render(expByCity);

b2.setTooltip(d=>`Rep.: ${d.k} - Total expenses: ${formatGBP(d.v)}`)
    .setOver(k=>{b2.highlightBars([k]);})
    .setOut(k=>{b2.highlightBars();})
    .render(expByRep);

p2.setTooltip(d=>`${d.k}: ${formatGBP(d.v)}`)
    .setOver(k=>{p2.highlightArcs([k]);})
    .setOut(k=>{p2.highlightArcs();})
    .render(salesByPaid);

