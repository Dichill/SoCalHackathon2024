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

import { analyzeImageBuffer, getImage, findFromImage } from "./services/cain"

const openTabConfig: ToolConfig = {
  id: "open-tab",
  name: "Open Tab",
  description: "Opens a new tab for the user",
  input: z.object({
    question: z.string().describe("Question to answer if the user wants to open a new tab"),
  }),
  output: z.object({
    answer: z.string().describe("Answer the user's question.")
  }),
  pricing: { pricePerUse: 0, currency: "USD" },
  handler: async ({ question }, agentInfo) => {
    try {
      const axios = require('axios');

      // Make the POST request
      const response = await axios.post('http://127.0.0.1:3000/open', {
        question: question
      });

      return {
        text: `Success, opened a new tab for you.`,
        data: {
          answer: "Success, opened a new tab for you."
        },
        ui: {},
      }

    } catch (error) {
      console.error('Error in open-tab handler:', error);
      return {
        text: "Failed to do task",
        data: { answer: "Cain Software is probably not open. Try again." },
        ui: {}
      };
    }
  }
};

const writeStringConfig: ToolConfig = {
  id: "write-string",
  name: "Write Text",
  description: "If user asks to write something down or to type something. This will be executed.",
  input: z.object({
    question: z.string().describe("Make it specific. Question as to what the user would like to type."),
  }),
  output: z.object({
    answer: z.string().describe("Do what the user says")
  }),
  pricing: { pricePerUse: 0, currency: "USD" },
  handler: async ({ question }, agentInfo) => {
    try {
      const axios = require('axios');

      // Make the POST request
      const response = await axios.post('http://127.0.0.1:3000/write_text?q=' + question);

      return {
        text: `Success, wrote it down for you.`,
        data: {
          answer: "Success, wrote your text for you."
        },
        ui: {},
      }

    } catch (error) {
      console.error('Error in write-string handler:', error);
      return {
        text: "Failed to do task",
        data: { answer: "Cain Software is probably not open. Try again." },
        ui: {}
      };
    }
  }
};

const pressKeysConfig: ToolConfig = {
  id: "press-key",
  name: "Emulate Pressing Keys",
  description: "If user asks to press a certain key like: 'once writing it down, can you go to the website etc.'",
  input: z.object({
    question: z.string().describe("Make it specific e.g. Enter as I am using PyAutoGui. Question as to what the user would like to press on their keys"),
  }),
  output: z.object({
    answer: z.string().describe("Do what the user says")
  }),
  pricing: { pricePerUse: 0, currency: "USD" },
  handler: async ({ question }, agentInfo) => {
    try {
      const axios = require('axios');

      // Make the POST request
      const response = await axios.post('http://127.0.0.1:3000/press_key?q=' + question);

      return {
        text: `Understood`,
        data: {
          answer: "Got it"
        },
        ui: {},
      }

    } catch (error) {
      console.error('Error in write-string handler:', error);
      return {
        text: "Failed to do task",
        data: { answer: "Cain Software is probably not open. Try again." },
        ui: {}
      };
    }
  }
};



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

      await axios.get('http://127.0.0.1:3000/analyze_screen')
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

const navigatePageConfig : ToolConfig = {
  id: "navigate-page",
  name: "Navigate Page",
  description: "allows the user to go forward from a page, go backward, undo or redo.",
  input: z.object({
    question: z.string().describe("Question to go next page, or go back."),
  }),
  output: z.object({
    answer: z.string().describe("Does what the user does")
  }),
  pricing: { pricePerUse: 0, currency: "USD" },
  handler: async ({ question }, agentInfo) => {
    let zed;

    try {
      if (question.includes("forward", "next", "redo")) {
        zed = "forward"
      } else {
        zed = "backward"
      }
      await axios.post(`http://127.0.0.1:3000/navigate_page`, {
        zed: zed,
      })

      return {
        text: "Success!",
        data: { answer: "There you go!" },
        ui: {}
      };

    } catch (error) {
      console.error('Error in scrolling up or down', error);
      return {
        text: "Failed scroll for user",
        data: { answer: "An error occurred while scrolling." },
        ui: {}
      };
    }
  }
}

const scrollPageConfig : ToolConfig = {
  id: "scroll-page",
  name: "Scroll Page",
  description: "allows the user to scroll up or down.",
  input: z.object({
    question: z.string().describe("Question to scroll up or down if user says so"),
  }),
  output: z.object({
    answer: z.string().describe("Does what the user does")
  }),
  pricing: { pricePerUse: 0, currency: "USD" },
  handler: async ({ question }, agentInfo) => {
    let direction;
    let amount = 100;

    try {
      if (question.includes("up")) {
        direction = "up"
      } else {
        direction = "down"
      }
      await axios.post(`http://127.0.0.1:3000/scroll`, {
        direction: direction,
        amount: amount
      })
      console.log(question)
      console.log(direction)

      return {
        text: "Success!",
        data: { answer: "There you go!" },
        ui: {}
      };

    } catch (error) {
      console.error('Error in scrolling up or down', error);
      return {
        text: "Failed scroll for user",
        data: { answer: "An error occurred while scrolling." },
        ui: {}
      };
    }
  }
}

const clickOnRequestConfig: ToolConfig = {
  id: "click-request",
  name: "Click Request",
  description: "(DONT EXECUTE THIS IF USER SAYS ANYTHING ABOUT GOING BACK A PAGE OR GOING FORWARD) if user requests to click a certain text, it will emulate a click to the specified button or text.",
  input: z.object({
    question: z.string().describe("Question to answer about what the user will click e.g. keywords like home and etc."),
  }),
  output: z.object({
    answer: z.string().describe("Answer the user's question.")
  }),
  pricing: { pricePerUse: 0, currency: "USD" },
  handler: async ({ question }, agentInfo) => {
    try {
      await axios.get('http://127.0.0.1:3000/analyze_screen')
      const screen = await getImage();
      const answer = await findFromImage(screen, question);
      console.log(answer)

      await axios.post('http://127.0.0.1:3000/click_request?q=' + answer)

      return {
        text: "Success",
        data: { answer: "navigated it for you :)" },
        ui: {}
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
  tools: [analyzeScreenConfig, openTabConfig, clickOnRequestConfig, scrollPageConfig, navigatePageConfig, writeStringConfig,
    pressKeysConfig
  ],
});

dainService.startNode({ port: 2022 }).then(() => {
  console.log("Cain Service is running on port 2022");
});