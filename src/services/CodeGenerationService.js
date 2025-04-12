import axios from 'axios';

export class CodeGenerationService {
  constructor() {
    this.groqKey = process.env.GROQ_API_KEY;
  }

  async generateCode(prompt, language = 'javascript', framework = 'react') {
    try {
      const systemPrompt = `You are an expert ${language} developer specializing in the ${framework} framework.
Generate clean, well-documented, and efficient code based on the user's requirements.
Return ONLY the code without explanations. Follow modern best practices.`;

      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama3-70b-8192',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
          max_tokens: 4000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.groqKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating code:', error);
      throw error;
    }
  }

  async createComponentFromDescription(description, type = 'ui', language = 'javascript') {
    try {
      let prompt;
      
      switch(type) {
        case 'ui':
          prompt = `Create a React component that implements: ${description}. 
Make it responsive, accessible, and styled with modern CSS. Include any necessary hooks or state management.`;
          break;
        case 'api':
          prompt = `Create an Express.js API endpoint that: ${description}.
Include proper error handling, validation, and follow RESTful principles.`;
          break;
        case 'function':
          prompt = `Create a JavaScript utility function that: ${description}.
Make it efficient, well-tested, and robust against edge cases.`;
          break;
        default:
          prompt = `Create code that: ${description}`;
      }
      
      return await this.generateCode(prompt, language);
    } catch (error) {
      console.error('Error creating component:', error);
      throw error;
    }
  }

  async translateToLanguage(code, targetLanguage) {
    try {
      const prompt = `Translate the following code to ${targetLanguage} while maintaining the same functionality:

\`\`\`
${code}
\`\`\``;

      return await this.generateCode(prompt, targetLanguage);
    } catch (error) {
      console.error('Error translating code:', error);
      throw error;
    }
  }
}
