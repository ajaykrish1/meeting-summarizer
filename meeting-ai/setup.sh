#!/bin/bash

echo "🚀 Setting up Meeting Summarizer & Action Tracker"
echo "=================================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed. Please install Python 3.8+ and try again."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "⚠️  pnpm not found. Installing pnpm..."
    npm install -g pnpm
fi

echo "✅ Prerequisites check passed"

# Backend setup
echo ""
echo "🔧 Setting up Backend..."
cd backend

# Create virtual environment
echo "Creating Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -e .

# Create .env file
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your API keys if you have them"
else
    echo "✅ .env file already exists"
fi

# Seed database
echo "Seeding database with sample data..."
python scripts/seed.py

cd ..

# Frontend setup
echo ""
echo "🎨 Setting up Frontend..."
cd frontend

# Install dependencies
echo "Installing Node.js dependencies..."
pnpm install

# Create .env file
if [ ! -f .env ]; then
    echo "Creating .env file..."
    echo "VITE_API_URL=http://localhost:8000" > .env
    echo "✅ Frontend environment configured"
else
    echo "✅ Frontend .env file already exists"
fi

cd ..

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "To start the application:"
echo ""
echo "1. Start the backend:"
echo "   cd backend"
echo "   source venv/bin/activate  # On Windows: venv\\Scripts\\activate"
echo "   make run"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   cd frontend"
echo "   pnpm dev"
echo ""
echo "3. Open http://localhost:5173 in your browser"
echo ""
echo "4. The backend API will be available at http://localhost:8000"
echo ""
echo "📚 For more information, see the README.md files in each directory"
echo ""
echo "🔑 To use real AI providers, edit backend/.env with your API keys:"
echo "   - OPENAI_API_KEY for OpenAI GPT-4"
echo "   - HF_TOKEN for Hugging Face models"
echo "   - Set PROVIDER to 'openai' or 'hf'"
echo ""
echo "💡 Without API keys, the app will use mock data for development"
