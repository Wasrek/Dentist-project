const mongoose = require('mongoose');

const connectDB = async ()=> {//async เพราะมีการใช้ await 
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(process.env.MONGO_URI);// waiting for การส่งข้อมูลกลับจากคำสั่งภายนอก

    console.log(`MongoDB Connected: ${conn.connection.host}`);
}

module.exports = connectDB;