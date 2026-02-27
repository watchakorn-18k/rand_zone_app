# Rand Zone

Rand Zone is a simple, beautiful, and provably fair web application built using **SvelteKit** and **Tailwind CSS v4**. It features an advanced group shuffler and an interactive spin wheel, making it perfect for picking names, creating teams, or making quick random decisions.

## ✨ Features

- **Advanced Group Shuffle**: 
  - Divide a list of names into a specific number of groups or a specific number of members per group.
  - Optionally assign group leaders to distribute them evenly among groups.
  - Built-in Transparency Log showing the cryptographic fairness of the shuffle.
- **Fairness Engine**: Uses `crypto.getRandomValues()` combined with a 7-round Fisher-Yates shuffle to guarantee unbiased and secure randomness.
- **Interactive Spin Wheel**: 
  - Smooth animation with eased rotation.
  - Option to remove the picked items automatically after completing the spin.
  - Keeps a history log of recent spins.
- **Shareable Links (Base64 State)**: Want to share the setup with friends? Generate a URL encoded with your exact list of names and configuration, allowing anyone to open the exact same wheel or group list without typing it again.
- **Responsive & Modern UI**: Built from the ground up to look great on desktop and mobile, with carefully selected color palettes, gradients, and micro-animations.

## 🚀 Getting Started

### Prerequisites
- Node.js installed

### Installation

1. Clone or download this repository.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

## 📦 Building for Production

To create an optimized production version of your app:

```sh
npm run build
```

You can preview the built application using:
```sh
npm run preview
```

## 📄 License

This project is licensed under the MIT License - see below for details.

### MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
