const mongoose= require('mongoose')
require('dotenv').config()

exports.dbConnect=()=>{

    mongoose.connect(process.env.DATABASE_URL)
    .then(console.log('DB connection successful'))
    .catch((error)=>{

        console.log("db connection issues");
        console.error(error);
        process.exit(1)
        
        
    })
}