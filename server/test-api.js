const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function testSymptomAnalysis() {
    try {
        const response = await fetch('http://localhost:3000/api/analyze-symptoms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                symptoms: "severe headache and nausea",
                vitals: { temp: "99", hr: "80" },
                userProfile: { age: 30, gender: "Male", history: "None" }
            })
        });

        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Test Failed:", error);
    }
}

testSymptomAnalysis();
