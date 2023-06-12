const fs = require('fs')
const { transactionEvents } = require('../modals')

const readRDFFile =  (req,res,next) => {
    try {
        let arr = []
        const { pmt_ref_no } = req.body
        const data = fs.readFileSync('D:/postedtransactions_sample.txt','utf-8').toString().split("\n")
        data.forEach((file,index) => {
            // console.log(file,'file')
            if(index>0){
                arr.push({
                    cardId : file.slice(46,75).trim(),
                    timestamp : file.slice(76,92).trim(),  //transaction datetime
                    act_type: file.slice(93,102).trim(),  //transaction code/type
                    amount : file.slice(103,116).trim(),
                    ext_trans_id : file.slice(237,256).trim(),
                    pmt_ref_no: file.slice(297,308).trim(), //PRN
                    prod_id: file.slice(309,323).trim()
                })
            }
        })
        // const transactionEvent = await transactionEvents.find({
        //     pmt_ref_no:pmt_ref_no
        // }).select('ext_trans_id')

        return res.status(200).send({
            statusCode: 200,
            response: { 
                arr
            }
        });
    }
    catch(err) {
        console.log(err)
       
    }
}

module.exports = readRDFFile