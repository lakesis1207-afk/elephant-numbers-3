// 바닷가 마을 (1단계 셋째 마을): 펭귄의 물고기 잔치

export const SEA = Object.freeze({
  key: 'sea',
  animals: [
    { key: 'penguin', name: '펭귄' },
    { key: 'polarbear', name: '북극곰' },
    { key: 'walrus', name: '바다코끼리' },
    { key: 'whale', name: '고래' },
    { key: 'turtle', name: '거북이' },
    { key: 'octopus', name: '문어' },
    { key: 'dolphin', name: '돌고래' },
    { key: 'starfish', name: '불가사리' },
    { key: 'seaotter', name: '해달' },
    { key: 'crab', name: '게' },
  ],
  story: {
    title: '펭귄의 물고기 잔치예요!',
    icon: { kind: 'prop', name: 'fish' },
    enterVoice: '바닷가 마을이야! 펭귄이 물고기 잔치를 열어. 친구들을 도와줘!',
    storyVoice: '펭귄의 물고기 잔치예요! 누가 더 많은지 보고, 무늬도 세고, 지그재그 길도 따라가 봐!',
  },
  games: [
    {
      key: 'compare',
      name: '누가 더 많아?',
      scene: [
        { kind: 'character', name: 'penguin', style: 'height:20cqh;left:0;bottom:2cqh' },
        { kind: 'prop', name: 'fish', style: 'right:0;bottom:4cqh;width:11cqh;height:8cqh' },
        { kind: 'prop', name: 'shell', style: 'right:3cqh;bottom:13cqh;width:9cqh;height:9cqh' },
      ],
    },
    {
      key: 'spots',
      name: '반짝 무늬 보기',
      icon: 'game-spots',
      scene: [
        { kind: 'character', name: 'giraffe', style: 'height:26cqh;left:0;bottom:1cqh' },
        { kind: 'prop', name: 'bush', style: 'right:0;bottom:3cqh;width:15cqh;height:15cqh' },
      ],
    },
    {
      key: 'zigzag',
      name: '지그재그 길',
      scene: [
        { kind: 'character', name: 'crab', style: 'height:15cqh;left:0;bottom:2cqh' },
        { kind: 'prop', name: 'shell', style: 'right:0;bottom:2cqh;width:11cqh;height:11cqh' },
        { kind: 'prop', name: 'shell', style: 'right:9cqh;bottom:10cqh;width:9cqh;height:9cqh' },
      ],
    },
  ],
});
