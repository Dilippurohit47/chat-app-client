/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',  // ← Tell Tailwind where your components live
  ],
  theme: {
    
    extend: {
      colors:{
        primeRed:"red"
      }
    },
    screens:{
         sm: { max: '520px' }, 
      md:{max: '768px'},
      lg: {max:'1024px'},
      xl: {max:'1280px'},
    }
  },
  plugins: [],
}
