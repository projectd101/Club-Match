const ADJ = ['Velvet','Neon','Hazy','Electric','Midnight','Silver','Crimson','Wild','Lunar','Golden','Feral','Static','Amber','Rogue','Cosmic','Restless','Violet','Smoky','Bold','Loose']
const NOUN = ['Fox','Panther','Comet','Wolf','Raven','Tiger','Phoenix','Falcon','Viper','Lynx','Shadow','Ghost','Storm','Ember','Wisp','Mirage','Echo','Blaze','Nova','Drift']

export function generateUsername() {
  const a = ADJ[Math.floor(Math.random() * ADJ.length)]
  const n = NOUN[Math.floor(Math.random() * NOUN.length)]
  const num = Math.floor(Math.random() * 90 + 10)
  return `${a}${n}${num}`
}
