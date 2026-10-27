// 숲속 마을 (1단계 둘째 마을): 다람쥐의 겨울 준비

export const FOREST = Object.freeze({
  key: 'forest',
  animals: [
    { key: 'rabbit', name: '토끼' },
    { key: 'squirrel', name: '다람쥐' },
    { key: 'panda', name: '판다' },
    { key: 'fox', name: '여우' },
    { key: 'owl', name: '부엉이' },
    { key: 'hedgehog', name: '고슴도치' },
  ],
  story: {
    title: '다람쥐의 겨울 준비를 도와요!',
    icon: { kind: 'prop', name: 'acorn' },
    enterVoice: '숲속 마을이야! 다람쥐가 겨울 준비를 해. 친구들을 도와줘!',
    storyVoice: '다람쥐의 겨울 준비를 도와요! 물웅덩이도 채우고, 풍선도 불고, 꼬불꼬불 길도 따라가 봐!',
  },
  games: [
    {
      key: 'pond',
      name: '물웅덩이 채우기',
      icon: 'game-pond',
      scene: [
        { kind: 'prop', name: 'pond', style: 'left:0;bottom:0;width:32cqh;height:24cqh' },
        { kind: 'character', name: 'hippo', style: 'height:20cqh;left:10cqh;bottom:6cqh' },
      ],
    },
    {
      key: 'blow',
      name: '풍선 불기',
      scene: [
        { kind: 'character', name: 'rabbit', style: 'height:20cqh;left:0;bottom:2cqh' },
        { kind: 'prop', name: 'balloon-yellow', style: 'right:1cqh;bottom:2cqh;width:9cqh;height:12cqh' },
        { kind: 'prop', name: 'balloon-green', style: 'right:9cqh;bottom:9cqh;width:12cqh;height:16cqh' },
      ],
    },
    {
      key: 'curvy',
      name: '꼬불꼬불 길',
      scene: [
        { kind: 'character', name: 'squirrel', style: 'height:16cqh;left:0;bottom:2cqh' },
        { kind: 'prop', name: 'acorn', style: 'right:1cqh;bottom:3cqh;width:10cqh;height:10cqh' },
      ],
    },
  ],
});
