
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
	
	/*
	 * 将blob保存为文件
	 */
	static saveAs(blob, filename) {
		var type = blob.type;
		var force_saveable_type = 'application/octet-stream';
		if (type && type != force_saveable_type) { // 强制下载，而非在浏览器中打开`
			var slice = blob.slice || blob.webkitSlice || blob.mozSlice;
			blob = slice.call(blob, 0, blob.size, force_saveable_type);
		}

		var url = URL.createObjectURL(blob);
		var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
		save_link.href = url;
		save_link.download = filename;

		var event = document.createEvent('MouseEvents');
		event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		save_link.dispatchEvent(event);
		URL.revokeObjectURL(url);
	}	
	
	/*
	 * 合并box
	 */	
	static mergeBox(ftyp, moov, moof, mdat){
		var result = new Uint8Array(ftyp.byteLength + moov.byteLength + mdat.byteLength + moof.byteLength);
		
		result.set(ftyp, 0);
		result.set(moov, ftyp.byteLength);
		result.set(moof, ftyp.byteLength + moov.byteLength);
		result.set(mdat, ftyp.byteLength + moov.byteLength + moof.byteLength);
		
		return result.buffer;
	}
	
	/*
	 * 解析mp4帧，主要是解析其中的二进制串
	 */	
	static parseMp4Samples(frames){		
		console.log("parseMp4Samples--------------------------------------------");
		
		var mp4Samples = [];	
		for(var i in frames){
			var frame = frames[i];
			//console.log("i "+ frame.size);
			
			var units = [];
			var data = Util.str2ab(window.atob(frame.units));
			var unit = { type: 0, data: data };
			units.push(unit);
			frame.units = units;
			
			mp4Samples.push(frame);
			console.log(frame);
		}
		return mp4Samples;
	}
	
	/*
	 * 构造mdat
	 */	
	static mdat(mp4Samples){
		console.log("making mdat-----------------------------------");
		
		var mdatBytes = Util._calcMdatBytes(mp4Samples);
		console.log("mdatBytes: "+mdatBytes);
		
		// allocate mdatbox
		mdat = new Uint8Array(mdatBytes);
		mdat[0] = mdatBytes >>> 24 & 0xFF;
		mdat[1] = mdatBytes >>> 16 & 0xFF;
		mdat[2] = mdatBytes >>> 8 & 0xFF;
		mdat[3] = mdatBytes & 0xFF;
		mdat.set(MP4.types.mdat, 4);
						
		// Write samples into mdat
		var offset = 8;
		for (var _i2 = 0; _i2 < mp4Samples.length; _i2++) {
			var units = mp4Samples[_i2].units;
			while (units.length) {
				var unit = units.shift();
				var data = unit.data;
				console.log(_i2 + " " + data.byteLength);
				mdat.set(data, offset);
				offset += data.byteLength;
				//console.log(offset);
			}				
		}
		return mdat;
	}
	
	static _calcMdatBytes(mp4Samples){
		var mdatBytes = 8;
		for(var i in mp4Samples){
			mdatBytes = mdatBytes + mp4Samples[i].size;
		}
		return mdatBytes;
	}
	
	/*
	 * 构造moof
	 */	
	static moof(mp4Samples){
		var track={};
		track.id=1;
		track.type="video";
		track.length=0;
		track.samples=mp4Samples;
		track.sequenceNumber=1;	

		var firstDts=0;		
		var moof =MP4.moof(track, firstDts);
		return moof;
	}
}
