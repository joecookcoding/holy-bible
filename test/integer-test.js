'use strict';

const bible = require('../index');

async function runTests() {
  try {
    console.log('---- Old Way (String Reference) ----');
    const john316str = await bible.get('John 3:16', 'kjv');
    console.log(john316str);

    console.log('---- New Way (Integer Verse ID) ----');
    const john316int = await bible.get(43003016, 'kjv');
    console.log(john316int);

    console.log('---- Genesis 1:1 (Integer) ----');
    const gen11 = await bible.get(1001001, 'asv');
    console.log(gen11);

    console.log('---- Invalid ID (should fail) ----');
    await bible.get(99999999, 'kjv');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

runTests();
