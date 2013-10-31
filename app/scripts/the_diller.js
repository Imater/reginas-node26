if(false) {
	var diller = {
		holding_name: "Регинас",
		logo_image: "images/logo-mini.png",
		logo_image_big: "images/logo.png"
	}
	if( typeof global != 'undefined' ) {
		global.database = "h116";
		global.sms_sender = "Reginas-FPK";
	}

} else {
	var diller = {
		holding_name: "Т-Моторс",
		logo_image: "images/logo-mini-t.png",
		logo_image_big: "images/logo-t.png"
	}	
	if( typeof global != 'undefined' ) {
		global.database = "h117";
		global.sms_sender = "T-Motors";
	}
}
