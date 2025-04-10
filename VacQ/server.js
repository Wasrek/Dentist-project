const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const mongoSanitize = require("express-mongo-sanitize");
const { xss } = require("express-xss-sanitizer");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");

dotenv.config({ path: "./config/config.env" });

connectDB();

const app = express();

//add body parser
app.use(express.json());
app.use(hpp());
app.use(mongoSanitize());
app.use(xss());
app.use(cookieParser());
app.use(helmet());

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Library API",
      version: "1.0.0",
      description: "A simple Express VacQ API",
    },
    servers: [
      {
        url: "http://localhost:5003/api/v1",
      },
    ],
  },
  apis: ["./routes/*.js"],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// Allow frontend (http://localhost:5173) to access backend
app.use(cors());
const limiter = rateLimit({
  windowsMs: 10 * 60 * 1000, //10 mins
  max: 100,
});
app.use(limiter);

const hospitals = require("./routes/hospitals");
const auth = require("./routes/auth");
const appointments = require("./routes/appointments");

//Mount routers
app.use("/api/v1/hospitals", hospitals);
app.use("/api/v1/auth", auth);
app.use("/api/v1/appointments", appointments);

const PORT = process.env.PORT || 5003;
// app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV,' mode on port ', PORT));
const server = app.listen(
  PORT,
  console.log(
    "Server running in ",
    process.env.NODE_ENV,
    " mode on port ",
    PORT
  )
);
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
// app.get('/api/v1/hospitals', (req, res)=> {
//     res.status(200).json({success: true, msg:"Show all hospitals"});
// });

// app.get('/api/v1/hospitals/:id', (req, res)=> {
//     res.status(200).json({success: true, msg:`Show all hospitals ${req.params.id}`});

// });

// app.post('/api/v1/hospitals', (req, res)=> {
//     res.status(200).json({success: true, msg:"Create new hospitals"});
// });

// app.put('/api/v1/hospitals/:id', (req, res)=> {
//     res.status(200).json({success: true, msg:`Update hospital ${req.params.id}`});
// });

// app.delete('/api/v1/hospitals/:id', (req, res)=> {
//     res.status(200).json({success: true, msg:`Delete hospital ${req.params.id}`});
// });
// app.get('/', (req,res) =>{
//     // 1. res.send('<h1>Hello from express</h1>');
//     // 2. res.send({name:'Brad'});
//     // 3. res.json({name:'Brad'});
//     // 4. res.sendStatus(400);
//     // 5. res.status(400).json({success:false});
//     res.status(200).json({success:true, data:{id:1}});
// });
