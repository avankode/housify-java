/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    // "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      backgroundImage: {
        'aurora-green': 'radial-gradient(circle 800px at 100% 200px, #d5f5e3, transparent)',
        'aurora-blue': 'radial-gradient(circle 800px at 0% 80%, #d6eaf8, transparent)',
      },
    },
  },
  plugins: [],
}