export const normalizeRatePercent = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  const text = String(value).trim().replace("%", "");
  if (!text) return null;

  const num = Number(text);
  if (Number.isNaN(num)) return null;

  // 兼容 0~1 的小数正确率
  const rate = num > 0 && num <= 1 ? num * 100 : num;
  return Math.max(0, Math.min(100, rate));
};

// 半颗星-五颗星，按 10% 一档
export const percentToStars = (percent: number): number => {
  if (!Number.isFinite(percent)) return 0;

  const rate = Math.max(0, Math.min(100, percent));
  if (rate <= 0) return 0;
  if (rate <= 10) return 0.5;
  if (rate <= 20) return 1;
  if (rate <= 30) return 1.5;
  if (rate <= 40) return 2;
  if (rate <= 50) return 2.5;
  if (rate <= 60) return 3;
  if (rate <= 70) return 3.5;
  if (rate <= 80) return 4;
  if (rate <= 90) return 4.5;
  return 5;
};

export const scoreToStars = (
  score: number | null | undefined,
  totalScore: number | null | undefined
): number => {
  const scoreNum = Number(score);
  const totalNum = Number(totalScore);

  if (!Number.isFinite(scoreNum) || !Number.isFinite(totalNum) || totalNum <= 0) {
    return 0;
  }

  const rate = Math.round((scoreNum / totalNum) * 100);
  return percentToStars(rate);
};
