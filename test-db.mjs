import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Need to load the exact same env variables the app uses
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function run() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // Simple definition of Package model just for testing
        const pkgSchema = new mongoose.Schema({}, { strict: false });
        const Package = mongoose.models.Package || mongoose.model('Package', pkgSchema, 'packages');

        const destination = 'kashmir';
        
        const pkgQuery = { 
            status: { $in: ['active', 'published'] },
            category: 'trip',
            destination: { $regex: new RegExp(`^${destination}$`, 'i') },
            days: { $gte: 5, $lte: 7 },
            packageType: 'individual'
        };

        console.time('Fetch packages explain');
        // removed explain
        console.timeEnd('Fetch packages explain');

        console.time('Fetch packages');
        const packages = await Package.find(pkgQuery).select('-packagePhotos -photos').lean();
        console.timeEnd('Fetch packages');
        console.log(`Found ${packages.length} packages for individual`);
        
        let totalSize = 0;
        for (const pkg of packages) {
            totalSize += JSON.stringify(pkg).length;
        }
        console.log('Total JSON size of fetched packages:', (totalSize / 1024 / 1024).toFixed(2), 'MB');

        const matchedPkgIds = new Set(packages.map(p => p._id.toString()));
        const otherPkgQuery = {
            status: { $in: ['active', 'published'] },
            category: 'trip',
            destination: { $regex: new RegExp(`^${destination}$`, 'i') },
            _id: { $nin: [...matchedPkgIds] },
            packageType: 'individual'
        };

        console.time('Fetch otherPackages');
        const otherPackages = await Package.find(otherPkgQuery).lean();
        console.timeEnd('Fetch otherPackages');
        console.log(`Found ${otherPackages.length} other packages`);

        await mongoose.disconnect();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
