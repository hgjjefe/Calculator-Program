

const display = document.getElementById("display");
display.value = "|";
const result = document.getElementById("result");    // result is what you get after hitting EXE
const indicator = document.getElementById("indicator");    // the line above display for indicating formulas
const indicator2 = document.getElementById("indicator2");  // shows e+ number in top right corner in normal mode

const sci_keys_list = document.querySelectorAll("#sci-keys>*");
const main_keys_list = document.querySelectorAll("#main-keys>*");


const STO_btn = document.getElementById("STO");
const RAD_btn = document.getElementById("RAD");
const SHIFT_btn = document.getElementById("SHIFT");
const ALPHA_btn = document.getElementById("ALPHA");
const FMLA_btn = document.getElementById("FMLA");

const sin_btn = document.getElementById("sin")

result.value = "";
let cursorPos = 0;
let historyCursor = -1;

let ans = 0;
let A = 0, B = 0, C = 0, D = 0, M = 0, X = 0, Y = 0, Z = 0;
let result_array = [];  // stores results from built-in formulas

let rad_mode = true;
let formula_mode = 0;

const GRAVITY = 9.81;
const PHI = 1.618033988749895;
const precision = 12;   // rounding precision (number of decimal places)


// operators that will make the searcher in factorialInputrGetter stop going left 
const OPERATORS = ["+", "-", "*", "/", "%", "⌊", "𝐂", "𝐏"];
const PLUSMINUS = ["+", "-"];
// expressions that can be the left or right of invisible times
const LEFTOFINVTIMES = ["0","1","2","3","4","5","6","7","8","9",")","Math.PI","Math.E","A","B","C","D","M",
"X","Y","Z","ans"];
const RIGHTOFINVTIMES = ["(","Math.PI","Math.E","A","B","C","D","M","X","Y","Z","ans"];
// keypresses that call appendToDisplay
const APPENDKEY = ["0","1","2","3","4","5","6","7","8","9","+","-","^","!","(",")",".",",",":","%"];
const LETTERS = ["A","B","C","D","M","X","Y","Z"];

/* order of operations:
1st: ^
2nd: !
3rd: 𝐂, 𝐏
4th: * / % ⌊
5th: + -
*/


// data.expr stores stuff displayed as an array
// data.formula stores stuff as Javascript formula to be evaluated by eval()
let data = {
    expr: ["|"],     
    formula : ["|"]
};

// History of Inputs
let history = {
    expr: [],
    formula: []
};


// helper function to insert char at cursorPos within string
function insertChar(str, characterToInsert, index){
    return str.slice(0, index) + characterToInsert + str.slice(index);
}
function roundToTwelve(num) {
    return +(Math.round(num + "e+12")  + "e-12");
}
function showDigits(num, digits){
    return Number(num.toFixed(digits));
}

// swap two elements of array at index A, index B
function swapElement(array, indexA, indexB){
    [array[indexA], array[indexB]] = [array[indexB], array[indexA]];
}

// SEARCH AN ARRAY and return a list of the indices that have keyword
function search( array, keyword){
    let search_result = [];
    new_array = Array.from(array);   // convert string (if any) to array

    new_array.forEach( (element, index) => {
        if (element == keyword ) search_result.push(index);
    })
    
    return search_result;
}
// Takes in an array that do plus one for all elements larger than j
function plusOne(array, j){
    for (let i=0; i<array.length; i++){
        if (array[i] >= j){
            array[i]++;
        }
    }
}
// plus n for all elements in array
function allPlus(array, n=1){
    for (let i=0; i<array.length; i++){
        array[i] += n;
    }
}

// toggle a boolean value
function toogleBool(input){
    if (input == true) return false;
    if (input == false) return true;
}


// DISABLE AND ENABLE BUTTONS
function disableBtns(){
    for (let i=4; i<24; i++){
        sci_keys_list[i].removeAttribute("onclick");
    }
    main_keys_list[8].removeAttribute("onclick");
    main_keys_list[9].removeAttribute("onclick");
    main_keys_list[13].removeAttribute("onclick");
    main_keys_list[14].removeAttribute("onclick");
    main_keys_list[16].removeAttribute("onclick");
    main_keys_list[17].removeAttribute("onclick");
    main_keys_list[18].removeAttribute("onclick");
}
// check if a character is letter
function isLetter(c) {
    return c.toLowerCase() != c.toUpperCase();
  }
// check if a character is number
function isNumber(c){
    return ['0','1','2','3','4','5','6','7','8','9'].includes(c);
}


// DISPLAY

function appendToDisplay(to_expr, to_formula = to_expr){
    // insert expr and formula into the data arrays using splice
    //  array.splice(index, how_many_to_delete, element1, element2, ...)
    data.expr.splice(cursorPos, 0, to_expr);
    data.formula.splice(cursorPos, 0, to_formula);
    cursorPos++;
    updateDisplay();
}

function updateDisplay(){
    display.value = data.expr.join("");

    // deactivate STO button if activated
    if (STO_btn.classList.contains("activated-btn")){
        STO_btn.classList.remove("activated-btn");
    }
    // deactivate SHIFT button if activated
    if (SHIFT_btn.classList.contains("activated-btn")){
        deactivateShift();
    }

    if (formula_mode > 0){
        indicator.value = TITLES[formula_mode];  // set indicator to default title of that formula_mode
    }
    printData();
}
function printData(){
    console.log("data.expr:", data.expr);
    console.log("data.formula:", data.formula);
}

function clearDisplay(){
    data.expr = ["|"];
    data.formula = ["|"];
    cursorPos = 0;
    result.value = "";
    indicator2.value = "";
    if (formula_mode == 0){
        indicator.value = "";
    }
    if ( formula_mode ==-1){
        deactivateFMLA();
    }
    if (formula_mode > 0){
        result_array = [];
        result_fraction_array = {  // for formula mode
            up: [null,null,null],
            down: [null,null,null]
        }
    }
    updateDisplay();
}

function del(){
    if (cursorPos > 0){
    data.expr.splice(cursorPos-1, 1);
    data.formula.splice(cursorPos-1, 1);
    cursorPos--;
    }
    updateDisplay();
}

function cursorLeft(){
    if (cursorPos > 0){
        swapElement(data.expr, cursorPos, cursorPos - 1);
        swapElement(data.formula, cursorPos, cursorPos - 1);
        cursorPos--;
    }
    updateDisplay();
}
function cursorRight(){
    if (cursorPos < data.expr.length - 1){
        swapElement(data.expr, cursorPos, cursorPos + 1);
        swapElement(data.formula, cursorPos, cursorPos + 1);
        cursorPos++;
    }
    updateDisplay();
}
function cursorLeftmost(){
    if (cursorPos == 0){
        if (historyCursor >0){
            historyCursor--;
            getHistory();
            return;
        }
    }
    while (cursorPos > 0){
        cursorLeft();
    }
}
function cursorRightmost(){
    if (cursorPos == data.formula.length - 1){
        if (historyCursor < history.formula.length-1){
            historyCursor++;
            getHistory();
            return;
        }
    }
    while (cursorPos < display.value.length - 1){
        cursorRight();
    }
}

function getHistory(){
    let tmp = cursorPos;  // temporarily store cursorPos
    clearDisplay();
    data.expr = Array.from(history.expr[historyCursor]);
    data.formula = Array.from(history.formula[historyCursor]);
    if (tmp){
        cursorPos = data.formula.length;
    }
    data.expr.splice(cursorPos,0,"|");
    data.formula.splice(cursorPos,0,"|");   
    updateDisplay();
}

// CALCULATE THE INPUT EXPRESSION 

function calculate(){
    deactivateShift();
    // record in history list
    if (data.formula.length > 1){
        history.formula.push(Array.from(data.formula.filter( e => e !== "|" )));
        history.expr.push(Array.from(data.expr.filter( e => e !== "|" )));
        historyCursor = history.formula.length - 1;
        console.log("History:", history);
    }
    // fix lazy notation
    let formula_array = Array.from(data.formula);  // make a copy of data.formula since I don't want it to be modified
    formula_array = formula_array.filter( e => e !== "|" );   // get rid of | bar
    formula_array = fixInvisibleTimes(formula_array);

    let formula_str = formula_array.join("");
    formula_str = formula_str.replace("|", "");  // get rid of | bar

    // choose formula screen
    if (formula_mode == -1){
        chooseFormula(formula_str);
        return;
    }
    formula_array = Array.from(formula_str); // make formula array so that each element only has one character
    formula_array = fixBracket(formula_array);

    // NORMAL CALCULATION
    // convert factorial into functional format:   n! => factorial(n)
    // convert str back into array because it is easier to work with
    // Also, in formula_array, each element only has one character
    
    let search_result = search(formula_array, "!");
    formula_str = factorialInputGetter(formula_array, search_result).join("");
    // combinations  ( n choose r )
    formula_array = Array.from(formula_str);
    search_result = search(formula_array, "𝐂");
    formula_str = combInputGetter(formula_array, search_result, "comb").join("");

    // permutations  ( n permute r )
    formula_array = Array.from(formula_str);
    search_result = search(formula_array, "𝐏");
    formula_str = combInputGetter(formula_array, search_result, "perm").join("");

    // floor division
    formula_array = Array.from(formula_str);
    search_result = search(formula_array, "⌊");
    formula_str = floordivInputGetter(formula_array, search_result).join("");

    // spread colon
    formula_array = Array.from(formula_str);
    formula_array = spreadColon(formula_array);
    formula_str = formula_array.join("");
    
    // formula_mode modifier
    if (formula_mode > 0){
    formula_array = Array.from(formula_str);
    formula_str = getFormula(formula_array).join("");
    }

    // turn ^ into ** before processing
    formula_str = formula_str.replaceAll("^","**")

    console.log(formula_str);
    try{
        formula_str = eval(formula_str);
        //result.value = Math.round(output.value  * Math.pow(10,12)) / Math.pow(10,12); 

        if (formula_mode == 0){
        result.value = Number(formula_str.toFixed(precision));
        ans = Number(result.value);

        // if result uses e+ notation, show the power on indicator (otherwise it overflows off screen)
        if (result.value > 10**21){
            indicator2.value = `e+${Math.floor(Math.log10(result.value))}`;
        }else{
            indicator2.value =  "";
        }
        // FORMULA MODE
        }else if (formula_mode > 0){ 
            for (let i=0; i<formula_str.length; i++){
                result_array[i] = Number(formula_str[i].toFixed(precision));
            }
            if(result_array[0])  X = result_array[0];
            if(result_array[1])  Y = result_array[1];
            if(result_array[2])  Z = result_array[2];
            showResult();
            console.log(result_array);
        }
    }
    catch(error){
        result.value = "Error";
        return "Error";
    }
    return ans;
}
// lazy notation functions
function fixBracket(array){
    let bracket_count = 0
    for (let i=0;i<array.length;i++){
        if (array[i] == '(')  bracket_count++;
        if (array[i] == ')')  bracket_count--;
    }
    if (bracket_count > 0){
        for (let i=0;i<bracket_count;i++){
            array.push(')');
        }
    }
    else if (bracket_count < 0){
        for (let i=0;i<-bracket_count;i++){
            array.unshift('(');
        }
    }
    return array;
}
// invisible multiplication symbol  eg. 5a, (a+b)(a-b)
function fixInvisibleTimes(array){
    let i=0;
    for (let i=0;i<array.length-1;i++){
        if (LEFTOFINVTIMES.includes(array[i]) && ( RIGHTOFINVTIMES.includes(array[i+1]) || isLetter(array[i+1][0]) ) ){
            array.splice(i+1,0,"*");
        }
    }
    return array;
}
// spread colon operator
// 3:5  becomes 3,3,3,3,3
function spreadColon(array){
    let i=0;
    while (i<array.length){
        if (array[i] == ":" ){
            let j = i-1;  // searcher goes left
            while (array[j-1] != "," && j > 0 && array[j-1] != "(" ){
                j--;
            }
            let k = i+1;   // searcher goes right
            while (array[k] != "," && k < array.length && array[k] != ")" ){
                k++;
            }
            console.log("j,i,k",j,i,k);
            let val = array.slice(j,i).join("");
            let n = array.slice(i+1,k).join("");
            console.log(val,n);
            array.splice(i,k-i,",");
            for (let l=0;l<n-2;l++){
                array.splice(i+1,0,val);
                array.splice(i+1,0,",");
            }
            array.splice(i+1,0,val);
            console.log(array);
        }
        i++;
    }
    return array;
}


// results
function showResult(){   // for showing multiple results in formula mode
    result.value = "";
    for (let i=0; i<result_array.length; i++){
        result.value += `${showDigits(result_array[i],5)}, `;
    }
    result.value = result.value.slice(0,-2);  // get rid of trailing comma
}
function appendToResult(input, i){   // append a value (cor. to 5 d.p.) to result
    result.value += `${showDigits(result_array[i],5)}, `;
}

// store the answer inside variable A, B, C, ...
function store(variable){
    if (STO_btn.classList.contains("activated-btn")){
        if (variable == 'A') A = ans;
        if (variable == 'B') B = ans;
        if (variable == 'C') C = ans;
        if (variable == 'D') D = ans;
        if (variable == 'X') X = ans;
        if (variable == 'Y') Y = ans;
        if (variable == 'Z') Z = ans;
        if (variable == 'M') M = ans;
        STO_btn.classList.remove("activated-btn");
        indicator.value = ` ans -> ${variable}`;
    }
    else{
        appendToDisplay(variable);

    }
}

function Mplus(){
    if (STO_btn.classList.contains("activated-btn")){
        store('M');
    }else{
    let cal_result = calculate();
    if (cal_result == "Error") {
        indicator.value = `M = ${M}`;
        return;
    }
    M += ans;   
    indicator.value = `M = ${M}`;
    }
}
function Mminus(){
    if (STO_btn.classList.contains("activated-btn")){
        store('M');
        deactivateShift();
    }else{
    let cal_result = calculate();
    if (cal_result == "Error") {
        indicator.value = `M = ${M}`;
        return;
    }
    M -= ans;   
    indicator.value = `M = ${M}`;
    deactivateShift();
    }
}

// for toggleable buttons like STO, RAD, SHIFT, ALPHA
function activateBtn(btn){
    if (btn == "STO")
        STO_btn.classList.toggle("activated-btn");
    if (btn == "RAD"){
        if (rad_mode == true){
            RAD_btn.textContent = "deg";
            rad_mode = false;
        }
        else{
            RAD_btn.textContent = "rad";
            rad_mode = true;
        }
    }
    if (btn == "SHIFT"){
        if (formula_mode != -1){
        SHIFT_btn.classList.toggle("activated-btn");
        toggleShiftPanel();
        }
    }
    if (btn == "ALPHA"){    // toggle small font size
        ALPHA_btn.classList.toggle("activated-btn");
        if (ALPHA_btn.classList.contains("activated-btn")){
            display.style.fontSize = "1.2rem";
            result.style.fontSize = "1.2rem";
        }
            
        else{
            display.style.fontSize = "2rem";
            result.style.fontSize = "2rem";
        }
    }
    if (btn == "FMLA"){
        FMLA_btn.classList.toggle("activated-btn");
        deactivateShift();
        if (FMLA_btn.classList.contains("activated-btn")){  // choose formula
            clearDisplay();
            formula_mode = -1;
            indicator.value = "Formula No?"
            disableBtns();
        }
        else{
            deactivateFMLA();
        }
    }
}
function deactivateShift(){
    SHIFT_btn.classList.remove("activated-btn");
    toggleShiftPanel();
}
function deactivateFMLA(){
    FMLA_btn.classList.remove("activated-btn");
    formula_mode = 0;
    indicator.value = "";
    indicator.style.width = "275px";
    indicator2.style.display = "block";
    clearDisplay();
    deactivateShift();
}
// Press ON button to return to normal mode in one press, and also clears history
function returnHome(){
    history = {
        expr: [],
        formula: []
    };
    if (formula_mode == -1){
        activateBtn('FMLA');
    }else{
    // Press FMLA Button twice
    activateBtn('FMLA');
    activateBtn('FMLA');
    }
}


// invoked when SHIFT is pressed
function toggleShiftPanel(){
    if (SHIFT_btn.classList.contains("activated-btn")){  // shift panel
        sci_keys_list[4].innerHTML = "n<sup>-1</sup>";
        sci_keys_list[4].setAttribute("onclick", "appendToDisplay('⁻¹', '^-1')");
        sci_keys_list[4].classList.remove("larger-text");

        sci_keys_list[5].textContent = "abs";
        sci_keys_list[5].setAttribute("onclick", "appendToDisplay('abs(', 'Math.abs(')");
        sci_keys_list[5].classList.remove("larger-text");

        sci_keys_list[6].textContent = "ab/c";
        sci_keys_list[6].setAttribute("onclick", "showMixedFraction()");

        sci_keys_list[7].innerHTML = "<sup>3</sup>√";
        sci_keys_list[7].setAttribute("onclick", "appendToDisplay('³√(', 'cubert(')");

        sci_keys_list[8].innerHTML = "n<sup>3</sup>";
        sci_keys_list[8].setAttribute("onclick", "appendToDisplay('³', '^3')");

        sci_keys_list[9].innerHTML = "<sup>n</sup>√";
        sci_keys_list[9].setAttribute("onclick", "appendToDisplay('ⁿ√(', 'mysqrt(')");

        sci_keys_list[10].innerHTML = "<sub>E</sub>";
        sci_keys_list[10].setAttribute("onclick", "appendToDisplay('ᴱ', '10^')");

        sci_keys_list[11].innerHTML = "exp";
        sci_keys_list[11].setAttribute("onclick", "appendToDisplay('exp(', 'Math.exp(')");

        sci_keys_list[12].innerHTML = "X";
        sci_keys_list[12].setAttribute("onclick", "store('X')");

        sci_keys_list[13].innerHTML = "Y";
        sci_keys_list[13].setAttribute("onclick", "store('Y')");

        sci_keys_list[14].innerHTML = "Z";
        sci_keys_list[14].setAttribute("onclick", "store('Z')");

        sci_keys_list[15].textContent = "asin";
        sci_keys_list[15].setAttribute("onclick", "appendToDisplay('asin(', 'inv_trigo(Math.asin,')");

        sci_keys_list[16].textContent = "acos";
        sci_keys_list[16].setAttribute("onclick", "appendToDisplay('acos(', 'inv_trigo(Math.acos,')");

        sci_keys_list[17].textContent = "atan";
        sci_keys_list[17].setAttribute("onclick", "appendToDisplay('atan(', 'inv_trigo(Math.atan,')");

        sci_keys_list[19].innerHTML = "M";
        sci_keys_list[19].setAttribute("onclick", "store('M')");

        sci_keys_list[20].textContent = "⌊n⌋";
        sci_keys_list[20].setAttribute("onclick", "appendToDisplay('flr(', 'Math.floor(')");

        sci_keys_list[21].textContent = "⌈n⌉";
        sci_keys_list[21].setAttribute("onclick", "appendToDisplay('ceil(', 'Math.ceil(')");

        sci_keys_list[22].textContent = ":";
        sci_keys_list[22].setAttribute("onclick", "appendToDisplay(':')");

        sci_keys_list[23].textContent = "M-";
        sci_keys_list[23].setAttribute("onclick", "Mminus()");

        // SHIFT PANEL MAIN KEYS

        main_keys_list[0].textContent = "mean";   
        main_keys_list[0].setAttribute("onclick", "appendToDisplay('mean(', 'mean(')");
        main_keys_list[0].classList.add("smaller-text");

        main_keys_list[1].textContent = "med";   
        main_keys_list[1].setAttribute("onclick", "appendToDisplay('med(', 'median(')");
        main_keys_list[1].classList.add("smaller-text");

        main_keys_list[2].textContent = "std";   
        main_keys_list[2].setAttribute("onclick", "appendToDisplay('std(', 'std(')");
        main_keys_list[2].classList.add("smaller-text");

        main_keys_list[3].textContent = "det";   
        main_keys_list[3].setAttribute("onclick", "appendToDisplay('det(', 'det(')");

        main_keys_list[4].textContent = "shoe";   
        main_keys_list[4].setAttribute("onclick", "appendToDisplay('shoe(', 'shoelace(')");

        main_keys_list[5].textContent = "LoC2";   // Law of Cosines
        main_keys_list[5].setAttribute("onclick", "appendToDisplay('LoC2(', 'cosinelaw2(')");
        main_keys_list[5].classList.add("smaller-text");

        main_keys_list[6].textContent = "max";   
        main_keys_list[6].setAttribute("onclick", "appendToDisplay('max(', 'Math.max(')");
        main_keys_list[6].classList.add("smaller-text");

        main_keys_list[7].textContent = "min";   
        main_keys_list[7].setAttribute("onclick", "appendToDisplay('min(', 'Math.min(')");
        main_keys_list[7].classList.add("smaller-text");

        main_keys_list[8].textContent = "%";
        main_keys_list[8].setAttribute("onclick", "appendToDisplay('%')");

        main_keys_list[9].textContent = "//";
        main_keys_list[9].setAttribute("onclick", "appendToDisplay('//', '⌊')");

        main_keys_list[10].textContent = "pyth";   
        main_keys_list[10].setAttribute("onclick", "appendToDisplay('pyth(')");
        main_keys_list[10].classList.add("smaller-text");

        main_keys_list[11].textContent = "LoC";   // Law of Cosines
        main_keys_list[11].setAttribute("onclick", "appendToDisplay('LoC(', 'cosinelaw(')");
        main_keys_list[11].classList.add("smaller-text");

        main_keys_list[12].textContent = "Hrn";
        main_keys_list[12].setAttribute("onclick", "appendToDisplay('Hrn(', 'heron(')");
        main_keys_list[12].classList.add("smaller-text");

        main_keys_list[13].textContent = "nPr";
        main_keys_list[13].setAttribute("onclick", "appendToDisplay('𝐏', '𝐏')");
        main_keys_list[13].classList.add("smaller-text");

        main_keys_list[14].textContent = "nCr";
        main_keys_list[14].setAttribute("onclick", "appendToDisplay('𝐂', '𝐂')");
        main_keys_list[14].classList.add("smaller-text");

        main_keys_list[15].textContent = "dist";
        main_keys_list[15].setAttribute("onclick", "appendToDisplay('dist(', 'distance(')");
        main_keys_list[15].classList.add("smaller-text");

        // changed my mind
        //main_keys_list[16].innerHTML = "φ";
        //main_keys_list[16].setAttribute("onclick", "appendToDisplay('φ', 'PHI')");
        main_keys_list[16].innerHTML = "gcd";
        main_keys_list[16].setAttribute("onclick", "appendToDisplay('gcd(', 'gcdall(')"); 
        main_keys_list[16].classList.add("smaller-text");

        //main_keys_list[17].textContent = "g";
        //main_keys_list[17].setAttribute("onclick", "appendToDisplay('g', 'GRAVITY')");
        main_keys_list[17].innerHTML = "lcm";
        main_keys_list[17].setAttribute("onclick", "appendToDisplay('lcm(', 'lcmall(')"); 
        main_keys_list[17].classList.add("smaller-text");

        main_keys_list[18].textContent = "int";
        main_keys_list[18].setAttribute("onclick", "appendToDisplay('int(', 'Math.round(')");
        main_keys_list[18].classList.add("smaller-text");
    }
    else{   // normal panel
        sci_keys_list[4].textContent = "!";
        sci_keys_list[4].setAttribute("onclick", "appendToDisplay('!')");
        sci_keys_list[4].classList.add("larger-text");

        sci_keys_list[5].textContent = "e";
        sci_keys_list[5].setAttribute("onclick", "appendToDisplay('e', 'Math.E')");
        sci_keys_list[5].classList.add("larger-text");

        sci_keys_list[6].textContent = "b/c";
        sci_keys_list[6].setAttribute("onclick", "convertToFraction()");

        sci_keys_list[7].textContent = "√";
        sci_keys_list[7].setAttribute("onclick", "appendToDisplay('√(', 'Math.sqrt(')");

        sci_keys_list[8].innerHTML = "n<sup>2</sup>";
        sci_keys_list[8].setAttribute("onclick", "appendToDisplay('²', '^2')");

        sci_keys_list[9].innerHTML = "^";
        sci_keys_list[9].setAttribute("onclick", "appendToDisplay('^', '^')");

        sci_keys_list[10].innerHTML = "log";
        sci_keys_list[10].setAttribute("onclick", "appendToDisplay('log(', 'mylog(')");

        sci_keys_list[11].innerHTML = "ln";
        sci_keys_list[11].setAttribute("onclick", "appendToDisplay('ln(', 'Math.log(')");

        sci_keys_list[12].innerHTML = "A";
        sci_keys_list[12].setAttribute("onclick", "store('A')");

        sci_keys_list[13].innerHTML = "B";
        sci_keys_list[13].setAttribute("onclick", "store('B')");

        sci_keys_list[14].innerHTML = "C";
        sci_keys_list[14].setAttribute("onclick", "store('C')");

        sci_keys_list[15].textContent = "sin";
        sci_keys_list[15].setAttribute("onclick", "appendToDisplay('sin(', 'trigo(Math.sin,')");

        sci_keys_list[16].textContent = "cos";
        sci_keys_list[16].setAttribute("onclick", "appendToDisplay('cos(', 'trigo(Math.cos,')");

        sci_keys_list[17].textContent = "tan";
        sci_keys_list[17].setAttribute("onclick", "appendToDisplay('tan(', 'trigo(Math.tan,')");

        sci_keys_list[18].innerHTML = "STO";
        sci_keys_list[18].setAttribute("onclick", "activateBtn('STO')");

        sci_keys_list[19].innerHTML = "D";
        sci_keys_list[19].setAttribute("onclick", "store('D')");

        sci_keys_list[20].textContent = "(";
        sci_keys_list[20].setAttribute("onclick", "appendToDisplay('(')");

        sci_keys_list[21].textContent = ")";
        sci_keys_list[21].setAttribute("onclick", "appendToDisplay(')')");

        sci_keys_list[22].textContent = ",";
        sci_keys_list[22].setAttribute("onclick", "appendToDisplay(',')");

        sci_keys_list[23].textContent = "M+";
        sci_keys_list[23].setAttribute("onclick", "Mplus()");

        // NORMAL PANEL MAIN KEYS

        main_keys_list[0].textContent = "7";
        main_keys_list[0].setAttribute("onclick", "appendToDisplay('7')");
        main_keys_list[0].classList.remove("smaller-text");

        main_keys_list[1].textContent = "8";
        main_keys_list[1].setAttribute("onclick", "appendToDisplay('8')");
        main_keys_list[1].classList.remove("smaller-text");

        main_keys_list[2].textContent = "9";
        main_keys_list[2].setAttribute("onclick", "appendToDisplay('9')");
        main_keys_list[2].classList.remove("smaller-text");

        main_keys_list[3].textContent = "DEL";
        main_keys_list[3].setAttribute("onclick", "del()");

        main_keys_list[4].textContent = "AC";
        main_keys_list[4].setAttribute("onclick", "clearDisplay()");

        main_keys_list[5].textContent = "4";
        main_keys_list[5].setAttribute("onclick", "appendToDisplay('4')");
        main_keys_list[5].classList.remove("smaller-text");

        main_keys_list[6].textContent = "5";
        main_keys_list[6].setAttribute("onclick", "appendToDisplay('5')");
        main_keys_list[6].classList.remove("smaller-text");

        main_keys_list[7].textContent = "6";
        main_keys_list[7].setAttribute("onclick", "appendToDisplay('6')");
        main_keys_list[7].classList.remove("smaller-text");

        main_keys_list[8].textContent = "×";
        main_keys_list[8].setAttribute("onclick", "appendToDisplay('×', '*')");

        main_keys_list[9].textContent = "÷";
        main_keys_list[9].setAttribute("onclick", "appendToDisplay('÷', '/')");

        main_keys_list[10].textContent = "1";
        main_keys_list[10].setAttribute("onclick", "appendToDisplay('1')");
        main_keys_list[10].classList.remove("smaller-text");

        main_keys_list[11].textContent = "2";
        main_keys_list[11].setAttribute("onclick", "appendToDisplay('2')");
        main_keys_list[11].classList.remove("smaller-text");

        main_keys_list[12].textContent = "3";
        main_keys_list[12].setAttribute("onclick", "appendToDisplay('3')");
        main_keys_list[12].classList.remove("smaller-text");

        main_keys_list[13].textContent = "+";
        main_keys_list[13].setAttribute("onclick", "appendToDisplay('+')");
        main_keys_list[13].classList.remove("smaller-text");

        main_keys_list[14].textContent = "–";
        main_keys_list[14].setAttribute("onclick", "appendToDisplay('-')");
        main_keys_list[14].classList.remove("smaller-text");

        main_keys_list[15].textContent = "0";
        main_keys_list[15].setAttribute("onclick", "appendToDisplay('0')");
        main_keys_list[15].classList.remove("smaller-text");

        main_keys_list[16].textContent = ".";
        main_keys_list[16].setAttribute("onclick", "appendToDisplay('.')");
        main_keys_list[16].classList.remove("smaller-text");

        main_keys_list[17].textContent = "π";
        main_keys_list[17].setAttribute("onclick", "appendToDisplay('π', 'Math.PI')");
        main_keys_list[17].classList.remove("smaller-text");

        main_keys_list[18].textContent = "Ans";
        main_keys_list[18].setAttribute("onclick", "appendToDisplay('ans')");
    }
    
}

// Detect key presses
window.addEventListener("keydown", keypress);
function keypress(event){
    let key = event.key;   // shorten the expression
    if (APPENDKEY.includes(key)){
        appendToDisplay(key);
    }else if (LETTERS.includes(key)){
        store(key);
    }
    switch(key){
        case "*":
            appendToDisplay('×', '*');
            break;
        case "/":
            appendToDisplay('÷', '/');
            break;
        case "Enter":
            calculate();
            break;
        case "Backspace":
            del();
            break;
        case "Escape":
            clearDisplay();
            break;
        case "ArrowLeft":
            cursorLeft();
            break;
        case "ArrowRight":
            cursorRight();
            break; 
        case "ArrowDown":
            cursorLeftmost();
            break;
        case "ArrowUp":
            cursorRightmost();
            break;
        case "Control":
            activateBtn('SHIFT');
            break;
        case "`":
            activateBtn('ALPHA');
            break;
        case "a":
            appendToDisplay('ans');
            break;
        case "e":
            appendToDisplay('e', 'Math.E');
            break;
        case "p":
            appendToDisplay('π', 'Math.PI');
            break;
        case "s":
            appendToDisplay('sin(', 'trigo(Math.sin,');
            break;
        case "c":
            appendToDisplay('cos(', 'trigo(Math.cos,');
            break;
        case "t":
            appendToDisplay('tan(', 'trigo(Math.tan,');
            break;
        case "l":
            appendToDisplay('log(', 'mylog(');
            break;
        case "i":
            appendToDisplay('ln(', 'Math.log(');
            break;
        case "q":
            appendToDisplay('√(', 'Math.sqrt(');
            break;
        case "m":
            Mplus();
            break;
        case "O":
            appendToDisplay('𝐂', '𝐂');
            break;
        case "P":
            appendToDisplay('𝐏', '𝐏');
            break;
        case "r":
            activateBtn('STO');
            break;
        case "f":
            activateBtn('FMLA');
            break;
    }
    
}


// GET FORMULAS

function chooseFormula(formula_str){
    if (formula_str > 70 || formula_str <= 0){
        result.value = "Invalid No.";
    }else{
        deactivateFMLA();
        formula_mode = Number(formula_str);
        indicator.value = TITLES[formula_mode];
        indicator2.style.display = "none";
        indicator.style.width = "350px";
    }
}
const TITLES = ["",   // formula_mode 0 is blank
    "1. Quadratic Formula",
    "2. SAS Triangle (area,c,A,B)",
    "3. Heron Formula, r, R",
    "4. Simultaneous Equations (x,y)",
    "5. Cubic Formula",
    "6. Line Intersect Circle",
    "7. Centroid",
    "8. Orthocenter",
    "9. Circumcenter, Circumradius",
    "10. Incenter, Inradius",
    "11. Four Centers of Triangle",
    "12. Shoelace Formula",
    "13. Cross Product",
    "14. Simultaneous Eq. (x,y,z)",
    "15. 3x3 Matrix Determinant",
    "16. 3x3 Inverse Matrix",
    "17. 3x3 Matrix Multiplication",
    "18. 2x2 Inverse Matrix",
    "19. 2x2 Matrix Multiplication",
    "20. Vector Projection on Vector",
    "21. Vector Projection on Plane",
    "22. V,h of Tetrahedron (vector)",
    "23. Parabola h,k,Focus,Directrix",
    "24. r,tx,ty,D,E,F of Point & Line",
    "25. Point + Vector (|v|, slope)",
    "26. Line Intersect Parabola",
    "27. Line Segments Intersection",
    "28. Circle Intersect Circle",
    "29. Tangent of Circle thro Point", 
    "30. Eq. of Line thro 2 Points",
    "31. Length of Angle bisectors",
    "32. Length of Medians",
    "33. Length of Altitudes",
    "34. Ang bisector,Median,Altitude",
    "35. Stewart's Theorem",
    "36. Eq. of Perp Line (2 points)",
    "37. Area, R, ∠s of Cyclic Quad.",
    "38. Diagonals of Cyclic Quad.",
    "39. Area,Diags of Trapezium (sides)",
    "40. Binomial Coefficients",
    "41. Binomial Probability (=k)",
    "42. Binomial Probability (<=k)",
    "43. Binomial Distribution (all)",
    "44. Poisson Distribution",
    "45. Normal Distribution",
    "46. Mean, Median, Std., Var.",
    "47. Sum of AS & GS",
    "48. Angles between Plane (angles)",
    "49. Vol,Ang of Tetrahedron(sides)",
    "50. Vol. of Regular Polyhedrons",
    "51. Polar Coordinates",
    "52. Rectangular Coordinates",
    "53. Area of Regular Polygon (s)",
    "54. Area of Regular Polygon (r)",
    "55. SSS Triangle",
    "56. ASA Triangle",
    "57. D,E,F of Circle (h,k,r)",
    "58. h,k,r of Circle (D,E,F)",
    "59. GCD and LCM",
    "60. Long Division (linear)",
    "61. Characteristic Polynomial",
    "62. Eigenvalues",
    "63. nth Power of 3x3 Matrix",
    "64. Char. Polynomial (2x2)",
    "65. Eigenvalues (2x2)",
    "66. nth Power of 2x2 Matrix",
    "67. Distance btw Parallel Lines",
    "68. Descartes' Circle Theorem",
    "69. Prime Factors of Integer",
    "70. Quartic Formula",      // Challenge
]

function getFormula(formula){   // formula is an array
    if (formula_mode == 0) return formula;
    formula.push(")");    // closing bracket that wraps the whole expression
    switch (formula_mode){
        case 1:
            formula.unshift("quadratic(");
            break;
        case 2:
            formula.unshift("SAStriangle(");
            break;
        case 3:
            formula.unshift("heronrR(");
            break;
        case 4:
            formula.unshift("simult(");
            break;
        case 5:
            formula.unshift("cubic2(");
            break;
        case 6:
            formula.unshift("lineNcircle(");
            break;
        case 7:
            formula.unshift("centroid(");
            break;
        case 8:
            formula.unshift("orthocenter(");
            break;
        case 9:
            formula.unshift("circumcenter(");
            break;
        case 10:
            formula.unshift("incenter(");
            break;
        case 11:
            formula.unshift("fourcenter(");
            break;
        case 12:
            formula.unshift("shoelaceFMLA(");
            break;
        case 13:
            formula.unshift("cross(");
            break;
        case 14:
            formula.unshift("simult3(");
            break;
        case 15:
            formula.unshift("detFMLA(");
            break;
        case 16:
            formula.unshift("inversematrix(");
            break;
        case 17:
            formula.unshift("multmatrix(");
            break;
        case 18:
            formula.unshift("inversematrix2(");
            break;
        case 19:
            formula.unshift("multmatrix2(");
            break;
        case 20:
            formula.unshift("proj(");
            break;
        case 21:
            formula.unshift("projplane(");
            break;
        case 22:
            formula.unshift("tetrahedron(");
            break;
        case 23:
            formula.unshift("parabola(");
            break;
        case 24:
            formula.unshift("pointline(");
            break;
        case 25:
            formula.unshift("pointvector(");
            break;
        case 26:
            formula.unshift("lineNparabola(");
            break;
        case 27:
            formula.unshift("segmentNsegment(");
            break;
        case 28:
            formula.unshift("circleNcircle(");
            break;
        case 29:
            formula.unshift("circletangent(");
            break;
        case 30:
            formula.unshift("eqofline(");
            break;
        case 31:
            formula.unshift("anglebisector(");
            break;
        case 32:
            formula.unshift("medianoftriangle(");
            break;
        case 33:
            formula.unshift("altitude(");
            break;
        case 34:
            formula.unshift("angmedalt(");
            break;
        case 35:
            formula.unshift("stewart(");
            break;
        case 36:
            formula.unshift("eqofperpline(");
            break;
        case 37:
            formula.unshift("cquadareaR(");
            break;
        case 38:
            formula.unshift("cquaddiag(");
            break;
        case 39:
            formula.unshift("trapezium(");
            break;
        case 40:
            formula.unshift("binomial(");
            break;
        case 41:
            formula.unshift("bidist(");
            break;
        case 42:
            formula.unshift("bidist2(");
            break;
        case 43:
            formula.unshift("bidistall(");
            break;
        case 44:
            formula.unshift("poisson(");
            break;
        case 45:
            formula.unshift("normal(");
            break;
        case 46:
            formula.unshift("meanmedstdvar(");
            break;
        case 47:
            formula.unshift("sumofASGS(");
            break;
        case 48:
            formula.unshift("dihedralangle(");
            break;
        case 49:
            formula.unshift("tetrahedrongivensides(");
            break;
        case 50:
            formula.unshift("platonic(");
            break;
        case 51:
            formula.unshift("polar(");
            break;
        case 52:
            formula.unshift("rect(");
            break;
        case 53:
            formula.unshift("regularpolygon(");
            break;
        case 54:
            formula.unshift("regularpolygon2(");
            break;
        case 55:
            formula.unshift("SSStriangle(");
            break;
        case 56:
            formula.unshift("ASAtriangle(");
            break;
        case 57:
            formula.unshift("circlegeneralform(");
            break;
        case 58:
            formula.unshift("circlestandardform(");
            break;
        case 59:
            formula.unshift("gcdlcm(");
            break;
        case 60:
            formula.unshift("longdivision(");
            break;
        case 61:
            formula.unshift("charpolynomial(");
            break;
        case 62:
            formula.unshift("eigen(");
            break;
        case 63:
            formula.unshift("matrixpower(");
            break;
        case 64:
            formula.unshift("charpolynomial2(");
            break;
        case 65:
            formula.unshift("eigen2(");
            break;
        case 66:
            formula.unshift("matrixpower2(");
            break;
        case 67:
            formula.unshift("parallellinedistance(");
            break;
        case 68:
            formula.unshift("descartes(");
            break;
        case 69:
            formula.unshift("primefactors(");
            break;
        case 70:
            formula.unshift("quartic(");
            break;
    }
    return formula;
}



// BUILT-IN FORMULAS OF CALCULATOR
// To use a built-in formula, go to formula mode and separate the arguments with commas, then hit EXE

// 1. Quadratic formula:  ax^2 + bx + c = 0
// IN: a,b,c   OUT: x1, x2
function quadratic(a,b,c){   
    let determinant = b**2 - 4*a*c;
    return [(-b + Math.sqrt(determinant)) / (2*a) , (-b - Math.sqrt(determinant)) / (2*a)]
}
// 2. SAS triangle to Area SAA
// i.e. Output Area, opposite side and remaining two angles
// IN: a, b, angleC           where a,b are sides and angC is the angle between a,b
// OUT: Area, c, angA, angB         (where c is opposite side of angC)
function SAStriangle(a,b,angC){
    if (!rad_mode)  angC = angC * Math.PI/180;
    let area = 1/2 * a * b * Math.sin(angC);
    let c = Math.sqrt( a**2 + b**2 - 2*a*b*Math.cos(angC) );
    let angA = Math.acos( (b**2 + c**2 - a**2) / (2*b*c) );
    let angB = Math.acos( (a**2 + c**2 - b**2) / (2*a*c) );
    [ angA, angB ] = rad_to_deg([angA,angB]);
    return [ area, c, angA, angB ];
}

// 3. Heron's formula, Inradius, Circumradius
// IN: a,b,c (triangle sides)
// OUT: area, inradius r, circumradius R
function heronrR(a,b,c){
    let s = (a+b+c)/2;
    let area = Math.sqrt(s*(s-a)*(s-b)*(s-c));
    return [ area, area/s,  a*b*c/(4*area) ]
}

// 4. Linear simultaneous equation in two unknowns
// IN: A,B,C,D,E,F       _( Ax + By = C 
// OUT: x, y              ( Dx + Ey = F
function simult(a,b,c,d,e,f){
    let m = a*e-b*d;
    return [ (c*e-b*f) / m , (a*f-c*d) / m ];
}

// 5. Cubic formula: ax^3 + bx^2 + cx + d = 0
// IN: a,b,c,d    OUT: x1, x2, x3
function cubic(a,b,c,d){       // from CASIO calculator program
    let ans = 0;
    let e = 0
    b = -b / (3*a);
    d += b*c;
    c = c / a;
    d = b**3 - d / (2*a);
    e = b**2 - c / 3;
    ans = b**2 - c/3;
    ans = d**2 - ans**3;
    
    if (0>ans){
        ans = 2* Math.sqrt(e) * Math.cos(1/3*Math.acos(d/Math.sqrt(e**3)  )   );
    }else{
        ans = Math.sqrt(ans)
        d += ans;
        ans = Math.cbrt(d) + Math.cbrt(d-2*ans);
    }
    ans = ans + b;
    a = ans;
    let x1 = a;
    d = 3*b - ans;
    b = d / 2 + Math.sqrt(a*d-c+d**2/4);
    d -= b;
    let x2 = b;
    let x3 = d;
    return [x1, x2, x3];
}
// readable version
function cubic2(a,b,c,d){
    let p = c/a - b**2/(3*a**2);
    let q = 2*b**3/(27*a**3) - b*c/(3*a**2) + d/a;
    let real_part = -q/2;          // original real and imaginary part
    let det = q**2/4 + p**3/27;

    let im_part = Math.sqrt(Math.abs(det));
    let r = Math.sqrt( real_part**2 + im_part**2 );  // magnitude of polar form 
    let x1 = 0, x2 = 0, x3 = 0;
    let R, I;   // real and imaginary part after dividing angle by three
    if (det <= 0 + 10**(-12)){
        let theta = Math.acos(real_part/r)/3;  // divide angle by three
        R = Math.cbrt(r) * Math.cos(theta);   // get real part*2
        I = Math.cbrt(r) * Math.sin(theta);
        x1 = 2 * R;
        x2 = - R + Math.sqrt(3) * I;
        x3 = - R - Math.sqrt(3) * I;
    }else{
        x1 = Math.cbrt(real_part + Math.sqrt(det)) + Math.cbrt(real_part - Math.sqrt(det)) ;
        x2 = NaN;
        x3 = NaN;
    }
    return [x1 - b/(3*a) , x2 - b/(3*a) , x3 - b/(3*a)];
}

// 6. Points of intersection of a line and a circle
// Equation of line:      Ax + By + C = 0
// Equation of circle:  x^2 + y^2 + Dx + Ey + F = 0
// IN: A,B,C,D,E,F
// OUT: x1,x2, y1,y2
// function name meaning: line_intersect_circle (N means intersect)
function lineNcircle(a,b,c,d,e,f){
    let r = 1 + a**2 / b**2 ;
    let p = 2*a*c/b**2 + d - a*e/b ;
    let q = c**2/b**2 - c*e/b + f ;
    let x1 = (- p + Math.sqrt(p**2 - 4*r*q))/ (2*r) ;
    let x2 = (- p - Math.sqrt(p**2 - 4*r*q))/ (2*r) ;
    let y1 = -a/b*x1 - c/b ;
    let y2 = -a/b*x2 - c/b ;
    return [x1, y1, x2, y2];
}

// (7,8,9,10). Coordinates of Four Centers of Triangle:
// IN: x1, y1, x2, y2, x3, y3       (coordinates of vertices)
// OUT: x, y  of center, circum/in-radius if any

// 7. Centriod
function centroid(x1,y1, x2,y2, x3,y3){
    return [ (x1+x2+x3)/3, (y1+y2+y3)/3 ];
}
// 8. Orthocenter
function orthocenter(x1,y1, x2,y2, x3,y3){
    let a = x1 - x2;
    let b = y1 - y2;
    let c = x3 * a + y3 * b;
    let d = x2 - x3;
    let e = y2 - y3;
    let f = x1 * d + y1 * e;
    let m = a*e - b*d;
    return [ (c*e-b*f)/m , (a*f - c*d)/m ];
}
// 9. Circumcenter, circumradius    
function circumcenter(x1,y1, x2,y2, x3,y3){
    let a = x1 - x2;
    let b = y1 - y2;
    let c = ( (x1+x2)*(x1-x2) + (y1+y2)*(y1-y2) ) / 2;
    let d = x2 - x3;
    let e = y2 - y3;
    let f = ( (x2+x3)*(x2-x3) + (y2+y3)*(y2-y3) ) / 2;
    let m = a*e - b*d;
    let side_a = Math.sqrt( (x2-x3)**2 + (y2-y3)**2 );
    let side_b = Math.sqrt( (x1-x3)**2 + (y1-y3)**2 );
    let side_c = Math.sqrt( (x1-x2)**2 + (y1-y2)**2 );
    let s = (side_a + side_b + side_c) / 2;
    return [ (c*e-b*f)/m , (a*f - c*d)/m, side_a*side_b*side_c / (4*Math.sqrt( s*(s-side_a)*(s-side_b)*(s-side_c))) ];
}
// 10. Incenter (x,y), inradius
function incenter(x1,y1, x2,y2, x3,y3){
    let a = Math.sqrt( (x2-x3)**2 + (y2-y3)**2 );
    let b = Math.sqrt( (x1-x3)**2 + (y1-y3)**2 );
    let c = Math.sqrt( (x1-x2)**2 + (y1-y2)**2 );
    let p = a + b + c;
    let s = p/2;
    return [ (a*x1 + b*x2 + c*x3)/p , (a*y1 + b*y2 + c*y3)/p, Math.sqrt( (s-a)*(s-b)*(s-c)/s) ];
}
// 11. Four Centres of Triangle (7,8,9,10 in one formula)
function fourcenter(x1,y1, x2,y2, x3,y3){
    let [centroid_x, centroid_y] = [...centroid(x1,y1, x2,y2, x3,y3)];
    let [ortho_x, ortho_y] = [...orthocenter(x1,y1, x2,y2, x3,y3)]
    let [circum_x, circum_y] = [...circumcenter(x1,y1, x2,y2, x3,y3)];
    let [incenter_x, incenter_y] = [...incenter(x1,y1, x2,y2, x3,y3)];
    return [  centroid_x, centroid_y, ortho_x, ortho_y, circum_x, circum_y, incenter_x, incenter_y  ];
}
// 12. Shoelace fomula  (Calculate area of polygon given coordinates (either clockwise or anticlockwise))
// IN: x1,y1,x2,y2,x3,y3,...,xn,yn
// OUT: Area of polygon
function shoelaceFMLA(x1,y1, x2,y2, x3,y3, ...others){
    let x_values = [], y_values = [];
    for (let i=0; i<arguments.length; i+=2){
        x_values.push(arguments[i]);
    }
    x_values.push(x1);
    for (let i=1; i<arguments.length; i+=2){
        y_values.push(arguments[i]);
    }
    y_values.push(y1);
    let s = 0;
    for (let i=0; i<x_values.length-1; i++){
        s += x_values[i] * y_values[i+1];
    }
    for (let i=0; i<x_values.length-1; i++){
        s -= y_values[i] * x_values[i+1];
    }
    return [Math.abs(s/2)];
}
// 13. 3d Cross product
// IN: x1,y1,z1, x2,y2,z2
// OUT: Coefficients of i,j,k of cross product
function cross(x1,y1,z1,x2,y2,z2){
    return [ y1*z2-z1*y2, -(x1*z2-z1*x2), x1*y2-y1*x2 ]
}
// 14. Linear Simultaneous Equation in 3 unknowns
// IN: a1,b1,c1,d1, a2,b2,c2,d2, a3,b3,c3,d3
// OUT: x,y,z
function simult3(a1,b1,c1,d1,a2,b2,c2,d2,a3,b3,c3,d3){
    function det(a,b,c,d,e,f,g,h,j){
        return  a*e*j + b*f*g + c*d*h - ( c*e*g + b*d*j + a*f*h );
    }
    // Cramer's Rule
    let determinant = det(a1,b1,c1,a2,b2,c2,a3,b3,c3);
    let x = det(d1,b1,c1,d2,b2,c2,d3,b3,c3) / determinant;
    let y = det(a1,d1,c1,a2,d2,c2,a3,d3,c3) / determinant;
    let z = det(a1,b1,d1,a2,b2,d2,a3,b3,d3) / determinant;
    return [x, y, z];
}
// 15. 3x3 Matrix Determinant
function detFMLA(a,b,c,d,e,f,g,h,i){
    return [ a*e*i + b*f*g + c*d*h - ( c*e*g + b*d*i + a*f*h ) ]
}
// 16. 3x3 Inverse Matrix
// IN: a,b,c,d,e,f,g,h,j   (of matrix M)
// OUT: Determinant, [a,b,c,d,e,f,g,h,i] in which M^-1 = 1/det [a,b,c,d,e,f,g,h,i]
function inversematrix(...mat){
    let a = mat[0];
    let b = mat[1];
    let c = mat[2];
    let d = mat[3];
    let e = mat[4];
    let f = mat[5];
    let g = mat[6];
    let h = mat[7];
    let i = mat[8];
    determinant = a*e*i + b*f*g + c*d*h - ( c*e*g + b*d*i + a*f*h );
    let res = [ i*e-f*h, -(d*i-f*g), d*h-e*g, -(b*i-c*h), a*i-c*g, -(a*h-b*g), b*f-c*e, -(a*f-c*d), a*e-b*d ];
    function transpose(mat){
        [mat[1], mat[3]] = [mat[3], mat[1]];
        [mat[2], mat[6]] = [mat[6], mat[2]];
        [mat[5], mat[7]] = [mat[7], mat[5]];
    }
    transpose(res);
    res.unshift(determinant);
    return res;
}
// 17. 3x3 Matrix Multiplication
// IN: entries of matrix A, entries of matrix B (18 in total)
// OUT: entries of AxB
function multmatrix(...mat){
    let matA = [], matB = [];    // make a 3x3 list
    for (let i=0;i<9;i+=3){
        matA.push([mat[i], mat[i+1], mat[i+2] ])
    }
    for (let i=9;i<18;i+=3){
        matB.push([mat[i], mat[i+1], mat[i+2] ])
    }
    let res = [];
    let s = 0;
    for (let k=0;k<3;k++){
        for (let j=0;j<3;j++){
            s = 0;
            for (let i=0;i<3;i++){
                s += matA[k][i] * matB[i][j];
            }
            res.push(s);
        }
    }
    return res;
}
// 18. 2x2 Inverse Matrix
// IN: entries of matrix M
// OUT: [a,b,c,d] where M^-1 = 1/det [a,b,c,d]
function inversematrix2(a,b,c,d){
    determinant = a*d - b*c;
    return [determinant, d, -b, -c, a ];
}
// 19. 2x2 Matrix Multiplication
// IN: a,b,c,d,e,f,g,h
// OUT: entries of the product
function multmatrix2(a,b,c,d,e,f,g,h){
    return [a*e+b*g, a*f+b*h, c*e+d*g, c*f+d*h ];
}
// 20. 3d Vector Projection on Vector  (project a on b)
// IN: b1, b2, b3, a1, a2, a3   (the vector to be projected on is inputted first) 
// OUT: c1, c2, c3, where c is projection of a on b
function proj(b1,b2,b3,a1,a2,a3){
    dot_product = a1*b1 + a2*b2 + a3*b3;
    b_magnitude = b1**2 + b2**2 + b3**2  // magnitude squared
    scalar = dot_product / b_magnitude;
    return [scalar*b1, scalar*b2, scalar*b3 ];
}
// 21. 3d Vector Projection on Plane 
//     where point e is the projection of d on plane a-b-c
// IN: a1,a2,a3, b1,b2,b3, c1,c2,c3, d1, d2, d3, 
// OUT: e1,e2,e3 ae1,ae2,ae3,ed1,ed2,ed3    (ae, ed are vectors)
function projplane(a1,a2,a3, b1,b2,b3, c1,c2,c3, d1,d2,d3){
    let a = [a1,a2,a3], b = [b1,b2,b3], c = [c1,c2,c3], d = [d1,d2,d3];
    function cross(vecA, vecB){  // each vec is a list with 3 elements
        let a1 = vecA[0], a2 = vecA[1], a3 = vecA[2];
        let b1 = vecB[0], b2 = vecB[1], b3 = vecB[2];
        return [ a2*b3-a3*b2, -(a1*b3-a3*b1), a1*b2-a2*b1];
    }
    function minus(vecA, vecB){  // AB = OB - OA
        let res = [];
        for (let i=0;i<3; i++){
            res.push(vecB[i] - vecA[i]);
        }
        return res;
    }
    function dot(vecA, vecB){
        let s = 0;
        for (let i=0;i<3; i++){
            s += vecA[i] * vecB[i];
        }
        return s;
    }
    function magnitude(vec){
        return Math.sqrt(vec[0]**2 + vec[1]**2 + vec[2]**2);
    }
    function scale(vec, scalar){  // multiply vec by scalar
        for (let i=0;i<3; i++){
            vec[i] *= scalar;
        }
        return vec;
    }
    let ab = minus(a,b), ac = minus(a,c), ad = minus(a,d);
    let abxac = cross(ab,ac);
    // sign of height let us know whether abxac points to the same side as d
    let height = dot( ad, abxac)/ magnitude(abxac) ;
    let scalar = height / magnitude(abxac);
    let ed = scale(abxac, scalar);
    let e = minus(ed,d);
    let ae = minus(ed,ad);
    return [...e, ...ae, ...ed];
}

// 22. Volume & Height of Tetrahedron spanned by 4 position vectors
// IN: a1,a2,a3, b1,b2,b3, c1,c2,c3, d1,d2,d3
// OUT: Volume of tetrahedron a-b-c-d, height h with base a-b-c
function tetrahedron(a1,a2,a3, b1,b2,b3, c1,c2,c3, d1,d2,d3){
    let a = [a1,a2,a3], b = [b1,b2,b3], c = [c1,c2,c3], d = [d1,d2,d3];
    function cross(vecA, vecB){  // each vec is a list with 3 elements
        let a1 = vecA[0], a2 = vecA[1], a3 = vecA[2];
        let b1 = vecB[0], b2 = vecB[1], b3 = vecB[2];
        return [ a2*b3-a3*b2, -(a1*b3-a3*b1), a1*b2-a2*b1];
    }
    function minus(vecA, vecB){  // AB = OB - OA
        let res = [];
        for (let i=0;i<3; i++){
            res.push(vecB[i] - vecA[i]);
        }
        return res;
    }
    function dot(vecA, vecB){
        let s = 0;
        for (let i=0;i<3; i++){
            s += vecA[i] * vecB[i];
        }
        return s;
    }
    function magnitude(vec){
        return Math.sqrt(vec[0]**2 + vec[1]**2 + vec[2]**2);
    }
    let ab = minus(a,b), ac = minus(a,c), ad = minus(a,d);
    let abxac = cross(ab,ac);
    let volume = 1/6 * dot(ad, abxac );
    let height = dot( ad, abxac)/ magnitude(abxac) ;
    return [Math.abs(volume) , Math.abs(height) ];
}
// 23. Parabola Vertex, Focus and Directrix
// IN: a,b,c    of  y = ax^2 + bx + c 
// OUT: Vertex (h,k), y-coor of Focus , d of Directrix is y = d
function parabola(a,b,c){
    let h = -b/(2*a);
    let k = -(b**2 - 4*a*c) / (4*a);
    let y = k + 1/(4*a);
    let d = k - 1/(4*a);
    return [h,k, y,d];
}
// 24. Distance between point and line, coordinate of tangent point (tx,ty),
//     and D,E,F of equation of circle centered at point and tangent to line
// IN: a,b,c, h,k    where eq of line is ax + by + c = 0 and coor of point are h,k
// OUT: r,tx,ty D,E,F        
function pointline(a,b,c, h,k){
    let r = Math.abs(a*h+b*k+c) / Math.sqrt(a**2 + b**2);
    let d = -2*h, e = -2*k;
    let f = h**2+k**2 - r**2;
    let tx, ty;
    function simult(a,b,c,d,e,f){
        let m = a*e-b*d;
        return [ (c*e-b*f) / m , (a*f-c*d) / m ];
    }
    // (tx,ty) is intersection of two perpendicular lines
    [tx,ty] = [...simult(a,b,-c, b,-a, -a*k+b*h)];
    return [r,tx,ty,d,e,f];
}

// 25. Find the tip of a vector whose tail is in a given point, given slope and magnitude of vector
// IN: h,k,r,m    where h,k are coordinates of given point, r is magnitude and m is slope 
// OUT: x1,y1, x2,y2      (possible tip coordinates of vector wtih x1,y1 
//                        corresponding to slope with a smaller angle to x-axis  (from 0 to 2pi))
function pointvector(h,k,r,m){
    let x,y;
    if (m >= 0){
        x = r / Math.sqrt(1+m**2);
    }
    else {
        x = -r / Math.sqrt(1+m**2);
    }
    y = Math.abs(m*r / Math.sqrt(1+m**2));
    return [h+x, k+y, h-x, k-y];
}
// 26. Line intersect Parabola
// IN: A,B,C, a,b,c   of Ax + By + C = 0  and  y = ax^2+bx+c
// OUT: x1,y1, x2,y2   of intersection
function lineNparabola(A,B,C,a,b,c){
    function quadratic(a,b,c){   
        let determinant = b**2 - 4*a*c;
        return [(-b + Math.sqrt(determinant)) / (2*a) , (-b - Math.sqrt(determinant)) / (2*a)]
    }
    let x1,x2;
    [x1,x2] = [...quadratic(a, b+A/B, c+C/B)];
    let y1 = -A/B*x1 - C/B;
    let y2 = -A/B*x2 - C/B;
    return [x1,y1, x2,y2];
}
// 27. Intersection of line segments p1--p2 and p3--p4
// IN: x1,y1, x2,y2, x3,y3, x4,y4         (where p1 = (x1,y1) and so on )
// OUT: x,y  of intersection
function segmentNsegment(x1,y1, x2,y2, x3,y3, x4,y4){
    function simult(a,b,c,d,e,f){
        let m = a*e-b*d;
        return [ (c*e-b*f) / m , (a*f-c*d) / m ];
    }
    function eqofline(x1,y1,x2,y2){
        let a = y2-y1, b = x1-x2, c = x1*(y1-y2) - y1*(x1-x2);
        return [ a, b, c ];
    }
    let line12 = eqofline(x1,y1,x2,y2);
    let line34 = eqofline(x3,y3,x4,y4);
    line12[2] *= -1;    // adjust for simult which is for ax + by = c
    line34[2] *= -1;
    return simult(...line12, ...line34);
}
// 28. Intersection of two Circles
//    with equations  x^2 + y^2 + D1 x + E1 y + F1 = 0 and x^2 + y^2 + D2 x + E2 y + F2 = 0
// IN: d1,e1,f1,d2,e2,f2
// OUT: x1,y1, x2,y2
function circleNcircle(d1,e1,f1,d2,e2,f2){
    function lineNcircle(a,b,c,d,e,f){
        let r = 1 + a**2 / b**2 ;
        let p = 2*a*c/b**2 + d - a*e/b ;
        let q = c**2/b**2 - c*e/b + f ;
        let x1 = (- p + Math.sqrt(p**2 - 4*r*q))/ (2*r) ;
        let x2 = (- p - Math.sqrt(p**2 - 4*r*q))/ (2*r) ;
        let y1 = -a/b*x1 - c/b ;
        let y2 = -a/b*x2 - c/b ;
        return [x1, y1, x2, y2];
    }
    let line = [d1-d2, e1-e2, f1-f2];
    return lineNcircle(...line, d1,e1,f1);
}
// 29. Points of tangency, and equation of tangent of circle through an external point (px,py)
// IN: px,py, d,e,f       where (px,py) is given point,  d,e,f are constants in circle equation
// OUT: x1,y1,x2,y2, a1,b1,c1, a2,b2,c2,       where eq. of lines are ax + by + c = 0,  points of tangency are (x1,y1),(x2,y2)
function circletangent(px,py,d,e,f){
    function circleNcircle(d1,e1,f1,d2,e2,f2){
        function lineNcircle(a,b,c,d,e,f){
            let r = 1 + a**2 / b**2 ;
            let p = 2*a*c/b**2 + d - a*e/b ;
            let q = c**2/b**2 - c*e/b + f ;
            let x1 = (- p + Math.sqrt(p**2 - 4*r*q))/ (2*r) ;
            let x2 = (- p - Math.sqrt(p**2 - 4*r*q))/ (2*r) ;
            let y1 = -a/b*x1 - c/b ;
            let y2 = -a/b*x2 - c/b ;
            return [x1, y1, x2, y2];
        }
        let line = [d1-d2, e1-e2, f1-f2];
        return lineNcircle(...line, d1,e1,f1);
    }
    function eqofperpline(x1,y1,x2,y2){  // Given segmnet p1--p2, get eq. of perp line through (x2,y2)
        let a = x2-x1, b = y2-y1, c = x2*(x1-x2) + y2*(y1-y2);
        if (a<0){
            a = -a;
            b = -b;
            c = -c;
        }
        return [ a,b,c ];
    }
    function eqofline(x1,y1,x2,y2){
        let a = y2-y1, b = x1-x2, c = x1*(y1-y2) - y1*(x1-x2);
        if (a<0){
            a = -a;
            b = -b;
            c = -c;
        }
        return [ a, b, c ];
    }
    let h = -d/2, k = -e/2;
    let r_sq = h**2 + k**2 - f;   // radius of given circle
    let distance_sq = (h-px)**2 + (k-py)**2;   // distance between (h,k) and (px,py)
    let R_sq = distance_sq - r_sq;   // radius of artificially created circle centered at (px,py) through points of tangency
    let d2 = -2*px, e2 = -2*py;
    let f2 = px**2 + py**2 - R_sq;
// if distance and r are approxminately equal then the given pont lies on the circle and there are repeated tangent points
    if (Math.abs(distance_sq - r_sq ) <= 10**-8){   
        return [px,py,px,py, ...eqofperpline(h,k,px,py)];
    }
    // else proceed as normal (if given point is inside circle, then it will give NaN)
    let tangent_pts = circleNcircle(d,e,f,d2,e2,f2);
    let tangent_line1 = eqofline(px,py, tangent_pts[0],tangent_pts[1]);
    let tangent_line2 = eqofline(px,py, tangent_pts[2],tangent_pts[3]);
    return [...tangent_pts, ...tangent_line1, ...tangent_line2];
}

// 30. Equation of line through two points
// IN: x1,y1, x2,y2
// OUT: a,b,c   of line ax + by + c = 0
function eqofline(x1,y1,x2,y2){
    let a = y2-y1, b = x1-x2, c = x1*(y1-y2) - y1*(x1-x2);
    if (a<0){
        a = -a;
        b = -b;
        c = -c;
    }
    return [ a, b, c ];
}

// 31. Length of angle bisectors
// IN: a,b,c  (sides)
// OUT: length of angle bisectors (from vertex A,B,C)
function anglebisector(a,b,c){
    let angbiA = Math.sqrt(b*c*(1- a**2/(b+c)**2) );
    let angbiB = Math.sqrt(a*c*(1- b**2/(a+c)**2) );
    let angbiC = Math.sqrt(b*a*(1- c**2/(b+a)**2) );
    return [angbiA, angbiB, angbiC];
}
// 32. Length of medians
// IN: a,b,c  (sides)
// OUT: length of medians (from vertex A,B,C)
function medianoftriangle(a,b,c){
    let medianA = Math.sqrt(2*b**2 + 2*c**2 - a**2)/2;
    let medianB = Math.sqrt(2*a**2 + 2*c**2 - b**2)/2;
    let medianC = Math.sqrt(2*b**2 + 2*a**2 - c**2)/2;
    return [medianA, medianB, medianC];
}
// 33. Length of altitudes
// IN: a,b,c  (sides)
// OUT: length of altitudes (from vertex A,B,C)
function altitude(a,b,c){
    let altitudeA = Math.sqrt(b**2 - ((a**2+b**2-c**2)/(2*a))**2 );
    let altitudeB = Math.sqrt(a**2 - ((b**2+a**2-c**2)/(2*b))**2 );
    let altitudeC = Math.sqrt(b**2 - ((c**2+b**2-a**2)/(2*c))**2 );
    return [altitudeA, altitudeB, altitudeC];
}

// 34. Angle bisector, Median, Altitude of a triangle  (See Toddler Geometry Part IV)
// IN: a,b,c (sides)    OUT: length of angle bisector, median, altitude from vertex A to side a
function angmedalt(a,b,c){
    let ang_bisector = Math.sqrt(b*c*(1- a**2/(b+c)**2) );
    let median = Math.sqrt(2*b**2 + 2*c**2 - a**2)/2;
    let altitude = Math.sqrt(b**2 - ((a**2+b**2-c**2)/(2*a))**2 );
    return [ang_bisector, median, altitude];
}
// 35. Stewart Theorem:   b^2 m + c^2 n = (m+n)(d^2+mn) 
// IN: b,c,m,n        (where m = BD and n = CD , so b opposites m and c opposites n)
// OUT: d, ∠BAD, ∠CAD   (length of cevian from A to BC, opposite angle of m, opposite angle of n)
function stewart(b,c,m,n){
    function cosinelaw2(a,b,c){   
        if (rad_mode)
            return Math.acos( (a**2 + b**2 - c**2) / (2*a*b) );
        else
            return Math.acos( (a**2 + b**2 - c**2) / (2*a*b) ) * 180 / Math.PI;
    }
    let d = Math.sqrt( (b**2*m+c**2*n) /(m+n) - m*n );
    
    return [ d, cosinelaw2(c,d,m),  cosinelaw2(b,d,n)  ];
}

// 36. Equation of perpendicular line
function eqofperpline(x1,y1,x2,y2){  // Given segmnet p1--p2, get eq. of perp line through (x2,y2)
    let a = x2-x1, b = y2-y1, c = x2*(x1-x2) + y2*(y1-y2);
    if (a<0){
        a = -a;
        b = -b;
        c = -c;
    }
    return [ a,b,c ];
}
// 37. Area and circumradius and angles of cyclic quadrilateral
// IN: a,b,c,d
// OUT: Area, R     (Brahmagupta's formula & Parameshvara's circumradius formula)
function cquadareaR(a,b,c,d){
    let s = (a+b+c+d) / 2;
    let area = Math.sqrt( (s-a)*(s-b)*(s-c)*(s-d) )
    let R = Math.sqrt( (a*b+c*d)*(a*c+b*d)*(a*d+b*c)) / (4*area) ;
    let angA = Math.acos( (a**2+d**2-b**2-c**2) / (2*(a*d+b*c))  );
    let angD = Math.acos( (d**2+c**2-a**2-b**2) / (2*(c*d+a*b))  );
    let angB = Math.PI - angD;
    let angC = Math.PI - angA;
    if (!rad_mode){
        angA = angA * 180 / Math.PI;
        angB = angB * 180 / Math.PI;
        angC = angC * 180 / Math.PI;
        angD = angD * 180 / Math.PI;
    }
    return [area, R, angA, angB, angC, angD];
}
// 38. Diagonals of Cyclic Quadrilateral
// IN: a,b,c,d    where a = AB, b = BC, c = CD, d = DA
// OUT: e,f       where e = AC, f = BD 
function cquaddiag(a,b,c,d){
    let e = Math.sqrt( (a*c+b*d)*(a*d+b*c)/(a*b+c*d) );
    let f = Math.sqrt( (a*b+c*d)*(a*c+b*d)/(a*d+b*c) );
    return [e,f];
}
// 39. Area and Diagonals of Trapezium given 4 sides
// a = AB, b = CD, c = AD, d = BC   where AB//CD and  CD > AB
// IN: a,b,c,d        where a//b  and b>a
// OUT: area, p, q    where p = AC, q = BD
function trapezium(a,b,c,d){
    let s = (a+b+c+d)/2;
    let area = (b+a)/(b-a) * Math.sqrt( (s-a)*(s-b)*(s-b-c)*(s-b-d) );
    let p = Math.sqrt( (a*b**2-a**2*b-a*c**2+b*d**2)/(b-a) );
    let q = Math.sqrt( (a*b**2-a**2*b-a*d**2+b*c**2)/(b-a) );
    return [area, p, q];
}
// 40. Binomial Coefficients
// IN: n   (size)
// OUT: nC0,  nC1, ..., nCn
function binomial(n){
    if (n > 40 || n < 0 || n % 1){  // restrict the size of input to avoid lag
        return "Error";
    }
    let res = [];
    for (let i=0; i<=n; i++){
        res.push( comb(n,i) );
    }
    return res;
}
// 41. Binomial Probability  (=k)
// n = number of trials, k = number of successes,  p = probability of sucess
// IN: n,k,p
// OUT: probability of exactly k sucesses in n trials
function bidist(n,k,p){
    if ( p > 1 || p < 0 || n % 1 || k % 1) return "Error";
    return [ comb(n,k) * p**k * (1-p)**(n-k) ];
}
// 42. Binomial Probability (<=k)
// n = number of trials, k = number of successes,  p = probability of sucess
// IN: n,k,p
// OUT: probability of k or less sucesses in n trials
function bidist2(n,k,p){
    let s = 0;
    if ( p > 1 || p < 0 || n % 1 || k % 1) return "Error";
    for (let i=0; i<=k;i++){
        s += comb(n,i) * p**i * (1-p)**(n-i)
    }
    return [ s ];
}
// 43. Binomial Distribution (all)
// n = number of trialsm, p = probability of sucess
// IN: n,k,p
// OUT: probability of X=x where x iterates from 0 to n
function bidistall(n,p){
    if (n > 40 || n < 0 || n % 1){   // restrict the size of input
        return "Error";
    }
    let res = [];
    for (let i=0; i<=n; i++){
        res.push( ...bidist(n,i,p) );
    }
    return res;
}
// 44. Poisson Distribution (=k, <=k)   (it's like 41 and 42's output but under one formula)
// lambda = expected number of events,  k = number of events occured in an interval
// IN: lambda, k
// OUT: P(X=k) , P(X<=k)
function poisson(lambda,k){
    if (k % 1) return "Error";
    let s = 0;
    for (let i=0; i<=k;i++){
        s += lambda**i * Math.E**(-lambda) / factorial(i)
    }
    return [ lambda**k * Math.E**(-lambda) / factorial(k), s ];
}
// 45. Normal Distribution 

// approximate area under curve with riemann sum
function riemann(f, a,b,n){    // f is function, [a,b] are bounds, n is number of intervals
    let delta = (b-a)/n;
    let s = 0;
    let x = a;
    for (let i=0;i<n;i++){
        s += f(x);
        x += delta;
    }
    return delta*s;
}
// Probability density function of normal distribution
function normalpdf(mean, std, x){
    return 1/(std*Math.sqrt(2*Math.PI))* Math.exp( -1/2* ((x-mean)/std)**2 );
}
// IN: mean, std deviation, lower bound, upper bound
// OUT: P(X<a), P(a<X<b), P(X>b)
// It may take like a second or two since it has to add like 200000 terms
function normal(mean,std, a,b){    // find probability that X < a ,  a < X < b , X > b
    function normalpdf(x){
        return 1/(std*Math.sqrt(2*Math.PI))* Math.exp( -1/2* ((x-mean)/std)**2 );
    }
    let mid = riemann( normalpdf, a,b, 100000 );
    let lower = riemann( normalpdf, a-std*5,a, 100000 );
    let upper = 1 - mid - lower;
    return [lower, mid, upper ];
}

// 46. Mean, Median, Standard deviation, Variance
function meanmedstdvar(...input){
    // avoid using the same name as the function
    let mean_value = mean(...input);
    let median_value = median(...input);
    let std_value = std(...input);
    let var_value = std_value ** 2;
    return [ mean_value, median_value, std_value, var_value ];
}

// 47. Sum of Arithmetic Sequence and Geometric Sequence
// a is first term,  d is common difference/ratio, n is number of terms (including first term)
// IN: a, d, n
// OUT: sum of AS, sum of GS
function sumofASGS(a,d,n){
    let AS_sum = n/2 * (2*a+d*(n-1));
    let GS_sum = a * (d**n-1) / (d-1);
    return [AS_sum, GS_sum];
}

// 48. Dihedral angles between planes
// Let there be tetrahedron ABCD, where ABC is the base of the tetrahedron.
// a = ∠BAC, b = ∠BAD, c = ∠CAD,
// IN: a,b,c
// OUT: angle btw planes  BAD-CAD, BAD-ABC, CAD-ABC
function dihedralangle(a,b,c){
    let bad_cad = Math.acos( (Math.cos(a) - Math.cos(b)*Math.cos(c)) / (Math.sin(b)*Math.sin(c)) );
    let bad_abc = Math.acos( (Math.cos(c) - Math.cos(a)*Math.cos(b)) / (Math.sin(a)*Math.sin(b)) );
    let cad_abc = Math.acos( (Math.cos(b) - Math.cos(a)*Math.cos(c)) / (Math.sin(a)*Math.sin(c)) );
    return rad_to_deg([ bad_cad, bad_abc, cad_abc  ]);
}

// 49. Volume and angles of planes of tetrahedron given 6 side lengths
// Let there be tetrahedron ABCD, where ABC is the base of the tetrahedron.
// Only angles involved with base ABC are concerned because too many outputs are messy.
// IN: AB,BC,CA,DA,DB,DC   (corresponds to a,b,c,d,e,f)
// OUT: Volume,  Angle btw planes DBC-ABC,  DCA-ABC, DAB-ABC
function tetrahedrongivensides(a,b,c,d,e,f){
    function dihedralangle(a,b,c){  // un-angled plane inputted first
        let bad_cad = Math.acos( (Math.cos(a) - Math.cos(b)*Math.cos(c)) / (Math.sin(b)*Math.sin(c)) );
        return bad_cad;
    }
    function loc(a,b,c){   // law of cosines
        return Math.acos( (a**2 + b**2 - c**2) / (2*a*b) );
    }
    function heron(a,b,c){
        let s = (a+b+c)/2;
        return Math.sqrt( s*(s-a)*(s-b)*(s-c) );
    }
    let baseA = loc(b,c,a), baseB = loc(a,c,b), baseC = loc(a,b,c);
    let DAB = loc(c,d,e), DBC = loc(a,e,f), DCA = loc(b,f,d);
    let DBA = loc(c,e,d), DCB = loc(a,f,e), DAC = loc(b,d,f);
    let DAB_ABC = dihedralangle( DAC, DAB, baseA );
    let DBC_ABC = dihedralangle( DBA, DBC, baseB );
    let DCA_ABC = dihedralangle( DCB, DCA, baseC );

    let DAB_altitude = heron(c,d,e) * 2 / c;
    let volume = heron(a,b,c) * DAB_altitude * Math.sin(DAB_ABC) / 3 ;    // Volume = 1/3 * base_area * height
    let res = rad_to_deg([ DBC_ABC, DCA_ABC, DAB_ABC ]);
    res.unshift(volume);
    return res;
}

// 50. Volume of Regular Polyhedrons
// IN: a   (side length)
// OUT: volume of tetrahedron, cube, octahedron, dodecahedron, icosahedron
function platonic(a){
    let tetra = Math.sqrt(2)/12 * a**3;
    let cube = a**3;
    let octa = Math.sqrt(2)/3 * a**3;
    let dodeca = (15+ 7*Math.sqrt(5) ) / 4 * a**3;
    let icosa = 5*(3+Math.sqrt(5))/12 * a**3;
    return [ tetra, cube, octa, dodeca, icosa ];
}

// 51. Rectangular Coordinates to Polar Coordinates
// IN: x,y     of rectangular coordinates
// OUT: r, theta    of polar coordinates
function polar(x,y){
    let r = Math.sqrt(x**2 + y**2);
    let theta = Math.atan2(y,x);
    if (theta <0){
        theta += 2*Math.PI
    }
    if (!rad_mode) theta = theta * 180 / Math.PI;
    return [ r, theta ];
}
// 52. Polar Coordinates to Rectangular Coordinates
// IN: r, theta   of polar coordinates
// OUT: x, y      of rectangular coordinates
function rect(r, theta){
    if (!rad_mode) theta = theta * Math.PI / 180;
    let x = r * Math.cos(theta);
    let y = r * Math.sin(theta);
    return [ x,y ];
}
// 53. Area of Regular Polygon
// IN: s, n            where n = number of sides,  s = side length of regular polygon
// OUT: Area, interior angle, r, R       
//      where r is inradius, R is circumradius   of regular polygon
function regularpolygon(s,n){
    if (n<3 || n % 1) return "Error";
    let ang = Math.PI/n;
    let int_ang = Math.PI - 2*Math.PI / n;
    let r = s / 2 / Math.tan(ang);
    let R = s / 2 / Math.sin(ang);
    let area_s = 1/2 * n * s * r;
    if (!rad_mode) int_ang = int_ang * 180 / Math.PI;
    return [area_s, int_ang, r, R];
}
// 54. Area of Regular Polygon
// IN: R, n            where n = number of sides,  R = circumradius
// OUT: Area, interior angle, r, s      
//      where r is inradius, s is side length  of regular polygon
function regularpolygon2(R,n){
    if (n<3 || n % 1) return "Error";
    let ang = Math.PI/n;
    let int_ang = Math.PI - 2*Math.PI / n;
    let r = R * Math.cos(ang);
    let s = 2 * R * Math.sin(ang);
    let area_s = 1/2 * n * s * r;
    if (!rad_mode) int_ang = int_ang * 180 / Math.PI;
    return [area_s, int_ang, r, s];
}

// 55. SSS triangle
// IN: a,b,c (triangle sides)   
// OUT: Area, A, B, C
function SSStriangle(a,b,c){
    function heron(a,b,c){
        let s = (a+b+c)/2;
        return Math.sqrt( s*(s-a)*(s-b)*(s-c) );
    }
    let area = heron(a,b,c);
    let angA = Math.acos( (b**2 + c**2 - a**2) / (2*b*c) );
    let angB = Math.acos( (a**2 + c**2 - b**2) / (2*a*c) );
    let angC = Math.acos( (a**2 + b**2 - c**2) / (2*a*b) );
    if (rad_mode){
        return [area, angA, angB, angC];
    }
    else{
        return [area, angA*180/Math.PI, angB*180/Math.PI, angC*180/Math.PI];
    }
}
// 56. ASA triangle
// IN: a, angB, angC
// OUT: Area, angA, b, c
function ASAtriangle(a,angB,angC){
    if (!rad_mode)  {
        angB = angB * Math.PI/180;
        angC = angC * Math.PI/180;
    }
    let angA = Math.PI - angB - angC;
    let b = a* Math.sin(angB) / Math.sin(angA);   // sine law
    let c = a * Math.sin(angC) / Math.sin(angA);
    let area = 1/2 * a * b * Math.sin(angC);
    if (!rad_mode) angA = angA / Math.PI * 180;
    return [area, angA, b, c];
}
// 57. Circle Equation: convert from Standard form to general form
// Standard form:   (x-h)^2 + (y-h)^2 = r^2
// General form:   x^2 + y^2 + Dx + Ey + F = 0
// IN: h,k,r
// OUT: D,E,F
function circlegeneralform(h,k,r){
    let D = - 2 * h, E = - 2 * k;
    let F = h**2 + k**2 - r**2;
    return [D,E,F];
}
// 58. Circle Equation: convert from general form to standard form 
// IN: D,E,F
// OUT: h,k,r
function circlestandardform(D,E,F){
    let h = - D / 2, k = - E / 2;
    let r = Math.sqrt(h**2 + k**2 - F);
    return [ h,k,r ];
}
// 59. GCD and LCM
// IN: a list of integers
// OUT: gcd, lcm  of these integers
function gcdlcm(...input){
    let GCD = gcdall(...input);
    let LCM = lcmall(...input);
    return [GCD, LCM];
}

// 60. Long Division: Cubic polynomial / linear polynomial
//     ax^3 + bx^2 + cx + d / (ex + f)
// IN: e,f,a,b,c,d
// OUT: A,B,C,D,E    in which  Ax^2 + Bx + C + D / (ex+f)
function longdivision(e,f,a,b,c,d){
    let A = a/e;
    let B = (b-A*f)/e;
    let C = (c-B*f)/e;
    let D = d - C*f;
    return [A,B,C,D];
}
// 61. Characteristic Polynomial of 3x3 Matrix
// which is det(A-λI) =
// |a-λ  b   c |
// | d  e-λ  f |
// | g   h  i-λ|
// which becomes λ^3 + coe2 λ^2 + coe1 λ + coe0
// IN: entries of 3x3 Matrix
// OUT: 1, coe2, coe1, coe0
function charpolynomial(a,b,c,d,e,f,g,h,i){
    function det(a,b,c,d,e,f,g,h,j){
        return  a*e*j + b*f*g + c*d*h - ( c*e*g + b*d*j + a*f*h );
    }
    let coe2 = - (a + e + i);   // coefficient of x^2
    let coe1 = (e*i-f*h) + (a*i-c*g) + (a*e-b*d);
    let coe0 = -det(a,b,c,d,e,f,g,h,i)
    return [1, coe2, coe1, coe0];
}
// 62. Eigenvalues and Eigenvectors of 3x3 Matrix

// check if two lists are approximately equal
function approxeq(listA,listB){
    for (let i=0;i<listA.length;i++){
        if (Math.abs(listA[i] - listB[i] ) > 10**-8  ){
            return 0;
        }
    }
    return 1;
}

// Gaussian Elimination (Unused)
function gaussian(eq1, eq2, eq3){  // each eq is a four element list
    function simult(a,b,c,d,e,f){
        let m = a*e-b*d;
        return [ (c*e-b*f) / m , (a*f-c*d) / m ];
    }
    function swap(array, indexA, indexB){
        [array[indexA], array[indexB]] = [array[indexB], array[indexA]];
    }
    function scale(vec, scalar){  // multiply vec by scalar
        for (let i=0;i<vec.length; i++){
            vec[i] *= scalar;
        }
        return vec;
    }
    function minus(eqA,eqB){
        for (let i=0;i<eqA.length;i++){
            diff = eqA[i] - eqB[i]; 
            eqA[i] = Number(diff.toFixed(8)); //round off errors
        }
    }
    function notzero(x){
        return Math.abs(x) > 10**-8;
    }
    let aug = [eq1,eq2,eq3];  // augmented matrix
    let x,y,z;
    for (let i=0;i<3;i++){
        if (aug[i][0]){
            scale(aug[i], 1/aug[i][0] );
        }
    }
    aug.sort( (a,b) => b[0] - a[0] );
    if (notzero(aug[2][0])) minus(aug[2],aug[1]);
    if (notzero(aug[1][0])) minus(aug[1],aug[0]);
    // aug becomes 1 x x x, 0 x x x, 0 x x x
    if (aug[1][1] < aug[2][1] ) swap(aug,1,2);
    for (let i=1;i<3;i++){
        if (aug[i][1]){
            scale(aug[i], 1/aug[i][1] );
        }
    }
    if (notzero(aug[2][1])) minus(aug[2],aug[1]);
    if (notzero(aug[2][2]) && !notzero(aug[1][2])) swap(aug,1,2);
    // aug becomes 1 x x x, 0 1 x x, 0 0 x x
    if (notzero(aug[2][2])){
        scale(aug[2], 1/aug[2][2]);
        z = aug[2][3];
        y = aug[1][3] - aug[1][2]*z;
        x = aug[0][3] - aug[0][2]*z - aug[0][1]*y;
    } else{
        if (notzero(aug[2][3])) return "Inconsistent";
        if (notzero(aug[1][1])) {
            z = 't';
            y = [aug[1][3], -aug[1][2]];
            x = [aug[0][3] - aug[0][1]*aug[1][3], aug[0][1]*aug[1][2] - aug[0][2] ];
        }
        
    }
    console.log(aug);
    console.log(x,y,z);
}


// eigenvalues
// IN: entries of 3x3 matrix
// OUT: λ1, λ2, λ3
function eigen(a,b,c,d,e,f,g,h,i){
    function charpolynomial(a,b,c,d,e,f,g,h,i){
        function det(a,b,c,d,e,f,g,h,j){
            return  a*e*j + b*f*g + c*d*h - ( c*e*g + b*d*j + a*f*h );
        }
        let coe2 = - (a + e + i);   // coefficient of x^2
        let coe1 = (e*i-f*h) + (a*i-c*g) + (a*e-b*d);
        let coe0 = -det(a,b,c,d,e,f,g,h,i)
        return [1, coe2, coe1, coe0];
    }
    let char = charpolynomial(a,b,c,d,e,f,g,h,i);
    let eigenvalues = cubic(...char);
    return [...eigenvalues];
}

// 63. nth Power of 3x3 Matrix
// IN: n, entries       where n is the power
// OUT: result entries
function matrixpower(n,a,b,c,d,e,f,g,h,i){
    function multmatrix(matA,matB){
        let res = [];
        let s = 0;
        for (let k=0;k<3;k++){
            for (let j=0;j<3;j++){
                s = 0;
                for (let i=0;i<3;i++){
                    s += matA[k][i] * matB[i][j];
                }
                res.push(s);
            }
        }
        let res2 = [];   // make 2d list
        for (let i=0;i<9;i+=3){
            res2.push( [res[i],res[i+1],res[i+2]] );
        }
        return res2;
    }
    let mat = [[a,b,c],[d,e,f],[g,h,i]];
    let res = [[a,b,c],[d,e,f],[g,h,i]];
    for (let i=1;i<n;i++){
        res = multmatrix(res,mat);
    }
    let res2 = [];    // flatten res list
    for (let i=0;i<3;i++){
        for (let j=0;j<3;j++){
            res2.push( res[i][j] );
        }
    }
    return res2;
}

// 64. Characteristic Polynomial of 2x2 Matrix
// IN: a,b,c,d     (entries)
// OUT: 1,B,C  of   char. polynomial  x^2 + Bx + C
function charpolynomial2(a,b,c,d){
    return [ 1, -(a+d), a*d-b*c ];
}
// 65. Eigenvalues of 2x2 Matrix
function eigen2(a,b,c,d){
    return quadratic(  1, -(a+d), a*d-b*c );
}
// 66. nth Power of 2x2 Matrix
// IN: n, a,b,c,d
// OUT: result entries
function matrixpower2(n,a,b,c,d){
    function multmatrix2(a,b,c,d,e,f,g,h){
        return [a*e+b*g, a*f+b*h, c*e+d*g, c*f+d*h ];
    }
    let mat = [a,b,c,d];
    let res = [a,b,c,d];
    for (let i=1;i<n;i++){
        res = multmatrix2(...res,...mat);
    }
    return [res];
}
// 67. Distance Between Parallel Lines
//  ax + by + c = 0  &  dx + ey + f = 0
// IN: a,b,c,d,e,f
// OUT: d
function parallellinedistance(a,b,c,d,e,f){
    if (Math.abs(a/b-d/e) > 10**-8) return "Not parallel";
    f = f / d* a;
    return Math.abs(f-c) / Math.sqrt(a**2 + b**2);
}
// 68. Descartes' Circle Theorem
// IN: r1,r2,r3
// OUT: r4 (two possibilities: one externally tangent, one internally tangent)
function descartes(r1,r2,r3){
    let k1 = 1/r1, k2 = 1/r2, k3 = 1/r3;  // curvatures
    let k4_1 = k1 + k2 + k3 + 2* Math.sqrt( k1*k2 + k2*k3 + k1*k3 );
    let k4_2 = k1 + k2 + k3 - 2* Math.sqrt( k1*k2 + k2*k3 + k1*k3 );
    return [ 1/k4_1, 1/k4_2  ];
}

// 69. Prime Factors of Integer
function primefactors(n) {
    if (n<1 || n%1 || n>10**8 ) return "Error";  // restrict certain inputs
    const factors = [];
    let divisor = 2;
  
    while (n >= 2) {
      if (n % divisor == 0) {
        factors.push(divisor);
        n = n / divisor;
      } else {
        divisor++;
      }
    }
    return factors;
  }

// 70. Quartic Formula   
// See Art of Problem Solving for method (https://artofproblemsolving.com/wiki/index.php/Quartic_Equation)
// ax^4 + bx^3 + cx^2 + dx + e = 0
// IN: a,b,c,d,e
// OUT: x1,x2,x3,x4
function quartic(a,b,c,d,e){
    let p = (8*a*c-3*b**2) / (8*a**2);
    let q = (b**3-4*a*b*c+8*a**2*d) / (8*a**3);
    let r = (-3*b**4+16*a*b**2*c-64*a**2*b*d+256*a**3*e) / (256*a**4);
    let U = cubic(1, 2*p, p**2-4*r, -(q**2))[0];  // the first solution of cubic (which must be real)
    let u = Math.sqrt(U);
    let s = -u;
    let t = (u**3+p*u+q) / (2*u)
    let v = t - q / u;
    let x1 = (-u + Math.sqrt(u**2-4*v)) / 2;
    let x2 = (-u - Math.sqrt(u**2-4*v)) / 2;
    let x3 = (-s + Math.sqrt(s**2-4*t)) / 2;
    let x4 = (-s - Math.sqrt(s**2-4*t)) / 2;
    return  [ x1-b/(4*a), x2-b/(4*a), x3-b/(4*a), x4-b/(4*a)   ];
}



// FOR MATH FUNCTIONS (which has a single output)

// custom Math.log
function mylog(base, input){
    if (arguments.length >= 2)
        return Math.log(input) / Math.log(base);
    else
        return Math.log10(base);
}


function mysqrt(nth_root, input){         // mysqrt(3,8) = 2
    if (arguments.length >= 2)
        return input ** (1/nth_root);
    else     // if only one input, nth_root becomes input
        return Math.sqrt(nth_root);
}
// cube root
function cubert(input){
    return Math.cbrt(input);
}

// MAIN PANEL FORMULAS

// pythagoras theorem with unlimited arguments
function pyth(a,b, ...others){
    let s = a**2 + b**2 ;
    for (let i of others){
        s += i**2 ;
    }
    return Math.sqrt(s);
}
// Heron's formula
function heron(a,b,c){
    let s = (a+b+c)/2;
    return Math.sqrt( s*(s-a)*(s-b)*(s-c) );
}
// Law of cosines
function cosinelaw(a, b, theta){
    if (rad_mode)
        return Math.sqrt( a**2 + b**2 - 2*a*b*Math.cos(theta));
    else
        return Math.sqrt( a**2 + b**2 - 2*a*b*Math.cos(theta*Math.PI/180));
}
// second version where SSS is known, returns value of angle btw sides a, b
function cosinelaw2(a,b,c){   
    if (rad_mode)
        return Math.acos( (a**2 + b**2 - c**2) / (2*a*b) );
    else
        return Math.acos( (a**2 + b**2 - c**2) / (2*a*b) ) * 180 / Math.PI;
}
// Distance formula (if enter 6 arguments then every three arguments corresponds to a 3d point)
function distance(x1,y1, x2,y2, z1=0, z2=0){
    if (arguments.length == 6){
        let s = (x1-y2)**2 + (y1-z1)**2 + (x2-z2)**2;
        return Math.sqrt(s);
    }
    let s = (x1-x2)**2 + (y1-y2)**2;
    return Math.sqrt(s);
}

// Shoelace fomula 
function shoelace(x1,y1, x2,y2, x3,y3, ...others){
    let x_values = [], y_values = [];
    for (let i=0; i<arguments.length; i+=2){
        x_values.push(arguments[i]);
    }
    x_values.push(x1);
    for (let i=1; i<arguments.length; i+=2){
        y_values.push(arguments[i]);
    }
    y_values.push(y1);
    let s = 0;
    for (let i=0; i<x_values.length-1; i++){
        s += x_values[i] * y_values[i+1];
    }
    for (let i=0; i<x_values.length-1; i++){
        s -= y_values[i] * x_values[i+1];
    }
    return Math.abs(s/2);
}

// *** Linear Algebra ***
// 3x3 Matrix Determinant
function det(a,b,c,d,e,f,g,h,j){
    return  a*e*j + b*f*g + c*d*h - ( c*e*g + b*d*j + a*f*h );
}
function transpose(mat){
    [mat[1], mat[3]] = [mat[3], mat[1]];
    [mat[2], mat[6]] = [mat[6], mat[2]];
    [mat[5], mat[7]] = [mat[7], mat[5]];
}

// Mean
function mean(...input){
    let s = 0;
    for (let i of input){
        s += i;
    }
    return s / input.length;
}
// Median
function median(...input){
    let values = [...input];
    values.sort( (a,b) => a-b );
    let mid_index = (input.length % 2 == 1) ? (input.length+1)/2-1 : input.length / 2 - 1;
    console.log(values);
    if (input.length % 2 == 1){
        return values[mid_index];
    }
    else
        return (values[mid_index] + values[mid_index+1] )/2;
}
// Standard deviation
function std(...input){
    let s = 0;
    for (let i of input){
        s += i;
    }
    let mean = s / input.length;
    s = 0;
    for (let i of input){
        s += (i-mean)**2;
    }
    return Math.sqrt(s / input.length);
}
// Greatest Common Divisor
function gcd(a,b){
    [a,b] = [Math.max(a,b), Math.min(a,b)];  // rearrange
    while (b != 0){
        [a, b] = [b, a % b];
    }
    return a;
}
// Least Common Multiple
function lcm(a,b){
    function gcd(a,b){
        [a,b] = [Math.max(a,b), Math.min(a,b)];  // rearrange
        while (b != 0){
            [a, b] = [b, a % b];
        }
        return a;
    }
    return a*b/gcd(a,b);
}
// gcd and lcm that supports more than two arguments
function gcdall(...input){
    let d = gcd(input[0],input[1]);
    for (let i=2;i<input.length; i++){
        d = gcd(d, input[i]);
    }
    return d;
}
function lcmall(...input){
    let d = lcm(input[0],input[1]);
    for (let i=2;i<input.length; i++){
        d = lcm(d, input[i]);
    }
    return d;
}



// TRIGONOMETRIC FUNCTION
function trigo(callback, angle){
    if (!rad_mode){
        angle = angle * Math.PI/180;
    }
    return callback(angle);
}
function inv_trigo(callback, value){
    let angle = callback(value);

    if (!rad_mode){
        angle = angle * 180/Math.PI;
    }

    return angle;
}
// convert stuff in list to degrees
function rad_to_deg(input){
    if (!rad_mode){
        for (let i=0;i<input.length;i++){
            input[i] = input[i] / Math.PI * 180;
        }
    }
    return input;
}




// FLOOR DIVISION input getter
function floordivInputGetter(formula, search_result){

    for (let i = 0; i< search_result.length; i++){
        let floordiv_index = search_result[i];  

        // j go left
        let parentheses_count = 0;
        let j = floordiv_index - 1;  // j is a searcher that will keep decrementing by 1 until search is finished
        while( j >= 0 ){       
            if( formula[j] == "(") parentheses_count--;
            if( formula[j] == ")") parentheses_count++;

            if( PLUSMINUS.includes(formula[j]) && parentheses_count <= 0 ) break;
            if (parentheses_count < 0) break    
            j--;
        }
        // put the elements between index j and factorial_index inside the bracket "factorial( )"
        formula[floordiv_index] = ",";   // replace "⌊" with ","
        formula.splice(j+1, 0, "floordiv", "(");
        // this will make the formula array length increase by two
        floordiv_index += 2;  // index of floor_div shifted right by 2 after insertion of "floordiv" and "("

        // j go right
        parentheses_count = 0;
        j = floordiv_index + 1;   
        while( j < formula.length ){       
            if( formula[j] == "(") parentheses_count++;
            if( formula[j] == ")") parentheses_count--;

            if (j == floordiv_index + 1){  // + or - at the immediate right of floordiv is excepted
                if( OPERATORS.includes(formula[j]) && parentheses_count <= 0 && formula[j] != "+" && formula[j] != "-" ) break;
            }else{
                if( OPERATORS.includes(formula[j]) && parentheses_count <= 0 ) break;
            }
            if (parentheses_count < 0) break    
            j++;
        }
        formula.splice(j, 0, ")");
        allPlus(search_result, 2);
        plusOne(search_result, j);
    }
    return formula;
}

// FLOOR DIVISION FUNCTION     // symbol: ⌊
function floordiv(x, y){   //  x ⌊ y   
    let quotient = x / y;
    quotient = Number(quotient.toFixed(8));
    return Math.floor(quotient);
}


// FACTORIAL Input GETTER
function factorialInputGetter(formula, search_result){

    for (let i = 0; i< search_result.length; i++){
        let factorial_index = search_result[i] + i*2;   // i is a shift variable
        let parentheses_count = 0;
        let j = factorial_index - 1;  // j is a searcher that will keep decrementing by 1 until search is finished

        while( j >= 0 ){       
            if( formula[j] == "(") parentheses_count--;
            if( formula[j] == ")") parentheses_count++;

            if( OPERATORS.includes(formula[j]) && parentheses_count <= 0 ) break;
            if (parentheses_count < 0) break    
            j--;
        }
        // put the elements between index j and factorial_index inside the bracket "factorial( )"
        formula[factorial_index] = ")";   // replace "!" with ")"
        formula.splice(j+1, 0, "factorial", "(");
        // this will make the formula array length increase by two
    }
    return formula;
}


// FACTORIAL FUNCTION
function factorial(number){
    if (number % 1 != 0) return gamma(number + 1);

    if (number === 0 || number === 1 ) return 1;

    let result = 1;
    for (let i = 1; i <= number; i++){
        result *= i;
        if(result === Infinity) return Infinity;
    }
    return result;
}


// GAMMA FUNCTINON
function gamma(n) {  // accurate to about 15 decimal places
    //some magic constants 
    var g = 7, // g represents the precision desired, p is the values of p[i] to plug into Lanczos' formula
        p = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if(n < 0.5) {
      return Math.PI / Math.sin(n * Math.PI) / gamma(1 - n);
    }
    else {
      n--;
      var x = p[0];
      for(var i = 1; i < g + 2; i++) {
        x += p[i] / (n + i);
      }
      var t = n + g + 0.5;
      return Math.sqrt(2 * Math.PI) * Math.pow(t, (n + 0.5)) * Math.exp(-t) * x;
    }
}

function comb(n, r){
    let up = 1, down = 1;
    for (let i=n; i>n-r; i--){
        up *= i;
    }
    for (let i=1; i<=r; i++){
        down *= i;
    }
    return up / down;
}

function perm(n, r){
    let result = 1;
    for (let i=n; i>n-r; i--){
        result *= i;
    }
    return result;
}

function combInputGetter(formula, search_result, comb_or_perm = "comb"){

    for (let i = 0; i< search_result.length; i++){
        let floordiv_index = search_result[i];   // i is a shift variable

        // j go left
        let parentheses_count = 0;
        let j = floordiv_index - 1;  // j is a searcher that will keep decrementing by 1 until search is finished
        while( j >= 0 ){       
            if( formula[j] == "(") parentheses_count--;
            if( formula[j] == ")") parentheses_count++;

            if( OPERATORS.includes(formula[j]) && parentheses_count <= 0 ) break;
            if (parentheses_count < 0) break    
            j--;
        }
        // put the elements between index j and factorial_index inside the bracket "comb( )"
        formula[floordiv_index] = ",";   // replace "⌊" with ","
        formula.splice(j+1, 0, comb_or_perm, "(");
        // this will make the formula array length increase by two
        floordiv_index += 2;  // index of floor_div shifted right by 2 after insertion of "floordiv" and "("

        // j go right
        parentheses_count = 0;
        j = floordiv_index + 1;   
        while( j < formula.length ){       
            if( formula[j] == "(") parentheses_count++;
            if( formula[j] == ")") parentheses_count--;

            if( OPERATORS.includes(formula[j]) && parentheses_count <= 0 ) break;
            if (parentheses_count < 0) break    
            j++;
        }
        formula.splice(j, 0, ")");
        allPlus(search_result, 2);
        plusOne(search_result, j);
    }
    return formula;
}


// object to store the result as a fraction
let result_fraction = {
    up: 0,
    down: 1
}
let result_fraction_array = {  // for formula mode
    up: [null,null,null],
    down: [null,null,null]
}

function convertToFraction(){
    if (formula_mode == 0){   // normal mode
    if (result.value == "") return;
    if (result.value % 1 == 0) return;
    if (result.value.includes("/") ){
        result.value = ans;
        return;
    }

    for (let i=2;i<100001;i++){
        let up = result.value * i;
        up =  Number(up.toFixed(8));
        if (up % 1 == 0){
            result_fraction.up = up;    // store it in result_fraction
            result_fraction.down = i;
            result.value = `${up} / ${i}`;  
            break;
        }
    }
    return;
    }
    // formula mode > 0
    if (formula_mode > 0){
        if (result.value == "") return;
        if (result.value.includes("/") ){
            showResult();
            return;
        }
    result.value = "";
    for (let j=0; j<result_array.length; j++){
        if (result_array[j] % 1 == 0){    // if it is integer value, then set up, down to 1
            result_fraction_array.up[j] = result_array[j];   
            result_fraction_array.down[j] = 1;
            result.value += `${result_array[j]}, `;   // and append the value unchanged
            continue;
        }
        let i=2;
        for (i=2;i<100001;i++){
            let up = result_array[j] * i;
            up =  Number(up.toFixed(8));
            if (up % 1 == 0){
                result_fraction_array.up[j] = up;    // store it in result_fraction
                result_fraction_array.down[j] = i;
                result.value += `${up}/${i}, `;  
                break;
            }
        }
        
        if (i>100000){   // cant convert to fractions
            appendToResult(result_array[j], j);   // append decimals instead
        }    
    }
    result.value = result.value.slice(0,-2);
    console.log("frac_arr:", result_fraction_array);
    }
}

function showMixedFraction(){
    if (formula_mode == 0){
        if (result.value % 1 == 0){
            deactivateShift();
            return;
        }
        if (result.value.includes("/") ){  // in either fraction mode
                if (result.value.includes("ᒽ")){  // in mixed fraction mode
                    result.value = `${result_fraction.up} / ${result_fraction.down}`;
                }else{  // in improper fraction mode
                    result.value = MixedFraction(result_fraction.up, result_fraction.down);
                }
        }else{  // not in fraction mode
            convertToFraction();
            result.value = MixedFraction(result_fraction.up, result_fraction.down);
        }
        deactivateShift();
        return;
    }
    if (formula_mode > 0){
        if (result.value == "") return;
        let mode = 0;
        if (result.value.includes("/")){
            if (result.value.includes("ᒽ") ) mode = 2;  // mixed_fraction_mode
            else mode = 1;  // improper_fraction_mode
        }else mode = 0   // non-fraction mode

        console.log("result:", result.value);   
        if (mode == 2){
            showResult();
            convertToFraction();
            console.log("result2:", result.value);   
        }
        if (mode == 0 || mode == 1){
            result.value = ""
            console.log("result01:", result.value);   
            for (let j=0;j<result_array.length;j++){
                if (result_fraction_array.down[j] == 1){
                    result.value += `${result_fraction_array.up[j]}, `;
                }else{
                    result.value += MixedFraction(result_fraction_array.up[j], result_fraction_array.down[j]) + ", ";
                }

            }
            result.value = result.value.slice(0,-2);
        }
        deactivateShift();
    }
}



function MixedFraction(up, down){ // inputs numerator, denominator, outputs mixed fraction string
    if (down == 0) return "NaN";
    if (down == 1) return `${up}`;
    let sign = "ᒽ";
    let firstsign = ( up > 0 ) ? "": "-";
    let integral_part = floordiv(Math.abs(up), down);
    up = Math.abs(up) % down;

    if (formula_mode == 0)
        if (integral_part)
            return `${firstsign}${integral_part} ${sign} ${up} / ${down}`;
        else
            return `${firstsign}${up} / ${down}`;
    if (formula_mode > 0)
        if (integral_part)
            return `${firstsign}${integral_part}${sign}${up}/${down}`;
        else
            return `${firstsign}${up}/${down}`;
}


