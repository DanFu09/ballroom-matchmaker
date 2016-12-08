function verify_num(numstr, pos) {
	if (!isNaN(parseInt(numstr))) {
		return parseInt(numstr);
	} else {
		alert("Data format is bad at token number: " + pos + "\nbad token: "+ numstr);
		throw new Error("Data format bad at token: " + numstr)
	}
}

var dance_hsens = [], dance_names = [];
var dancers = [];

function match_maker(str) {
	//No more newlines
	var tokens = str.replace(/(\r\n|\n|\r)/gm,"").split(',');
	//alert(tokens.length);

	var phase = 0, ctr = 0;
	var d, n;
	var donereading = 0;
	var i = 0;
	while (i < tokens.length) {
		tn = tokens[i];
		//alert(tn);
		switch(phase) {
			case 0:
				//Read number of dances
				d = verify_num(tn, i);
				//alert(d);
				phase++;
				i++;
				break;
			case 1:
				//Read dance names and height sensitivity
				if (ctr % 2 == 0) {
					dance_names.push(tn);
					//alert(dance_names.join(" | "));
				} else {
					dance_hsens.push(verify_num(tn,i));
					//alert(dance_hsens.join(" | "));
				}
				ctr++;
				if (ctr == 2 * d) {
					phase++;
					ctr = 0;
				}
				i++;
				break;
			case 2:
				//Read number of dancers to be paired
				n = verify_num(tn, i);
				//alert(n);
				phase++;
				i++;
				break;
			case 3:
				//Read the dancer info
				var dnr = {};
				dnr.name = tokens[i++];
				dnr.height = verify_num(tokens[i++], i);
				dnr.nonb_dan_expr = verify_num(tokens[i++], i);
				dnr.less_att = verify_num(tokens[i++], i);
				dnr.practice = verify_num(tokens[i++], i);
				dnr.b_dan_expr = verify_num(tokens[i++], i);
				dnr.ndances = verify_num(tokens[i++], i);
				dnr.dances = [];
				for (var j = 0; j < dnr.ndances; j++) {
					var dance_match = {};
					dance_match.dance_num = verify_num(tokens[i++], i);
					dance_match.role = verify_num(tokens[i++], i);
					dance_match.partner_name = tokens[i++];
					//console.log(dance_match);
					dnr.dances.push(dance_match);
				}
				//console.log(dnr);
				dancers.push(dnr);
				ctr++;
				if (ctr == n) {
					donereading = 1;
					phase++;
				}
				break;
			default:
				throw new Error("Data format not correct. Reading past EOF");
				break;
		}
	}
	console.log(dancers);
	//alert(dance_names.join(' | '));
	//alert(dance_hsens.join(' | '));
}