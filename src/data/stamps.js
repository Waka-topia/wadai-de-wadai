/**
 * スタンプのマスターデータ
 *
 * 2025年4月時点で配布されていた 112 種類のスタンプ。画像は public/stamps/{stampId}.webp に配置する。 name / groupId は
 * src/data/groups.js の並び順との対応から復元した （画像自体に団体名は描かれていないため、カテゴリ内の連番で紐づけている）。
 *
 * 不変のマスターデータなので Firestore ではなくリポジトリ内に持つ。 Firestore は「どのユーザーがどの stampId を取得したか」だけを保持する。
 */
export const stampMaster = [
  { stampId: 'cir01', name: 'アドベンチャー', category: 'circle', groupId: '1' },
  { stampId: 'cir02', name: 'ライムライト', category: 'circle', groupId: '2' },
  { stampId: 'cir03', name: 'ビッグホエールズ', category: 'circle', groupId: '3' },
  { stampId: 'cir04', name: '軟式テニス同好会　おれんぢ', category: 'circle', groupId: '4' },
  { stampId: 'cir05', name: 'Ｎｅｗ　Ｊａｃｋ', category: 'circle', groupId: '5' },
  { stampId: 'cir06', name: 'Ｂｌｕｅ　Ｄｒｏｐｓ', category: 'circle', groupId: '6' },
  { stampId: 'cir07', name: '老麺愛好会　ばりあぶるこんでんさ', category: 'circle', groupId: '7' },
  { stampId: 'cir08', name: 'すいすい', category: 'circle', groupId: '8' },
  { stampId: 'cir09', name: 'ソフトボール同好会', category: 'circle', groupId: '9' },
  { stampId: 'cir10', name: 'ブザービーター', category: 'circle', groupId: '10' },
  { stampId: 'cir11', name: 'マジシャンずサークル', category: 'circle', groupId: '11' },
  { stampId: 'cir12', name: '和', category: 'circle', groupId: '12' },
  { stampId: 'cir13', name: 'ＪＯＹ４', category: 'circle', groupId: '13' },
  { stampId: 'cir14', name: 'よさこいサークル「和歌乱」', category: 'circle', groupId: '14' },
  { stampId: 'cir15', name: 'Ｆｒｅｅ　Ｓｔｙｌｅ', category: 'circle', groupId: '15' },
  { stampId: 'cir16', name: 'ｅｘｄｒｅａｍ', category: 'circle', groupId: '16' },
  { stampId: 'cir17', name: '国際交流委員会　ＩＥＣ', category: 'circle', groupId: '17' },
  { stampId: 'cir18', name: 'agrico.', category: 'circle', groupId: '18' },
  { stampId: 'cir19', name: 'アカペラサークル和音-kazune-', category: 'circle', groupId: '19' },
  { stampId: 'cir20', name: 'Sound Energy', category: 'circle', groupId: '20' },
  { stampId: 'cir21', name: 'ジャズ研究会 UncleJam', category: 'circle', groupId: '21' },
  { stampId: 'cir22', name: '書道サークル梅筆', category: 'circle', groupId: '22' },
  { stampId: 'cir23', name: '美術館部', category: 'circle', groupId: '23' },
  { stampId: 'cir24', name: 'いろ色', category: 'circle', groupId: '24' },
  { stampId: 'cir25', name: 'Pamplemousse', category: 'circle', groupId: '25' },
  { stampId: 'cir26', name: '夢想史紀行', category: 'circle', groupId: '26' },
  { stampId: 'cir27', name: '和歌山大学スマブラサークル', category: 'circle', groupId: '27' },
  { stampId: 'cir28', name: 'Surfing', category: 'circle', groupId: '28' },
  { stampId: 'cir29', name: '競技かるたサークル－紫雨－', category: 'circle', groupId: '29' },
  { stampId: 'cir30', name: 'WANT　TO', category: 'circle', groupId: '30' },
  {
    stampId: 'cir31',
    name: '和歌山大学アウトドアサークルJAMBO',
    category: 'circle',
    groupId: '31',
  },
  { stampId: 'cir32', name: 'NarukamiFC', category: 'circle', groupId: '32' },
  { stampId: 'cir33', name: '和歌山大学自動車サークル', category: 'circle', groupId: '33' },
  { stampId: 'cir34', name: '和歌山大学サバゲ―サークル', category: 'circle', groupId: '34' },
  { stampId: 'cir35', name: 'WAMö', category: 'circle', groupId: '35' },
  { stampId: 'cir36', name: '地域交流サークル　むすび', category: 'circle', groupId: '36' },
  { stampId: 'cir37', name: '和歌山大学eスポーツサークル', category: 'circle', groupId: '37' },
  { stampId: 'cir38', name: '手話サークルsilent', category: 'circle', groupId: '38' },
  { stampId: 'cir39', name: '和歌山大学献血推進サークル', category: 'circle', groupId: '39' },
  {
    stampId: 'cre01',
    name: '服＆本の交換プロジェクト「GREEN CLOSET」',
    category: 'project',
    groupId: '89',
  },
  { stampId: 'cre02', name: 'クリエゲーム制作プロジェクト', category: 'project', groupId: '90' },
  { stampId: 'cre03', name: 'クリエデザインプロジェクト', category: 'project', groupId: '91' },
  {
    stampId: 'cre04',
    name: '高野山観光推進プロジェクト「ばあむ。」',
    category: 'project',
    groupId: '92',
  },
  {
    stampId: 'cre05',
    name: 'ITものづくりプロジェクト「AppLii」',
    category: 'project',
    groupId: '93',
  },
  { stampId: 'cre06', name: 'MITILAB EdTechプロジェクト', category: 'project', groupId: '94' },
  { stampId: 'cre07', name: 'ロボットプロジェクト', category: 'project', groupId: '95' },
  { stampId: 'cre08', name: '和歌山ASEANプロジェクト(WAP)', category: 'project', groupId: '96' },
  { stampId: 'cre09', name: '脳情報総合研究プロジェクト', category: 'project', groupId: '97' },
  {
    stampId: 'cre10',
    name: '和歌山大学ソーラーカープロジェクト',
    category: 'project',
    groupId: '98',
  },
  {
    stampId: 'cre11',
    name: '新クリエ映像制作プロジェクト！－Filmage－',
    category: 'project',
    groupId: '99',
  },
  { stampId: 'cre12', name: 'NC機械製作プロジェクト', category: 'project', groupId: '100' },
  {
    stampId: 'cre13',
    name: '和歌山大学宇宙開発プロジェクト（ＷＳＰ）',
    category: 'project',
    groupId: '101',
  },
  {
    stampId: 'cre14',
    name: '鳥人間プロジェクト「ワカヤマン！」',
    category: 'project',
    groupId: '102',
  },
  {
    stampId: 'cre15',
    name: 'データ分析プロジェクト“Hello, World!”',
    category: 'project',
    groupId: '103',
  },
  {
    stampId: 'cre16',
    name: '世界農業遺産交流プロジェクト「ひなたぽっと」',
    category: 'project',
    groupId: '104',
  },
  { stampId: 'cre17', name: '天体継続観測プロジェクト', category: 'project', groupId: '105' },
  { stampId: 'cre18', name: 'きのくに電鉄プロジェクト', category: 'project', groupId: '106' },
  {
    stampId: 'cre19',
    name: '観光自主研究プロジェクト（旧潮岬灯台の灯台ホテル化プロジェクト）',
    category: 'project',
    groupId: '107',
  },
  {
    stampId: 'cre20',
    name: '交通たび企画「めーぷる」（旧ローカル線利活用推進プロジェクト）',
    category: 'project',
    groupId: '108',
  },
  {
    stampId: 'cre21',
    name: 'ねこの手レンタルカフェプロジェクト',
    category: 'project',
    groupId: '109',
  },
  {
    stampId: 'cre22',
    name: '情報セキュリティ研究開発プロジェクト「SecLab」',
    category: 'project',
    groupId: '110',
  },
  {
    stampId: 'cre23',
    name: '郷土料理研究プロジェクト ろかるーむ',
    category: 'project',
    groupId: '111',
  },
  {
    stampId: 'cre24',
    name: '良い旅プロジェクトBon Voyage（ボンボヤージュ）',
    category: 'project',
    groupId: '112',
  },
  { stampId: 'cul01', name: '混声合唱部', category: 'clubCulture', groupId: '46' },
  { stampId: 'cul02', name: '交響楽団', category: 'clubCulture', groupId: '47' },
  { stampId: 'cul03', name: '吹奏楽団', category: 'clubCulture', groupId: '48' },
  { stampId: 'cul04', name: 'マンドリンクラブ', category: 'clubCulture', groupId: '49' },
  { stampId: 'cul05', name: '流行音楽倶楽部', category: 'clubCulture', groupId: '50' },
  { stampId: 'cul06', name: '絵画部', category: 'clubCulture', groupId: '51' },
  { stampId: 'cul07', name: '文芸部', category: 'clubCulture', groupId: '52' },
  { stampId: 'cul08', name: 'STEP', category: 'clubCulture', groupId: '53' },
  { stampId: 'cul09', name: 'mycom', category: 'clubCulture', groupId: '54' },
  { stampId: 'cul10', name: 'プラットホーム', category: 'clubCulture', groupId: '55' },
  { stampId: 'cul11', name: '将棋部', category: 'clubCulture', groupId: '56' },
  { stampId: 'cul12', name: '写真部', category: 'clubCulture', groupId: '57' },
  { stampId: 'cul13', name: '演劇部', category: 'clubCulture', groupId: '58' },
  { stampId: 'cul14', name: '那楽部', category: 'clubCulture', groupId: '59' },
  { stampId: 'cul15', name: 'ESA', category: 'clubCulture', groupId: '60' },
  { stampId: 'cul16', name: '茶道部', category: 'clubCulture', groupId: '61' },
  { stampId: 'cul17', name: 'ねこねここねこ', category: 'clubCulture', groupId: '62' },
  { stampId: 'org01', name: '学生自治会', category: 'committee', groupId: '40' },
  { stampId: 'org02', name: '新聞会', category: 'committee', groupId: '41' },
  { stampId: 'org03', name: '体育会', category: 'committee', groupId: '42' },
  { stampId: 'org04', name: '文化部連合会', category: 'committee', groupId: '43' },
  { stampId: 'org05', name: '大学祭実行委員会', category: 'committee', groupId: '44' },
  { stampId: 'org06', name: '生協学生委員会', category: 'committee', groupId: '45' },
  { stampId: 'spo01', name: '陸上競技部', category: 'clubSports', groupId: '63' },
  { stampId: 'spo02', name: '水泳部', category: 'clubSports', groupId: '64' },
  { stampId: 'spo03', name: '硬式野球部', category: 'clubSports', groupId: '65' },
  { stampId: 'spo04', name: '準硬式野球部', category: 'clubSports', groupId: '66' },
  { stampId: 'spo05', name: 'テニス部', category: 'clubSports', groupId: '67' },
  { stampId: 'spo06', name: 'ソフトテニス部', category: 'clubSports', groupId: '68' },
  { stampId: 'spo07', name: '男子バスケットボール部', category: 'clubSports', groupId: '69' },
  { stampId: 'spo08', name: '女子バスケットボール部', category: 'clubSports', groupId: '70' },
  { stampId: 'spo09', name: '男子バレーボール部', category: 'clubSports', groupId: '71' },
  { stampId: 'spo10', name: '女子バレーボール部', category: 'clubSports', groupId: '72' },
  { stampId: 'spo11', name: '男子サッカー部', category: 'clubSports', groupId: '73' },
  { stampId: 'spo12', name: 'ラグビー部', category: 'clubSports', groupId: '74' },
  { stampId: 'spo13', name: '卓球部', category: 'clubSports', groupId: '75' },
  { stampId: 'spo14', name: 'バドミントン部', category: 'clubSports', groupId: '76' },
  { stampId: 'spo15', name: '男子ハンドボール部', category: 'clubSports', groupId: '77' },
  { stampId: 'spo16', name: '柔道部', category: 'clubSports', groupId: '78' },
  { stampId: 'spo17', name: '剣道部', category: 'clubSports', groupId: '79' },
  { stampId: 'spo18', name: '弓道部', category: 'clubSports', groupId: '80' },
  { stampId: 'spo19', name: '空手道部', category: 'clubSports', groupId: '81' },
  { stampId: 'spo20', name: '合氣道部', category: 'clubSports', groupId: '82' },
  { stampId: 'spo21', name: '少林寺拳法部', category: 'clubSports', groupId: '83' },
  { stampId: 'spo22', name: '陸上ホッケー部', category: 'clubSports', groupId: '84' },
  { stampId: 'spo23', name: 'ヨット部', category: 'clubSports', groupId: '85' },
  { stampId: 'spo24', name: 'サイクリング部', category: 'clubSports', groupId: '86' },
  { stampId: 'spo25', name: 'アメリカンフットボール部', category: 'clubSports', groupId: '87' },
  { stampId: 'spo26', name: 'フライングディスク部', category: 'clubSports', groupId: '88' },
]

/** カテゴリの表示名 */
export const stampCategoryLabels = {
  circle: 'サークル',
  clubSports: '体育会',
  clubCulture: '文化部',
  project: 'プロジェクト',
  committee: '委員会',
}

const stampMap = new Map(stampMaster.map((stamp) => [stamp.stampId, stamp]))

/**
 * StampId からマスターデータを引く
 *
 * @param {string} stampId - スタンプID（例: cir01）
 * @returns {object | null} 該当するマスターデータ。存在しない場合は null
 */
export const findStamp = (stampId) => stampMap.get(stampId) ?? null

/**
 * スタンプ画像の公開URLを組み立てる
 *
 * Public/ 配下の静的ファイルなので、ビルド後もこのパスのまま解決される
 *
 * @param {string} stampId - スタンプID（例: cir01）
 * @returns {string} 画像のURL
 */
export const stampImageUrl = (stampId) => `/stamps/${stampId}.webp`

/** スタンプの総数 */
export const totalStampCount = stampMaster.length
