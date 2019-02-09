import warrior from '/warrior'
import mage from '/mage'
import ranger from '/ranger'

const classes = {
  warrior,
  mage,
  ranger
}

var attack_mode=true

function on_cm (name, data) {
  game_log(`Got cmd ${name} ${JSON.stringify(data)}`)
  if(data == 'reload') {
    game_log('Reloading code')
    load_code(2)
  }
}
window.on_cm = on_cm

function on_party_request(name) {
  game_log(`partyrequest from ${name}`)
  //if (!name.startsWith('ags')) return
  accept_party_request(name)
}
window.on_party_request = on_party_request
function on_party_invite(name) {
  //game_log(`partyinvite from ${name}`)
  //if (!name.startsWith('ags')) return
  accept_party_invite(name)
}
window.on_party_invite = on_party_invite

add_bottom_button(1, 'Import Code', () => {
  const fs = require('fs')
  const code = fs.readFileSync('/home/adam/projects/adventureland/code/dist/main.js', 'utf8')
  parent.api_call("save_code", {
    name: "main",
    slot: 2,
    code
  })
  const party = ['ags131','agswar','agsran']
  party.forEach(name => send_cm(name, 'reload'))
})

add_bottom_button(2, 'Reload Party', () => {
  const party = ['agswar','agsran']
  party.forEach(char => {
    stop_character(char)
    start_character(char, 2)
  })
})

if(classes[character.ctype].start) {
  classes[character.ctype].start()
}

if(window.mainInterval) clearInterval(window.mainInterval)
window.mainInterval = setInterval(function(){
  if(character.rip) respawn()
  if(classes[character.ctype].tick) {
    if(classes[character.ctype].tick()) {
      return
    }
  }

	//use_hp_or_mp();
	potionController();
	loot();

	if(!attack_mode || character.rip || is_moving(character)) return;

	var target=get_targeted_monster();
	if(!target)
	{
		target=get_nearest_monster({min_xp:100,max_att:120});
		if(target) change_target(target);
		else
		{
			set_message("No Monsters");
			return;
		}
	}
	
	if(!in_attack_range(target))
	{
		move(
			character.x+(target.x-character.x)/2,
			character.y+(target.y-character.y)/2
			);
		// Walk half the distance
	}
	else if(can_attack(target))
	{
		set_message("Attacking");
		attack(target);
	}

},1000/4); // Loops every 1/4 seconds.
function potionController(priest = false) {
    if (!priest) {
        if (can_use('use_hp') && character.hp < character.max_hp * 0.25) {
            use('use_hp');
        } else if (can_use('use_mp') && character.mp < character.max_mp * 0.45) {
            use('use_mp');
        } else if (can_use('use_hp') && character.hp < character.max_hp * 0.45) {
            use('use_hp');
        }
    } else {
        if (character.hp < character.max_hp * 0.25) {
            if (can_use('use_hp')) use('use_hp');
            heal(character);
        } else if (can_use('use_mp') && character.mp < character.max_mp * 0.6) {
            use('use_mp');
        } else if (character.hp < character.max_hp * 0.75) {
            heal(character);
        } else if (character.hp < character.max_hp * 0.45) {
            if (can_use('use_hp')) use('use_hp');
            heal(character);
        }
    }
}
// Learn Javascript: https://www.codecademy.com/learn/learn-javascript
// Write your own CODE: https://github.com/kaansoral/adventureland

