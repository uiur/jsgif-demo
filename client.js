// Array{DOM Image} -> callback(dataURL)
function createGIF (args, callback) {
  var images = args.images || [];
  var option = {
    delay: args.delay || 100,
    repeat: args.repeat || 0,  // default: auto loop
    width: args.width || 400,
    height: args.height || 400
  };

  var canvas = $('#canvas')[0];
  var context = canvas.getContext('2d');

  canvas.width = option.width;
  canvas.height = option.height;

  // GIFは透明にできないから白色で塗る
  context.fillStyle = "rgb(255,255,255)";  
  context.fillRect(0, 0, canvas.width, canvas.height);

  var worker = new Worker('encoder.js');

  worker.postMessage({ cmd: 'start', data: option });

  images.forEach(function (image) {
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Workerにフレームのデータを送る
    worker.postMessage({ cmd: 'frame', data: context.getImageData(0, 0, canvas.width, canvas.height).data });

    context.fillRect(0, 0, canvas.width, canvas.height);
  });

  worker.postMessage({ cmd: 'finish' });

  worker.onmessage = function (e) {
    callback('data:image/gif;base64,' + encode64(e.data));
  };
}

// from https://github.com/antimatter15/jsgif/blob/master/Demos/b64.js
function encode64(input) {
	var output = "", i = 0, l = input.length,
	key = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", 
	chr1, chr2, chr3, enc1, enc2, enc3, enc4;
	while (i < l) {
		chr1 = input.charCodeAt(i++);
		chr2 = input.charCodeAt(i++);
		chr3 = input.charCodeAt(i++);
		enc1 = chr1 >> 2;
		enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
		enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
		enc4 = chr3 & 63;
		if (isNaN(chr2)) enc3 = enc4 = 64;
		else if (isNaN(chr3)) enc4 = 64;
		output = output + key.charAt(enc1) + key.charAt(enc2) + key.charAt(enc3) + key.charAt(enc4);
	}
	return output;
}

$(function () {
  var srcs = ['sozai/1.jpg', 'sozai/2.jpg'];

  var images = srcs.map(function (src) {
    var image = new Image();
    image.src = src;
    return image;
  });

  // 画像が全ロードされるまで待つ
  window.onload = function() {
    createGIF({ images: images }, function (dataURL) {
      $("#image").attr('src', dataURL);
    });
  };
}());
