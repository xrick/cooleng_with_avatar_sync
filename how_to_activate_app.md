# How to Start the English Speaking Practice Application

## Prerequisites

This is a SvelteKit application with Azure Cognitive Services integration that requires:
- Node.js (with pnpm package manager)
- Azure Speech Services credentials
- Azure OpenAI credentials

## Setup Instructions

### 1. Create Environment Variables File
First, create your `.env` file based on the example:
```bash
cp .env.example .env
```

Then update with your actual Azure credentials for both speech and OpenAI services.

### 2. Install Dependencies
The project uses pnpm as its package manager:
```bash
pnpm install
```

### 3. Start Development Server
The application uses SvelteKit with Vite, so run:
```bash
pnpm dev
```
This will start the frontend on http://localhost:5173

## Required Backend Services

This application requires the following Azure services:

1. **Azure Speech Services** - For pronunciation assessment and speech recognition
2. **Azure OpenAI** - For language content analysis and grading

### Environment Variables Needed:
```
AZURE_SPEECH_KEY=your_speech_service_key
AZURE_SPEECH_REGION=your_speech_region
AZURE_OPENAI_ENDPOINT=https://YOUR_ENDPOINT.openai.azure.com/
AZURE_OPENAI_API_KEY=your_openai_api_key
AZURE_OPENAI_API_VERSION=2024-02-15-preview
DEPLOYMENT=gpt-4o-mini
```

## Application Features

The app is a complete English speaking practice platform that includes:
- Question answering practice with speech recognition
- Pronunciation assessment using Azure Cognitive Services (Speech SDK)
- Content analysis and feedback using Azure OpenAI
- Visual feedback through the integrated 2D virtual avatar component
- Complete chat interface with all features working together

## Access the Application

After starting the development server, the application will be accessible at:
http://localhost:5173

The system will require your API keys to function fully. The 2D virtual avatar face is now integrated and will provide visual feedback during speech synthesis and assessment phases.