/*
test note
*/

function doTable() {
  
  var table = document.getElementById('mainTable');
  let colsCnt = 100;
  let rowsCnt = 30;
  
  table.appendChild( doTbodyHeader(colsCnt) );

  for (let index = 1; index <= daysN; index++) {
    table.appendChild( doTbody(rowsCnt, 0, index, '') );
  }

  return table;


  function doTbodyHeader(colsCnt) {
    let tbodyHeader = document.createElement('tbody');
    tbodyHeader.id = 'tbodyHeader';
    tbodyHeader.classList.add('tbodyHeader');

    let hTr =  document.createElement('tr');
    hTr.id = 'headerTr';
    hTr.classList.add('headerTr');

    let hTh =  document.createElement('th');
    hTh.id = 'th0';
    hTh.classList.add('th0');
    hTh.innerHTML = 'th0';


    hTr.appendChild(hTh);
    for (let index = 0; index < colsCnt; index++) {
      let hTd =  document.createElement('th');

      hTd.classList.add('thHeader');
      hTd.innerHTML = 'th' +index;

      hTr.appendChild(hTd);
    }//end for cols
    tbodyHeader.appendChild(hTr);
    return tbodyHeader;
  }// end do doTbodyHeader


  function doTbody(rowsCnt, colsCnt, dayN, dayHeader) {
    let tbody = document.createElement('tbody');
    tbody.id = dayN;
    tbody.classList.add('bookingTbody');

    let hTr =  document.createElement('tr');
    hTr.id = 'day_' +dayN +'_Tr';
    hTr.classList.add('newDayTr');
    hTr.innerHTML = `<th class="thNewDayHeader">day_${dayN}</th>
                     <th colspan="3" class="thNewDayHeader">full_day_${dayN}</th>`;

    tbody.appendChild(hTr);

    for (let index = 0; index < rowsCnt; index++) {
      let className = (index % 2 == 0) ? 'groupD' : 'groupD odd';
      let rowsStr = `<tr id="day${dayN}_${index}" class="${className}">
      <th class="thRowHeader" rowspan="2">${index} <br><span class="tdSpan"></span></th>
      <td class="pf">v1</td>
      <td class="pf">v2</td>
      <td class="pf">v3</td>
    </tr>
    <tr class="groupN">
      <td colspan="3" class="freeTimeTd"> -- ft marker --</td>
    </tr>`;

      tbody.insertAdjacentHTML('beforeend', rowsStr);
    }// end for rowsCnt

    // let tr =  document.createElement('tr');
    // tr.id = dayN +'_' +'slot-' +index;
    // tr.classList.add('groupD');
    // if(index % 2 == 0) { tr.classList.add(odd) }
    // tr.innerHTML =

    return tbody;
  }// end do Tbody
}// end do table















function setHeaderDiv(hTh) {
  let divHeader = document.createElement('div');
  divHeader.id = 'divHeader';
  divHeader.classList.add('divHeader');
  divHeader.innerHTML = 'div Header!';
  hTh.appendChild(divHeader);

  return divHeader;
}


function findCurElem(anchorId, xOffset = 1, yOffset = 1) {
  let anchor = document.getElementById(anchorId);
  let anchorRect = anchor.getBoundingClientRect();
  let xPos = anchorRect.left + xOffset;
  let yPos = anchorRect.bottom + yOffset;

  let curElem = document.elementFromPoint(xPos, yPos);
  return curElem;
}


function findParent(elem, targetTagName) {
  while ( (elem = elem.parentElement) && (elem.tagName != targetTagName) )
  return elem.parentElement;
}


function blinkElem(elem) {
  if (typeof(elem) === 'string') {
    elem = document.getElementById(elem);
  }
  elem.classList.toggle( 'blinkElem' );
  setTimeout( () => {
    elem.classList.toggle( 'blinkElem' );
  }, 1000);
}// end blinkElem

