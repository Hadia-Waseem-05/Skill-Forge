export const PASSING_PERCENTAGE = 0.5;

function calculateScore(userAnswers, correctAnswers) {
  let score = 0;

  for (let i = 0; i < correctAnswers.length; i++) {
    if (userAnswers[i] === correctAnswers[i]) {
      score = score + 1;
    }
  }

  return score;
}

export default calculateScore;