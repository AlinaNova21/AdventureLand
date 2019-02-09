
export function potionController(priest = false) {
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