const Hospital = require('../models/Hospital.js');
const Appointment = require('../models/Appointment.js');
// @desc   Get all getHospitals
// @route  Get /api/v1/hospitals
// @access Public
exports.getHospitals = async (req, res, next) =>{

    let query;
    
    //Copy req.query
    const reqQuery= {...req.query};

    //Fields to exclude
    const removeFields=[ 'select', 'sort', 'page', 'limit'];
    //Loop over remove fields and delete them from reqQuery
    removeFields.forEach(param=>delete reqQuery[param]);
    console.log(reqQuery)

    let queryStr=JSON.stringify(req.query);
    queryStr=queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match=>`$${match}`);
    
    query = Hospital.find(JSON.parse(queryStr)).populate('appointments');
    // console.log(queryStr);

    if(req.query.select) {
        const fields=req.query.select.split(',').join(' ');
        query=query.select(fields);
    }

    if(req.query.sort) {
        const sortBy=req.query.sort.split(',').join(' ');
        query=query.sort(sortBy);
    } else {
        query=query.sort('-createdAt');
    }

    //Pagination
    const page=parseInt(req.query.page, 10) || 1;
    const limit=parseInt(req.query.limit, 10) || 25;
    const startIndex= (page-1) *limit;
    const endIndex=page*limit;

    try{
        const total=await Hospital.countDocuments();
        query=query.skip(startIndex).limit(limit) ;
        const hospitals = await query;

        const pagination = {};

        if(endIndex<total) {
            pagination.next={
                page:page+1,
                limit
            }
        }
        
        if(startIndex>0) {
            pagination.prev={
                page:page-1,
                limit
            }
        }

        res.status(200).json({
            success:true,
            count: hospitals.length,
            pagination,
            data:hospitals
        });
    } catch (err) {
        res.status(400).json({success:false});
    }
}
    //Ver 2
    // try{
    //     const hospitals = await Hospital.find(req.query);
    //     console.log(req.query);
    //     res.status(200).json({success:true, count: hospitals.length, data:hospitals});
    // } catch(err){
    //     res.status(400).json({success:false});
    // }

    //Ver 1
    // res.status(200).json({success: true, msg:"Get all hospitals"});
// }

// @desc   Get single getHospital
// @route  Get /api/v1/hospitals/:id
// @access Public
exports.getHospital = async (req, res, next) =>{
    try{
        const hospital = await Hospital.findById(req.params.id);

        if(!hospital) {
            return res.status(400).jsom({success: false});
        }

        res.status(200).json({success:true, data:hospital});
    } catch(err){
        res.status(400).json({success:false});
    }
    // res.status(200).json({success: true, msg: `Get hospital ${req.params.id}`});
}

// @desc   Create a getHospital
// @route  POST /api/v1/hospitals
// @access Private
exports.createHospital = async (req, res, next) =>{
    const hospital = await Hospital.create(req.body);
    // console.log(req.body);
    // res.status(200).json({success: true, msg:"Create a hospital"});
    res.status(201).json({success: true, data:hospital});
}

// @desc   Update single getHospital
// @route  PUT /api/v1/hospitals/:id
// @access Private
exports.updateHospital = async (req, res, next) =>{
    try{
        const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if(!hospital) {
            return res.status(400).json({success:false});
        }

        res.status(200).json({success:true, data:hospital});
    }catch(err) {
        res.status(400).json({success: false});
    }
    // res.status(200).json({success: true, msg: `Update hospital ${req.params.id}`});
}

// @desc   Delete single getHospital
// @route  DELETE /api/v1/hospitals/:id
// @access Private
exports.deleteHospital = async (req, res, next) =>{
    try{
        const hospital = await Hospital.findById(req.params.id);
        // const hospital = await Hospital.findByIdAndDelete(req.params.id);

        if(!hospital) {
            return res.status(400).json({success: false, message:`Hospital not found with id of ${req.params.id}`});
        }

        await Appointment.deleteMany({hospital: req.params.id});
        await Hospital.deleteOne({_id: req.params.id});
        
        res.status(200).json({success:true, data: {}});
    }catch(err){
        res.status(400).json({success:false});
    }
    // res.status(200).json({success: true, msg: `Delete hospital ${req.params.id}`});
}