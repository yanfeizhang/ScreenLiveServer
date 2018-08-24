
class Util {
	
	/*
	 * 调试打印fmp4 arraybuffer里的各个box
	 */
	static printFmp4Box(buf){
	
		console.log("buf.byteLength:"+buf.byteLength);
		
		var start=0
		while(start<buf.byteLength){		
			var boxLenArray = new Uint8Array(buf, start, 4);		
			var boxLen = Util._tranUint8ArrayToInt(boxLenArray);
			var boxName = new Uint8Array(buf,start+4,4);
			Util._printfUint8ArrayByString(boxName);
			console.log("boxLen:"+boxLen);
			
			start=start+boxLen;
			
			if(boxLen==0){//some error accur.
				break;
			}
		}
	}
	
	/*
	 * 十六进制方式打印数组
	 */
	static printfArrayHex(values){
		var hex="";
		for(var i=0; i< values.length; i++){
			hex = hex + " " + values[i].toString(16);
		}
		console.log(hex);
	}
	
	static _tranUint8ArrayToInt(uint8array){
		var r= new Uint32Array(1);
		r[0] = (uint8array[0] & 0xFF) << 24;
		r[0] = r[0] | (uint8array[1] & 0xFF) << 16;
		r[0] = r[0] | (uint8array[2] & 0xFF) << 8;
		r[0] = r[0] | (uint8array[3] & 0xFF);		
		return r[0];
	}	

	static _printfUint8ArrayByString(values){
		var str="";
		for(var i=0; i< values.length; i++){
			str = str + " " + String.fromCharCode(values[i]);
		}
		console.log(str);
	}

	/*
	 * 转换string为Uint8Array
	 */
	static str2ab(str) {
		var buf = new ArrayBuffer(str.length); // 2 bytes for each char
		var bufView = new Uint8Array(buf);
		for (var i=0, strLen=str.length; i<strLen; i++) {
		bufView[i] = str.charCodeAt(i);
		}
		return bufView;
	}
}
