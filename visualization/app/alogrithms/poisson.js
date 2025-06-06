

const factorial = (n) => {
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
};

function poisson(lambda, k) {
  const e = Math.E;
  return (e ** (-lambda) * (lambda ** k)) / factorial(k);
}
  
  // 示例使用
const lambda0 = 10 ** -6; // 平均发生率
d = 3



const k = 0; // 发生次数
// 压频比数值
const S = [
  0.85 / 1.55,
  0.95 / 1.55,
  1.05 / 1.55,
  1.15 / 1.55,
  1.25 / 1.55,
  1.35 / 1.55,
  1.45 / 1.55,
  1.55 / 1.55
]

// T 为time length of the task
function calProbability(T) {
  const lambda = lambda0 * 
    10 ** (
      d 
      * (1 - S[7])
      / (1- S[0])
    );
  const probability = 1 - poisson(lambda * T, k);
  return probability;
}

function hitProbability(P) {
  const hit = Math.random() < P
  return hit
}

module.exports = {
  hitProbability,
  calProbability
}
