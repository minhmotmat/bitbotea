//index.js
const generate = require("generate-nice-eth-address")
function helloNpm() {
    return "hello NPM"
}
function generateBitboTea(postfix) {
    helloNpm()
    let result = generate("6868");
    return result;
}
module.exports = generateBitboTea
