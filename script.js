/*
    Ip calculator and Ip Calculation Practise

    Author: WattoX00
    Date:   03/03/2024 
*/
const subnetForm = document.getElementById('subnetForm');
const ipCalculatorSection = document.getElementById('ipCalculatorSection');
const practiceProgramSection = document.getElementById('practiceProgramSection');
const resultOutput = document.getElementById('resultOutput');

subnetForm.addEventListener('submit', function (e) {
    e.preventDefault();
    calculateSubnet();
});
const footerContainer = document.getElementById('footerContainer');
const footerArrow = document.getElementById('footerArrow');
let isFooterVisible = false;

footerArrow.addEventListener('click', function () {
isFooterVisible = !isFooterVisible;
toggleFooterVisibility();
});

footerContainer.addEventListener('mouseenter', function () {
isFooterVisible = true;
toggleFooterVisibility();
});

footerContainer.addEventListener('mouseleave', function () {
isFooterVisible = false;
toggleFooterVisibility();
});

function toggleFooterVisibility() {
footerContainer.classList.toggle('active', isFooterVisible);
footerArrow.classList.toggle('hidden', isFooterVisible);
}
function calculateSubnet() {
try {
const inputField = document.getElementById('ipInput');
const resultOutput = document.getElementById('resultOutput');
const rawIp = inputField.value.trim();

if (!/^[0-9.\/]+$/.test(rawIp)) {
    resultOutput.textContent = "Invalid characters in input. Use only numbers, dots, and forward slash.";
    return;
}

const mask = parseInt(rawIp.split("/")[1]);
const ip = rawIp.split("/")[0].split(".").map(Number);

if (ip.some(octet => octet < 0 || octet > 255)) {
    resultOutput.textContent = "Invalid IP address. Octet value must be between 0 and 255.";
    return;
}

if (mask >= 24 && mask <= 32) {
    c_ip(ip, mask);
} else if (mask >= 16 && mask <= 23) {
    b_ip(ip, mask);
} else if (mask >= 8 && mask <= 15) {
    a_ip(ip, mask);
} else if (mask >= 0 && mask <= 7) {
    under_ip(ip, mask);
} else {
    resultOutput.textContent = "Invalid subnet mask.";
}
} catch (error) {
console.error(error);
resultOutput.textContent = "Error occurred. Please check the input.";
}
}

function under_ip(ip, mask) {
const subnet_multiplier = Math.floor(mask / 8);
const remaining_bits = mask % 8;
let octet_decimal = 0;

for (let i = 0; i < remaining_bits; i++) {
octet_decimal += Math.pow(2, 7 - i);
}

const steps = 256 - octet_decimal;
let index = subnet_multiplier;

while (true) {
if (index >= ip.length) {
    const network = steps * subnet_multiplier;
    const broadcast = (steps * subnet_multiplier) + (Math.pow(2, 8 - remaining_bits)) - 1;
    const first_ip = 1;
    const last_ip = 254;

    const networkAddress = [network, 0, 0, 0];
    const broadcastAddress = [broadcast, 255, 255, 255];

    const networkBinary = networkAddress.map(octet => ('00000000' + octet.toString(2)).slice(-8)).join('.');
    const broadcastBinary = broadcastAddress.map(octet => ('00000000' + octet.toString(2)).slice(-8)).join('.');
    const firstIpBinary = ('00000000' + first_ip.toString(2)).slice(-8);
    const lastIpBinary = ('00000000' + last_ip.toString(2)).slice(-8);

    displayResult(networkAddress, broadcastAddress, networkBinary, broadcastBinary, first_ip, last_ip, firstIpBinary, lastIpBinary,mask);
    break;
}

const current_octet = ip[index];
if (current_octet >= steps * subnet_multiplier && current_octet <= (steps * (subnet_multiplier + 1)) - 1) {
    index++;
} else {
    const network = steps * subnet_multiplier;
    const broadcast = (steps * (subnet_multiplier + 1)) - 1;
    const first_ip = 1;
    const last_ip = 254;

    const networkAddress = [network, 0, 0, 0];
    const broadcastAddress = [broadcast, 255, 255, 255];

    const networkBinary = networkAddress.map(octet => ('00000000' + octet.toString(2)).slice(-8)).join('.');
    const broadcastBinary = broadcastAddress.map(octet => ('00000000' + octet.toString(2)).slice(-8)).join('.');
    const firstIpBinary = ('00000000' + first_ip.toString(2)).slice(-8);
    const lastIpBinary = ('00000000' + last_ip.toString(2)).slice(-8);

    displayResult(networkAddress, broadcastAddress, networkBinary, broadcastBinary, first_ip, last_ip, firstIpBinary, lastIpBinary,mask);
    break;
}
}
}

function a_ip(ip, mask) {
const bit_needed = mask - 8;
let octet_decimal = 0;

for (let i = 0; i < bit_needed; i++) {
octet_decimal += Math.pow(2, 7 - i);
}

const steps = 256 - octet_decimal;
const first_octet = ip[0];
let subnet_multiplier = 0;

while (true) {
if (first_octet >= steps * subnet_multiplier && first_octet <= (steps * (subnet_multiplier + 1)) - 1) {
    const network = steps * subnet_multiplier;
    const broadcast = (steps * (subnet_multiplier + 1)) - 1;
    const first_ip = 1;
    const last_ip = 254;

    const networkAddress = ip.slice(0, 1).concat([network, 0, 0]);
    const broadcastAddress = ip.slice(0, 1).concat([broadcast, 255, 255]);

    const networkBinary = networkAddress.map(octet => ('00000000' + octet.toString(2)).slice(-8)).join('.');
    const broadcastBinary = broadcastAddress.map(octet => ('00000000' + octet.toString(2)).slice(-8)).join('.');
    const firstIpBinary = ('00000000' + first_ip.toString(2)).slice(-8);
    const lastIpBinary = ('00000000' + last_ip.toString(2)).slice(-8);

    displayResult(networkAddress, broadcastAddress, networkBinary, broadcastBinary, first_ip, last_ip, firstIpBinary, lastIpBinary,mask);
    break;
} else {
    subnet_multiplier++;
}
}
}

function b_ip(ip, mask) {
const bit_needed = mask - 16;
const steps = Math.pow(2, 8 - bit_needed);
let subnet_multiplier = 0;

while (true) {
if (ip[2] >= steps * subnet_multiplier && ip[2] <= (steps * (subnet_multiplier + 1)) - 1) {
    const network = steps * subnet_multiplier;
    const broadcast = (steps * (subnet_multiplier + 1)) - 1;
    const first_ip = 1;
    const last_ip = 254;

    const networkAddress = ip.slice(0, 2).concat([network, 0]);
    const broadcastAddress = ip.slice(0, 2).concat([broadcast, 255]);

    const networkBinary = networkAddress.map(octet => ('00000000' + octet.toString(2)).slice(-8)).join('.');
    const broadcastBinary = broadcastAddress.map(octet => ('00000000' + octet.toString(2)).slice(-8)).join('.');
    const firstIpBinary = ('00000000' + first_ip.toString(2)).slice(-8);
    const lastIpBinary = ('00000000' + last_ip.toString(2)).slice(-8);

    displayResult(networkAddress, broadcastAddress, networkBinary, broadcastBinary, first_ip, last_ip, firstIpBinary, lastIpBinary,mask);
    break;
} else {
    subnet_multiplier++;
}
}
}

function c_ip(ip, mask) {
const bit_needed = mask - 24;
let octet_decimal = 0;

for (let i = 0; i < bit_needed; i++) {
    octet_decimal += Math.pow(2, 7 - i);
}

const steps = 256 - octet_decimal;
const octet = ip[3];
let subnet_multiplier = 0;

while (true) {
    if (octet >= steps * subnet_multiplier && octet <= (steps * (subnet_multiplier + 1)) - 1) {
        const network = steps * subnet_multiplier;
        const broadcast = (steps * (subnet_multiplier + 1)) - 1;
        const first_ip = network + 1;
        const last_ip = broadcast - 1;

        const networkAddress = ip.slice(0, 3).concat([network]);
        const broadcastAddress = ip.slice(0, 3).concat([broadcast]);

        const networkBinary = networkAddress.map(octet => ('00000000' + octet.toString(2)).slice(-8)).join('.');
        const broadcastBinary = broadcastAddress.map(octet => ('00000000' + octet.toString(2)).slice(-8)).join('.');
        const firstIpBinary = ('00000000' + first_ip.toString(2)).slice(-8);
        const lastIpBinary = ('00000000' + last_ip.toString(2)).slice(-8);

        displayResult(networkAddress, broadcastAddress, networkBinary, broadcastBinary, first_ip, last_ip, firstIpBinary, lastIpBinary,mask);
        break;
    } else {
        subnet_multiplier++;
    }
}
}

function displayResult(networkAddress, broadcastAddress, networkBinary, broadcastBinary, first_ip, last_ip, firstIpBinary, lastIpBinary, mask) {
const subnetMask = mask;
const numberOfHostBits = 32 - subnetMask;
const totalHosts = Math.pow(2, numberOfHostBits) - 2;

if (numberOfHostBits >= 0) {
const decimalSubnetMask = calculateDecimalSubnetMask(subnetMask);

const decimalWildcardMask = calculateDecimalWildcardMask(subnetMask);

let resultText = `Network:   ${formatIpAndBinary(networkAddress, networkBinary)}\nBroadcast: ${formatIpAndBinary(broadcastAddress, broadcastBinary)}\nFirst IP:  ${formatIpAndBinary(networkAddress.slice(0, 3).concat([first_ip]), firstIpBinary)}\nLast IP:   ${formatIpAndBinary(broadcastAddress.slice(0, 3).concat([last_ip]), lastIpBinary)}\n`;

resultText += `Subnet Mask:     ${(decimalSubnetMask)}\n`;
resultText += `Wildcard Mask:   ${decimalWildcardMask}\n`;

resultText += `Total Hosts: ${totalHosts}`;

resultOutput.innerHTML = resultText;
} else {
resultOutput.textContent = "Invalid subnet mask.";
}
}

function calculateDecimalSubnetMask(subnetMask) {
const binarySubnetMask = '1'.repeat(subnetMask) + '0'.repeat(32 - subnetMask);
const decimalSubnetMask = [];
for (let i = 0; i < 32; i += 8) {
const octet = parseInt(binarySubnetMask.slice(i, i + 8), 2);
decimalSubnetMask.push(octet);
}
return decimalSubnetMask.join('.');
}

function calculateDecimalWildcardMask(subnetMask) {
const binaryWildcardMask = '0'.repeat(subnetMask) + '1'.repeat(32 - subnetMask);
const decimalWildcardMask = [];
for (let i = 0; i < 32; i += 8) {
const octet = parseInt(binaryWildcardMask.slice(i, i + 8), 2);
decimalWildcardMask.push(octet);
}
return decimalWildcardMask.join('.');
}

function formatIpAndBinary(ipArray, binaryArray) {
const ip = ipArray.join('.');
const binary = ipArray.map(octet => ('00000000' + octet.toString(2)).slice(-8)).join('.');
const spaceWidth = 20;
const padding = ' '.repeat(spaceWidth - ip.length - 1);
return `${ip}${padding}Binary: ${binary}`;
}

function toggleSections() {
const switchButton = document.getElementById('switchButton');
const h1Text = document.getElementById('h1Text');

if (ipCalculatorSection.style.display === 'none' || ipCalculatorSection.style.display === '') {
    ipCalculatorSection.style.display = 'block';
    practiceProgramSection.style.display = 'none';
    resultOutput.textContent = '';
    switchButton.textContent = 'Switch to IP Practise';
    h1Text.textContent = 'IP Subnet Calculator (A, B, C)';
} else {
    ipCalculatorSection.style.display = 'none';
    practiceProgramSection.style.display = 'block';
    switchButton.textContent = 'Switch to IP Calculator';
    h1Text.textContent = 'IP Calculation Practice';
}
}

function toggleClass(ipClass) {
const classCButton = document.getElementById('classCButton');
const classBButton = document.getElementById('classBButton');
const classAButton = document.getElementById('classAButton');
const classUnderButton = document.getElementById('classUnderButton');

if (ipClass === 'C') {
toggleButtonState(classCButton);
} else if (ipClass === 'B') {
toggleButtonState(classBButton);
} else if (ipClass === 'A') {
toggleButtonState(classAButton);
} else if (ipClass === 'Under') {
toggleButtonState(classUnderButton);
}
}

function toggleButtonState(button) {
const isOn = button.textContent.includes('on');
toggleAllClassesOff();
if (isOn) {
button.textContent = button.textContent.replace('on', 'off');
} else {
button.textContent = button.textContent.replace('off', 'on');
}
}

function toggleAllClassesOff() {
const classCButton = document.getElementById('classCButton');
const classBButton = document.getElementById('classBButton');
const classAButton = document.getElementById('classAButton');
const classUnderButton = document.getElementById('classUnderButton');

classCButton.textContent = 'Class C IP off';
classBButton.textContent = 'Class B IP off';
classAButton.textContent = 'Class A IP off';
classUnderButton.textContent = 'Class under IP off';
}

function generateRandomIP() {
const selectedClasses = getSelectedClasses();
const randomMask = getRandomMask(selectedClasses);
const randomlyGeneratedIP = generateRandomIPWithMask(randomMask);
document.getElementById('randomlyGeneratedIP').textContent = randomlyGeneratedIP;
updatePracticeTable(randomlyGeneratedIP, randomMask);
}

function getSelectedClasses() {
const classCButton = document.getElementById('classCButton');
const classBButton = document.getElementById('classBButton');
const classAButton = document.getElementById('classAButton');
const classUnderButton = document.getElementById('classUnderButton');

const selectedClasses = [];
if (classCButton.textContent === 'Class C IP on') {
    selectedClasses.push('C');
}
if (classBButton.textContent === 'Class B IP on') {
    selectedClasses.push('B');
}
if (classAButton.textContent === 'Class A IP on') {
    selectedClasses.push('A');
}
if (classUnderButton.textContent === 'Class under IP on') {
    selectedClasses.push('Under');
}

return selectedClasses;
}

function getRandomMask(selectedClasses) {
let minMask = 0;
let maxMask = 30;

if (selectedClasses.includes('C')) {
    minMask = Math.max(minMask, 24);
}
if (selectedClasses.includes('B') && !selectedClasses.includes('C')) {
    minMask = Math.max(minMask, 16);
    maxMask = Math.min(maxMask, 23);
}
if (selectedClasses.includes('A') && !selectedClasses.includes('B') && !selectedClasses.includes('C')) {
    minMask = Math.max(minMask, 8);
    maxMask = Math.min(maxMask, 15);
}
if (selectedClasses.includes('Under') && !selectedClasses.includes('A') && !selectedClasses.includes('B') && !selectedClasses.includes('C')) {
    maxMask = Math.min(maxMask, 7);
}
return Math.floor(Math.random() * (maxMask - minMask + 1)) + minMask;
}

function generateRandomIPWithMask(mask) {
const ip = Array.from({ length: 4 }, () => Math.floor(Math.random() * 256));
return ip.join('.') + '/' + mask;
}

function updatePracticeTable(randomlyGeneratedIP, randomMask) {
}

function checkResults() {
const networkDecimal = document.getElementById('networkDecimal1').value;
const networkBinary = document.getElementById('networkBinary1').value;
const networkFullIp = document.getElementById('networkFullIp1').value;
const broadcastDecimal = document.getElementById('broadcastDecimal1').value;
const broadcastBinary = document.getElementById('broadcastBinary1').value;
const broadcastFullIp = document.getElementById('broadcastFullIp1').value;
const firstIPDecimal = document.getElementById('firstIPDecimal1').value;
const firstIPBinary = document.getElementById('firstIPBinary1').value;
const firstIPFullIp = document.getElementById('firstIPFullIp1').value;
const lastIPDecimal = document.getElementById('lastIPDecimal1').value;
const lastIPBinary = document.getElementById('lastIPBinary1').value;
const lastIPFullIp = document.getElementById('lastIPFullIp1').value;

const validationResult = validateResults(networkDecimal, networkBinary, networkFullIp, broadcastDecimal, broadcastBinary, broadcastFullIp, firstIPDecimal, firstIPBinary, firstIPFullIp, lastIPDecimal, lastIPBinary, lastIPFullIp);
}

function validateResults(networkDecimal, networkBinary, networkFullIp, broadcastDecimal, broadcastBinary, broadcastFullIp, firstIPDecimal, firstIPBinary, firstIPFullIp, lastIPDecimal, lastIPBinary, lastIPFullIp) {
const randomlyGeneratedIP = document.getElementById('randomlyGeneratedIP').textContent;
const randomMask = parseInt(randomlyGeneratedIP.split('/')[1]);
const ipArray = randomlyGeneratedIP.split('/')[0].split('.').map(Number);

const expectedResults = calculateExpectedResults(ipArray, randomMask);

let allFieldsCorrect = true;
let incorrectValues = {};

for (const field in expectedResults) {
const inputValue = eval(field);
const isCorrect = expectedResults[field] === inputValue;

const inputField = document.getElementById(field + '1');
inputField.style.color = isCorrect ? 'green' : 'red';

if (!isCorrect) {
    allFieldsCorrect = false;
    incorrectValues[field] = inputValue;
}
}

return allFieldsCorrect ? 'Results are correct!' : 'Some results are incorrect.';
}

function calculateExpectedResults(ipArray, randomMask) {
const subnetMultiplier = Math.floor(randomMask / 8);
const remainingBits = randomMask % 8;
const steps = Math.pow(2, 8 - remainingBits);
const lastOctetDecimal = ipArray[3];

const network = Math.floor(lastOctetDecimal / steps) * steps;
const broadcast = network + steps - 1;
return {
networkDecimal: network.toString(),
networkBinary: ('00000000' + network.toString(2)).slice(-8),
networkFullIp: ipArray.slice(0, 3).concat([network]).join('.'),
broadcastDecimal: broadcast.toString(),
broadcastBinary: ('00000000' + broadcast.toString(2)).slice(-8),
broadcastFullIp: ipArray.slice(0, 3).concat([broadcast]).join('.'),
firstIPDecimal: (network + 1).toString(),
firstIPBinary: ('00000000' + (network + 1).toString(2)).slice(-8),
firstIPFullIp: ipArray.slice(0, 3).concat([network + 1]).join('.'),
lastIPDecimal: (broadcast - 1).toString(),
lastIPBinary: ('00000000' + (broadcast - 1).toString(2)).slice(-8),
lastIPFullIp: ipArray.slice(0, 3).concat([broadcast - 1]).join('.')
};
}