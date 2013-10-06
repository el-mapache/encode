$(document).ready(function() {
    var bytesUploaded       = 0,
        bytesTotal          = 0,
        previousBytesLoaded = 0,
        intervalTimer       = 0,
        drop                = $('#chromeDrop'),
        upld                = $('#upload'),
        submit              = $('#submit'),
        myFile          		= new Object();

    $('#formats').on({'change' : checkFormat });

    submit.click(function(e) {
        if(!($('#noEmail').is(':checked')) && !verifyEmail() && !($('#errText').length)) {
            $('<p id="errText">please enter a valid email, or select the Download Immediately option</p>')
            .insertAfter($('#noEmail'));
        } else if($('#noEmail').is(':checked') || verifyEmail() ) {
             processForm();
            $('#email').val('').end().removeClass('error');
        }
    });
    
    $('section#settings').toggle();
    

/*VERIFICATION
---------------------------*/

function verifyEmail(e) {
   var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;  
   if(emailPattern.test($('#email').val())) {
     $('#email').removeClass('error');
     return true;
   } else {
      $('#email').addClass('error');
      return false;
   }
}

function checkFormat() {
	if($(this).val() == 'flac.flac' || $(this).val() == 'libvorbis.ogg') {
		$('#bRate').prop('disabled',true);
	} else {
		$('#bRate').prop('disabled',false);
	}
}

/* AJAX FUNCTONS
---------------------------------------*/

function uploadRequest(fd) {
    var uploadResponse = document.getElementById('uploadResponse');
    document.getElementById('progressIndicator').className = 'visible';
    uploadResponse.style.display = 'block';
    var xhr = new XMLHttpRequest();
        xhr.open("post", "/upload", true);
        uploadResponse.innerHTML = '<span>converting...</span><img src="css/images/ajax-loader.gif" />';
        xhr.onreadystatechange = function() {
            clearInterval(intervalTimer);
            res = xhr.responseText;
            uploadResponse.innerHTML = res;
        }   
        
        xhr.upload.addEventListener("progress", uploadProgress, false);
        xhr.addEventListener("load", uploadComplete, false);
        xhr.addEventListener("error", uploadFailed, false);
        xhr.addEventListener("abort", uploadCanceled, false);
        xhr.send(fd);

    intervalTimer = setInterval(updateTransferSpeed, 100);     
}


function uploadComplete(evt) {
    clearInterval(intervalTimer);
    var uploadResponse = document.getElementById('uploadResponse');
        uploadResponse.innerHTML = evt.target.responseText;
        uploadResponse.style.display = 'block';
}  
  
function uploadFailed(evt) {
    clearInterval(intervalTimer);
    alert("An error occurred while uploading the file.");  
}  
  
function uploadCanceled(evt) {
    clearInterval(intervalTimer);
    alert("The upload has been canceled by the user or the browser dropped the connection.");  
}

/*PROGRESS BAR
---------------------------------*/

function updateTransferSpeed() {
    
    var currentBytes = bytesUploaded;
    var bytesDiff = currentBytes - previousBytesLoaded;
    if (bytesDiff == 0) {
        return;
    }
    
    previousBytesLoaded = currentBytes;
    bytesDiff = bytesDiff * 2;
    var bytesRemaining = bytesTotal - previousBytesLoaded;
    var secondsRemaining = bytesRemaining / bytesDiff;
    var speed = "";
    
    if (bytesDiff > 1024 * 1024)
        speed = (Math.round(bytesDiff * 100/(1024*1024))/100).toString() + 'MBps';
    else if (bytesDiff > 1024)
        speed = (Math.round(bytesDiff * 100/1024)/100).toString() + 'KBps';
    else
        speed = bytesDiff.toString() + 'Bps';
    
    var b = document.getElementById('transferSpeedInfo').innerHTML = speed;
}

function secondsToString(seconds) {        
    var h = Math.floor(seconds / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 3600 % 60);
    
    return ((h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "0:") + (s < 10 ? "0" : "") + s);
}

function uploadProgress(evt) {
    if (evt.lengthComputable) {
        bytesUploaded = evt.loaded;
        bytesTotal = evt.total;
        
        var percentComplete = Math.round(evt.loaded * 100 / evt.total);
        var bytesTransfered = '';
          
          if (bytesUploaded > 1024*1024)
            bytesTransfered = (Math.round(bytesUploaded * 100/(1024*1024))/100).toString() + 'MB';
          else if (bytesUploaded > 1024)
            bytesTransfered = (Math.round(bytesUploaded * 100/1024)/100).toString() + 'KB';
          else
            bytesTransfered = (Math.round(bytesUploaded * 100)/100).toString() + 'Bytes';
        
        document.getElementById('progressNumber').innerHTML = percentComplete.toString() + '%';
        document.getElementById('progressBar').style.display = 'block';
        document.getElementById('progressBar').style.width = (percentComplete * 3.55).toString() + 'px';
        document.getElementById('transferBytesInfo').innerHTML = 'Upload Total: ' + bytesTransfered;
    } 
}

});
