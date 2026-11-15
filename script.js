/*
    Ip calculator and Ip Calculation Practise

    Author: WattoX00
    Date:   03/03/2024
*/

/* ================= Core subnet math (pure functions) ================= */

const pad8 = n => n.toString(2).padStart(8, '0');
const toInt = a => (((a[0] << 24) | (a[1] << 16) | (a[2] << 8) | a[3]) >>> 0);
const toArr = n => [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];

function maskToInt(mask) {
    return mask === 0 ? 0 : (0xFFFFFFFF << (32 - mask)) >>> 0;
}

function calc(ip, mask) {
    const maskInt = maskToInt(mask);
    const wildInt = (~maskInt) >>> 0;
    const net = (toInt(ip) & maskInt) >>> 0;
    const bc = (net | wildInt) >>> 0;

    let first, last, usable;
    if (mask === 32) { first = last = net; usable = 1; }
    else if (mask === 31) { first = net; last = bc; usable = 2; }
    else { first = net + 1; last = bc - 1; usable = Math.pow(2, 32 - mask) - 2; }

    return {
        mask,
        network: toArr(net),
        broadcast: toArr(bc),
        first: toArr(first),
        last: toArr(last),
        subnetMask: toArr(maskInt),
        wildcard: toArr(wildInt),
        total: Math.pow(2, 32 - mask),
        usable
    };
}

/* Returns {type:'full'|'mask'|'error', ...} */
function parseInput(raw) {
    const s = raw.trim();
    if (!s) return { type: 'empty' };
    if (!/^[0-9.\/]+$/.test(s)) {
        return { type: 'error', message: 'Invalid characters in input. Use only numbers, dots, and a forward slash.' };
    }

    if (s.includes('.')) {
        const parts = s.split('/');
        const octets = parts[0].split('.');
        if (octets.length !== 4 || octets.some(o => o === '')) {
            return { type: 'error', message: 'An IP address needs four octets, e.g. 192.168.100.1/24.' };
        }
        const ip = octets.map(Number);
        if (ip.some(o => !Number.isInteger(o) || o < 0 || o > 255)) {
            return { type: 'error', message: 'Invalid IP address. Each octet must be between 0 and 255.' };
        }
        if (parts.length !== 2 || parts[1] === '') {
            return { type: 'error', message: 'Add a subnet mask, e.g. /24.' };
        }
        const mask = Number(parts[1]);
        if (!Number.isInteger(mask) || mask < 0 || mask > 32) {
            return { type: 'error', message: 'Invalid subnet mask. Use a value from 0 to 32.' };
        }
        return { type: 'full', ip, mask };
    }

    const m = s.replace('/', '');
    const mask = Number(m);
    if (m === '' || s.split('/').length > 2 || !Number.isInteger(mask) || mask < 0 || mask > 32) {
        return { type: 'error', message: 'Invalid subnet mask. Use a value from 0 to 32.' };
    }
    return { type: 'mask', mask };
}

/* Expected answers for the practice mode */
function calculateExpectedResults(ipArray, mask) {
    const r = calc(ipArray, mask);
    const lo = a => a[3];
    return {
        networkDecimal: String(lo(r.network)),
        networkBinary: pad8(lo(r.network)),
        networkFullIp: r.network.join('.'),
        broadcastDecimal: String(lo(r.broadcast)),
        broadcastBinary: pad8(lo(r.broadcast)),
        broadcastFullIp: r.broadcast.join('.'),
        firstIPDecimal: String(lo(r.first)),
        firstIPBinary: pad8(lo(r.first)),
        firstIPFullIp: r.first.join('.'),
        lastIPDecimal: String(lo(r.last)),
        lastIPBinary: pad8(lo(r.last)),
        lastIPFullIp: r.last.join('.')
    };
}

const CLASS_RANGES = {
    C: [24, 30],
    B: [16, 23],
    A: [8, 15],
    Under: [0, 7]
};

function getRandomMask(selected) {
    const [min, max] = selected ? CLASS_RANGES[selected] : [0, 30];
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomIPWithMask(mask) {
    const ip = Array.from({ length: 4 }, () => Math.floor(Math.random() * 256));
    return ip.join('.') + '/' + mask;
}

if (typeof module !== 'undefined') {
    module.exports = { calc, parseInput, calculateExpectedResults, getRandomMask, generateRandomIPWithMask, pad8 };
}

/* ================= UI ================= */

if (typeof document !== 'undefined') {
    const $ = id => document.getElementById(id);

    const ipCalculatorSection = $('ipCalculatorSection');
    const practiceProgramSection = $('practiceProgramSection');
    const resultOutput = $('resultOutput');
    const ipInput = $('ipInput');
    const h1Text = $('h1Text');
    const subText = $('subText');
    const tabs = document.querySelector('.tabs');

    /* ---------- Tabs ---------- */
    const TITLES = {
        calc: ['IP Subnet Calculator', 'Enter an IP with a CIDR mask and get everything about the subnet instantly.'],
        practice: ['IP Calculation Practice', 'Generate a random IP, work out the subnet by hand, then check your answers.']
    };

    function showSection(name) {
        const isCalc = name === 'calc';
        ipCalculatorSection.classList.toggle('hidden', !isCalc);
        practiceProgramSection.classList.toggle('hidden', isCalc);
        $('switchCalc').classList.toggle('active', isCalc);
        $('switchPractice').classList.toggle('active', !isCalc);
        $('switchCalc').setAttribute('aria-selected', String(isCalc));
        $('switchPractice').setAttribute('aria-selected', String(!isCalc));
        tabs.dataset.active = name;
        h1Text.textContent = TITLES[name][0];
        subText.textContent = TITLES[name][1];
    }
    $('switchCalc').addEventListener('click', () => showSection('calc'));
    $('switchPractice').addEventListener('click', () => showSection('practice'));

    /* ---------- Calculator ---------- */
    function binHTML(arr, mask) {
        const bits = arr.map(pad8).join('');
        let out = '';
        for (let i = 0; i < 32; i++) {
            if (i > 0 && i % 8 === 0) out += '.';
            out += `<span class="${i < mask ? 'n' : 'h'}">${bits[i]}</span>`;
        }
        return out;
    }

    function card(label, arr, mask, wide) {
        return `<div class="card${wide ? ' wide' : ''}">
            <div class="k">${label}</div>
            <div class="v">${arr.join('.')}</div>
            <div class="bin">${binHTML(arr, mask)}</div>
        </div>`;
    }

    function statCard(label, value) {
        return `<div class="card"><div class="k">${label}</div><div class="v">${value}</div></div>`;
    }

    const legend = `<div class="legend"><span><i style="background:var(--accent)"></i>Network bits</span><span><i style="background:#a78bfa"></i>Host bits</span></div>`;

    function calculateSubnet() {
        const parsed = parseInput(ipInput.value);
        if (parsed.type === 'empty') { resultOutput.innerHTML = ''; return; }
        if (parsed.type === 'error') {
            resultOutput.innerHTML = `<div class="msg">${parsed.message}</div>`;
            return;
        }

        if (parsed.type === 'mask') {
            const r = calc([0, 0, 0, 0], parsed.mask);
            resultOutput.innerHTML =
                card('Subnet Mask', r.subnetMask, parsed.mask) +
                card('Wildcard Mask', r.wildcard, parsed.mask) +
                statCard('Total Hosts', r.total.toLocaleString('en-US')) +
                statCard('Usable Hosts', r.usable.toLocaleString('en-US')) +
                legend;
            return;
        }

        const r = calc(parsed.ip, parsed.mask);
        resultOutput.innerHTML =
            card('Network', r.network, r.mask) +
            card('Broadcast', r.broadcast, r.mask) +
            card('First IP', r.first, r.mask) +
            card('Last IP', r.last, r.mask) +
            card('Subnet Mask', r.subnetMask, r.mask) +
            card('Wildcard Mask', r.wildcard, r.mask) +
            statCard('Total Hosts', r.total.toLocaleString('en-US')) +
            statCard('Usable Hosts', r.usable.toLocaleString('en-US')) +
            legend;
    }

    $('subnetForm').addEventListener('submit', e => { e.preventDefault(); calculateSubnet(); });
    ipInput.addEventListener('input', calculateSubnet);

    /* ---------- Practice ---------- */
    let selectedClass = null;

    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const cls = chip.dataset.class;
            selectedClass = selectedClass === cls ? null : cls;
            document.querySelectorAll('.chip').forEach(c =>
                c.setAttribute('aria-pressed', String(c.dataset.class === selectedClass)));
        });
    });

    const FIELDS = ['network', 'broadcast', 'firstIP', 'lastIP']
        .flatMap(k => ['Decimal', 'Binary', 'FullIp'].map(t => k + t));
    const checkMessage = $('checkMessage');

    function clearPractice() {
        FIELDS.forEach(f => {
            const el = $(f + '1');
            el.value = '';
            el.classList.remove('correct', 'wrong');
        });
        checkMessage.textContent = '';
        checkMessage.className = 'check-message';
    }

    function generateRandomIP() {
        const mask = getRandomMask(selectedClass);
        $('randomlyGeneratedIP').textContent = generateRandomIPWithMask(mask);
        clearPractice();
    }
    $('generateButton').addEventListener('click', generateRandomIP);

    function normalize(field, value) {
        const v = value.trim();
        if (field.endsWith('Binary') && /^[01]{1,8}$/.test(v)) return v.padStart(8, '0');
        return v;
    }

    function checkResults() {
        const text = $('randomlyGeneratedIP').textContent;
        if (!text.includes('/')) {
            checkMessage.textContent = 'Generate an IP first.';
            checkMessage.className = 'check-message fail';
            return;
        }
        const [ipPart, maskPart] = text.split('/');
        const expected = calculateExpectedResults(ipPart.split('.').map(Number), parseInt(maskPart, 10));

        let correct = 0;
        FIELDS.forEach(f => {
            const el = $(f + '1');
            const ok = normalize(f, el.value) === expected[f];
            el.classList.toggle('correct', ok);
            el.classList.toggle('wrong', !ok);
            if (ok) correct++;
        });

        const all = correct === FIELDS.length;
        checkMessage.textContent = all
            ? 'Results are correct! 🎉'
            : `Some results are incorrect (${correct}/${FIELDS.length} right).`;
        checkMessage.className = 'check-message ' + (all ? 'ok' : 'fail');
    }
    $('checkResultButton').addEventListener('click', checkResults);

    FIELDS.forEach(f => $(f + '1').addEventListener('input', e => e.target.classList.remove('correct', 'wrong')));

    /* ---------- Footer ---------- */
    const footerContainer = $('footerContainer');
    const footerArrow = $('footerArrow');
    let isFooterVisible = true;

    function updateFooter() {
        footerContainer.classList.toggle('active', isFooterVisible);
        footerArrow.classList.toggle('hidden', isFooterVisible);
        document.body.style.setProperty('--footer-h', isFooterVisible ? footerContainer.offsetHeight + 'px' : '0px');
    }
    footerArrow.addEventListener('click', () => { isFooterVisible = true; updateFooter(); });
    footerContainer.addEventListener('click', e => {
        if (e.target.closest('a')) return;
        isFooterVisible = false;
        updateFooter();
    });
    window.addEventListener('resize', updateFooter);

    showSection('calc');
    updateFooter();
}
