async function run() {
    const res = await fetch('http://localhost:3000/api/public/trips?id=69d90638ed41ee7ef2eabdaf');
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}
run();
