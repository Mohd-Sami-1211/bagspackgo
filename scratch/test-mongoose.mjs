import mongoose from 'mongoose';

async function test() {
    await mongoose.connect('mongodb+srv://sami:sami@cluster0.dbw3x.mongodb.net/bagspackgo?retryWrites=true&w=majority&appName=Cluster0');
    console.log("Connected");
    
    // Define the schema as in your app
    const itineraryDaySchema = new mongoose.Schema({
        hotelPhotos: [{ type: String }],
        location: String
    });
    const packageSchema = new mongoose.Schema({
        packagePhotos: [{ type: String }],
        photos: [{ type: String }],
        itinerary: [itineraryDaySchema]
    });
    
    const Package = mongoose.models.PackageTest || mongoose.model('PackageTest', packageSchema, 'packages');
    
    try {
        const pkgQuery = { status: { $in: ['active', 'published'] }, category: 'trip' };
        let packagesQuery = Package.find(pkgQuery);
        packagesQuery = packagesQuery.select('-packagePhotos -photos -itinerary.hotelPhotos');
        const result = await packagesQuery.limit(1).lean();
        console.log("Success:", result);
    } catch (err) {
        console.error("Mongoose Error:", err.message);
    }
    
    mongoose.disconnect();
}
test();
