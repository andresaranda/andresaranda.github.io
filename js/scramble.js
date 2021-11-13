
// gem game
// liquid button
// videos

const skills_container = document.querySelector('#scramble')
const skills_list = document.querySelectorAll('#scramble .skill')

// Configuration parameters:
const num_columns = 3
const skill_width = 75 //px
const skill_height = 30 //px
const max_font_size_growth_factor = 1.4
const min_font_size_reduce_factor = 0.9
const minimum_opacity = 0.7
const interval = 5 // seconds, also change on CSS: #scramble div {transition: ... }

let maximum_font_size
let minimum_font_size

function setFontSizes(){
	const current_font_size = parseInt(window.getComputedStyle(skills_container)['fontSize'].slice(0,-2))
	maximum_font_size = Math.round(current_font_size * max_font_size_growth_factor)
	minimum_font_size = Math.round(current_font_size * min_font_size_reduce_factor)
}
setFontSizes()

const num_rows = Math.ceil(skills_list.length / num_columns)
let skill_column_width
let skill_row_height

function setScrambleGridDimensions(){
    let container_width = window.getComputedStyle(skills_container).getPropertyValue('width')
    let container_height = window.getComputedStyle(skills_container).getPropertyValue('height')
    skill_column_width = parseInt(container_width.slice(0,-2)) / num_columns
    skill_row_height = parseInt(container_height.slice(0,-2)) / num_rows
}
setScrambleGridDimensions()

window.addEventListener('resize', () => {
	setScrambleGridDimensions()
	setFontSizes()
})

let scramble_loop_position_x = 0
let scramble_loop_position_y = 0
let column_counter = 1

function scrambleSkills(){
	const skills_list_shuffled = []
	let skills_counter = 0
	skills_list.forEach((skill) => {
		const index = Math.round(Math.random() * skills_counter)
		skills_counter += 1
		skills_list_shuffled.splice(index, 0, skill);
	})
	skills_list_shuffled.forEach((skill) => {
		const x_pos = scramble_loop_position_x + Math.floor(Math.random() * (skill_column_width - skill_width))
		const y_pos = scramble_loop_position_y + Math.floor(Math.random() * (skill_row_height - skill_height))
		const font_size = minimum_font_size + Math.floor(Math.random() * (maximum_font_size - minimum_font_size))
        const opacity_factor = ((font_size - minimum_font_size) / (maximum_font_size - minimum_font_size))
        // const modified_opacity_factor = 1 - (1 - opacity_factor) * (1 - opacity_factor)
		const opacity = (minimum_opacity + (1 - minimum_opacity) * opacity_factor).toFixed(3)
        skill.style = `left: ${x_pos}px; top: ${y_pos}px; font-size: ${font_size}px; opacity: ${opacity}`
		if (column_counter < 3){
			column_counter += 1
			scramble_loop_position_x += skill_column_width
		} else {
			column_counter = 1
			scramble_loop_position_y += skill_row_height
			scramble_loop_position_x = 0
		}
	})
	scramble_loop_position_x = 0
	scramble_loop_position_y = 0
	column_counter = 1
}

scrambleSkills()
const timeoutID = window.setTimeout(scrambleSkills, 0);
const intervalID = window.setInterval(scrambleSkills, interval * 1000);
