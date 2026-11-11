// 신뢰 게임 데이터: 보상 규칙, 친구 5명, 장면(교과) 테마, 성찰 문항
// 점수 구조(죄수의 딜레마): 둘 다 함께 3/3, 나만 함께 0/5, 나만 혼자 5/0, 둘 다 혼자 1/1
export const PAY = { CC: [3, 3], CD: [0, 5], DC: [5, 0], DD: [1, 1], CX: [0, 0], DX: [1, 0] }
export const ROUNDS = 5

// 교과 장면: 같은 게임을 체육 말고 다른 수업에서도 쓸 수 있게
export const THEMES = {
  sport: {
    id: 'sport', label: '체육 시간', icon: '⚽',
    C: '함께 패스', D: '혼자 슛', Cicon: '🤝', Dicon: '🥅',
    Cdesc: '친구에게 공을 넘겨요', Ddesc: '내가 직접 슛해요',
    place: '운동장',
    scene: ['골대 앞이에요! 친구에게 패스할까요, 혼자 슛할까요?', '다시 공이 왔어요. 이번엔 어떻게 할까요?', '수비가 몰려와요. 패스할까요, 혼자 갈까요?', '경기가 무르익었어요. 내 선택은?', '마지막 공격이에요! 어떻게 할까요?'],
    slip: '친구의 패스가 빗나가 공이 밖으로 나갔어요!',
  },
  group: {
    id: 'group', label: '모둠 활동', icon: '📚',
    C: '함께 나누기', D: '나만 챙기기', Cicon: '🤝', Dicon: '🔒',
    Cdesc: '찾은 자료를 친구와 나눠요', Ddesc: '좋은 자료는 나만 써요',
    place: '교실',
    scene: ['모둠 과제 시작! 내가 찾은 자료를 친구와 나눌까요?', '친구가 다음 자료를 기다려요. 이번엔?', '발표가 얼마 남지 않았어요. 어떻게 할까요?', '좋은 아이디어가 떠올랐어요. 나눌까요?', '마지막 정리 시간이에요. 내 선택은?'],
    slip: '친구가 보낸 자료가 전송 오류로 도착하지 않았어요!',
  },
}

// 친구 5명. move(h) : h = [{me, you}] 지금까지 기록, 반환 'C' | 'D' | 'X'(실수)
export const FRIENDS = [
  {
    id: 'copy', name: '준호', tag: '따라쟁이', icon: '🔁', hue: ['#38BDF8', '#6366F1'],
    hint: '내가 한 대로 돌려주는 것 같아요.',
    rule: '처음엔 함께. 그다음부터는 내가 바로 앞에서 한 그대로 따라 해요.',
    lesson: '세상에는 이런 친구가 가장 많아요. 내가 먼저 손을 내밀면 좋은 관계가 이어지고, 한 번 등을 돌리면 그대로 돌아와요.',
    badge: '먼저 손 내밀기',
    move: (h) => (h.length ? h[h.length - 1].me : 'C'),
  },
  {
    id: 'kind', name: '도윤', tag: '늘 함께', icon: '🌱', hue: ['#34D399', '#0EA5E9'],
    hint: '언제나 나를 믿어 주는 친구예요.',
    rule: '무슨 일이 있어도 늘 함께를 골라요.',
    lesson: '이 친구를 이용하면 내 점수는 가장 높아져요. 하지만 그건 친구의 믿음을 써 버리는 거예요. 우리 팀 점수도 줄고, 믿음도 사라져요.',
    badge: '믿음 지키기',
    move: () => 'C',
  },
  {
    id: 'shy', name: '태민', tag: '마음 닫은', icon: '🛡️', hue: ['#A78BFA', '#EC4899'],
    hint: '처음에는 아무도 안 믿는 것 같아요.',
    rule: '처음 두 번은 혼자. 그 뒤에는 내가 두 번 이어서 함께를 고르면 마음을 열어요.',
    lesson: '예전에 상처받아서 먼저 다가오지 못하는 친구예요. 한두 번 거절당해도 꾸준히 손을 내밀면 마음을 열어요. 금방 포기하면 계속 그대로예요.',
    badge: '꾸준히 다가가기',
    move: (h) => (h.length < 2 ? 'D' : h[h.length - 1].me === 'C' && h[h.length - 2].me === 'C' ? 'C' : 'D'),
  },
  {
    id: 'hurt', name: '민재', tag: '서운함이 오래 가는', icon: '🌧️', hue: ['#F59E0B', '#EF4444'],
    hint: '한 번 서운하면 오래 가는 친구예요.',
    rule: '함께로 시작해요. 내가 한 번이라도 혼자를 고르면 계속 혼자. 내가 세 번 이어서 함께를 고르면 다시 마음을 풀어요.',
    lesson: '한 번의 서운함이 오래 남는 친구예요. 상처는 금방 생기지만 회복에는 더 많은 시간이 들어요. 그래도 꾸준히 진심을 보이면 관계는 다시 좋아져요.',
    badge: '상처 주지 않기',
    move: (h) => {
      if (!h.some((x) => x.me === 'D')) return 'C'
      const l3 = h.slice(-3)
      return l3.length === 3 && l3.every((x) => x.me === 'C') ? 'C' : 'D'
    },
  },
  {
    id: 'oops', name: '지후', tag: '가끔 실수하는', icon: '🍀', hue: ['#FDE047', '#22C55E'],
    hint: '착한데 가끔 실수를 하는 것 같아요.',
    rule: '늘 함께하려고 해요. 그런데 2라운드에서 실수를 했어요! 그 뒤로는 내가 바로 앞에서 한 대로 따라 해요.',
    lesson: '2라운드의 0점은 일부러가 아니라 실수였어요. 실수를 일부러 한 걸로 오해하고 되갚으면 다툼이 이어져요. "괜찮아" 하고 한 번 넘어가 주거나 "일부러 그런 거야?" 하고 물어보면 관계가 다시 이어져요.',
    badge: '실수 감싸 주기',
    move: (h) => (h.length === 1 ? 'X' : h.length === 0 ? 'C' : h[h.length - 1].me),
  },
]

// 라운드 결과에 따른 친구 말풍선(친구 입장)
export function bubble(f, me, you) {
  if (you === 'X') return '앗…!'
  if (me === 'C' && you === 'C') return ['고마워! 나이스!', '우리 잘 맞는다!', '좋아, 같이 가자!'][Math.floor(Math.random() * 3)]
  if (me === 'D' && you === 'C') return f.id === 'kind' ? '괜찮아… 다음엔 같이 하자.' : '어…? 나는 너 믿었는데.'
  if (me === 'C' && you === 'D') return f.id === 'shy' ? '…아직은 잘 모르겠어.' : f.id === 'hurt' ? '아까 일이 아직 서운해.' : '미안, 나도 모르게…'
  return '우리 둘 다 아쉽다…'
}

// 결과 문장(나 입장)
export function outcomeText(t, me, you) {
  if (you === 'X') return { title: '앗, 0점!', text: t.slip, tone: 'warn' }
  if (me === 'C' && you === 'C') return { title: '둘 다 함께!', text: '서로 믿었어요. 둘 다 3점씩 얻었어요.', tone: 'good' }
  if (me === 'D' && you === 'D') return { title: '둘 다 혼자', text: '아무도 크게 얻지 못했어요. 둘 다 1점이에요.', tone: 'flat' }
  if (me === 'D') return { title: '나만 혼자', text: '나는 5점을 얻었지만 친구는 0점이에요. 친구 마음은 어떨까요?', tone: 'flat' }
  return { title: '나만 함께', text: '나는 손을 내밀었는데 친구는 혼자 했어요. 서운하죠. 다음엔 어떻게 할까요?', tone: 'warn' }
}

export function trustDelta(me, you) {
  if (you === 'X') return -6
  if (me === 'C' && you === 'C') return 12
  if (me === 'D' && you === 'C') return -28
  if (me === 'C' && you === 'D') return 4
  return -8
}

export const PREDICT = [
  { id: 'D', label: '늘 나만 챙기기', icon: '🙋' },
  { id: 'C', label: '늘 함께하기', icon: '🤝' },
  { id: 'M', label: '상대를 봐 가며 정하기', icon: '🔍' },
]

export const MINDS = [
  { id: 'happy', icon: '😊', label: '든든해요' },
  { id: 'calm', icon: '🙂', label: '괜찮아요' },
  { id: 'sad', icon: '😢', label: '서운해요' },
  { id: 'angry', icon: '😠', label: '속상해요' },
]

export const HARD = ['친구가 먼저 혼자를 골랐을 때', '내 점수가 더 많아 보일 때', '친구가 나를 안 믿는 것 같을 때', '실수인지 일부러인지 헷갈릴 때', '어렵지 않았어요']

export const PLEDGE = {
  sport: ['혼자 있는 친구에게 먼저 패스하기', '실수한 친구에게 "괜찮아, 다시 하자" 말하기', '경기 뒤 상대 팀과 인사하기', '서운할 때 화내기 전에 "일부러 그런 거야?" 물어보기'],
  group: ['내가 찾은 자료를 모둠과 나누기', '말이 적은 친구에게 의견 물어보기', '실수한 친구에게 "괜찮아" 말하기', '서운할 때 화내기 전에 "일부러 그런 거야?" 물어보기'],
}

// 어울림 5대 역량과 게임 장면 연결
export const COMPS = [
  { name: '공감', how: '친구 말풍선과 마음 고르기로 친구 입장을 생각해요.' },
  { name: '의사소통', how: '서운할 때 "일부러 그런 거야?" 하고 묻는 법을 배워요.' },
  { name: '감정조절', how: '친구가 혼자를 골라도 바로 되갚지 않고 한 번 참아 봐요.' },
  { name: '자기존중감', how: '손해를 봐도 내가 정한 바른 선택을 지켜요.' },
  { name: '갈등해결', how: '깨진 믿음을 꾸준한 함께로 다시 이어 봐요.' },
]
