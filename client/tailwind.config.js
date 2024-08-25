/** @type {import('tailwindcss').Config} */


// eslint-disable-next-line no-undef
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'custom-balance': 'customBalance 1.5s ease-in-out 1s',
        'custom-shrinkjump': 'customShrinkjump 1s ease-in-out 3s',
        'custom-falling': 'customFalling 2s ease-out 2s',
        'custom-rotate': 'customRotate 1s ease-out 1s',
        'custom-toplong': 'customToplong 1.5s linear 2s', 
      },
      keyframes: {
        customBalance: {
          '0%, 100%' : {
            transform: 'rotate(0deg)'
          },
          '30%, 60%' : {
            transform: 'rotate(-45deg)'
          }
        },
        customShrinkjump: {
          '10%, 35%' : {
            transform: 'scale(2, .2) translate(0, 0)'
          },
          '45%, 50%' : {
            transform: 'scale(1) translate(0, -150px)'
          },
          '80%' : {
            transform: 'scale(1) translate(0, 0)'
          },
        },
        customFalling: {
          '12%': {
            transform: 'rotateX(240deg)'
          },
          
          '24%': {
            transform: 'rotateX(150deg)'
          },
          
          '36%': {
            transform: 'rotateX(200deg)'
          },
          
          '48%': {
            transform: 'rotateX(175deg)'
          },
          
          '60%, 85%': {
            transform: 'rotateX(180deg)'
          },
          
          '100%': {
            transform: 'rotateX(0deg)'
          }
        },
        customRotate: {
          '20%': {
            transform: 'rotateY(180deg)'
          },

          '80%': {
            transform: 'rotateY(180deg)'
          },
          
          '100%': {
            transform: 'rotateY(360deg)'
          }
        },
        customToplong: {
          '10%, 40%': {
            transform: 'translateY(-38vh) scaleY(1)'
          },
          '90%': {
            transform: 'translateY(-38vh) scaleY(7)'
          },
        },
      },
    },

  },
  plugins: [],
}
