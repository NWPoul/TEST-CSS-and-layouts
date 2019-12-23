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
  let rowsCnt = 50,
      colsCnt = 100;

  let mainTable = document.getElementById('mainTable');
  doTable(mainTable, rowsCnt, colsCnt);
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
