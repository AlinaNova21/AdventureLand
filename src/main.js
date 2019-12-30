async function run () {
  while (true) {
    console.log('start')
    const gen = main()
    let done = false
    while (!done) {
      await sleep(250)
      const res = await gen.next()
      done = res.done
      console.log('done', done)
    }
    console.log('done')
  }
}
run()

async function * main () {
  console.log('main')
  if (character.ctype === 'merchant') yield * merchantMain()
  yield * dumpMain()
}

function * merchantMain () {
  let nextBankVisit = 0
  const VISIT_BANK_INTERVAL = 5 * 60 * 1000 // 5 minutes
  while (true) {
    yield * exchangeItems()
    yield * stockItems()
    yield * upgradeItems()
    if (nextBankVisit < Date.now()) {
      yield * merchantVisitBank()
      console.log('visited bank')
      nextBankVisit = Date.now() + VISIT_BANK_INTERVAL
    }
    yield
  }
}

function * dumpMain () {
  yield * travelTo('bank')
  if (character.gold) {
    yield * travelTo({ x: 0, y: -300, map: 'bank' })
    bank_deposit(character.gold)
  }
  for (const ind in character.items) {
    const item = character.items[ind]
    if (!item) continue
    if (item.name.slice(1, 4) === 'pot') continue
    bank_store(ind)
  }
  yield * travelTo('main')
  while (true) yield
}

function getInvMap () {
  const map = {}
  for (const item of character.items) {
    if (!item) continue
    map[item.name] = map[item.name] || []
    map[item.name].push(item)
  }
  return map
}

function * upgradeItems () {
  const map = getInvMap()
  for (const name in map) {
    item: for (const inv of map[name]) {
      const item = G.items[name]
      if (item.upgrade) {
        if (inv.level >= item.grades[0]) continue // Skip if high grade
        if (map[name].filter(i => i.level >= inv.level).length >= 2) {
          const item_num = character.items.indexOf(inv)
          const scroll_num = character.items.findIndex(i => i && i.name == 'scroll0')
          console.log(item, inv, item_num, scroll_num)
          parent.socket.emit('upgrade', { item_num, scroll_num, offering_num: null, clevel: inv.level })
          break item
        }
      }
    }
  }
}

function * stockItems () {
  const map = getInvMap()
  const toBuy = []
  const WANTED_STOCK = {
    hpot0: 1000,
    mpot0: 1000,
    scroll0: 0,
    cscroll0: 0
  }
  for (const name in WANTED_STOCK) {
    const q = (map[name] || []).reduce((l, i) => l + (i.q || 1), 0)
    const need = WANTED_STOCK[name] - q
    if (need > 0) {
      toBuy.push({ name, q: need })
    }
  }
  if (toBuy.length) {
    console.log('Buying', JSON.stringify(toBuy))
    yield * travelTo({ x: -175, y: -87, map: 'main' })
    for (const { name, q } of toBuy) {
      parent.socket.emit('buy', { name, quantity: q })
    }
  }
  if (character.gold < 100000) {
    yield * merchantVisitBank()
  }
}

function * exchangeItems () {
  const itemsToExchange = []
  for (const i in character.items) {
    const { name, q } = character.items[i] || {}
    if (!name) continue
    const item = G.items[name]
    if (item.e && q >= item.e) {
      itemsToExchange.push({ name, item_num: i, q, e: item.e })
    }
  }
  if (itemsToExchange.length) {
    if (character.in !== 'main') {
      set_message('Moving to main')
      yield * travelTo('main')
    }
    const { position: [x, y] = [0, 0] } = G.maps.main.npcs.find(n => n.id == 'exchange') || {}
    const dist = Math.abs(character.x - x) + Math.abs(character.y - y)
    if (dist > 100) {
      set_message('Moving to exchange ' + dist)
      yield * travelTo('exchange')
    }
    for (const item of itemsToExchange) {
      game_log(`Exchanging ${item.q} ${item.name}`)
      for (let i = item.q; i >= item.e; i -= item.e) {
        parent.socket.emit('exchange', item)
      }
    }
  }
}

function * travelTo (dest) {
  smart_move(dest)
  while (is_moving(character)) {
    yield
  }
}

function * merchantVisitBank (opts = {}) {
  const {
    goldLimit = 200000
  } = opts
  if (character.in !== 'bank') {
    set_message('moving to bank')
    yield * travelTo({ x: 0, y: 0, map: 'bank' })
  }
  set_message('Using bank')
  const map = getInvMap()
  for (const name in map) {
    for (const inv of map[name]) {
      const item = G.items[name]
      const grade = item.grade || (item.grades && item.grades.findIndex(g => g && inv.level >= g) + 1) || 0
      if (inv.level && inv.level >= 7 || grade) {
        const ind = character.items.indexOf(inv)
        bank_store(ind)
      }
    }
  }
  for (const pack in character.bank) {
    if (pack === 'gold') continue
    const items = character.bank[pack]
    if (items.length) {
      for (const i in items) {
        if (character.items.filter(Boolean).length > 35) break
        if (!items[i]) continue
        const item = G.items[items[i].name]
        const grade = item.grade || (item.grades && item.grades.findIndex(g => g && items[i].level >= g) + 1) || 0
        if (items[i].level && items[i].level >= 7 || grade) continue
        parent.socket.emit('bank', {
          operation: 'swap',
          pack,
          str: i,
          inv: -1
        })
      }
    }
  }
  if (character.gold !== goldLimit) {
    yield * travelTo({ x: 0, y: -300 })
    if (character.gold > goldLimit) {
      const amt = character.gold - goldLimit
      set_message(`Dep ${amt}`)
      bank_deposit(amt)
    }
    if (character.gold < goldLimit) {
      const amt = goldLimit - character.gold
      set_message(`With ${amt}`)
      bank_withdraw(amt)
    }
  }
  set_message('Leaving bank')
  yield * travelTo({ x: -175, y: -87, map: 'main' }) // Leave bank
  set_message('')
}

function sleep (ms) {
  return new Promise(res => setTimeout(res, ms))
}
