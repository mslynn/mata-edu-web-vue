export type ObjectRecognitionMaterialItem = {
  id: string;
  name: string;
  url: string;
};

export type ObjectRecognitionLabel = {
  name: string;
  category: string;
};

export type MobileNetClassPattern = ObjectRecognitionLabel & {
  pattern: RegExp;
};

export const OBJECT_DETECTION_CONFIDENCE_THRESHOLD = 0.25;

export const IMAGE_CLASSIFICATION_CONFIDENCE_THRESHOLD = 0.15;

export const cocoSsdClassMap: Record<string, ObjectRecognitionLabel> = {
  person: { name: "人", category: "人物" },
  bicycle: { name: "自行车", category: "交通工具" },
  car: { name: "汽车", category: "交通工具" },
  motorcycle: { name: "摩托车", category: "交通工具" },
  airplane: { name: "飞机", category: "交通工具" },
  bus: { name: "公交车", category: "交通工具" },
  train: { name: "火车", category: "交通工具" },
  truck: { name: "卡车", category: "交通工具" },
  boat: { name: "船", category: "交通工具" },
  "traffic light": { name: "交通灯", category: "交通设施" },
  "fire hydrant": { name: "消防栓", category: "交通设施" },
  "stop sign": { name: "停车标志", category: "交通设施" },
  "parking meter": { name: "停车计时器", category: "交通设施" },
  bench: { name: "长椅", category: "家具" },
  bird: { name: "鸟", category: "动物" },
  cat: { name: "猫", category: "动物" },
  dog: { name: "狗", category: "动物" },
  horse: { name: "马", category: "动物" },
  sheep: { name: "羊", category: "动物" },
  cow: { name: "牛", category: "动物" },
  elephant: { name: "大象", category: "动物" },
  bear: { name: "熊", category: "动物" },
  zebra: { name: "斑马", category: "动物" },
  giraffe: { name: "长颈鹿", category: "动物" },
  backpack: { name: "背包", category: "随身物品" },
  umbrella: { name: "雨伞", category: "随身物品" },
  handbag: { name: "手提包", category: "随身物品" },
  tie: { name: "领带", category: "服饰" },
  suitcase: { name: "行李箱", category: "随身物品" },
  frisbee: { name: "飞盘", category: "运动用品" },
  skis: { name: "滑雪板", category: "运动用品" },
  snowboard: { name: "单板滑雪板", category: "运动用品" },
  "sports ball": { name: "球", category: "运动用品" },
  kite: { name: "风筝", category: "运动用品" },
  "baseball bat": { name: "棒球棒", category: "运动用品" },
  "baseball glove": { name: "棒球手套", category: "运动用品" },
  skateboard: { name: "滑板", category: "运动用品" },
  surfboard: { name: "冲浪板", category: "运动用品" },
  "tennis racket": { name: "网球拍", category: "运动用品" },
  bottle: { name: "瓶子", category: "餐饮用品" },
  "wine glass": { name: "酒杯", category: "餐饮用品" },
  cup: { name: "杯子", category: "餐饮用品" },
  fork: { name: "叉子", category: "餐饮用品" },
  knife: { name: "刀", category: "餐饮用品" },
  spoon: { name: "勺子", category: "餐饮用品" },
  bowl: { name: "碗", category: "餐饮用品" },
  banana: { name: "香蕉", category: "食物" },
  apple: { name: "苹果", category: "食物" },
  sandwich: { name: "三明治", category: "食物" },
  orange: { name: "橙子", category: "食物" },
  broccoli: { name: "西兰花", category: "食物" },
  carrot: { name: "胡萝卜", category: "食物" },
  "hot dog": { name: "热狗", category: "食物" },
  pizza: { name: "披萨", category: "食物" },
  donut: { name: "甜甜圈", category: "食物" },
  cake: { name: "蛋糕", category: "食物" },
  chair: { name: "椅子", category: "家具" },
  couch: { name: "沙发", category: "家具" },
  "potted plant": { name: "盆栽", category: "植物" },
  bed: { name: "床", category: "家具" },
  "dining table": { name: "餐桌", category: "家具" },
  toilet: { name: "马桶", category: "家具" },
  tv: { name: "电视", category: "电子设备" },
  laptop: { name: "笔记本电脑", category: "电子设备" },
  mouse: { name: "鼠标", category: "电子设备" },
  remote: { name: "遥控器", category: "电子设备" },
  keyboard: { name: "键盘", category: "电子设备" },
  "cell phone": { name: "手机", category: "电子设备" },
  microwave: { name: "微波炉", category: "家用电器" },
  oven: { name: "烤箱", category: "家用电器" },
  toaster: { name: "烤面包机", category: "家用电器" },
  sink: { name: "水槽", category: "家居设施" },
  refrigerator: { name: "冰箱", category: "家用电器" },
  book: { name: "书", category: "学习用品" },
  clock: { name: "钟表", category: "家居用品" },
  vase: { name: "花瓶", category: "家居用品" },
  scissors: { name: "剪刀", category: "工具" },
  "teddy bear": { name: "泰迪熊", category: "玩具" },
  "hair drier": { name: "吹风机", category: "家用电器" },
  toothbrush: { name: "牙刷", category: "生活用品" },
};

export const mobileNetClassPatterns: MobileNetClassPattern[] = [
  { pattern: /\b(coffee mug|cup|mug|water jug)\b/i, name: "杯子", category: "餐饮用品" },
  { pattern: /\b(water bottle|bottle|pop bottle)\b/i, name: "瓶子", category: "餐饮用品" },
  { pattern: /\b(book|comic book|notebook|binder)\b/i, name: "书", category: "学习用品" },
  { pattern: /\b(apple|Granny Smith)\b/i, name: "苹果", category: "食物" },
  { pattern: /\b(banana|orange|lemon|strawberry|pineapple)\b/i, name: "水果", category: "食物" },
  { pattern: /\b(pizza|hotdog|hot dog|cheeseburger|sandwich|pretzel|bagel)\b/i, name: "食物", category: "食物" },
  { pattern: /\b(cat|tabby|tiger cat|Persian cat|Egyptian cat|Siamese cat)\b/i, name: "猫", category: "动物" },
  { pattern: /\b(dog|beagle|Labrador retriever|golden retriever|poodle|Chihuahua|corgi|husky)\b/i, name: "狗", category: "动物" },
  { pattern: /\b(bird|hen|cock|ostrich|peacock|parrot)\b/i, name: "鸟", category: "动物" },
  { pattern: /\b(kite)\b/i, name: "风筝", category: "运动用品" },
  { pattern: /\b(ball|basketball|soccer ball|tennis ball|ping-pong ball)\b/i, name: "球", category: "运动用品" },
  { pattern: /\b(laptop|notebook computer)\b/i, name: "笔记本电脑", category: "电子设备" },
  { pattern: /\b(desktop computer|monitor|screen|television|tv)\b/i, name: "显示设备", category: "电子设备" },
  { pattern: /\b(mouse|computer mouse)\b/i, name: "鼠标", category: "电子设备" },
  { pattern: /\b(keyboard|computer keyboard)\b/i, name: "键盘", category: "电子设备" },
  { pattern: /\b(cellular telephone|cell phone|mobile phone|iPod)\b/i, name: "手机", category: "电子设备" },
  { pattern: /\b(remote control|joystick)\b/i, name: "遥控器", category: "电子设备" },
  { pattern: /\b(camera|reflex camera|Polaroid camera|lens cap)\b/i, name: "相机", category: "电子设备" },
  { pattern: /\b(chair|folding chair|rocking chair|barber chair)\b/i, name: "椅子", category: "家具" },
  { pattern: /\b(couch|sofa|studio couch)\b/i, name: "沙发", category: "家具" },
  { pattern: /\b(table|desk|dining table)\b/i, name: "桌子", category: "家具" },
  { pattern: /\b(clock|wall clock|analog clock|digital clock)\b/i, name: "钟表", category: "家居用品" },
  { pattern: /\b(backpack|purse|handbag|wallet|suitcase)\b/i, name: "包", category: "随身物品" },
  { pattern: /\b(umbrella)\b/i, name: "雨伞", category: "随身物品" },
  { pattern: /\b(sunglasses|spectacles)\b/i, name: "眼镜", category: "随身物品" },
  { pattern: /\b(running shoe|shoe|sneaker|loafer)\b/i, name: "鞋", category: "服饰" },
  { pattern: /\b(toy|teddy bear|doll)\b/i, name: "玩具", category: "玩具" },
  { pattern: /\b(scissors|screwdriver|hammer|knife)\b/i, name: "工具", category: "工具" },
  { pattern: /\b(vase|flowerpot|pot)\b/i, name: "花瓶", category: "家居用品" },
  { pattern: /\b(microwave|oven|toaster|refrigerator|washer)\b/i, name: "家用电器", category: "家用电器" },
];

export const defaultObjectRecognitionMaterials: ObjectRecognitionMaterialItem[] = [
  {
    id: "cat",
    name: "猫",
    url: "/images/ai-practice/tfjs-common/cat.jpg",
  },
  {
    id: "dog",
    name: "狗",
    url: "/images/ai-practice/tfjs-common/image2.jpg",
  },
  {
    id: "book",
    name: "书",
    url: "/images/ai-practice/practice-02-2aa5c253.webp",
  },
  {
    id: "apple",
    name: "苹果",
    url: "/images/ai-practice/practice-07-0698f4e2.webp",
  },
  {
    id: "person",
    name: "人物",
    url: "/images/ai-practice/practice-08-31ce93c4.webp",
  },
  {
    id: "kite",
    name: "风筝",
    url: "/images/ai-practice/tfjs-common/image1.jpg",
  },
];
