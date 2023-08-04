// models/Candidate.js
const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    name:{  
        type:String  
    },  
    email:{  
        type:String  
    },    
    mobile:{  
        type:Number  
    },
    dateofbirth:{
        type:String
    },
    Workexperience:{
        type:String
    },
    Currentlocation:{
        type:String
    },
    Postaladdress:{
        type:String
    },
    Currentemployee:{
        type:String
    },
    Currentdestination:{
        type:String
    },
});

const Candidate = mongoose.model('Candidate', candidateSchema);

module.exports = Candidate;
