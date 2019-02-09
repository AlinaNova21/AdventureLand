const fs = require('fs')
const data = fs.readFileSync('/home/adam/projects/adventureland/code/dist/main.js', 'utf8')
eval(data)

// add_bottom_button(1, 'Import Code', () => {
  // const fs = require('fs')
  // const code = fs.readFileSync('/home/adam/projects/adventureland/code/dist/main.js', 'utf8')
  // parent.api_call("save_code", {
    // name: "main",
    // slot: 2,
    // code
  // })
// })