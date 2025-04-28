// decodeVerseId.js

'use strict';

/**
 * Decode a 7-digit verseId into { book, chapter, verse }
 * Example: 43003016 → { book: 43, chapter: 3, verse: 16 }
 * @param {number} verseId
 * @returns {{book: number, chapter: number, verse: number}}
 */
function decodeVerseId(verseId) {
  const book = Math.floor(verseId / 1000000);
  const chapter = Math.floor((verseId % 1000000) / 1000);
  const verse = verseId % 1000;
  return { book, chapter, verse };
}

module.exports = { decodeVerseId };
