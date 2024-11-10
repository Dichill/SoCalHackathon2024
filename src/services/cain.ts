import OpenAI from 'openai';
import { read, readFile, promises as fsPromises } from "fs";
import path = require("path");


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
async function analyzeImageBuffer(buffer: Buffer): Promise<string> {
    try {
      // Convert the buffer to base64 string for API
      const base64Image = buffer.toString('base64');
      const imageUrl = `data:image/jpeg;base64,${base64Image}`;
  
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "What's in this image? Just explain as if you are talking to the person. At the very bottom, include links, texts, whatever is important for identification." },
              {
                type: "image_url",
                image_url: {
                  "url": imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 1024,
      });
  
      // Extract and return the content from the API response
      return response.choices[0]?.message?.content || "No response received from the model.";
    } catch (error) {
      console.error('Error analyzing image:', error);
      return "An error occurred while processing the image.";
    }
  }

  async function findFromImage(buffer: Buffer, question: String): Promise<string> {
    try {
      // Convert the buffer to base64 string for API
      const base64Image = buffer.toString('base64');
      const imageUrl = `data:image/jpeg;base64,${base64Image}`;
  
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Question: " + question + "Return the word only. Understand what the user and analyze the image. Try to understand what the user is trying to click based on the question. Make sure its the exact word that the user wants to navigate to. No cut offs or anything." },
              {
                type: "image_url",
                image_url: {
                  "url": imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 1024,
      });
  
      // Extract and return the content from the API response
      return response.choices[0]?.message?.content || "No response received from the model.";
    } catch (error) {
      console.error('Error analyzing image:', error);
      return "An error occurred while processing the image.";
    }
  }
  
  const getImage = async (): Promise<Buffer> => {
    try {
      const data = await fsPromises.readFile(path.resolve(__dirname + '/../../temp/image.png'));
      return data;
    } catch (err) {
      console.error('Error reading image file:', err);
      throw err;
    }
  };

export {
    analyzeImageBuffer,
    getImage,
    findFromImage
}