/*
test note
*/

function makeTableHTML(myArray) {
  var result = "<table>";
  for(var i=0; i<myArray.length; i++) {
    result += "<tr>";
    for(var j=0; j<myArray[i].length; j++){
      result += "<td>"+myArray[i][j]+"</td>";
    }
    result += "</tr>";
  }
  result += "</table>";

  return result;
}


function setSimpleTable() {
  let rowsCnt = 15,
      colsCnt = 10;

  let mainTable = document.getElementById('mainTable');
  doTable(mainTable, rowsCnt, colsCnt);

  window.eventLogVar = '';
  for(var key in mainTable){
    if(key.search('on') === 0) {
      mainTable.addEventListener(key.slice(2), showEvent);
    }
  }

  // mainTable.oncontextmenu = testLongClickHandler;
  // mainTable.onclick = testClickHandler;
}


function testLongClickHandler(event) {
    event.preventDefault();
    // alert(event.type);
    // let cell = event.target;
    cell.innerHTML = 'Long';
    return false;
}

function testClickHandler(event) {
  event.preventDefault();
  console.log(event.target, event.type);
  // alert(event.type);
  let cell = event.target;
  cell.innerHTML = 'click';
  return false;
}

function showEvent(event) {
  if (event.target.tagName != 'TD') return;
  // event.preventDefault();
  if(!event.type.includes('pointer') ){
      window.eventLogVar += `${event.type}
      `;
  }
  console.log(event.type);
  // alert(window.eventLog);
  // let cell = event.target;
  // cell.innerHTML = event.type;
  return false;
}


function sendLog() {
  alert(window.eventLogVar);
  window.eventLogVar = '';
}

function doTable(table, rowsCnt = 50, colsCnt = 100) {
  let tbody = document.createElement('tbody');
  tbody.classList.add('tbodyClass');

  let headerRowClassName = 'headerRowClass';
  let thRowClassName = 'thRowClass';
  let thColClassName = 'thColClass';
  let rowClassName = 'rowClass';
  let tdClassName = 'tdClass';

  let headerRowStr = `<tr id="r0" class="${headerRowClassName}"><th class="th0">TABLE</th>`;
  for (let colIndex = 1; colIndex < colsCnt; colIndex++) {
    headerRowStr += `<th id="r0c${colIndex}" class="${thColClassName}">
                      col_${colIndex}
                     </th>`;
  }
  headerRowStr += '</tr>';
  tbody.insertAdjacentHTML('beforeend', headerRowStr);

  for (let rowIndex = 1; rowIndex < rowsCnt; rowIndex++) {
    let rowStr = `<tr id="r${rowIndex}" class="${rowClassName}">
                  <th class="${thRowClassName}">Row_${rowIndex}</th>`;

    for (let colIndex = 1; colIndex < colsCnt; colIndex++) {
      rowStr += `<td id="r${rowIndex}c${colIndex}" class="${tdClassName}">
                  r${rowIndex}c${colIndex}
                 </td>`;
    }
    rowStr += '</tr>';

    tbody.insertAdjacentHTML('beforeend', rowStr);
  }// end for rowsCnt

  table.appendChild(tbody);
  return table;
}// end do table
