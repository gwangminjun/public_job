import assert from 'node:assert/strict';
import { MBTI_TYPES, QUESTIONS, START_QUESTION_ID } from '../src/lib/mbti.ts';

const expectedTypes = [
  'ENFJ', 'ENFP', 'ENTJ', 'ENTP', 'ESFJ', 'ESFP', 'ESTJ', 'ESTP',
  'INFJ', 'INFP', 'INTJ', 'INTP', 'ISFJ', 'ISFP', 'ISTJ', 'ISTP',
];
assert.deepEqual([...MBTI_TYPES].sort(), expectedTypes);

const visited = new Set();
const results = new Set();
let paths = 0;

function visit(id, ancestors = []) {
  assert.ok(!ancestors.includes(id), `Cycle: ${[...ancestors, id].join(' → ')}`);
  const question = QUESTIONS[id];
  assert.ok(question, `Missing question: ${id}`);
  assert.ok(question.text.trim(), `Empty question: ${id}`);
  assert.ok(question.options.length >= 2 && question.options.length <= 3, `Invalid options: ${id}`);
  visited.add(id);

  for (const option of question.options) {
    assert.ok(option.label.trim(), `Empty option: ${id}`);
    if (option.next.kind === 'question') {
      visit(option.next.id, [...ancestors, id]);
    } else {
      assert.equal(option.next.kind, 'result');
      assert.ok(expectedTypes.includes(option.next.type), `Invalid result: ${option.next.type}`);
      results.add(option.next.type);
      paths++;
    }
  }
}

visit(START_QUESTION_ID);
assert.deepEqual([...visited].sort(), Object.keys(QUESTIONS).sort(), 'Unreachable questions');
assert.deepEqual([...results].sort(), expectedTypes, 'Unreachable MBTI types');

// Hand-checked paths catch valid-looking edges pointing at the wrong result.
const fixtures = [
  [[0, 0, 0, 0], 'INFJ'],
  [[0, 0, 0, 1], 'INFP'],
  [[0, 0, 1, 0], 'INFJ'],
  [[0, 0, 1, 1], 'INFP'],
  [[0, 0, 0, 2, 0], 'INTJ'],
  [[0, 0, 0, 2, 1, 0], 'ISTP'],
  [[0, 0, 0, 2, 1, 1], 'INTP'],
  [[0, 1, 0], 'INFJ'],
  [[0, 1, 1, 0], 'ENTJ'],
  [[0, 1, 1, 1, 0], 'ENTP'],
  [[0, 1, 1, 1, 1], 'ENFP'],
  [[1, 0, 0], 'ESTP'],
  [[1, 0, 1, 0], 'ESFP'],
  [[1, 0, 1, 1], 'ISFP'],
  [[1, 1, 0], 'ESTJ'],
  [[1, 1, 1], 'ISTJ'],
  [[1, 2, 1], 'ISFJ'],
  [[1, 2, 0, 0], 'ENFJ'],
  [[1, 2, 0, 1], 'ESFJ'],
];

for (const [choices, expected] of fixtures) {
  let step = { kind: 'question', id: START_QUESTION_ID };
  for (const index of choices) {
    assert.equal(step.kind, 'question', `Path ended too soon: ${choices}`);
    step = QUESTIONS[step.id].options[index].next;
  }
  assert.deepEqual(step, { kind: 'result', type: expected });
}

console.log(`MBTI checks passed: ${visited.size} questions, ${results.size} types, ${paths} complete paths.`);
