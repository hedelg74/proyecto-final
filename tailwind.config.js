/** @type {import('tailwindcss').Config} */
export const content = ["./src/**/*.{html,js}", "./public/**/*.{html,js}", "./views/**/*.ejs"];
export const darkMode = 'class'
export const theme = {
	extend: {
		colors: {
			"custom-blue": "#4377bb",
		},
		gridTemplateColumns: {
			'9': 'repeat(9, minmax(0, 1fr))',
			'10': 'repeat(10, minmax(0, 1fr))',
			'11': 'repeat(11, minmax(0, 1fr))',
			'12': 'repeat(12, minmax(0, 1fr))',
			'13': 'repeat(13, minmax(0, 1fr))',
			'15': 'repeat(15, minmax(0, 1fr))',
	  },
	},

};
//export const plugins = [require('daisyui'),];
