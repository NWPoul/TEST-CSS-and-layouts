import {m1} from './Modules/m1.js';

function testFunction() {
    let testSpan = document.getElementById('testSpan');
    testSpan.innerHTML = m1.testMF();
    console.log('tf runned');
}

export {testFunction}