var express = require('express');
var XLSX=require('xlsx')
var router = express.Router();



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
  const work=XLSX.readFile('test.xlsx');
  var sheet_name_list = work.SheetNames;

  var xlData = XLSX.utils.sheet_to_json(work.Sheets[sheet_name_list[0]]);

  xlData.forEach((element)=>{
    //console.log(element)
    for(let i in element) {
      if(element.hasOwnProperty(i))
        console.log(element[i])
    }

  })
});

module.exports = router;
