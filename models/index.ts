import * as mongoose from 'mongoose'
mongoose.connect('mongodb://127.0.0.1/cnodejsData',{
  server:{poolSize: 20}
}, function(err){
  if(err){
    process.exit(1)
  }
})

export const Article = require('./article')