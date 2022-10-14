const instructionMemory = document.getElementById("instruction-memory");
const dataMemory = document.getElementById("data-memory");
const codeEditor = document.getElementById("code-editor");
const codeEditorData = document.getElementById("code-editor-data");
const consoleDiv = document.getElementById("console");

const instructionPointer = document.getElementById("instruction-pointer");
const instructionRegister = document.getElementById("instruction-register");
const instructionDecoder = document.getElementById("instruction-decoder");
const accumulator = document.getElementById("accumulator");
const dataPointer1 = document.getElementById("data-pointer-1");
const dataPointer2 = document.getElementById("data-pointer-2");
const dataRegister1 = document.getElementById("data-register-1");
const dataRegister2 = document.getElementById("data-register-2");

const selectExample = document.getElementById("select-example");

const compileButton = document.getElementById("compile");
const runButton = document.getElementById("run");

let stop = true;

let clock;

const memorySize = 16;

let ip = "0000";
let acc = "00000000";
let dp1 = "0000";
let dp2 = "0000";
let dr1 = "00000000";
let dr2 = "00000000";
let ir = "000";
let idc = "";

function clearMemory() {
  instructionMemory.innerHTML = "";
  for (let i = 0; i < memorySize; i++) {
    let memoryCell = `
    <div class="memory-cell">
    <p>${toBinary(i, 4)}</p>
    <div id="instruction-memory-${i.toString(2).padStart(4, "0")}">0000000</div>
    </div>
    `;
    instructionMemory.innerHTML += memoryCell;
  }
  dataMemory.innerHTML = "";
  for (let i = 0; i < memorySize; i++) {
    let memoryCell = `
    <div class="memory-cell">
    <p>${toBinary(i, 4)}</p>
    <div id="data-memory-${i.toString(2).padStart(4, "0")}">00000000</div>
    </div>
    `;
    dataMemory.innerHTML += memoryCell;
  }
}

function compile() {
  clearMemory();
  let lines = codeEditor.value.split("\n");
  let compiledLines = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === "") continue; //ignore empty lines
    if (lines[i][0] === "#") continue; //ignore comments
    const opcode = lines[i].split(" ")[0];
    const operand = lines[i].split(" ")[1];

    const operandBin = toBinary(operand, 4) ? toBinary(operand, 4) : "0000";

    let requireOperand = false;
    let opcodeBin;
    switch (opcode) {
      case "JUMP":
        opcodeBin = "000";
        requireOperand = true;
        break;
      case "LOAD1":
        opcodeBin = "001";
        requireOperand = true;
        break;
      case "LOAD2":
        opcodeBin = "010";
        requireOperand = true;
        break;
      case "STORE":
        opcodeBin = "011";
        break;
      case "ADD":
        opcodeBin = "100";
        break;
      case "SUB":
        opcodeBin = "101";
        break;
      case "MULT":
        opcodeBin = "110";
        break;
      case "STOP":
        opcodeBin = "111";
        break;
      default:
        error("COMPILATION ERROR\n Invalid instruction: " + opcode);

        return;
    }
    if (!requireOperand && operand) {
      error("COMPILATION ERROR\n" + opcode + " does not take an address");
      return;
    }
    compiledLines.push(opcodeBin + operandBin);
  }
  if (!compiledLines.includes("1110000")) {
    error("COMPILATION ERROR\n Program must contain STOP");
    return;
  }

  //data memory
  let dataLines = codeEditorData.value.split("\n");
  let compiledDataLines = [];
  for (let i = 0; i < dataLines.length; i++) {
    if (dataLines[i] === "") continue; //ignore empty lines
    if (dataLines[i][0] === "#") continue; //ignore comments
    const value = parseInt(dataLines[i]);
    if (!(value >= 0 && value <= 255)) {
      console.log("VAL: " + value);
      error("COMPILATION ERROR\n Data must be in range 0-255");
      return;
    }
    compiledDataLines.push(toBinary(value, 8));
  }
  console.log(compiledDataLines);
  loadDataToMemory(compiledDataLines);
  loadToInstructionMemory(compiledLines);
}

function error(msg) {
  alert(msg);
}

function loadDataToMemory(compiledDataLines) {
  for (let i = 0; i < compiledDataLines.length; i++) {
    const location = document.getElementById("data-memory-" + toBinary(i, 4));
    location.innerHTML = compiledDataLines[i];
  }
}

function loadToInstructionMemory(compiledLines) {
  for (let i = 0; i < compiledLines.length; i++) {
    const location = document.getElementById(
      "instruction-memory-" + toBinary(i, 4)
    );
    location.innerHTML = compiledLines[i];
  }
}
function incrementProgramCounter() {
  pc = parseInt(programCounter.innerHTML);
  programCounter.innerHTML = pc + 1;
}

function loadExample() {
  const i = selectExample.selectedIndex;

  if (i == 0) {
    document.getElementById(
      "code-editor"
    ).value = `#adds x and y\n#result in DM 0\nLOAD1 0\nLOAD2 1\nADD\nSTORE\nSTOP`;
    document.getElementById("code-editor-data").value = `#x\n3\n#y\n2\n`;
  }
  if (i == 1) {
    document.getElementById(
      "code-editor"
    ).value = `#calculates n!\nLOAD1 0\nLOAD2 2\nMULT\nSTORE\nLOAD1 2\nLOAD2 3\nADD\nSTORE\nLOAD1 1\nLOAD2 3\nSUB\nSTORE\nLOAD1 1\nJUMP 0\nSTOP`;
    document.getElementById("code-editor-data").value = `1\n#n\n5\n1\n1`;
  }
  if (i == 2) {
    document.getElementById(
      "code-editor"
    ).value = `#if x=y DM 2=1\nLOAD1 0\nLOAD2 1\nSUB\nSTORE\nJUMP 9\nLOAD1 2\nLOAD2 3\nADD\nSTORE\nSTOP`;
    document.getElementById("code-editor-data").value = `#x\n3\n#y\n3\n0\n1`;
  }
  if (i == 3) {
    document.getElementById(
      "code-editor"
    ).value = `LOAD1 0\nLOAD2 1\nADD\nSTORE\nLOAD1 2 9\nLOAD2 0\nSUB\nLOAD1 3\nSTORE\nJUMP 0\nSTOP`;
    document.getElementById("code-editor-data").value = `0\n1\n10\n0`;
  }
}

function stopProgram() {
  const highestId = window.setTimeout(() => {
    for (let i = highestId; i < timeOuts.length; i++) {
      window.clearInterval(i);
    }
  }, 0);

  stop = true;

  compileButton.disabled = false;
  compileButton.classList.remove("disabled");
  runButton.disabled = false;
  runButton.classList.remove("disabled");
}

const sleep = (d) => new Promise((resolve) => setTimeout(resolve, d));
async function run() {
  //disable run and compile buttons until program finnished running
  compileButton.disabled = true;
  compileButton.classList.add("disabled");
  runButton.disabled = true;
  runButton.classList.add("disabled");
  //get clock speed
  clock = document.getElementById("clock").value;

  //reset instruction pointer
  ip = "0000";
  //get program from dom memory
  let programLines = [];
  for (let i = 0; i < memorySize; i++) {
    const address = toBinary(i, 4);
    const line = document.getElementById(
      "instruction-memory-" + address
    ).innerHTML;
    programLines.push(line);
  }
  //get data from dom memory
  let dataMemory = [];
  for (let i = 0; i < memorySize; i++) {
    const address = toBinary(i, 4);
    const line = document.getElementById("data-memory-" + address).innerHTML;
    console.log("A: " + line);
    dataMemory.push(line);
  }

  function updateDisplay() {
    accumulator.innerHTML = acc;
    dataPointer1.innerHTML = dp1;
    dataPointer2.innerHTML = dp2;
    dataRegister1.innerHTML = dr1;
    dataRegister2.innerHTML = dr2;
    instructionPointer.innerHTML = ip;
    instructionRegister.innerHTML = ir;
    instructionDecoder.innerHTML = idc;
    loadDataToMemory(dataMemory);
  }
  const padChar = "-";
  function log(line) {
    consoleDiv.innerHTML += "<div>" + line + "</div>";
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
  }
  function formatRegister(r) {
    return parseInt(r, 2).toString().padStart(3, padChar);
  }
  function logRegisters() {
    log(
      `RESULT  IP: ${formatRegister(ip)} IR: ${formatRegister(
        ir
      )} IDC: ${idc.padStart(5, padChar)} ACC: ${formatRegister(
        acc
      )} DP1: ${formatRegister(dp1)} DP2: ${formatRegister(
        dp2
      )} DR1: ${formatRegister(dr1)} DR2: ${formatRegister(dr2)}`
    );
  }

  log("START");
  stop = false;
  while (!stop) {
    ir = programLines[parseInt(ip, 2)].substring(0, 3);
    attention(document.getElementById("instruction-memory-" + ip), "read");
    const operand = programLines[parseInt(ip, 2)].substring(3, 7);
    //decode instruction
    idc = decodeInstruction(ir);

    log(
      "EXECUTING LINE: " +
        formatRegister(ip) +
        " INSTRUCTION: " +
        idc.padStart(5, padChar) +
        " WITH ADDRESS: " +
        formatRegister(operand)
    );
    switch (idc) {
      case "JUMP": //JUMP
        if (dr1 != "00000000") {
          ip = operand;
        } else {
          ip = binaryAddition(ip, 1, 4);
        }

        break;
      case "LOAD1": //LOAD1
        dp1 = operand;

        dr1 = dataMemory[parseInt(operand, 2)];

        attention(document.getElementById("data-memory-" + operand), "read");
        ip = binaryAddition(ip, 1, 4);

        break;
      case "LOAD2": //LOAD2
        dp2 = operand;

        dr2 = dataMemory[parseInt(operand, 2)];

        attention(document.getElementById("data-memory-" + operand), "read");
        ip = binaryAddition(ip, 1, 4);

        break;
      case "STORE": //STORE
        dataMemory[parseInt(dp1, 2)] = acc;
        attention(document.getElementById("data-memory-" + dp1), "write");
        dr1 = acc;

        ip = binaryAddition(ip, 1, 4);

        break;
      case "ADD": //ADD
        acc = binaryAddition(dr1, dr2, 8);

        ip = binaryAddition(ip, 1, 4);

        break;
      case "SUB": //SUB
        acc = binarySubtraction(dr1, dr2, 8);
        ip = binaryAddition(ip, 1, 4);
        break;
      case "MULT": //MULT
        acc = binaryMultiplication(dr1, dr2, 8);
        ip = binaryAddition(ip, 1, 4);
        break;
      case "STOP": //STOP
        ip = "0000";
        stop = true;
        break;
      default:
        error("RUNTIME ERROR");
        stop = true;
        break;
    }

    logRegisters();
    updateDisplay();
    await sleep(1000 / clock);
  }
  compileButton.disabled = false;
  compileButton.classList.remove("disabled");
  runButton.disabled = false;
  runButton.classList.remove("disabled");
}

function decodeInstruction(instruction) {
  switch (instruction) {
    case "000": //JUMP
      return "JUMP";
      break;
    case "001": //LOAD1
      return "LOAD1";
      break;
    case "010": //LOAD2
      return "LOAD2";
      break;
    case "011": //STORE
      return "STORE";
      break;
    case "100": //ADD
      return "ADD";
      break;
    case "101": //SUB
      return "SUB";
      break;
    case "110": //MULT
      return "MULT";
      break;
    case "111": //STOP
      return "STOP";
      break;
    default:
      return "?";
      break;
  }
}

function binaryAddition(a, b, length) {
  const da = parseInt(a, 2);
  const db = parseInt(b, 2);
  const dresult = da + db;
  const result = toBinary(dresult, length);
  return result;
}
function binarySubtraction(a, b, length) {
  const da = parseInt(a, 2);
  const db = parseInt(b, 2);
  const dresult = da - db;
  const result = toBinary(dresult, length);
  return result;
}
function binaryMultiplication(a, b, length) {
  const da = parseInt(a, 2);
  const db = parseInt(b, 2);
  const dresult = da * db;
  const result = toBinary(dresult, length);
  return result;
}

function toBinary(num, length) {
  num = parseInt(num);
  if (!num) num = 0;
  let negative = false;
  if (num < 0) {
    negative = true;
    num = num * -1;
  }
  num = num.toString(2);
  num = num.padStart(length, "0");
  num = num.substring(num.length, num.length - length);

  //if negative flip bits and add 1

  if (negative) {
    num = num.replaceAll("0", "X");
    num = num.replaceAll("1", "Y");
    num = num.replaceAll("Y", "0");
    num = num.replaceAll("X", "1");

    num = binaryAddition(num, 1, length);
  }
  return num;
}

function attention(element, readOrWrite) {
  if (readOrWrite == "read") {
    element.classList.add("read");
    setTimeout(function () {
      element.classList.remove("read");
    }, 100);
  }
  if (readOrWrite == "write") {
    element.classList.add("write");
    setTimeout(function () {
      element.classList.remove("write");
    }, 100);
  }
}

//start
clearMemory();

/*
===Info===

Instruction Memory: XXXYYYY (opcode,address)
Data Memory: ZZZZZZZZ (data)

000 JUMP if DR1 != 0 then IP = addr
001 LOAD1 DP1 = addr
010 LOAD2
011 STORE write ACC to DM using address DP1
100 ADD ACC = DR1+DR2
101 SUB ACC = DR1 - DR2
110 MULT ACC = DR1 x DR2
111 STOP

==========
*/
