<a href="https://masterbuilder.ai">
  <img alt="MasterBuilder" src="./public/newog.png">
  <h1 align="center">MasterBuilder</h1>
</a>

<p align="center">
  An intelligent coding assistant for developers. Powered by Llama 3.1 & Together.ai
</p>

## Features

- Find relevant APIs and documentation for your development needs
- Get expert guidance on implementing technical solutions
- Simple and clean interface focused on developer experience
- Personalized responses based on your builder level

## Tech stack

- Meta's Llama 3.1 8B Instruct Turbo for the language model
- Together AI for LLM inference
- Next.js 14 with app router and Tailwind CSS
- Serper for web search capabilities 
- Helicone for API usage tracking
- RAG system for enhanced responses with up-to-date information

## Setup & Installation

1. Clone the repository
2. Create an account at [Together AI](https://together.ai) for LLM access
3. Get API keys from [SERP API](https://serper.dev/) or [Bing Search API](https://www.microsoft.com/en-us/bing/apis/bing-web-search-api)
4. Create an account at [Helicone](https://www.helicone.ai/) for monitoring
5. Create a `.env` file (use `.example.env` as reference) and add your API keys
6. Run `npm install` and `npm run dev` to start development

## Roadmap

- [ ] Add sharing capabilities for generated responses
- [ ] Implement suggested follow-up questions
- [ ] Enhance the UI with more responsive design elements
- [ ] Add user authentication for personalized experiences
- [ ] Implement more advanced API discovery features
- [ ] Support more programming languages and frameworks
