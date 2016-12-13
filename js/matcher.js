function verify_num(numstr, pos) {
	if (!isNaN(parseInt(numstr))) {
		return parseInt(numstr);
	} else {
		alert("Data format is bad at token number: " + pos + "\nbad token: "+ numstr);
		throw new Error("Data format bad at token: " + numstr)
	}
}

function trim_spaces(array_of_str) {
	if (array_of_str) {
		for (var i = 0; i < array_of_str.length; i++) {
			array_of_str[i] = array_of_str[i].trim();
		}
	}
	return array_of_str;
}

var dance_hsens = [], dance_names = [];
var dancers = {};
var d, n;

function process_input(str) {
	//No more newlines
	var tokens = str.replace(/(\r\n|\n|\r)/gm,"").split(';');
	//alert(tokens.length);
	tokens.pop(); //Remove last element
	//console.log(tokens);

	var phase = 0, ctr = 0;
	var donereading = 0;
	var i = 0;
	while (i < tokens.length) {
		var tn = tokens[i];
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
				dnr.email = tokens[i++];
				dnr.height = verify_num(tokens[i++], i);
				
				dnr.dances = trim_spaces(tokens[i++].split(','));
				dnr.ndances = Object.keys(dnr.dances).length;
				
				dnr.role = tokens[i++].toLowerCase();
				dnr.practice = verify_num(tokens[i++], i);
				dnr.less_att = verify_num(tokens[i++], i);
				dnr.b_dan_expr = verify_num(tokens[i++], i);
				dnr.nonb_dan_expr = verify_num(tokens[i++], i);
				dnr.nogo = trim_spaces(tokens[i++].split(','));
				
				dnr.preferences = {};
				for (var j = 0; j < d; j++) {
					if (dnr.dances.indexOf(dance_names[j]) != -1) {
						dnr.preferences[dance_names[j]] = trim_spaces(tokens[i++].split(','));
					} else {
						i++; //Increase the token
					}
				}
				//console.log(dnr);
				dnr.index = ctr;
				dancers[dnr.name] = dnr;
				ctr++;
				if (ctr == n) {
					donereading = 1;
					phase++;
				}
				break;
			default:
				alert("Error: Data format not correct. Reading past EOF");
				throw new Error("Data format not correct. Reading past EOF");
		}
	}
	if (!donereading) {
		alert("Error: Not enough data!");
		throw new Error("Error: I don't have enough data!");
	}
	
	//console.log(dancers);
	init_matching();
	//alert(dance_names.join(' | '));
	//alert(dance_hsens.join(' | '));
}

//Find the person's dancing object based off their index
function objectOfIndex(i) {
	if (i == -1) {
		var TBAguy = {};
		TBAguy.name = "TBA";
		return TBAguy;
	}
	for (var key in dancers) {
		if (dancers[key].index == i) {
			return dancers[key];
		}
	}
	return -1;
}

//Given a matching, returns an array of dictionaries. Each dancer's index refers to a
//dictionary with keys = the dance names and the values referring to each dancer's partnership
//within that.
function get_partner_assignments(matching) {
	var dancer_partners = [];
	for (var i = 0; i < n; i++) {
		dancer_partners.push({});
	}
	for (var j = 0; j < dance_names.length; j++) {
		var dname = dance_names[j];
		for (var k = 0; k < matching[dname].length; k++) {
			if (matching[dname][k][0] != -1) {
				dancer_partners[matching[dname][k][0]][dname] = matching[dname][k];
			}
			if (matching[dname][k][1] != -1) {
				dancer_partners[matching[dname][k][1]][dname] = matching[dname][k];
			}
		}	
	}
	return dancer_partners;
}

// Stringify the partner assignments in a human-readable way.
// Makes it in a more human-readable string.
function stringify_partner_assignments(matching) {
	var partnering = get_partner_assignments(matching);
	var outstr = "";
	for (var i = 0; i < partnering.length; i++) {
		var myobject = objectOfIndex(i);
		outstr += myobject.name + ":\n";
		for (var key in partnering[i]) {
			outstr += "\t" + key + " - " +
			objectOfIndex(partnering[i][key][0]).name +
			" leads " + objectOfIndex(partnering[i][key][1]).name + "\n";
		}
	}
	return outstr
}

// Returns a score for a possible matching
function matching_score(matching) {
	//Construct an object that has the partner data for each index
	var dancer_partners = get_partner_assignments(matching);
	var cost = 0;
	var totalst = {}; //Total statistics
	totalst.nonTBA = 0, totalst.TBA = 0, totalst.dupdances = 0, totalst.opprole = 0, totalst.matches = 0, totalst.nogos = 0, totalst.badheight = 0, totalst.goodexpr = 0, totalst.partopprole =0;
	
	//Go through each partnership and assign partners. Will basically go through each partnership twice.
	for (var i = 0; i < dancer_partners.length; i++) {
		var myobject = objectOfIndex(i);
		var mydances = dancer_partners[i];
		var st = {};
		st.nonTBA = 0, st.TBA = 0, st.dupdances = 0, st.opprole = 0, st.matches = 0, st.nogos = 0, st.badheight = 0, st.goodexpr = 0, st.partopprole = 0;
		var partners = [];
		for (var key in mydances) {
			var partner = mydances[key][0] != i ? mydances[key][0] : mydances[key][1];
			var partner_object = objectOfIndex(partner);
			partners.push(partner);
			if (partner == -1) {
				//TBA
				st.TBA++;
				//Role matching
				if ((myobject.role == "lead" && mydances[key][1] == i) || (myobject.role == "follow" && mydances[key][0] == i)) {
					st.opprole++;
				}
			} else {
			st.nonTBA++;
				//Preference matching
				if (myobject.preferences[key].indexOf(partner_object.name) != -1 && partner_object.preferences[key].indexOf(myobject.name) != -1) {
					st.matches++;
				} else if (myobject.nogo.indexOf(partner) ) {
					st.nogos++;
				}
				//Height matching
				if (dance_hsens[dance_names.indexOf(key)]) {
					var heightdiff = objectOfIndex(mydances[key][0]).height - objectOfIndex(mydances[key][1]).height;
					if (heightdiff == 4 || heightdiff == 5) {
						st.badheight--;	
					} else if (heightdiff < 2 && heightdiff > 7) {
						st.badheight++;
					}
					
				}
				//Experience matching
				if (myobject.b_dan_expr == partner_object.b_dan_expr || 
				Math.abs(myobject.nonb_dan_expr  - partner_object.nonb_dan_expr) < 2) {
					st.goodexpr++;
				}
				if (Math.abs(myobject.less_att - partner_object.less_att) < 2) {
					st.goodexpr++;	
				}
				//Role matching
				if ((myobject.role == "lead" && mydances[key][1] == i) || (myobject.role == "follow" && mydances[key][0] == i)) {
					st.opprole++;
				}
				//Partner Role Matching
				if ((partner_object.role == "lead" && mydances[key][1] == partner) || (partner_object.role == "follow" && mydances[key][0] == partner)) {
					st.partopprole++;
				}
			}
		}
		//Count duplicates
		var counts = {};
		partners.forEach(function(x) { counts[x] = (counts[x] || 0)+1; });
		for (var key in counts) {
			if (counts[key] > 1) {
				st.dupdances += counts[key];
			}
		}
		
		//Calculate the cost!
		st.cost = st.TBA * 1000 / (st.nonTBA + 1e-2) + 50 * st.dupdances * st.dupdances + 50 * st.opprole * st.opprole
		+ 10 * st.badheight + -30 * st.matches + -2 * st.goodexpr + 10 * st.partopprole * st.partopprole * d / (myobject.ndances + 1e-2);
		
		if (isNaN(st.cost)) {
			console.log(st);
		}
		
		//console.log(st);
		cost += st.cost;
		for (var key in st) {
			totalst[key] += st[key];
		}
	}
	//console.log(totalst);
	return cost;
}


// Turns a matching into a string
/*
dance_num:leader_num,follower_num;leader_num,follower_num;...\n
dance_num:leader_num,follower_num;leader_num,follower_num;...\n

TBA indicated by -1
*/
function serialize_matching(matching) {
	var ret_str = ""
	for (var i = 0; i < dance_names.length; i++) {
		var dance_name = dance_names[i];
		var ret_str = ret_str +  i + ":"
		var pairings = matching[dance_name];
		for (var j = 0; j < pairings.length; j++) {
			ret_str += pairings[j][0] + "," + pairings[j][1]
			if (j < pairings.length - 1) {
				ret_str += ";"
			}
		}
		ret_str += "\n";
	}
	
	return ret_str;
}

// Turns a string into a matching
function deserialize_matching(matching_str) {
	var ret_matching = {};
	var dances = matching_str.split("\n");
	for (var i = 0; i < dances.length; i++) {
		var dance_matching = dances[i];
		if (dance_matching.length == 0) {
			continue;
		}	
		var dance_idx = verify_num(dance_matching.split(":")[0], 0);
		var dance_name = dance_names[dance_idx];
		ret_matching[dance_name] = [];
		var pairings = dance_matching.split(":")[1].split(";");
		for (var j = 0; j < pairings.length; j++) {
			var pairing = pairings[j];
			var match = pairing.split(",")
			ret_matching[dance_name].push([verify_num(match[0], 0), 
				verify_num(match[1], 0)]);
		}
	}
	
	return ret_matching;
}

function shuffle(array) {
    var counter = array.length;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        var index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        var temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

// creates an initial matching
// first, matches up based on preference
// then tries to match up based on role
// then basically randomly assigns everyone else
function init_matching() {
	if (Object.keys(dancers).length == 0) {
		return {}	
	}
	
	var stillNeedMatching = {};
	var matching = {};
	var matched_already = {};
	// loop through each dance
	for (var i = 0; i < dance_names.length; i++) {
		var dance_name = dance_names[i];
		
		// first, make a list of dancers that need matching
		stillNeedMatching[dance_name] = [];
		for (var dancer_name in dancers) {
			var dancer = dancers[dancer_name];
			if (dancer.dances.indexOf(dance_name) != -1) {
				stillNeedMatching[dance_name].push(dancer_name);
			}
		}
		
		// next, match up dancers that list each other for preferences
		matching[dance_name] = [];
		matched_already[dance_name] = [];
		for (var j = 0; j < stillNeedMatching[dance_name].length; j++) {
			var dancer_name = stillNeedMatching[dance_name][j];
			var dancer = dancers[dancer_name];
			if (matched_already[dance_name].indexOf(dancer_name) != -1) {
				continue;
			}
			// see if this dancer has any two way matchings
			for (var k = 0; k < dancer.preferences[dance_name].length; k++) {
				var pref = dancer.preferences[dance_name][k];
				// ignore dancers that have already been sorted or where
				//   lead/follow doesn't match
				if (!(pref in dancers) || 
					matched_already[dance_name].indexOf(pref) != -1 ||
					(dancers[pref].role == dancer.role && dancer.role != "both")
				) {
					continue;
				}
				if (dance_name in dancers[pref].preferences &&
					dancers[pref].preferences[dance_name].indexOf(dancer_name) != -1) {
					// we have a match!
					matched_already[dance_name].push(dancer_name);
					matched_already[dance_name].push(pref);
					if (dancer.role == "lead" ||
						dancers[pref].role == "follow" ||
						(dancer.role == "both" && dancer.height > 
						dancers[pref].height)) {
						matching[dance_name].push(
							[dancer.index, dancers[pref].index]);
					} else {
						matching[dance_name].push(
							[dancers[pref].index, dancer.index]);
					}
					break;
				}
			}
		} // for
		
		// remove the dancers we've matched from stillNeedMatching
		for (var j = 0; j < matched_already[dance_name].length; j++) {
			var ind = stillNeedMatching[dance_name].indexOf(
				matched_already[dance_name][j]);
			stillNeedMatching[dance_name].splice(ind, 1);
		}
		
		// now, shuffle stillNeedMatching
		stillNeedMatching[dance_name] = shuffle(stillNeedMatching[dance_name]);
		
		// go through the dancers that need matching, find another dancer of
		// right lead/follow preference and make a matching
		while (stillNeedMatching[dance_name].length > 0) {
			var num_leads = 0;
			var num_follows = 0;
			var num_both = 0;
			for (var j = 0; j < stillNeedMatching[dance_name].length; j++) {
				var dancer = stillNeedMatching[dance_name];
				switch (dancer.role) {
					case "lead":
						num_leads++;
						break;
					case "follow":
						num_leads++;
						break;
					case "both":
						num_both++;
						break;
					default:
						break;
				}
			}
			
			// break if out of leads or follows
			if (num_both == 0 && (num_leads == 0 || num_follows == 0)) {
				break;
			}
			
			var can_use_both = (num_leads == 0 || num_follows == 0);
			
			// go through the dancers that still need matching
			for (var j = 0; j < stillNeedMatching[dance_name].length; j++) {
				var dancer_name = stillNeedMatching[dance_name][j];
				var dancer = dancers[dancer_name];
				if (matched_already[dance_name].indexOf(dancer_name) != -1 ||
					dancer.role == "both" && !can_use_both
				) {
					continue;
				}
				for (var k = 0; k < stillNeedMatching[dance_name].length; k++) {
					var partner_name = stillNeedMatching[dance_name][k];
					var partner = dancers[partner_name];
					if (partner_name == dancer_name ||
						matched_already[dance_name].indexOf(partner_name) != -1 ||
						partner.role == "both" && !can_use_both ||
						(dancer.role != "both" && partner.role != "both" &&
						dancer.role == partner.role)
					) {
						continue;
					}
					// looks like we have a match!
					matched_already[dance_name].push(dancer_name);
					matched_already[dance_name].push(partner_name);
					if (dancer.role == "lead" ||
						partner.role == "follow" ||
						(dancer.role == "both" && dancer.height > 
						partner.height)) {
						matching[dance_name].push(
							[dancer.index, partner.index]);
					} else {
						matching[dance_name].push(
							[partner.index, dancer.index]);
					}
					break;
				} // for
			} // for
			
			// remove dancers that have been matched
			for (var j = 0; j < matched_already[dance_name].length; j++) {
				var ind = stillNeedMatching[dance_name].indexOf(
					matched_already[dance_name][j]);
				if (ind == -1) {
					continue;
				}
				stillNeedMatching[dance_name].splice(ind, 1);
			} // for
		} // while
		
		stillNeedMatching[dance_name] = shuffle(stillNeedMatching[dance_name]);
		
		// now we are out of leaders or followers for this dance
		// we just match everyone else up with the first person we find
		for (var j = 0; j < stillNeedMatching[dance_name].length; j++) {
			var dancer_name = stillNeedMatching[dance_name][j];
			var dancer = dancers[dancer_name];
			if (matched_already[dance_name].indexOf(dancer_name) != -1) {
				continue;
			}
			var found_partner = false;
			for (var k = 0; k < stillNeedMatching[dance_name].length; k++) {
				var partner_name = stillNeedMatching[dance_name][k];
				var partner = dancers[partner_name];
				if (partner_name == dancer_name ||
					matched_already[dance_name].indexOf(partner_name) != -1
				) {
					continue;
				}
				// looks like we have a match!
				matched_already[dance_name].push(dancer_name);
				matched_already[dance_name].push(partner_name);
				if (dancer.height > partner.height) {
					matching[dance_name].push(
						[dancer.index, partner.index]);
				} else {
					matching[dance_name].push(
						[partner.index, dancer.index]);
				}
				found_partner = true;
				break;
			}
			if (!found_partner) {
				matched_already[dance_name].push(dancer_name);
				if (dancer.role == "lead") {
					matching[dance_name].push([dancer.index, -1]);
				} else {
					matching[dance_name].push([-1, dancer.index]);
				}
			}
		}
		
		// remove dancers that have been matched
		for (var j = 0; j < matched_already[dance_name].length; j++) {
			var ind = stillNeedMatching[dance_name].indexOf(
				matched_already[dance_name][j]);
			if (ind == -1) {
				continue;
			}
			stillNeedMatching[dance_name].splice(ind, 1);
		} // for
	} // for
	
	console.log(matching_score(matching));
	console.log(stringify_partner_assignments(matching));
	
	return matching;
}

function matching_clone(matching) {
	var clone = {};
	for (var dance in matching) {
		clone[dance] = [];
		for (var i = 0; i < matching[dance].length; i++) {
			clone[dance].push(matching[dance][i].slice(0));	
		}
	}
	
	return clone;
}

function matching_switch_leaders(matching, dance, l1idx, l2idx) {
	var temp = matching[dance][l1idx][0];
	matching[dance][l1idx][0] = matching[dance][l2idx][0];
	matching[dance][l2idx][0] = temp;
	
	return matching;
}

function matching_switch_leader_with_follower(matching, dance, lidx, fidx) {
	var temp = matching[dance][lidx][0];
	matching[dance][lidx][0] = matching[dance][fidx][1];
	matching[dance][fidx][1] = temp;
	
	return matching;
}

// Returns a random neighbor that hasn't been seen before
// Random moves: first, randomly pick a dance
// Then, either switch two leaders, or switch a leader with someone else's
//   follower
function random_neighbor(matching, cache) {
	for (var i = 0; i < 1000; i++) {
		// first, pick a random dance
		var dance = dance_names[Math.floor(Math.random() * dance_names.length)];
		var idx1 = Math.floor(Math.random() * matching[dance].length);
		var idx2 = Math.floor(Math.random() * matching[dance].length);
		var neighbor = matching_clone(matching);
		if (Math.random() < 0.5) {
			matching_switch_leaders(neighbor, dance, idx1, idx2);	
		} else {
			matching_switch_leader_with_follower(neighbor, dance, idx1, idx2);
		}
		var stringified = serialize_matching(neighbor);
		if (stringified in cache) {
			continue;
		} else {
			return neighbor;
		}
	}
	
	return undefined;
}

var scores_over_time;
//Runs a local search with simulated annealing. 
function local_search(num_steps) {
	scores_over_time = "";
	var current_matching = init_matching();
	var T = 1000, steps = 0, origscore = matching_score(current_matching);
	
	var cache = {};
	var curr_serialized = serialize_matching(current_matching);
	cache[curr_serialized] = origscore;
	while (steps < num_steps) {
		var new_matching = random_neighbor(current_matching, cache);
		if (new_matching == undefined) {
			// we tried 100 random steps, couldn't find a new random neighbor
			console.log("Couldn't find neighbor");
			console.log(steps);
			break;
		}
		var curr_score = cache[curr_serialized];
		scores_over_time += curr_score.toString() + "\n";
		var new_score = matching_score(new_matching);
		var new_serialized = serialize_matching(new_matching);
		cache[new_serialized] = new_score;
		if (new_score > curr_score) {
			//console.log("Prob = " + Math.exp(-(new_score - curr_score) / T / origscore));
		}
		if (new_score < curr_score || 
			Math.random() < Math.exp(-(new_score - curr_score) / T / origscore)) {
			current_matching = new_matching;
			curr_serialized = new_serialized;
			curr_score = new_score;
			console.log(curr_score);
		}
		T *= 0.99; //Reduce T
		steps++;
	}
	console.log(steps + " steps taken");
	return current_matching;
}