const display = document.getElementById('current-expression');
const inlineHistory = document.getElementById('inline-history');
const historyPanel = document.getElementById('history-items-container');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const buttons = Array.from(document.getElementsByTagName('button'));
let History = [];

display.contentEditable = true;

// Utility Functions
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
    if (display.innerText[display.innerText.length - 1] === '(' && 
        (display.innerText[display.innerText.length - 2] === 'n' || 
         display.innerText[display.innerText.length - 2] === 's')) {
        display.innerText = display.innerText.slice(0, -4);
    } else {
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

// Popup Element
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

const updateHistoryDisplay = () => {
    if (historyPanel) {
        historyPanel.innerHTML = '';
        
        if (History.length === 0) {
            historyPanel.innerHTML = '<div style="text-align: center; color: #666; padding: 40px 20px;">No history yet</div>';
        } else {
            History.slice().reverse().forEach((item) => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                historyItem.innerHTML = `
                    <div class="history-expression">${item.expression.replace(/Math\./g, '')}</div>
                    <div class="history-result">${item.result}</div>
                `;
                
                historyItem.addEventListener('click', () => {
                    display.innerText = item.result;
                    cursorToRight();
                });
                
                historyPanel.appendChild(historyItem);
            });
        }
    }
    
    // Update mobile inline history (show only last calculation)
    if (inlineHistory && History.length > 0) {
        const lastItem = History[History.length - 1];
        inlineHistory.textContent = `${lastItem.expression.replace(/Math\./g, '')} = ${lastItem.result}`;
    } else if (inlineHistory) {
        inlineHistory.textContent = '';
    }
};

// Clear history functionality
if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
        History = [];
        updateHistoryDisplay();
    });
}

// Event Listeners
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
            
            const result = eval(expression).toFixed(4);
            display.innerText = result;
            
            History.push({
                expression: expression,
                result: result
            });
            
            updateHistoryDisplay();
            console.log('Evaluation history:', History);
        } catch {
            display.innerText = "Error";
        }
        cursorToRight();
    }
});

buttons.map(button => {
    button.addEventListener('click', (e) => {
        const buttonText = e.target.innerText;
        
        if (buttonText === '=') {
            console.log('= button pressed');
            try {
                const expression = handleBeforeEvaluation();
                if (!expression) return; // If parentheses are unmatched, exit early
                
                console.log('Evaluating:', expression);
                const result = eval(expression);
                display.innerText = result.toFixed(4);

                History.push({
                    expression: expression,
                    result: result
                });
                updateHistoryDisplay();
                console.log('Evaluation history:', History);
            } catch {
                display.innerText = "Error";
            }
        } 
        else if (buttonText === 'C') {
            display.innerText = '';
        } 
        else if (buttonText === '⌫') {
            handleBackspace();
        } 
        else if (buttonText === '²√x') {
            display.innerText += 'sqrt(';
        } 
        else if (buttonText === 'π') {
            display.innerText += Math.PI.toFixed(4);
        } 
        else if (buttonText === 'e') {
            display.innerText += Math.E.toFixed(4);
        } 
        else if (buttonText === 'sin') {
            display.innerText += 'sin(';
        } 
        else if (buttonText === 'cos') {
            display.innerText += 'cos(';
        } 
        else if (buttonText === 'tan') {
            display.innerText += 'tan(';
        }
        else if (buttonText === '🗑️') {
            History.length = 0; // Clear history
            updateHistoryDisplay();
        } else {
            display.innerText += buttonText;
        }
    });
});