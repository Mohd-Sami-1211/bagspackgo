async function run() {
    try {
        console.log('Fetching from local API...');
        const res = await fetch('http://localhost:3000/api/public/trips?id=69d90638ed41ee7ef2eabdaf');
        if (!res.ok) {
            console.log('Error status:', res.status);
        }
        const data = await res.json();
        console.log('API Response success:', data.success);
        if (data.success && data.data) {
            console.log('Data length:', data.data.length);
        } else {
            console.log('API Response message:', data.message);
        }
    } catch (e) {
        console.error(e);
    }
}
run();
