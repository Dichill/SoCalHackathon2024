//File: example/example-node.ts

import { z } from "zod";
import axios from "axios";

import {
  defineDAINService,
  ToolConfig,
  ServiceConfig,
  ToolboxConfig,
  ServiceContext,
} from "@dainprotocol/service-sdk";

import { analyzeImageBuffer, getImage } from "./services/cain"



const analyzeScreenConfig: ToolConfig = {
  id: "analyze-screen",
  name: "Analyze Screen",
  description: "Analyzes the user's screen. If the user asks what's in their screen it will analyze their screen.",
  input: z.object({
    question: z.string().describe("Question to answer about what the users see in their computer."),
  }),
  output: z.object({
    answer: z.string().describe("Answer the user's question.")
  }),
  pricing: { pricePerUse: 0, currency: "USD" },
  handler: async ({ imageUrl, question }, agentInfo) => {
    try {


      const screen = await getImage();
      const answer = await analyzeImageBuffer(screen);

      return {
        text: "Generated image analysis",
        data: { answer },
        ui: {
          type: "imageCard",
          uiData: JSON.stringify({
            title: "Image Analysis Result",
            description: answer,
            imageUrl: imageUrl || "image.png", // Adjust as needed
            imageAlt: "Image",
            actions: [
              {
                text: "View Full Size",
                url: imageUrl || "image.png",
                variant: "default"
              }
            ]
          })
        }
      };
    } catch (error) {
      console.error('Error in analyze-screen handler:', error);
      return {
        text: "Failed to analyze image",
        data: { answer: "An error occurred while analyzing the image." },
        ui: {}
      };
    }
  }
};

const dainService = defineDAINService({
  metadata: {
    title: "CAIN Service",
    description:
      "A DAIN service that has access to a users computer through the cain software, which can control, see, analyze what the user requests.",
    version: "1.0.0",
    author: "DFPP - Dichill | Fahat | Paola | Phu",
    tags: ["dain", "personal assistant", "analyze screen of user"],
    logo: "https://cdn-icons-png.flaticon.com/512/252/252035.png"
  },
  identity: {
    apiKey: process.env.DAIN_API_KEY,
  },
  tools: [analyzeScreenConfig],
});

dainService.startNode({ port: 2022 }).then(() => {
  console.log("Weather DAIN Service is running on port 2022");
});