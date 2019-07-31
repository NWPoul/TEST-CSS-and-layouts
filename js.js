/*
test note
*/

function start(params) {
  var table = document.getElementById('mainTable');
  doTable(table);

  var targetElementId = 'day_3_Tr';

  try {
  testObserver(targetElementId);
  } catch (err) {
    console.log(err);
  }
}


function testObserver(targetElementId) {
  //console.log('setObserver');
try {
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
      changeHeader(subj);
    });
  };

  var observer = new IntersectionObserver(callback, options);
  var mainTable = document.getElementById('mainTable');
  var headers = mainTable.getElementsByClassName('newDayTr');
    // target.classList.add('target');
  for (let header of headers) {
    observer.observe(header);
    showLogDiv.innerHTML += header.id +'<br>';
  }
  showLogDiv.innerHTML += 'observer root: ' +observer.root.id;

} catch (error) {
  console.log('inside testObserver: ', error)
  showLogDiv.innerHTML += error.message
}

}// end testObserver  
function changeHeader(params) {
  let dayHeaderId = 'divHeader';
  let dayHeader = document.getElementById(dayHeaderId);

  let xOffset = 10;
  let yOffset = params.isIntersecting ? 1 : 30; 

  let curElem = findCurElem('divHeader', xOffset, yOffset);
  blinkElem(curElem);
  let curTbody = findParent(curElem, 'TBODY');
  let curTbodyHeader = curTbody.rows[0].cells[1];
  let dayHeaderText = curTbodyHeader.innerHTML;

  dayHeader.innerHTML = dayHeaderText;
  
  
}// end of changeHeader




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
    hTh.id = 'th0';
    hTh.classList.add('th0');
    hTh.innerHTML = 'th0';



    setHeaderDiv(hTh);


    hTr.appendChild(hTh);
    for (let index = 0; index < colsCnt; index++) {
      let hTd =  document.createElement('th');
      //hTd.id = "hTd";
      hTd.classList.add('thHeader');
      hTd.innerHTML = 'th' +index;

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

