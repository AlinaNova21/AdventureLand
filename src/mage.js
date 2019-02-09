export default {
  party: ['agswar','agsran'],
  start() {
  },
  tick() {
    this.party.forEach(char => {
      const ent = get_player(char)
      if (!ent) return
      if(ent.party != character.name) {
        send_party_invite(ent.name)
      }
    })
  }
}