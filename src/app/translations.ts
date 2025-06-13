export type Language = 'en' | 'ja'

export interface Translations {
  // UI Elements
  title: string
  subtitle: string
  start: string
  playing: string
  launch: string
  distance: string
  yourScore: string
  bestScore: string
  restart: string
  tryAgain: string
  results: string
  mute: string
  unmute: string
  rotatePhone: string

  // Wine Monkey Scene (250-300m)
  wineMonkeyTitle: string
  wineMonkeyLines: string[]

  // Sapphire Duo Scene (700-749m)
  sapphireDuoTitle: string
  sapphireDuoLines: string[]

  // Ruby Monkey Scene (750-800m)
  rubyMonkeyTitle: string
  rubyMonkeyLines: string[]

  // Diamond Monkey Scene (800m+)
  diamondMonkeyTitle: string
  diamondMonkeyLines: string[]

  // Achievement Messages
  achievements: {
    legendary: string
    amazing: string
    excellent: string
    great: string
    good: string
  }
}

export const translations: Record<Language, Translations> = {
  en: {
    // UI Elements
    title: "Poop Launcher",
    subtitle: "Commence the Sacred Launch ✨",
    start: "Tap to Start!",
    playing: "Playing...",
    launch: "Tap to Launch!",
    distance: "Distance",
    yourScore: "Your Score",
    bestScore: "Best Score",
    restart: "Tap to Restart",
    tryAgain: "Try Again",
    results: "🎉 Results 🎉",
    mute: "🔇",
    unmute: "🔊",
    rotatePhone: "Turn your phone sideways to play!",

    // Wine Monkey Scene (250-300m)
    wineMonkeyTitle: "Art Critic Monkey",
    wineMonkeyLines: [
      "Ah, a bold yet directionless flight.",
      "So much effort, so little depth.",
      "The trajectory lacks... sophistication.",
      "Amusing, but hardly transcendent.",
      "One might call this... pedestrian."
    ],

    // Sapphire Duo Scene (700-749m)
    sapphireDuoTitle: "Sapphire Duo",
    sapphireDuoLines: [
      "Hmm... Not entirely without merit, I suppose.",
      "A respectable effort, though hardly extraordinary.",
      "Adequate performance. One might call it... decent.",
      "Well, well... You've managed something passable.",
      "Moderately impressive. The sapphire acknowledges you.",
      "A fair display of skill, though room for improvement remains.",
      "Competent execution. The duo finds this... acceptable."
    ],

    // Ruby Monkey Scene (750-800m)
    rubyMonkeyTitle: "Ruby Monkey",
    rubyMonkeyLines: [
      "Impressive! You show real talent!",
      "The ruby recognizes your skill!",
      "Excellent form and precision!",
      "You're approaching mastery!",
      "Magnificent technique displayed!"
    ],

    // Diamond Monkey Scene (800m+)
    diamondMonkeyTitle: "💎 DIAMOND EMPEROR MONKEY 💎",
    diamondMonkeyLines: [
      "Magnificent... You have transcended mortal limits.",
      "Behold, the Diamond of Eternal Excellence!",
      "Your mastery shines brighter than the stars themselves.",
      "Witness the birth of a legend!",
      "The cosmos trembles before your supreme skill!",
      "You have achieved the impossible dream!",
      "Divine perfection incarnate!"
    ],

    // Achievement Messages
    achievements: {
      legendary: "LEGENDARY! You have transcended humanity!",
      amazing: "AMAZING! World-class technique!",
      excellent: "EXCELLENT! Master-level skill!",
      great: "GREAT! Professional-grade performance!",
      good: "GOOD! Almost at 700m!"
    }
  },

  ja: {
    // UI Elements
    title: "うんこランチャー",
    subtitle: "神聖なる発射を開始せよ ✨",
    start: "タップしてスタート！",
    playing: "プレイ中...",
    launch: "タップして発射！",
    distance: "飛距離",
    yourScore: "今回のスコア",
    bestScore: "ベストスコア",
    restart: "タップしてリスタート",
    tryAgain: "再挑戦",
    results: "🎉 結果 🎉",
    mute: "🔇",
    unmute: "🔊",
    rotatePhone: "スマホを横にしてね！",

    // Wine Monkey Scene (250-300m)
    wineMonkeyTitle: "芸術評論家モンキー",
    wineMonkeyLines: [
      "力強いが…方向性に欠けるね。",
      "努力の割に、浅いね。",
      "軌道に…洗練さが足りない。",
      "面白いが、超越性はないね。",
      "これは…凡庸と言えるかな。"
    ],

    // Sapphire Duo Scene (700-749m)
    sapphireDuoTitle: "サファイアデュオ",
    sapphireDuoLines: [
      "うーん…全く価値がないわけではないが。",
      "まずまずの努力だが、特別ではないな。",
      "適切な成果だ。まあまあ…と言えるかな。",
      "ほう、ほう…及第点は取れたようだね。",
      "そこそこ印象的だ。サファイアが認めよう。",
      "まあまあの技術だが、改善の余地はあるな。",
      "有能な実行力だ。デュオはこれを…受け入れよう。"
    ],

    // Ruby Monkey Scene (750-800m)
    rubyMonkeyTitle: "ルビーモンキー",
    rubyMonkeyLines: [
      "素晴らしい！真の才能を見せているね！",
      "ルビーが君の技術を認めている！",
      "優秀なフォームと精度だ！",
      "マスタリーに近づいているぞ！",
      "見事な技術の披露だ！"
    ],

    // Diamond Monkey Scene (800m+)
    diamondMonkeyTitle: "💎 ダイヤモンド皇帝モンキー 💎",
    diamondMonkeyLines: [
      "壮大だ…君は人間の限界を超越した。",
      "見よ、永遠の卓越のダイヤモンドを！",
      "君の熟練は星々よりも明るく輝いている。",
      "伝説の誕生を目撃せよ！",
      "宇宙が君の至高の技術の前に震えている！",
      "君は不可能な夢を達成した！",
      "神聖なる完璧の化身よ！"
    ],

    // Achievement Messages
    achievements: {
      legendary: "伝説級！もはや人間を超越しています！",
      amazing: "驚異的！世界レベルの技術です！",
      excellent: "卓越！マスター級の実力です！",
      great: "素晴らしい！プロ級の腕前です！",
      good: "上手い！もう少しで700mです！"
    }
  }
}