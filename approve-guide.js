// Usage: node approve-guide.js <GUIDE_ID>
// Example: node approve-guide.js 67b6ebfa000000000

const guideId = process.argv[2];

if (!guideId) {
    console.error('Please provide a Guide ID.');
    console.log('Usage: node approve-guide.js <GUIDE_ID>');
    console.log('\nFetching a list of all pending providers for you instead:\n');

    fetch('http://localhost:3000/api/admin/provider/review', {
        headers: { 'x-admin-secret': 'bagspackgo_dev_admin_secret' }
    })
        .then(r => r.json())
        .then(data => {
            if (!data.providers || data.providers.length === 0) {
                console.log('No providers found.');
                return;
            }

            console.table(data.providers.map(p => ({
                ID: p.guideId,
                Username: p.username,
                Email: p.email,
                Status: p.applicationStatus
            })));
            console.log('\nCopy the ID above and run this script again!');
        })
        .catch(console.error);

} else {
    console.log(`Approving guide: ${guideId}...\n`);

    fetch('http://localhost:3000/api/admin/provider/review', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'x-admin-secret': 'bagspackgo_dev_admin_secret'
        },
        body: JSON.stringify({
            guideId: guideId,
            action: 'approve',
            adminNotes: 'Welcome to BagspackGo! Your application has been approved.'
        })
    })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                console.log('✅ Success! Provider approved.');
                console.log('Message:', data.message);
                console.log('Details:', data.guide);
                console.log('\nThey should receive an email confirmation momentarily!');
            } else {
                console.error('❌ Failed:', data.message);
            }
        })
        .catch(console.error);
}
