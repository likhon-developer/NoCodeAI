 import axios from 'axios';

export class ImageGenerationService {
  constructor() {
    this.openRouterKey = process.env.OPENROUTER_API_KEY;
  }

  async generateImage(prompt, options = {}) {
    try {
      const {
        size = '1024x1024',
        style = 'natural',
        quality = 'standard'
      } = options;

      const response = await axios.post(
        'https://openrouter.ai/api/v1/images/generations',
        {
          prompt,
          model: 'stability.stable-diffusion-xl', // Default model
          size,
          style,
          quality,
          n: 1
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openRouterKey}`,
            'HTTP-Referer': 'https://nocodeai.app',
            'X-Title': 'NoCode AI'
          }
        }
      );

      return response.data.data[0].url;
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  }

  async variateImage(imageUrl, prompt, options = {}) {
    try {
      const {
        size = '1024x1024',
        style = 'natural'
      } = options;

      const response = await axios.post(
        'https://openrouter.ai/api/v1/images/variations',
        {
          image: imageUrl,
          prompt,
          model: 'stability.stable-diffusion-xl',
          size,
          style,
          n: 1
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openRouterKey}`,
            'HTTP-Referer': 'https://nocodeai.app',
            'X-Title': 'NoCode AI'
          }
        }
      );

      return response.data.data[0].url;
    } catch (error) {
      console.error('Error variating image:', error);
      throw error;
    }
  }
}
