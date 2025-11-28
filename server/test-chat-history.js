const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function testChatHistory() {
    console.log("Testing Chat History Fix...");

    // Turn 1: Initial Greeting (Model) + User Message
    const history1 = [
        { sender: 'ai', text: "Hello! I'm Aura..." }
    ];
    const message1 = "Hi, I have a headache.";

    console.log("\n--- Turn 1 ---");
    try {
        const res1 = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message1, history: [...history1, { sender: 'user', text: message1 }] })
        });
        const data1 = await res1.json();
        console.log("Turn 1 Response:", data1.reply ? "SUCCESS" : "FAILED");
        if (data1.error) console.error(data1.error);

        // Turn 2: History includes Turn 1 response
        const history2 = [
            ...history1,
            { sender: 'user', text: message1 },
            { sender: 'ai', text: data1.reply || "Mock Reply" }
        ];
        const message2 = "What causes it?";

        console.log("\n--- Turn 2 ---");
        const res2 = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message2, history: [...history2, { sender: 'user', text: message2 }] })
        });
        const data2 = await res2.json();
        console.log("Turn 2 Response:", data2.reply ? "SUCCESS" : "FAILED");
        if (data2.error) console.error(data2.error);
        if (data2.reply) console.log("Reply:", data2.reply.substring(0, 100) + "...");

    } catch (error) {
        console.error("Test Failed:", error);
    }
}

testChatHistory();
