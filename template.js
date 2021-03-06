/**
 * Ricardo Hernandez 
 * October 20, 2020
 * This file will create a template so that the coaches know what fields are necessary to upload data.
 * It creates a downloadable template when it is clicked
 */
var json2csv = require('json2csv').parse;
 
exports.get = function(req, res) {
 
    var fields = [
        'Number',
        'FullName',
        'Pos',
        'GradYear',
        'Height',
        'Weight',
        'Hometown/High School',
        'Email'
    ];
 
    // var csv = json2csv({ data: '', fields: fields });

    var csv = json2csv( {
        'Number' : 58,
        'FullName': "Justin Titchenell",
        'Pos': "OL",
        'GradYear': 2021,
        'Height': "5-ll",
        'Weight': 245,
        'Hometown/High School' : "West Chester, PA / Malvern Prep",
        'Email': "hernri01@gettysburg.edu"
      });
 
    res.set("Content-Disposition", "attachment;filename=roster.csv");
    res.set("Content-Type", "application/octet-stream");
 
    res.send(csv);
 
};