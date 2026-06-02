const groupSchema = new mongoose.Schema({
    name: String,
  
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  
    groupPic: String,
  }, { timestamps: true });
  