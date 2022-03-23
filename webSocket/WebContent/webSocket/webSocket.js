var socket; // 소켓
var market='"KRW-BTC","KRW-ETH","BTC-ETH","KRW-LTC","KRW-ZRX"';
var arrMarket=["KRW-BTC","KRW-ETH","BTC-ETH","KRW-LTC","KRW-ZRX"];

// 최종결과데이터
var resultDataSet={};


//최종 데이터 class
class ResultDataSet {
	constructor(arrMarket){
		console.log("ResultDataSet Constructor");
		
		// 웹소켓으로 가져온 호가 정보가 실시간으로 최종 데이터(위 예시 형태)에 반영돼야 합니다.
		this.dataSet = {};

	}
	
	// 최종 데이터(위 예시 형태)에 반영
	update(market, orderBooks){
		this.dataSet[market] = orderBooks;
	}
	
	// 현재 데이터 되돌려주자
	getData(){
		return this.dataSet;
	}
	
}


// 웹소켓 연결
function connectWS() {
	if(socket != undefined){
		socket.close();
	}
	
	resultDataSet = new ResultDataSet(arrMarket);
	
	socket = new WebSocket("wss://api.upbit.com/websocket/v1");
	socket.binaryType = 'arraybuffer';

	socket.onopen 	= function(e){ 
		
//		 [{ticket field}, {type field}, {format field}] isOnlySnapshot isOnlyRealtime

			var query = '[{"ticket":"UNIQUE_TICKET1234Featter082"},'+
			            ' {"type":"orderbook","codes":[' + market +'], "isOnlySnapshot":true}' +
	                    ']';
			console.log(query);

		
		filterRequest(query);
	}
	socket.onclose 	= function(e){ 
		socket = undefined; 
	}
	socket.onmessage= function(e){ 
		var enc = new TextDecoder("utf-8");
		var arr = new Uint8Array(e.data);
		var str_d = enc.decode(arr);
		var d = JSON.parse(str_d);
		if(d.type == "ticker") { // 현재가 데이터
		// TODO
		}
		if(d.type == "orderbook") { // 호가 데이터
		// TODO
		}
		if(d.type == "trade") { // 체결 데이터
		// TODO
		}
		processMain(d);
	}	
}
// 웹소켓 연결 해제
function closeWS() {
	if(socket != undefined){
		socket.close();
		socket = undefined;
	}	
}

// 웹소켓 요청
function filterRequest(filter) {
	if(socket == undefined){
		alert('no connect exists');
		return;
	}
	socket.send(filter);
}

connectWS();

// data processing
function processMain(orderbook){

	var market = orderbook.code;	
	var orderBooks={};
	orderBooks[market] = getSortedAsksBidsObject(orderbook.orderbook_units); // 배열->오브젝트
	
	resultDataSet.update(market,orderBooks[market]);
	
	
	console.log("orderBOoks:" +resultDataSet.getData());
}

// orderbook_units: Array(15) 로 
function getSortedAsksBidsObject(arrOrderBookUnits){
	
	var orderLength = arrOrderBookUnits.length;
	
	var arrAsks=[];
	var arrBids=[];
	
	for (var i=0;i<orderLength;i++){
		arrAsks.push({price:arrOrderBookUnits[i].ask_price, quantity:arrOrderBookUnits[i].ask_size});
		arrBids.push({price:arrOrderBookUnits[i].bid_price, quantity:arrOrderBookUnits[i].bid_size});
	}
	console.log(arrAsks);
	
	arrAsks.sort(function (a, b) {
		  if (a.ask_price > b.ask_price) {
		    return 1;
		  }
		  if (a.ask_price < b.ask_price) {
		    return -1;
		  }
		  // a must be equal to b
		  return 0;
		});
	
	arrBids.sort(function (a, b) {
		  if (a.bids_price < b.bids_price) {
			    return 1;
			  }
			  if (a.bids_price > b.bids_price) {
			    return -1;
			  }
			  // a must be equal to b
			  return 0;
			});
	
	console.log(arrBids);
	
	return {asks:arrAsks, bids:arrBids};
}

