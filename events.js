const display = document.getElementById('display');
const buttons = Array.from(document.getElementsByTagName('button'));

display.contentEditable = true;

const cursorToRight = () => {
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(display);
    range.collapse(false); // Move cursor to the end
    selection.removeAllRanges();
    selection.addRange(range);
}

const hasBalancedParentheses = (text) => {
    let openBrackets = [];
    for (let char of text) {
        if (char === '(') {
            openBrackets.push(char);
        } else if (char === ')') {
            if (openBrackets.length === 0) return false;
            openBrackets.pop();
        }
    }
    return openBrackets.length === 0;
}

const handleBackspace = () => {
                if (display.innerText[display.innerText.length - 1] === '(' && (display.innerText[display.innerText.length - 2] === 'n' ||display.innerText[display.innerText.length - 2] === 's'  ) ) {
                    display.innerText = display.innerText.slice(0, -4); 
                }
                else{
                    display.innerText = display.innerText.slice(0, -1);
                }
            }
const handleBeforeEvaluation = () => {
            let expression = display.innerText
                .replace(/\^/g, '**')
                .replace(/sqrt\(/g, 'Math.sqrt(')
                .replace(/sin\(/g, 'Math.sin(')
                .replace(/cos\(/g, 'Math.cos(')
                .replace(/tan\(/g, 'Math.tan(');
                console.log('Expression before evaluation:', expression);
            cursorToRight();

            if (!hasBalancedParentheses(expression)) {
                document.body.appendChild(popup);
                setTimeout(() => {
                    document.body.removeChild(popup);
                }, 500);
                return;
            }
            console.log('Expression after handling:', expression);
            return expression;
}
               
const popup = document.createElement('div');
popup.textContent = 'Unmatched parentheses';
popup.style.cssText = `
                        position: fixed;
                        top: 10%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background-color: #4f4d4dff;
                        color: white;
                        padding: 10px 20px;
                        border-radius: 5px;
                        font-size: 16px;
                        z-index: 1000;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                    `;


display.addEventListener('input', (e) => {

    // Remove invalid characters
    const allowedChars = /[0-9+\-*/.()^]/;
    const text = display.innerText;
    let filteredText = '';
    let i = 0;
    while (i < text.length) {
        const char = text[i];
        
        // Check for function names
        if (text.substr(i, 4) === 'sqrt') {
            filteredText += 'sqrt';
            i += 4;
        } else if (text.substr(i, 3) === 'sin') {
            filteredText += 'sin';
            i += 3;
        } else if (text.substr(i, 3) === 'cos') {
            filteredText += 'cos';
            i += 3;
        } else if (text.substr(i, 3) === 'tan') {
            filteredText += 'tan';
            i += 3;
        } else if (allowedChars.test(char)) {
            filteredText += char;
            i++;
        } else {
            i++; // Skip invalid character
        }
    }

    if (text !== filteredText) {
        display.innerText = filteredText;
    }
    cursorToRight();
});

display.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        display.focus(); 
        try {
            const expression = handleBeforeEvaluation();
            if (!expression) return;
            console.log('Evaluating:', expression);
            display.innerText = eval(expression);
        } catch {
            display.innerText = "Error";
        }
        cursorToRight();
    }
});

buttons.map(button => {
    button.addEventListener('click', (e) => {
        if (e.target.innerText === '=') {       
            console.log('= button pressed');
            try {
                
               const expression = handleBeforeEvaluation();
                if (!expression) return; // If parentheses are unmatched, exit early
                console.log('Evaluating:', expression);
                const result = eval(expression);
                display.innerText = result.toFixed(4);
            } catch {
                display.innerText = "Error";
            }
        }
        else if (e.target.innerText === 'C') {
            display.innerText = '';
        }
        else if (e.target.innerText === '⌫') {
            handleBackspace();
        }
        else if (e.target.innerText === '²√x') {
            // Add sqrt function to the display
            display.innerText += 'sqrt(';
        }
        else if (e.target.innerText === 'π') {
            display.innerText += Math.PI.toFixed(4);
        }
        else if (e.target.innerText === 'e') {
            display.innerText += Math.E.toFixed(4);
        }
        else if (e.target.innerText === 'sin') {
            // Add sine function to the display
            display.innerText += 'sin(';
        }
        else if (e.target.innerText === 'cos') {
            // Add cosine function to the display
            display.innerText += 'cos(';
        }
        else if (e.target.innerText === 'tan') {
            // Add tangent function to the display
            display.innerText += 'tan(';
        }
        else {
            display.innerText += e.target.innerText;
        }
    });
});