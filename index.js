'use strict';

var Promise = require('es6-promise').Promise;
var zeroFill = require('zero-fill');

var BCVParser =
  require('bible-passage-reference-parser/js/en_bcv_parser').bcv_parser;
var bcv = new BCVParser();

var BOOK_TO_INDEX = require('./indexes/book-index-map');
var VERSE_INDEX = require('./indexes/verse-index-map');

// Added to allow integer verse reference
var { decodeVerseId } = require('./decodeVerseId');
var { BOOK_NAMES } = require('./bibleBooks');

var BIBLES = {
  'asv': require('./bibles/asv'),
  'kjv': require('./bibles/kjv')
};

module.exports = (function () {
  var bible = {};

  /**
   * Retrieve bible passages
   *
   * @param {String|Number} psg - bible book/chapter/verse (string or integer)
   * @param {String} ver - bible version
   * @return {Promise} returns String passage
   */
  bible.get = function (psg, ver) {
    var self = this;
    var v = ver || 'asv';
    v = v.toLowerCase();

    if (typeof psg === 'number') {
      // New behavior: treat as integer verseId
      const bibleVersion = BIBLES[v];
      const paddedVerseId = zeroFill(8, psg); // Pad to 8 digits like '01001001'
      const mappedIndex = VERSE_INDEX[paddedVerseId];

      if (mappedIndex == null) {
        return Promise.reject(new Error('Invalid verse ID'));
      }

      const verseText = bibleVersion[mappedIndex];

      const { book, chapter, verse } = decodeVerseId(psg);
      const bookName = BOOK_NAMES[book];
      if (!bookName) {
        return Promise.reject(new Error('Invalid book number from verse ID'));
      }

      const passageName = `${bookName} ${chapter}:${verse}`;

      return Promise.resolve({
        version: v,
        passage: passageName,
        text: verseText
      });
    }

    // OLD behavior for strings
    if (typeof psg !== 'string') {
      throw new TypeError('Passage should be a string or integer');
    }

    // clean/normalize psg to bcv object
    var psgBCV = bcv.parse(psg).parsed_entities()[0].entities[0];

    if (!psgBCV) { throw new Error('Bad bible passage input'); }

    return new Promise(function (res, rej) {
      // parse psg into index ranges
      var start = self._bcvToInd(psgBCV.start);
      var end = self._bcvToInd(psgBCV.end);
      var psgOsis = psgBCV.osis;
      var text = (end - start === 0) ? self._getVerses(BIBLES[v], start)
                                       : self._getVerses(BIBLES[v], start, end);

      if (text) {
        var data = { version: v, passage: psgOsis, text: text };
        res(data);
      } else {
        rej(Error('Ahhhhh!!! Nooo!!!'));
      }
    });
  };

  /**
   * Convert book, chapter, verse object into verse index
   *
   * @param {Object} psg - bible book/chapter/verse obj
   * @return {String} verse index (ie: 01001001)
   */
  bible._bcvToInd = function (psg) {
    var book = BOOK_TO_INDEX[psg.b].b;
    var b = zeroFill(2, book);
    var c = zeroFill(3, psg.c);
    var v = zeroFill(3, psg.v);

    return b + c + v;
  };

  /**
   * Convert book, chapter, verse object into verse index
   *
   * @param {Object} bVersions - bible version object
   * @param {String} start - start index
   * @param {String} end - end index
   * @return {String} bible passage
   */
  bible._getVerses = function (bVersions, start, end) {
    var s = VERSE_INDEX[start];
    var e = VERSE_INDEX[end];
    var arr = [];

    // Return single verse if no end
    if (!e) { return bVersions[s]; }

    for (var i = Number(s), len = Number(e); i < len + 1; i++) {
      arr.push(bVersions[i]);
    }

    return arr.join(' ');
  };

  return bible;
})();
