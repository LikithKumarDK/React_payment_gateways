import mongoose from 'mongoose';

const URL = 'mongodb://127.0.0.1:27017/payments';

export const connectDb = () => {
    mongoose
        .connect(URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => {
            console.log('mongodb connected successfully');
        })
        .catch((err) => {
            throw err;
        });
};
