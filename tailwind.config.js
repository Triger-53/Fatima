/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			screens: {
				"max-1100": { max: "1100px" }, // new custom breakpoint
			},
		},
	},

	theme: {
		extend: {
			colors: {
				primary: {
					50: "#F0F7FF",
					100: "#E0EFFE",
					200: "#C2E0FF",
					300: "#A3D1FF",
					400: "#85C2FF",
					500: "#67B3FF",
					600: "#4F9BEE",
					700: "#3A7AD6",
					800: "#2A5C9E",
					900: "#1E426B",
				},
				medical: {
					50: "#F2F9F9",
					100: "#E6F3F4",
					200: "#D0E8EA",
					300: "#B9DDE1",
					400: "#A2D2D8",
					500: "#8BC7CF",
					600: "#73BCC6",
					700: "#5AADC0",
					800: "#429DB0",
					900: "#2D8EA1",
				},
				accent: {
					50: "#FFF9F0",
					100: "#FFEDD9",
					200: "#FFDBB3",
					300: "#FFC98D",
					400: "#FFB767",
					500: "#FFA541",
					600: "#EE9A3B",
					700: "#D68934",
					800: "#9E6426",
					900: "#6B441A",
				},
			},
			fontFamily: {
				sans: ["Inter", "system-ui", "sans-serif"],
			},
		},
	},
	plugins: [],
}
