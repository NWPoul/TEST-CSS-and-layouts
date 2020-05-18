
//GLOBAL NAME SPACE
var MODE                = {
        TEST:              true,
        ENV:              'GIT',    // 'GIT', 'GAS', 'DEV'
        HTTP:             'JSONP'   // 'local', 'GAS', 'JSONP'
};
if (window.google) {
    MODE.ENV            = 'GAS';
    MODE.HTTP           = 'GAS';
}

var SHIFTAPI_URL        = {
        WORK_EXEC:        'https://script.google.com/macros/s/AKfycbxrhqgnC54sVCZlRNMTVoIQQ4j-WRqHsjUJoB3bMx8QbELvXg/exec',
        WORK_DEV:         'https://script.google.com/macros/s/AKfycbzBr83KgXKILg-cCd2iSFUc9HWrDLrwHYeEJH-Igw/dev',
        TEST_EXEC:        'https://script.google.com/macros/s/AKfycbye8JAXiJfseuPCq-X8z7CWqEc6vq-y9GqjhpFk8ump2Rx-HQ/exec',
        TEST_DEV:         'https://script.google.com/macros/s/AKfycbxLpmA5BYGw59ZsJe9vm-iQSikMUNSyX5wWbXoPDw/dev',
        TEST_PROXY:       'https://script.google.com/macros/s/AKfycbzYnFPRARon_zsvYmUA_I1sJhiNWFGu_clw-hcQE8Woi38Kdtw/exec'
};

var CUR_SHIFTAPI_URL    = SHIFTAPI_URL.TEST_PROXY;

var SHIFTAPI_reqHeader  = 'webAppReq';

var RASP_DATA;                  // массив с расписанием смен из гугла
var PREV_REQ_DATA;              // массив с данными сделаных запросов
var LOG_DATA;                   // объект с данными по статистике пользователя/лей


var MAINTABLE_STATE;            // объект с состоянием основной таблицы

var G_MAXDATE           = 0;    // or = Date.parse('YYYY-MM-DD'); ms, (0 = not limit) latest date for request
var G_MAXDATE_COL       = 21;
var COST                = {
        shift:             3000,
        w:                 1500,
        hr:                350
};

var CUR_SC              = 'Tff-23723';
var USER                = {
        nick:             null,
        ps:               null,
        mail:             null,
        status:           null
};



/*global
AUTH
GAS
TEST_APIanswer
ERROR_LOGGER

STB_SetMainTable
*/
///// ===== END GLOBAL NAME SPACE =====


///// START POINT /////
// eslint-disable-next-line no-unused-vars
function HDL_start() {
    let appMode   = MODE.ENV;
    let httpMode  = MODE.HTTP;
    let userObj   = USER;

    let mainTable = document.getElementById('mainTable');
    let userData  = HDL_getUser(appMode);

    setNavBtnMenu();

    if ( !userData.status ) {
        mainTable.innerHTML = '<tr><td>Нужна авторизация! Нажмите "Log_in"</td></tr>';
        HDL_Async_login(appMode)
          .then( HDL_start )
          .catch( err => console.trace('HDL_start loginERROR = ' + err) );
        return;
    }

    AUTH.storeUserToAPP_VARS(userData, userObj);
    AUTH.setLoginButtonText(userObj.nick);

    HDL_Async_getRaspData(httpMode)
      .then( (raspData)   => STB_SetMainTable(raspData) )
      .catch( err => {
          console.trace('HDL_start raspDataERROR = ' + err );
          swal(err);
      });
    mainTable.innerHTML = '<tr><td>Loading data...</td></tr>';
} // END HDL_start ============================================


function HDL_getUser(appMode) {
    let userObj = {};

    switch (appMode) {
        case 'GIT':
        case 'GAS':
            userObj         = AUTH.getUserFromLS();
            break;

        case 'DEV':
            userObj.status  = 'test';
            userObj.nick    = 'TST';
            userObj.ps      = 'tstps';
            userObj.mail    = 'nwpoul@ya.ru';
            break;
    }
    return userObj;
}

async function HDL_Async_login(appMode) {
    var loginResponse;
    switch (appMode) {
        case 'GIT':
            loginResponse        = AUTH.Async_logIn();
            break;

        case 'GAS':
            var userObj          = {};
            var reqResponse, clearedResponse;

            reqResponse          = await GAS.Async_logIn();
            clearedResponse      = HDL_checkApiResponse(reqResponse);

            if ( clearedResponse.status === true ) {
                userObj.nick     = clearedResponse.content.nick;
                userObj.ps       = clearedResponse.content.ps;
                loginResponse    = AUTH.loginResponseHandler(userObj.nick, userObj.ps, reqResponse);
            } else {
                loginResponse    = Promise.reject(clearedResponse.content);
            }
            break;
    }
    return loginResponse;
}


// eslint-disable-next-line no-unused-vars
async function HDL_Async_getRaspData(httpMode = MODE.HTTP) {
    var reqObj = {
            command: 'rasp',
            data:    ''
        };

    var reqResponse,
        clearedResponse;
    switch(httpMode) {
        case 'local':
            RASP_DATA   = TEST_APIanswer.content;
            break;
        case 'GAS':
            reqResponse = await GAS.Async_GAS_FETCH(reqObj);
            break;
        case 'JSONP':
            reqResponse = await HDL_Async_ShiftApi_JSONP_Request (reqObj);
            break;
    }// end switch

    clearedResponse     = HDL_checkApiResponse(reqResponse);
    RASP_DATA           = ( clearedResponse.status === true ) ?
                            clearedResponse.content :
                            Promise.reject(clearedResponse.content);
    return RASP_DATA;
}// END HDL_Async_getRaspData


// eslint-disable-next-line no-unused-vars
async function HDL_Async_getPrevReqData(httpMode = MODE.HTTP) {
    var reqObj = {
            command: 'getZamReq',
            data:    ''
        };

    var reqResponse,
        clearedResponse;
    switch(httpMode) {
        case 'local':
            reqResponse = {status: true, content: ''};
            break;
        case 'GAS':
            reqResponse = await GAS.Async_GAS_FETCH(reqObj);
            break;
        case 'JSONP':
            reqResponse = await HDL_Async_ShiftApi_JSONP_Request (reqObj);
            break;
    }// end switch

    clearedResponse     = HDL_checkApiResponse(reqResponse);
    PREV_REQ_DATA       = ( clearedResponse.status === true ) ?
                            clearedResponse.content :
                            Promise.reject(clearedResponse.content);
    return PREV_REQ_DATA;
}// end HDL_Async_getPrevReqData


// eslint-disable-next-line no-unused-vars
async function HDL_Async_getLogData(httpMode = MODE.HTTP) {
    var reqObj = {
            command: 'getLog',
            data:    ''
        };

    var reqResponse,
        clearedResponse;
    switch(httpMode) {
        case 'local':
            reqResponse = {status: true, content: ''};
            break;
        case 'GAS':
            reqResponse = await GAS.Async_GAS_FETCH(reqObj);
            break;
        case 'JSONP':
            reqResponse = await HDL_Async_ShiftApi_JSONP_Request (reqObj);
            break;
    }// end switch

    clearedResponse     = HDL_checkApiResponse(reqResponse);
    if (clearedResponse.status === true ) {
        LOG_DATA = clearedResponse.content;
        Object.defineProperty(LOG_DATA, 'updated', {
            writable: true,
            value:    new Date()
        });
        return LOG_DATA;
    } else {
        return Promise.reject(clearedResponse.content);
    }
}// end HDL_Async_getPrevReqData




// eslint-disable-next-line no-unused-vars
async function HDL_Async_uploadChanges(shiftChanges, httpMode = MODE.HTTP) {
    if (!shiftChanges.shifts.length) return;
    var uploadResponse;
    var reqObj  = {
            command: 'upReq',
            data:    shiftChanges
        };

    var reqResponse,
        clearedResponse;
    switch(httpMode) {
        case 'local':
            reqResponse = {status:   true,
                           content: 'local call changes uppload/n ' + 'changes = ' + shiftChanges};
            break;
        case 'GAS':
            reqResponse = await GAS.Async_GAS_FETCH( reqObj );
            break;
        case 'JSONP':
            reqResponse = await HDL_Async_ShiftApi_JSONP_Request( reqObj );
            break;
    }// end switch

    clearedResponse     = HDL_checkApiResponse( reqResponse );
    uploadResponse      = ( clearedResponse.status === true ) ?
                            clearedResponse.content :
                            Promise.reject(clearedResponse.content);
    return uploadResponse;
}// end HDL_Async_uploadChanges


async function HDL_Async_upload_vacation(vacationData, httpMode = MODE.HTTP) {
    var uploadResponse;
    var reqObj  = {
            command: 'vacationReq',
            data:     vacationData
        };

    var reqResponse,
        clearedResponse;
    switch(httpMode) {
        case 'local':
            reqResponse = {status:   true,
                           content: 'local call vacation uppload/n ' + 'vacationData = ' + vacationData};
            break;
        case 'GAS':
            reqResponse = await GAS.Async_GAS_FETCH( reqObj );
            break;
        case 'JSONP':
            reqResponse = await HDL_Async_ShiftApi_JSONP_Request( reqObj );
            break;
    }// end switch

    clearedResponse     = HDL_checkApiResponse( reqResponse );
    uploadResponse      = ( clearedResponse.status === true ) ?
                            clearedResponse.content :
                            Promise.reject(clearedResponse.content);
    return uploadResponse;
}// end HDL_Async_upload_vacation




function HDL_checkApiResponse(apiResponse) {
    let clearedApiResponse = {
        status: false,
        content: ''
    };

    if (!apiResponse) {
        clearedApiResponse.content = 'No response!';

    } else if (!apiResponse.status === undefined || !apiResponse.content) {
        clearedApiResponse.content = `Invalid response: \n ${apiResponse}`;

    } else if (apiResponse.status !== 200) {
        clearedApiResponse.content = `Error!: \n ${apiResponse.content}`;

    } else {
        clearedApiResponse.status  = true;
        clearedApiResponse.content = apiResponse.content;
    }
    return clearedApiResponse;
}

async function HDL_Async_ShiftApi_JSONP_Request (reqObj) {
    let url             = CUR_SHIFTAPI_URL;
    let dataHeader      = SHIFTAPI_reqHeader;
    let idData          = USER;

    let parametersObj   = {};
        parametersObj[dataHeader] = {
            command:      reqObj.command,
            data:         reqObj.data,
            id:           idData
        };
    await Async_JSONP_HTTP_Transport(url, parametersObj);
    let result          = APIanswer;
    APIanswer           = undefined;
    return result;
} // ShiftApiRequest

async function Async_JSONP_HTTP_Transport(url = CUR_SHIFTAPI_URL, parameters) {
    var targetNode      = document.head;
    var newScript_tag   = document.createElement('script');
    var parametersStr   = '';

    if ( typeof parameters == 'string' ) {
        parametersStr   = parameters;
    } else {
        for (let parameter in parameters) {
            parametersStr += '&' + parameter
                          +  '=' + JSON.stringify(parameters[parameter]);
        }
    }

    var URIparametersStr  = encodeURI( parametersStr );
    var srcStr            = url + '?' + URIparametersStr;

    let response = new Promise( (resolve, reject) => {
            newScript_tag.type    = 'text/javascript';
            newScript_tag.src     = srcStr;
            newScript_tag.done    = function () {
                                        console.trace('done prms_req: ' + this.src);
                                        targetNode.removeChild(this);
                                    };
            newScript_tag.onload  = function () {
                                        this.done();
                                        resolve('Request resolved');
                                    };
            newScript_tag.onerror = function () {
                                        this.done();
                                        reject('Request rejected! ' +this);
                                    };
            targetNode.appendChild(newScript_tag);
    }); //end promise

    return response;
} // END JSONP_HTTP_Request ===============================================





function helpButtonClick() {
    var helpDiv  = document.createElement('div');
    var helpText = `<b>Режимы работы:</b><br>
        <br>
        <b>Авто (основной):</b>
        <p class="helpTexpP">
            - выбираем день, в нем выбираем (кликаем) пару инструкторов, смены которых меняем<br>
            - в открывшемся диалоге выбираем из возможных вариантов
        </p>
        <br>
        <b>Одиночный-прямой:</b>
        <p class="helpTexpP">
            - долгий тап в телефоне (правая кнопка мыши в компе) на смене, которую хотим изменить<br>
            - или выбор "ввести свой вариант" в диалоге автозамены (если ни один из официально возможных не подошел)
            <br>
            <br>
            В одном запросе можно заявлять замен на несколько дней:<br>
            Запрос должен быть законченным,<br>
            если для того, чтобы он не нарушал правил (день-ночь, выходной...) нужно выставить замены в другие дни, они должны быть отправлены в том же запросе.
        </p>
        <br>
        <b>Кнопки:</b>
        <p class="helpTexpP">
            <i class="icon icon-em menu-f"></i> - вход(логин) / меню пользователя<br>
            <i class="icon icon-em undo-2"></i> - откат на шаг (замену) назад<br>
            <i class="icon icon-em refresh"></i> - перезагрузка расписания (не отправленные замены пропадут)<br>
            <i class="icon icon-em upload-s"></i> - проверка и отправка запроса<br>
        </p>
        <br>
        Если запрос нарушает правила - будет выдано предупреждение со списком нарушений<br>
        Если такой запрос все равно хотим отправить - нужно ввести комментраий/причину
    `;

    helpDiv.innerHTML      = helpText;
    helpDiv.style.fontSize = '4vmin';
    swal({
        content: helpDiv
    });
}//end helpButtonClick




//////TESTING/////////////////////////////TESTING///////////////////////////////////////////////TESTING
//////                                 TESTING AREA
//////TESTING/////////////////////////////TESTING///////////////////////////////////////////////TESTING


function testLS() {
    let LStestStr     = 'LStestStr';
    localStorage.setItem( 'LStestRec', LStestStr );
    let testRes       = ( localStorage.getItem('LStestRec') == LStestStr );
    localStorage.removeItem( 'LStestRec' );
    return testRes;
}

function encodeObj(obj, curSc) {
    curSc             = curSc || CUR_SC;
    let encodedObj    = encodeURIComponent( AUTH.xorObj(obj, curSc) );
    return encodedObj;
}

function getLastProperty(obj, propChainStr) {
    propChainStr.split('.')
    .forEach( (prop) => {
        if (
            typeof obj != 'object'
            ||     obj === null
            ||   !(prop in obj)
           ) { return obj; }
        obj = obj[prop];
    });
    return obj;
}


function ttest() {
    let reqObj = {
        command: 'test',
        data: 'no data'
    };
    HDL_Async_ShiftApi_JSONP_Request (reqObj)
    .then( result => {
        console.log( 'ttest() resp: ', result );
    });
}

// let testObj = {
//     l1: {
//         l2:{
//             l3:{
//                 l4:7
//             }
//         }
//     }
// }
// let testArr = [[[[]]]]
// let tstr = 'l2.l3.l4'
// console.log(getLastProperty(testObj, 'testObj.l1.l2.l3.l4'));
// console.log( testObj.l2.l3.l4.l5.l6 instanceof Object);
// console.log( testArr[0][0][0] instanceof Object);



function testReq() {
  let reqObj = {
    command: 'getLog',
    data: {
        stDate:  '2020-04-20',
        endDate: '2020-04-25',
        notes:   'WebApp vacation test request'
    },
  };
  HDL_Async_ShiftApi_JSONP_Request (reqObj);

}




function setDefButton( parent, propObj) {
    let button            = document.createElement('button');
    for (let prop in propObj) {
        button[prop]      = propObj[prop];
    }
    parent.appendChild(button);
  }//end service function setDefButton




function setNavBtnMenu() {
    let navBtnMenuId    = 'navBtnDialog';
    let navBtnMenu = setDialog(navBtnMenuId, undefined, 'all', 'hide');
    navBtnMenu.appendToBody();

    return navBtnMenu;
}


function setDialog(id = 'defDialogDiv', className='dialogDiv', closeOnClick='non', closeMethod='hide') {
    let dialog              = document.getElementById(id);
        if( !dialog ) {
             dialog         = document.createElement('div');
             dialog.id      = id;
        }
        dialog.className    = className;

    let modalBack           = document.createElement('div');
        modalBack.id        = id +'Back';
        modalBack.className = 'modalBack';


    dialog.appendToBody     = () => {
        modalBack.appendChild(dialog);
        document.body.appendChild(modalBack);
    };
    dialog.removeDialog     = () => {
        modalBack.remove();
    };

    dialog.show             = () => {
        modalBack.style.display  = 'block';
        dialog.style.display     = 'block';
    };
    dialog.close            = () => {
        if(closeMethod == 'remove') {
            dialog.removeDialog();
            return;
        }
        dialog.innerHTML         = '';
        dialog.dataObj           = {};
        modalBack.style.display  = 'none';
        dialog.style.display     = 'none';
    };
    dialog.dataObj               = {};
    dialog.setItems = (itemsObj) => {
        for (const item in itemsObj) {
            setDefButton( dialog, itemsObj[item] );
        }
    };

    switch (closeOnClick) {
        case 'non':
            break;
        case 'out':
            modalBack.onclick = (e) => {
                if(e.target.id == modalBack.id ) dialog.close(); };
            break;
        case 'all':
            modalBack.onclick = () => {
                dialog.close(); };
            break;
    }

    return dialog;
}




function setVacationRequestDiag() {
    let vacationReqDiagId       = 'vacationReqDiag';
    let vacationReqDiag         = setDialog(vacationReqDiagId, undefined, 'out', 'remove');

    vacationReqDiag.addNotes    = () => {
        let notes = prompt('Введите комментарий:');
        vacationReqDiag.dataObj.notes = notes;
    };

    vacationReqDiag.sendRequest = () => {
        let reqData = vacationReqDiag.dataObj;
        HDL_Async_upload_vacation(reqData)
            .then( result => swal(result) )
            .catch( error => swal(error) );
    };

    vacationReqDiag.setDate     = (dateSide, date) => {
        date = (Object.prototype.toString.call(date) === '[object Date]') ?
                date :
                new Date(date);
        vacationReqDiag.dataObj[dateSide] = date.toLocaleDateString();
    };

    vacationReqDiag.initDatePicker = () => {
        var TinyDatePicker = window.TinyDatePicker;
        var dpCustomOpt = {
            format(date) { return date.toLocaleDateString(); }
        };
        var dpWStDate  = TinyDatePicker('#WStDate',  dpCustomOpt)
            .on('select', (_, dp) => {
                vacationReqDiag.setDate('startDate', dp.state.selectedDate);
                console.log(dp.state.selectedDate);
            });

        var dpWEndDate = TinyDatePicker('#WEndDate', dpCustomOpt)
            .on('select', (_, dp) => {
                vacationReqDiag.setDate('endDate', dp.state.selectedDate);
                console.log(dp.state.selectedDate);
            });
    };

    let buttons = {
        pickUpDateButton: {
            className: 'vacDiag-actionButton',
            id:        'pickUpDateButton',
            innerHTML: `
                <div class="vacDiag-dateInputContainer">
                    <input type="text" id="WStDate"  class="dp-dateInput" placeholder="Дата начала" >
                </div>
                <div class="vacDiag-dateInputContainer">
                    <input type="text" id="WEndDate" class="dp-dateInput" placeholder="Дата кончала">
                </div>
            `
        },

        setNotesButton: {
            className: 'vacDiag-actionButton',
            innerText: 'Добавить комментарий',
            onclick:    vacationReqDiag.addNotes
        },
        sendButton: {
            className: 'vacDiag-actionButton',
            innerText: 'Отправить запрос',
            onclick:    () => {
                            vacationReqDiag.sendRequest();
                            vacationReqDiag.removeDialog();
                            swal('Запрос отправлен!', {
                                buttons: false,
                                timer: 1500,
                              });
                        }
        },
        cancelButton: {
            className: 'vacDiag-actionButton',
            innerText: 'Отмена',
            onclick:    vacationReqDiag.removeDialog
        }
    };
    vacationReqDiag.setItems( buttons);

    vacationReqDiag.appendToBody();
    vacationReqDiag.show();
    vacationReqDiag.initDatePicker();
}


function setLogDiag(logData, chosenMounth0) {
    let LogDiagId       = 'LogDiag';
    let LogDiag         = setDialog(LogDiagId, undefined, 'out', 'remove');

    LogDiag.resetPeriod = (month0) => {
        LogDiag.close();
        HDL_Async_showLogData(month0);
    };

    let logPeriodSelectStr =
          ` <label for="logPeriodSelect">mr.${USER.nick}, отчёт за:</label>
            <select id       = "logPeriodSelect"
                    name     = "logPeriodSelect"
                    class    = "logPeriodSelect"
                    onchange = "LogDiag.resetPeriod(this.value)">
                <option value="0"  >Январь</option>
                <option value="1"  >Февраль</option>
                <option value="2"  >Март</option>
                <option value="3"  >Апрель</option>
                <option value="4"  >Май</option>
                <option value="5"  >Июнь</option>
                <option value="6"  >Июль</option>
                <option value="7"  >Август</option>
                <option value="8"  >Сентябрь</option>
                <option value="9"  >Октябрь</option>
                <option value="10" >Ноябрь</option>
                <option value="11" >Декабрь</option>
                <option value="12" >Год</option>
            </select> `;
    let logPeriodSelectContainer           = document.createElement('div');
        logPeriodSelectContainer.className = 'logPeriodSelectContainer';
        logPeriodSelectContainer.innerHTML = logPeriodSelectStr;

    LogDiag.appendChild( logPeriodSelectContainer );
    LogDiag.appendChild( setSummTable( doLogReport(logData) ) );
    LogDiag.appendChild( setLogTable(logData) );
    LogDiag.appendToBody();
    LogDiag.show();

    let logPeriodSelect                    = document.getElementById('logPeriodSelect');
        logPeriodSelect.selectedIndex      = chosenMounth0;
}//end setLogDiag

async function HDL_Async_showLogData(logMonth0 = new Date().getMonth()) {
    let logData      = LOG_DATA;
    let upDate       = logData && logData.updated;
    if ( !upDate || (Date.now() - upDate) > 50000000 ) {
        swal('Загрузка \n отчёта', {buttons: false});
        logData = await HDL_Async_getLogData()
            .then( (logData)   => console.log(logData) )
            .catch( err => {
                console.trace('HDL_Async_showLogData = ' + err );
                swal(err);
            });
        swal.close();
    }
    if (USER.nick == 'TST') { logData = LOG_DATA.Скворцов; }

    let periodLogData   = getPeriodLogData(logData, logMonth0);
    setLogDiag(periodLogData, logMonth0);
}// END HDL_Async_showLogData



function setLogTable(logData) {
    let logTable      = document.createElement('table');
        logTable.Id   = 'logTable';

    let logTbody      = document.createElement('tbody');
    let firstRowStr   =
        `<th>Дата</th>
         <th>События</th>
        `;
    logTbody.innerHTML = firstRowStr;

    for(let date in logData) {
        let dateRec = logData[date];

        let tr      = document.createElement('tr');
        let rowStr  = `<th>${date}</th>`;

        rowStr      += dateRec.shift   ? ` смена: ${dateRec.shift} `     : '';
        rowStr      += dateRec.over    ?       ` +${dateRec.over}ч. `    : '';
        rowStr      += dateRec.bonus   ?  ` бонус ${dateRec.bonus}р. `   : '';
        rowStr      += dateRec.penalty ?  ` штраф ${dateRec.penalty}р. ` : '';
        rowStr      += dateRec.notes   ?        ` ${dateRec.notes} `     : '';

        tr.innerHTML = rowStr;

        logTbody.appendChild(tr);
    }
    logTable.append(logTbody);

    return logTable;
}// end setLogTable

function setSummTable(LogReport) {
    let SummTable   = document.createElement('table');
    SummTable.Id    = 'summTable';

    let summTbody   = document.createElement('tbody');

    let rowsStr  = [
        `<th>Смены / отпуска:</th>
            <td>${LogReport.shift.cnt        || ' - '}  /
               ${LogReport.w.cnt             || ' - '}</td>
            <td>${LogReport.shift.mn   +'р.' || ' - '}  /
               ${LogReport.w.mn        +'р.' || ' - '}</td>
        `,
        `<th>Доп. часы:</th>
            <td>${LogReport.over.hr          || '-'}</td>
            <td>${LogReport.over.mn    +'р.' || '-'}</td>
        `,
        `<th>Бонусы / Штрафы:</th>
            <td>${LogReport.bonus.mn   +'р.' || 'нет'}</td>
            <td>${LogReport.penalty.mn +'р. '|| 'нет'}</td>`,
        `<th> ИТОГО: </th><td colspan="2" >${LogReport.total.mn}р.</td>`

    ];
    rowsStr.forEach( (str) => {
        let tr = document.createElement('tr');
            tr.innerHTML = str;
            summTbody.appendChild(tr);
    });


    SummTable.append(summTbody);

    return SummTable;
}// end setSummTable

function getPeriodLogData(logData, month0) {
    if (month0 == 12) return logData;
    let slicedLogData = {};
    let dateStrToDMYobj = (str) => {
        let DMYarr = str.split('.')
        let DMYobj = {
            date:   DMYarr[0],
            month1: DMYarr[1],
            year:   DMYarr[2]
        }
        return DMYobj;
    };

    for(let dateStr in logData) {
        let curDMYobj = dateStrToDMYobj(dateStr);
        if (curDMYobj.month1 - 1 == month0) {
            slicedLogData[dateStr] = logData[dateStr];
        }
    }
    return slicedLogData;
}//end getPeriodLogData



function doLogReport(logData) {
    let cost      = COST;
    let logSummary = {
            shift:   { cnt: 0, mn: 0 },
            w:       { cnt: 0, mn: 0 },
            over:    { hr:  0, mn: 0 },
            bonus:   { mn:  0 },
            penalty: { mn:  0 },
            total:   { mn:  0}
    };
    for (let date in logData) {
        let dateRec  = logData[date];
        let curShift = dateRec.shift;
        if (curShift) {
            var shCounter = { shift:0, w:0 };
            apdShiftCounter(curShift, shCounter);
            logSummary.shift.cnt += shCounter.shift ;
            logSummary.shift.mn  += shCounter.shift * cost.shift;
            logSummary.w.cnt     += shCounter.w ;
            logSummary.w.mn      += shCounter.w * cost.w;
        }//end if (curShift)
        logSummary.over.hr    += dateRec.over    || 0;
        logSummary.over.mn    += ( dateRec.over  || 0 ) * cost.hr;
        logSummary.bonus.mn   += dateRec.bonus   || 0;
        logSummary.penalty.mn -= dateRec.penalty || 0;
    }
    let totalMn = 0;
    for (let key in logSummary) {
        totalMn += logSummary[key].mn;
    }
    logSummary.total.mn = totalMn;
    return logSummary;
}

// function shiftsLogCounter(rec) {
//     var counter = { shift:0, w:0 };
//     rec.forEach( function(dayRec) {
//         apdShiftCounter(dayRec, counter);
//     });
//     return counter;
// }//end shiftsLogCounter

function apdShiftCounter(shift, counter) {
    var nonRe   = /[vsx-]+$/i,
        clearRe = /[^ДНЖW]+/gi,
        wRe     = /w/i;
    if (typeof shift != 'string') shift = shift.toString();
    var clearedShift = nonRe.test(shift) ?
                       '' :
                       shift.replace(clearRe,'');
        if ( wRe.test(clearedShift) ) {
            counter.w++ ;
        } else {
            counter.shift += clearedShift.length ;
        }
    return counter;
}// end subFn for addShiftCounter
