async function sendSample() {
  try {
    const res = await fetch('http://localhost:3000/api/send-proposal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        phone: "123-456-7890",
        service: "Web Development",
        message: "This is a test proposal sent from the server test script."
      })
    });
    
    const data = await res.json();
    console.log("Response:", data);
  } catch (err) {
    console.error("Error:", err);
  }
}

sendSample();
