const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes'); 
const settingRoutes = require('./routes/settings')
const fileRoute = require('./routes/files')
const blogRoutes = require('./routes/blogRoute')
const planRoutes = require('./routes/planRoutes')
const invoiceRoutes = require('./routes/invoiceRoutes')
dotenv.config();

const app = express();
 
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log(" MongoDB connected");
}).catch((err) => {
  console.error("MongoDB connection error:", err);
});
 
app.use(helmet()); 

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));


app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use(cors({
  origin: process.env.CLIENT_URL,  
  credentials: true
}));



// Session Store
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
    ttl: 14 * 24 * 60 * 60
  }),
  cookie: {
    httpOnly: true,
    secure: false,        
    sameSite: 'lax',   
    maxAge: 7 * 24 * 60 * 60 * 1000
  },
}));
 
app.get('/', (req, res) => {
    if (req.session.user) { 
        res.status(200).json({success:true,user:req.session.user, message:'User is logged in'});

    } else {      

      console.log(req.session)
      res.status(200).json({success:false,user:null, message:'User is not logged in'});

    }
});

 
app.use('/api/auth', authRoutes);
app.use('/api/settings',settingRoutes) 
app.use('/api/files-section',fileRoute)
app.use('/api/blogs', blogRoutes);
app.use('/api/plans', planRoutes)
app.use('/api/invoice',invoiceRoutes)
 
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});
 
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});
 
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
