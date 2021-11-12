var express = require('express');
var xlsx=require('xlsx')
var router = express.Router();



/* GET home page. */
router.get('/', function(req, res, next) {
  const work=xlsx.readFile(__dirname+  '/test.xlsx');
  let sheet_name_list = work.SheetNames;

  let xlData = xlsx.utils.sheet_to_json(work.Sheets[sheet_name_list[0]]);

  // xlData.forEach((element)=>{
  //   //console.log(element)
  //   for(let i in element) {
  //     if(element.hasOwnProperty(i))
  //       console.log(element[i])
  //   }

  res.status(200).json(xlData[0]);
});

module.exports = router;
