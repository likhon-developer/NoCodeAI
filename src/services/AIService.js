import * as brain from 'brain.js';
import { Lambda } from 'aws-sdk';
import axios from 'axios';

const AI_PROVIDERS = {
  OPENROUTER: {
    baseUrl: 'https://openrouter.ai/api/v1',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://nocodeai.app',
      'X-Title': 'NoCode AI'
    }
  },
  GROQ: {
    baseUrl: 'https://api.groq.com/openai/v1',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    }
  },
  TOGETHER: {
    baseUrl: 'https://api.together.xyz/v1',
    headers: {
      'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`
    }
  }
};

export class AIService {
  constructor() {
    this.models = {};
    this.lambda = new Lambda({
      region: process.env.VERCEL_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY
    });
  }

  async createModel(modelType, config = {}) {
    try {
      let model;
      
      switch(modelType.toLowerCase()) {
        case 'neuralnetwork':
          model = new brain.NeuralNetwork(config);
          break;
        case 'rnn':
          model = new brain.recurrent.RNN(config);
          break;
        case 'lstm':
          model = new brain.recurrent.LSTM(config);
          break;
        default:
          throw new Error(`Unsupported model type: ${modelType}`);
      }
      
      const modelId = this.generateId();
      this.models[modelId] = model;
      return modelId;
      
    } catch (error) {
      console.error('Error creating model:', error);
      throw error;
    }
  }

  async trainModel(modelId, trainingData, options = {}) {
    if (!this.models[modelId]) {
      throw new Error(`Model ${modelId} not found`);
    }
    
    return this.models[modelId].train(trainingData, options);
  }

  async executeModel(modelId, input) {
    if (!this.models[modelId]) {
      throw new Error(`Model ${modelId} not found`);
    }
    
    return this.models[modelId].run(input);
  }

  async executeServerless(functionName, payload) {
    const params = {
      FunctionName: functionName,
      Payload: JSON.stringify(payload)
    };
    
    const response = await this.lambda.invoke(params).promise();
    return JSON.parse(response.Payload);
  }

  async queryAI(provider, model, messages) {
    try {
      const config = AI_PROVIDERS[provider];
      const response = await axios.post(
        `${config.baseUrl}/chat/completions`,
        {
          model,
          messages
        },
        { headers: config.headers }
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error(`Error querying ${provider} AI:`, error);
      throw error;
    }
  }

  generateId() {
    return Math.random().toString(36).substring(2, 9);
  }
}
