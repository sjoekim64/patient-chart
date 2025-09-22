# Patient Chart System

A modern digital patient record system built with React, TypeScript, and Vite.

## Features

- **Patient Management**: Create, edit, and manage patient records
- **SOAP Reports**: Generate comprehensive SOAP reports
- **AI Integration**: AI-powered diagnosis and treatment recommendations using Google Gemini
- **Email Notifications**: Email alerts for login activities using EmailJS
- **Responsive Design**: Works on desktop and mobile devices
- **Print Support**: Clean print layouts for patient charts

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **AI**: Google Gemini API
- **Email**: EmailJS
- **Database**: IndexedDB (client-side storage)

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd patient-chart-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
# Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_here

# EmailJS Configuration
EMAILJS_SERVICE_ID=your_emailjs_service_id
EMAILJS_TEMPLATE_ID=your_emailjs_template_id
EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment

### Netlify

This project is configured for easy deployment on Netlify:

1. Connect your repository to Netlify
2. Set the build command to `npm run build`
3. Set the publish directory to `dist`
4. Add environment variables in Netlify dashboard:
   - `GEMINI_API_KEY`
   - `EMAILJS_SERVICE_ID`
   - `EMAILJS_TEMPLATE_ID`
   - `EMAILJS_PUBLIC_KEY`

The `netlify.toml` file is already configured for automatic deployment.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key for AI features | Yes |
| `EMAILJS_SERVICE_ID` | EmailJS service ID for email notifications | Yes |
| `EMAILJS_TEMPLATE_ID` | EmailJS template ID for email notifications | Yes |
| `EMAILJS_PUBLIC_KEY` | EmailJS public key for email notifications | Yes |

## API Setup

### Google Gemini API

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Add the key to your environment variables

### EmailJS Setup

1. Create an account at [EmailJS](https://www.emailjs.com/)
2. Set up an email service (Gmail recommended)
3. Create an email template
4. Get your service ID, template ID, and public key
5. Add them to your environment variables

## Project Structure

```
src/
├── components/          # React components
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── types/              # TypeScript type definitions
├── App.tsx             # Main application component
└── index.tsx           # Application entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

## License

This project is licensed under the MIT License.