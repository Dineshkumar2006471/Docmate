const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function testChat() {
    console.log("Testing Chat Endpoint...");
    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: "I have a severe headache and nausea. What should I do?",
                history: []
            })
        });

        const data = await response.json();
        console.log("Status:", response.status);
        if (response.ok) {
            console.log("Response:", data.reply);
        } else {
            console.error("Error:", data);
        }
    } catch (error) {
        console.error("Request Failed:", error);
    }
}

testChat();
