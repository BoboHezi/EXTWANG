
function Ajax(conf, callback) {
    chrome.runtime.sendMessage(conf, callback)
}

$(document).ready(function() {
    setTimeout(intervalQuery, 2000);
});

var intervalQuery = () => {
    var uids = getlistUid();
    if (uids.length <= 0) {
        setTimeout(intervalQuery, 5000);
    }    
}

function getlistUid() {
    var listUid = [];
    $('#list-container>.list-item .shop-name').each(function (i, it) {
        var par = $(it).parents('.list-item');
        if (par && par.attr('GaoHao-IsSearch') === "true") return;
        var uid = $(it).attr('trace-uid');
        listUid.push(uid)
    });
    console.log('getlistUid: ' + listUid);
    return listUid;
}