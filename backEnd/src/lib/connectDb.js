import mongoose from "mongoose"
const connectDb = async()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`Mongodb connected: ${conn.connection.host}`)
    }catch(err){
        console.log("Db not connected",err)
        process.exit(1)
    }
}
export default connectDb