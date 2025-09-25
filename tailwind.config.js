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
      },  
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'ping-slow': 'ping 2s cubic-bezier(0,0,0.2,1) infinite',
        'wave': 'wave 2s ease-in-out infinite',
      },
       keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        wave: {
          '0%, 100%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(100%)' },
        }}
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
