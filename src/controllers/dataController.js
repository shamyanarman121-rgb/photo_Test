const axios = require('axios');

const processData = async (req, res) => {
  try {
    const data = req.body;
    
    // Validate required fields
    if (!data.userId) {
      return res.status(400).json({ message: 'Missing required field: userId' });
    }
    
    const imageSizeMB = data.image ? (data.image.length / 1024 / 1024).toFixed(2) : 0;
    console.log("Data received from client:", { 
      userId: data.userId, 
      hasImage: !!data.image,
      imageSizeMB: imageSizeMB,
      answers: { answer1: data.answer1, answer2: data.answer2, answer3: data.answer3 }
    });
    
    // Prepare data to send to external API with base64 image
    let cleanImage = null;
    if (data.image) {
      // Remove data URI prefix (e.g., "data:image/png;base64,")
      cleanImage = data.image.replace(/^data:image\/\w+;base64,/, '');
    }
    
    const dataToSend = {
      userId: data.userId,
      answer1: data.answer1,
      answer2: data.answer2,
      answer3: data.answer3,
      ts: data.ts,
      image: cleanImage,
      imageReceived: !!data.image
    };
    
    console.log("Sending to external API:", { 
      userId: data.userId,
      hasImage: !!data.image,
      imageSizeMB: imageSizeMB,
      answers: { answer1: data.answer1, answer2: data.answer2, answer3: data.answer3 }
    });
    
    // Replace with the actual external API URL
    const externalApiUrl = "https://totogaming.app.n8n.cloud/webhook/8bd18292-f8d4-46a0-80e9-e463ef8f457a" 

    const response = await axios.post(externalApiUrl, dataToSend, {
      timeout: 30000
    });

    console.log("External API response status:", response.status);
    res.status(200).json({ 
      message: 'Data processed successfully', 
      response: response.data 
    });
  } catch (error) {
    console.error("Error processing data:", error.message);
    if (error.response) {
      console.error("External API error status:", error.response.status);
      console.error("External API error data:", error.response.data);
    }
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message,
      apiStatus: error.response ? error.response.status : 'Unknown'
    });
  }
};

module.exports = {
  processData,
};
