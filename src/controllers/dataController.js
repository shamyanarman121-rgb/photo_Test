const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Helper function to save base64 image to file
const saveBase64Image = (base64String, filename) => {
  try {
    if (!base64String || base64String === '') {
      return null;
    }

    // Extract base64 data (remove data URI prefix if present)
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Save the file
    const timestamp = Date.now();
    const fileExtension = base64String.includes('png') ? 'png' : 'jpg';
    const filepath = path.join(uploadsDir, `${timestamp}-${filename}.${fileExtension}`);
    
    fs.writeFileSync(filepath, base64Data, 'base64');
    console.log(`Image saved to: ${filepath}`);
    
    return filepath;
  } catch (error) {
    console.error('Error saving base64 image:', error);
    return null;
  }
};

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
    
    // Handle base64 image
    let imagePath = null;
    if (data.image && data.image !== '') {
      console.log(`Processing image of size: ${imageSizeMB} MB`);
      imagePath = saveBase64Image(data.image, data.userId || 'image');
      if (!imagePath) {
        console.warn('Image processing failed but continuing with request');
      }
    }
    
    // Prepare data to send to external API (WITHOUT the base64 string to reduce payload)
    // Generate image URL from the saved path
    let imageUrl = null;
    if (imagePath) {
      // Extract just the filename from the full path
      const filename = imagePath.split('\\').pop() || imagePath.split('/').pop();
      imageUrl = `${process.env.SERVER_URL || 'http://localhost:3000'}/api/image/${filename}`;
    }
    
    const dataToSend = {
      userId: data.userId,
      answer1: data.answer1,
      answer2: data.answer2,
      answer3: data.answer3,
      ts: data.ts,
      imagePath: imagePath,
      imageUrl: imageUrl,
      imageReceived: !!data.image
    };
    
    console.log("Sending to external API:", { 
      ...dataToSend,
      imageUrl: imageUrl ? '✓ Generated' : '✗ Not generated'
    });
    
    // Replace with the actual external API URL
    const externalApiUrl = "https://totogaming.app.n8n.cloud/webhook/8bd18292-f8d4-46a0-80e9-e463ef8f457a" 

    const response = await axios.post(externalApiUrl, dataToSend, {
      timeout: 30000
    });

    console.log("External API response status:", response.status);
    res.status(200).json({ 
      message: 'Data processed successfully', 
      imagePath: imagePath,
      imageUrl: imageUrl,
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
