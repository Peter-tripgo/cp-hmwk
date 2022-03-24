var socket; // 소켓
var market='"KRW-BTC","KRW-ETH","BTC-ETH","KRW-LTC","KRW-ZRX"';
var arrMarket=["KRW-BTC","KRW-ETH","BTC-ETH","KRW-LTC","KRW-ZRX"];

// 최종결과데이터
var resultDataSet;


// 데이터 class
class ResultDataSet {
	constructor(){
		console.log("ResultDataSet Constructor");
		
		// 웹소켓으로 가져온 호가 정보가 실시간으로 최종 데이터(위 예시 형태)에 반영돼야 합니다.
		this.dataSet = {};

	}
	
	// 최종 데이터(위 예시 형태)에 반영
	update(market, orderbook_units){
		
		var orderBooks={};
		orderBooks = this.getSortedAsksBidsObject(orderbook_units); // 배열->오브젝트
		this.dataSet[market] = orderBooks;
	}
	
	// 현재 데이터 되돌려주자
	getData(){
		return this.dataSet;
	}
	
	// orderbook_units: Array(15) 로 
	getSortedAsksBidsObject(arrOrderBookUnits){
		
		var orderLength = arrOrderBookUnits.length;
		
		var arrAsks=[];
		var arrBids=[];
		
		for (var i=0;i<orderLength;i++){
			arrAsks.push({price:arrOrderBookUnits[i].ask_price, quantity:arrOrderBookUnits[i].ask_size});
			arrBids.push({price:arrOrderBookUnits[i].bid_price, quantity:arrOrderBookUnits[i].bid_size});
		}
		
		// asks는 price기준으로 오름차순, bids는 price기준으로 내림차순 정렬
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
		
		return {asks:arrAsks, bids:arrBids};
	}
	
}


// 웹소켓 연결
function connectWS() {
	if(socket != undefined){
		console.log("Socket에 뭔가 있다! 그래서 다시 연결하지 않는다.");
		return;
	}
	
	resultDataSet = new ResultDataSet();
	
	socket = new WebSocket("wss://api.upbit.com/websocket/v1");
	socket.binaryType = 'arraybuffer';

	socket.onopen 	= function(e){ 
		
			//		 [{ticket field}, {type field}, {format field}] isOnlySnapshot isOnlyRealtime

			var query = '[{"ticket":"UNIQUE_TICKET1234Featter082"},'+
			            ' {"type":"orderbook","codes":[' + market +'], "isOnlyRealtime":true}' +
	                    ']';
			console.log(query);
		
			socket.send(query);
	}
	socket.onclose 	= function(e){ 
		socket = undefined; 
	}
	socket.onmessage= function(e){ 
		var enc = new TextDecoder("utf-8");
		var arr = new Uint8Array(e.data);
		var str_d = enc.decode(arr);
		var d = JSON.parse(str_d);

		if(d.type == "orderbook") { // 호가 데이터
			processMain(d); // 웹소켓 데이터를 수신받았다면 처리를 하자.
		}
		
	}	
}
// 웹소켓 연결 해제
function closeWS() {
	if(socket != undefined){
		socket.close();
		socket = undefined;
		console.log("웹소켓을 닫았다.");
	}	
}


// 데이터 처리 (* 아래 예시 데이터 형태)
function processMain(orderbook){

	// 마켓코드
	var market = orderbook.code;	
	
	// 수신받은 데이터에서 orderbook_unit을 처리한다.
	resultDataSet.update(market,orderbook.orderbook_units);
	
	console.log(resultDataSet.getData());
}



