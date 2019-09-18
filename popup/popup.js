var bg = chrome.extension.getBackgroundPage();

$(function() {
	if (bg && bg.islogineffective()) {
		$('#loginform').hide();
		$('#logininfo').show();
		var logindata = bg.readlogindata();
		var msg = `登陆成功！\n用户：${logindata.username}\n到期时间：${logindata.expre_time}`;
		$('#loginmsg').append(msg);
	} else {
		$('#loginform').show();
		$('#logininfo').hide();
	}

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
			$('#loginform').hide();
			$('#logininfo').show();
			if (response && response.type == 'success' && response.data.code == '200') {
				bg.savelogindata(response.data);
				var msg = `登陆成功！\n用户：${response.data.username}\n到期时间：${response.data.expre_time}`;
				$('#loginmsg').empty();
				$('#loginmsg').append(msg);
				$('#logout').empty();
				$('#logout').append('Logout');
			} else {
				var msg = `登陆失败！\n信息：${response.data.message}`;
				$('#loginmsg').empty();
				$('#loginmsg').append(msg);
				$('#logout').empty();
				$('#logout').append('SignIn');
			}
		});
	});

	$('#logout').click(function() {
		var conf = {
			url: '/login/out',
			type: 'GET',
			data: {
			},
			dataType: 'JSON'
		};
		chrome.runtime.sendMessage('{type: "ajax", conf:' + JSON.stringify(conf) + '}', function(response){
			bg.clearlogindata();
			$('#loginform').show();
			$('#logininfo').hide();
		});
	});
});