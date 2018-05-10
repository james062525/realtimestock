//
/*
 * global variable: selectedStockID
 * @returns {object} global arMonitorStocks
 */
function getMyEvent() {
  $('#submit').click(function() {
    if (selectedStockID !== '') {
      stockCheck(selectedStockID).then(function(result) {
        if (result === true) {
          var obj = {};
          obj.key = selectedStockID;
          var myMonitorStocks = getMonitorStocks();
          myMonitorStocks.push(obj);
          saveMonitorStocks(myMonitorStocks);
          arMonitorStocks = myMonitorStocks;
          appendShowme(selectedStockID, selectedStockName);
          selectedStockID = '';
          $('.myinput').val('');
        }
      });
    }
  });

  $('.showme')
    .on('mouseenter', '.rank', function() {
      $(this)
        .find('td.trig')
        .css('display', 'inline');
      $(this).css('background', '#AFD7FF');
    })
    .on('mouseleave', '.rank', function() {
      $(this)
        .find('td.trig')
        .css('display', 'none');
      $(this).css('background', 'none');
    })
    .on('click', '.rank', function() {
      var rank = '#' + $(this).attr('id');
      var arNumber = rank.split('_');
      $(rank).detach();
      arMonitorStocks = removeMonitorStock(arMonitorStocks, arNumber[1]);
      saveMonitorStocks(arMonitorStocks);
    });
}

/*
 * @param {object} array
 * @param {number} index_number
 * @return {object} newarray
 */
function removeMonitorStock(array) {
  var index = arguments[1];
  array.splice(index, 1);
  return array;
}

/*
 * @param {string} id
 * @param {string} name
 */
function appendShowme(szStockid, szStockName) {
  var lastItem = arMonitorStocks.length - 1;
  var szhtml =
    '<tr class="rank" id="rank_' +
    lastItem +
    '">' +
    '<td>' +
    szStockName +
    '</td>' +
    '<td>--</td>' +
    '<td>--</td>' +
    '<td>--</td>' +
    '<td>--</td>' +
    '<td>--</td>' +
    '<td>--</td>' +
    '<td>--</td>' +
    '<td class="trig" data-value="' +
    szStockid +
    '">刪除</td>' +
    '</tr>';
  $('.showme').append(szhtml);
}

function getData(data) {
  $('.rank').detach();
  for (var i in data.msgArray) {
    var stock_ch = data.msgArray[i].ch.slice(0, -3);
    var stock_n = '<td>' + data.msgArray[i].n + '</td>';
    if (typeof data.msgArray[i].o === 'undefined') {
      var stock_z = '<td>--</td>';
      var stock_tv = '<td>--</td>';
      var stock_v = '<td>--</td>';
      var stock_o = '<td>--</td>';
      var stock_h = '<td>--</td>';
      var stock_l = '<td>--</td>';
      var stock_t = '<td>--</td>';
    } else {
      var stock_z = '<td>' + data.msgArray[i].z + '</td>';
      var stock_tv =
        '<td>' + (data.msgArray[i].z - data.msgArray[i].y).toFixed(2) + '</td>';
      var stock_v = '<td>' + data.msgArray[i].v + '</td>';
      var stock_o = '<td>' + data.msgArray[i].o + '</td>';
      var stock_h = '<td>' + data.msgArray[i].h + '</td>';
      var stock_l = '<td>' + data.msgArray[i].l + '</td>';
      var stock_t = '<td>' + data.msgArray[i].t + '</td>';
    }
    var mycolor = '<tr class="rank" id="rank_' + i + '" ';
    if (i % 2 === 0) {
      mycolor += 'style="color: blue">';
    } else {
      mycolor += 'style="color: black">';
    }
    var szhtml =
      mycolor +
      stock_n +
      stock_z +
      stock_tv +
      stock_v +
      stock_o +
      stock_h +
      stock_l +
      stock_t +
      '<td class="trig" data-value="' +
      stock_ch +
      '">刪除</td>' +
      '</tr>';
    $('.showme').append(szhtml);
  }
}

function failGetData() {
  setTimeout(function() {
    clearInterval(refreshInterval);
    console.log('a.clear interval');

    sendRequest();
    console.log('b.send again');

    refreshInterval = setInterval(sendRequest, 180000);
    console.log('c.reset interval');
  }, 180000);
}

function sendRequest() {
  var myMonitorStocks = getMonitorStocks();
  if (myMonitorStocks.length === 0) {
    return;
  }

  var time = +new Date();
  var stockid = 'tse_' + myMonitorStocks[0].key + '.tw';
  if (myMonitorStocks.length > 1) {
    for (var i = 1; i < myMonitorStocks.length; i++) {
      stockid += '%7ctse_' + myMonitorStocks[i].key + '.tw';
    }
  }
  var locate =
    'http://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=' +
    stockid +
    '%7c&cp=0&json=1&delay=0&_=' +
    time;

  $.ajax({
    type: 'GET',
    url: locate,
    dataType: 'JSON',
    success: function(data) {
      if (data.rtcode === '0000') {
        if (typeof data.msgArray === 'undefined') {
          failGetData();
        } else {
          getData(data);
          $('#waiting').removeClass('show');
        }
      } else {
        failGetData();
      }
    },
    error: function() {
      failGetData();
    }
  });
}

function initRequest() {
  var server = 'http://mis.twse.com.tw';
  var url = server + '/stock/index.jsp';
  var xhr = new XMLHttpRequest();
  try {
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Accept-Language', 'zh-TW');
    xhr.send();
  } catch (e) {
    console.log(e);
  }
}

var selectedStockID;
var selectedStockName;

function initStockList() {
  $('#autocomplete').autocomplete({
    delay: 50,
    lookup: stockList,
    onSelect: function(suggestion) {
      var sz = suggestion.value.split(' ');
      selectedStockName = sz[1];
      selectedStockID = suggestion.data;
    }
  });
}

var arMonitorStocks = [];
var refreshInterval;
function init() {
  $('#waiting').addClass('show');
  arMonitorStocks = getMonitorStocks(); // get required stocks list
  initStockList(); // initialize jquery autocomplete function

  initRequest();
  setTimeout(function() {
    getMyEvent();
    refreshInterval = setInterval(sendRequest, 180000);
  }, 6000);
  sendRequest();

  return false;
}

$(document).ready(function() {
  return init();
});

/**
 * @returns {(object|Array)} array
 */
function getMonitorStocks() {
  var szStockList = localStorage.getItem('stocklist');
  var arStockList = [];
  if (szStockList === null) {
    arStockList = [{key: 't00'}];
    saveMonitorStocks(arStockList);
    szStockList = JSON.stringify(arStockList);
  }
  return JSON.parse(szStockList);
}

/**
 * @param {(object|Array)} a
 */
function saveMonitorStocks(arStockList) {
  if (arStockList.length === 0 || arStockList === null) {
    arStockList = [{key: 't00'}];
  }
  localStorage.setItem('stocklist', JSON.stringify(arStockList));
}

function stockCheck(stock) {
  return new Promise(function(resolve, reject) {
    var hostname = 'mis.twse.com.tw';
    var apiBaseUrl = 'http://' + hostname + '/stock/api/';
    var logname = apiBaseUrl + 'getStock.jsp?ch=' + stock + '.tw&json=1';
    var bReturn = false;
    $.getJSON(logname, function(data) {
      if (data.rtcode === '0000') {
        if (data.msgArray.length === 0) {
          alert('查無此股票');
        } else if (data.msgArray.length === 1) {
          bReturn = true;
        }
      }
      resolve(bReturn);
    });
  });
}
