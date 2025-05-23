/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Add your custom colors here
      },
      fontFamily: {
        'quicksand': ['Quicksand', 'sans-serif'],
      },
      spacing: {
        // Add your custom spacing here
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
  // Ensure Tailwind works in production builds
  future: {
    hoverOnlyWhenSupported: true,
  },
  // Enable dark mode if needed
  darkMode: 'class',
} 
