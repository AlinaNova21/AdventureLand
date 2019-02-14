import { potionController } from '/lib'
export default {
  start() {
  },
  tick() {
    if(!character.party) {
      send_party_request('ags131')
      //game_log('Trying to join ags131')
      //set_message('Joining Party')
      return false
      // send_cm('ags131', 'accept_party')
    }
    const leader = get_player(character.party)

    const follow_dist = is_moving(leader) ? leader.range * 0.85 : 200
    if(parent.distance(character, leader) > follow_dist) {
      move(
  			character.x+(leader.x-character.x)/5,
  			character.y+(leader.y-character.y)/5
			);
      return
    }
    
    let target = get_target_of(leader)

  	//use_hp_or_mp();
  	potionController();
  	loot();

  	if(character.rip || is_moving(character)) return;
  
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
  }

}