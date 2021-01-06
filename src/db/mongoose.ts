import mongoose from "mongoose";

export const createMongooseConnection = async () => {
  await mongoose.connect(process.env.MONGODB_URL!, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });
};
