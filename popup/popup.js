var bg = chrome.extension.getBackgroundPage();

$(function() {
	$('#input_submit').click(function() {
		var number = $('#input_number').val();
		var password = $('#input_password').val();
		console.log(`number: ${number}, password: ${password}`);

		var conf = {
			url: '/login/login',
			type: 'GET',
			data: {
				mobile: number,
				password: password
			},
			dataType: 'JSON'
		};
		chrome.runtime.sendMessage('{type: "ajax", conf:' + JSON.stringify(conf) + '}', function(response) {
			console.log('response: ' + JSON.stringify(response));
			$('#input_submit').hide();
			$('#input_number').hide();
			$('#input_password').hide();
			if (response && response.type == 'success') {
				$('body').append('<p>Login success</p>');
			} else {
				$('body').append(`<p>Login error! msg ${response.data.responseText.message}</p>`);
			}
		});
	});
});