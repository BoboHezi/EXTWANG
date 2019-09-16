
var lastUids = []

function Ajax(conf, callback) {
    chrome.runtime.sendMessage(conf, callback)
}

$(document).ready(function() {
    setTimeout(intervalQuery, 2000);
});

var intervalQuery = () => {
    var uids = getlistUid();
    if (uids.length > 0) {
        if (lastUids.toString() != uids.toString()) {
            lastUids = uids;
            console.log('lastUids changed: \n\t' + lastUids);
        }
    }
    setTimeout(intervalQuery, 2000);
}

function getlistUid() {
    var listUid = [];
    $('#list-container>.list-item .shop-name').each(function (i, it) {
        var par = $(it).parents('.list-item');
        var uid = $(it).attr('trace-uid');
        listUid.push(uid)
    });
    return listUid;
}