/*
test note
*/

function start(params) {
  var table = document.getElementById('mainTable');
  doTable(table);

  var targetElementId = 'day_3_Tr';

  testObserver(targetElementId);
}


function testObserver(targetElementId) {
  //console.log('setObserver');

  var options = {
    root: document.getElementById('inner'),
    rootMargin: '-15% 0% 0% 0%'
  };
  var callback = function(entries, observer) {
    entries.forEach(entry => {
      var subj = {
        //time : entry.time,               // a DOMHightResTimeStamp indicating when the intersection occurred.
        roorBounds : entry.rootBounds,         // a DOMRectReadOnly for the intersection observer's root.
        bClRect : entry.boundingClientRect, // a DOMRectReadOnly for the intersection observer's target.
        intersectionRext : entry.intersectionRect,   // a DOMRectReadOnly for the visible portion of the intersection observer's target.
        intsRatio : entry.intersectionRatio,  // the number for the ratio of the intersectionRect to the boundingClientRect.
        target : entry.target,             // the Element whose intersection with the intersection root changed.
        isIntersecting : entry.isIntersecting     // intersecting: true or false
      };
      //console.log(subj);
      changeHeader();
    });
  };

  var observer = new IntersectionObserver(callback, options);
  var target = document.getElementById(targetElementId);
  target.classList.add('target');

  observer.observe(target);
}// end testObserver

function changeHeader(params) {
  let anchor = document.getElementById('r0c0');
  let anchorRect = anchor.getBoundingClientRect();
  let xPos = anchorRect.left+10;
  let yPos = anchorRect.bottom+10;

  let checkElem = document.elementFromPoint(xPos, yPos);
  console.log('yPos=' +yPos, 'elem: ', checkElem.innerHTML);

  var newEl = document.createElement('div');
  newEl.innerHTML = '$';
  newEl.style.cssText = 'position:fixed;'
  +'left:' +xPos +'px;'
  +'top:' +(yPos + 1) +'px;'
  +'z-index:100;'
  +'border: 1px solid #000;'
  +'background-color: red';

  document.body.appendChild(newEl);

  setTimeout(function() {
    document.body.removeChild(newEl);
  }, 3000);


}




function doTable(table) {
  let colsCnt = 3;
  let rowsCnt = 10;
  let daysN = 5;

  table.appendChild( doHeadTbody(colsCnt) );

  for (let index = 1; index <= daysN; index++) {
    table.appendChild( doTbody(rowsCnt, 0, index, '') );
  }


  return table;

  function doHeadTbody(colsCnt) {
    let headTbody = document.createElement('tbody');
    headTbody.id = 'btHeaderTbody';
    headTbody.classList.add('bookingTbody');

    let hTr =  document.createElement('tr');
    hTr.id = 'btHeaderTr';
    hTr.classList.add('tableHeader');

    let hTh =  document.createElement('th');
    hTh.id = 'r0c0';
    hTh.classList.add('th0');
    hTh.innerHTML = 'th0';

    let divHeader =  document.createElement('div');
    divHeader.id = 'divHeader';
    divHeader.classList.add('divHeader');
    divHeader.innerHTML = 'div Header!';

    hTr.appendChild(hTh);
    for (let index = 0; index < colsCnt; index++) {
      let hTd =  document.createElement('td');
      //hTd.id = "hTd";
      hTd.classList.add('td-header');
      hTd.innerHTML = 'td' +index;

      hTr.appendChild(hTd);
    }//end for cols

    headTbody.appendChild(hTr);

    return headTbody;
  }// end do doHeadTbody


  function doTbody(rowsCnt, colsCnt, dayN, dayHeader) {
    let tbody = document.createElement('tbody');
    tbody.id = dayN;
    tbody.classList.add('bookingTbody');

    let hTr =  document.createElement('tr');
    hTr.id = 'day_' +dayN +'_Tr';
    hTr.classList.add('newDayTr');
    hTr.innerHTML = `<th>day_${dayN}</th>
                     <td colspan="3" class="newDayTr">full_day_${dayN}</td>`;

    tbody.appendChild(hTr);

    for (let index = 0; index < rowsCnt; index++) {
      let className = (index % 2 == 0) ? 'groupD' : 'groupD odd';
      let rowsStr = `<tr id="day${dayN}_${index}" class="${className}">
      <th rowspan="2">${index} <br><span class="tdSpan"></span></th>
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