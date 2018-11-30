/* Modified from https://github.com/indexdata/cql-js */
/* istanbul ignore file */
/* eslint-disable */

const DEFAULT_SERVER_CHOICE_FIELD = 'cql.serverChoice';
const DEFAULT_SERVER_CHOICE_RELATION = 'scr';

function indent(n, c) {
  let s = '';
  for (let i = 0; i < n; i++) {
    s += c;
  }
  return s;
}

export class CQLModifier {
  constructor() {
    this.name = null;
    this.relation = null;
    this.value = null;
  }

  toString() {
    return this.name + this.relation + this.value;
  }

  toXCQL(n, c) {
    let s = indent(n + 1, c) + '<modifier>\n';
    s = s + indent(n + 2, c) + '<name>' + this.name + '</name>\n';
    if (this.relation != null) {
      s = s + indent(n + 2, c) +
      '<relation>' + this.relation + '</relation>\n';
    }
    if (this.value != null) {
      s = s + indent(n + 2, c) +
      '<value>' + this.value + '</value>\n';
    }
    s = s + indent(n + 1, c) + '</modifier>\n';
    return s;
  }

  toFQ() {
    // we ignore modifier relation symbol, for value-less modifiers
    // we assume 'true'
    const value = this.value.length > 0 ? this.value : 'true';
    const s = '"' + this.name + '": "' + value + '"';
    return s;
  }
}

export class CQLSearchClause {
  constructor(field, fielduri, relation, relationuri,
    modifiers, term, scf, scr) {
    this.field = field;
    this.fielduri = fielduri;
    this.relation = relation;
    this.relationuri = relationuri;
    this.modifiers = modifiers;
    this.term = term;
    this.scf = scf || DEFAULT_SERVER_CHOICE_FIELD;
    this.scr = scr || DEFAULT_SERVER_CHOICE_RELATION;
  }

  toString() {
    let field = this.field;
    let relation = this.relation;
    if (field === this.scf && relation === this.scr) {
      // avoid redundant field/relation
      field = null;
      relation = null;
    }
    return (field ? field + ' ' : '') +
      (relation || '') +
      (this.modifiers.length > 0 ? '/' + this.modifiers.join('/') : '') +
      (relation || this.modifiers.length ? ' ' : '') +
      '"' + this.term + '"';
  }

  toXCQL(n, c) {
    let s = indent(n, c) + '<searchClause>\n';
    if (this.fielduri.length > 0) {
      s = s + indent(n + 1, c) + '<prefixes>\n' +
        indent(n + 2, c) + '<prefix>\n' +
        indent(n + 3, c) + '<identifier>' + this.fielduri +
        '</identifier>\n' +
        indent(n + 2, c) + '</prefix>\n' +
        indent(n + 1, c) + '</prefixes>\n';
    }
    s = s + indent(n + 1, c) + '<index>' + this.field + '</index>\n';
    s = s + indent(n + 1, c) + '<relation>\n';
    if (this.relationuri.length > 0) {
      s = s + indent(n + 2, c) +
        '<identifier>' + this.relationuri + '</identifier>\n';
    }
    s = s + indent(n + 2, c) + '<value>' + this.relation + '</value>\n';
    if (this.modifiers.length > 0) {
      s = s + indent(n + 2, c) + '<modifiers>\n';
      for (let i = 0; i < this.modifiers.length; i++) {
        s += this.modifiers[i].toXCQL(n + 2, c);
      }
      s = s + indent(n + 2, c) + '</modifiers>\n';
    }
    s = s + indent(n + 1, c) + '</relation>\n';
    s = s + indent(n + 1, c) + '<term>' + this.term + '</term>\n';
    s = s + indent(n, c) + '</searchClause>\n';
    return s;
  }

  toFQ() {
    let s = '{"term": "' + this.term + '"';
    if (this.field.length > 0 && this.field !== this.scf) {
      s += ', "field": "' + this.field + '"';
    }
    if (this.relation.length > 0 && this.relation !== this.scr) {
      s += ', "relation": "' + this._mapRelation(this.relation) + '"';
    }
    for (let i = 0; i < this.modifiers.length; i++) {
      // since modifiers are mapped to keys, ignore the reserved ones
      if (this.modifiers[i].name === 'term' ||
        this.modifiers[i].name === 'field' ||
        this.modifiers[i].name === 'relation') {
        continue;
      }
      s += ', ' + this.modifiers[i].toFQ();
    }
    s += '}';
    return s;
  }

  _mapRelation(rel) {
    switch (rel) {
      case '<':
        return 'lt';
      case '>':
        return 'gt';
      case '=':
        return 'eq';
      case '<>':
        return 'ne';
      case '>=':
        return 'ge';
      case '<=':
        return 'le';
      default:
        return rel;
    }
  }

  _remapRelation(rel) {
    switch (rel) {
      case 'lt':
        return '<';
      case 'gt':
        return '>';
      case 'eq':
        return '=';
      case 'ne':
        return '<>';
      case 'ge':
        return '>=';
      case 'le':
        return '<=';
      default:
        return rel;
    }
  }
}

export class CQLBoolean {
  constructor() {
    this.op = null;
    this.modifiers = null;
    this.left = null;
    this.right = null;
  }

  toString() {
    return (this.left.op ? '(' + this.left + ')' : this.left) + ' ' +
      this.op.toUpperCase() +
      (this.modifiers.length > 0 ? '/' + this.modifiers.join('/') : '') +
      ' ' + (this.right.op ? '(' + this.right + ')' : this.right);
  }

  toXCQL(n, c) {
    let s = indent(n, c) + '<triple>\n';
    s = s + indent(n + 1, c) + '<boolean>\n' +
      indent(n + 2, c) + '<value>' + this.op + '</value>\n';
    if (this.modifiers.length > 0) {
      s = s + indent(n + 2, c) + '<modifiers>\n';
      for (let i = 0; i < this.modifiers.length; i++) {
        s += this.modifiers[i].toXCQL(n + 2, c);
      }
      s = s + indent(n + 2, c) + '</modifiers>\n';
    }
    s = s + indent(n + 1, c) + '</boolean>\n';
    s = s + indent(n + 1, c) + '<leftOperand>\n' +
      this.left.toXCQL(n + 2, c) + indent(n + 1, c) + '</leftOperand>\n';

    s = s + indent(n + 1, c) + '<rightOperand>\n' +
      this.right.toXCQL(n + 2, c) + indent(n + 1, c) + '</rightOperand>\n';
    s = s + indent(n, c) + '</triple>\n';
    return s;
  }

  toFQ(n, c, nl) {
    let s = '{"op": "' + this.op + '"';
    // proximity modifiers
    for (let i = 0; i < this.modifiers.length; i++) {
      s += ', ' + this.modifiers[i].toFQ();
    }
    s += ',' + nl + indent(n, c) + ' "s1": ' + this.left.toFQ(n + 1, c, nl);
    s += ',' + nl + indent(n, c) + ' "s2": ' + this.right.toFQ(n + 1, c, nl);
    const fill = n && c ? ' ' : '';
    s += nl + indent(n - 1, c) + fill + '}';
    return s;
  }
}

export default class CQLParser {
  constructor() {
    this.qi = null;
    this.ql = null;
    this.qs = null;
    this.look = null;
    this.lval = null;
    this.val = null;
    this.prefixes = {};
    this.tree = null;
    this.scf = null;
    this.scr = null;
  }

  parse(query, scf, scr) {
    if (!query) {
      throw new Error('The query to be parsed cannot be empty');
    }
    this.scf = typeof scf !== 'string' ?
      DEFAULT_SERVER_CHOICE_FIELD : scf;
    this.scr = typeof scr !== 'string' ?
      DEFAULT_SERVER_CHOICE_RELATION : scr;
    this.qs = query;
    this.ql = this.qs.length;
    this.qi = 0;
    this._move();
    this.tree = this._parseQuery(this.scf, this.scr, []);
    if (this.look !== '') {
      throw new Error('EOF expected');
    }
  }

  parseFromFQ(query, scf, scr) {
    if (!query) {
      throw new Error('The query to be parsed cannot be empty');
    }
    if (typeof query === 'string') {
      query = JSON.parse(query);
    }
    this.scf = typeof scf !== 'string' ?
      DEFAULT_SERVER_CHOICE_FIELD : scf;
    this.scr = typeof scr !== 'string' ?
      DEFAULT_SERVER_CHOICE_RELATION : scr;
    this.tree = this._parseFromFQ(query);
  }

  _parseFromFQ(fq) {
    // op-node
    if (fq.hasOwnProperty('op') &&
      fq.hasOwnProperty('s1') &&
      fq.hasOwnProperty('s2')) {
      const node = new CQLBoolean();
      node.op = fq.op;
      node.left = this._parseFromFQ(fq.s1);
      node.right = this._parseFromFQ(fq.s2);
      // include all other members as modifiers
      node.modifiers = [];
      for (const key in fq) {
        if (key === 'op' || key === 's1' || key === 's2') {
          continue;
        }
        const mod = new CQLModifier();
        mod.name = key;
        mod.relation = '=';
        mod.value = fq[key];
        node.modifiers.push(mod);
      }
      return node;
    }

    // search-clause node
    if (fq.hasOwnProperty('term')) {
      const node = new CQLSearchClause();
      node.term = fq.term;
      node.scf = this.scf;
      node.scr = this.scr;
      node.field = fq.hasOwnProperty('field') ?
        fq.field : this.scf;
      node.relation = fq.hasOwnProperty('relation') ?
        node._remapRelation(fq.relation) : this.scr;
      // include all other members as modifiers
      node.relationuri = '';
      node.fielduri = '';
      node.modifiers = [];
      for (const key in fq) {
        if (key === 'term' || key === 'field' || key === 'relation') {
          continue;
        }
        const mod = new CQLModifier();
        mod.name = key;
        mod.relation = '=';
        mod.value = fq[key];
        node.modifiers.push(mod);
      }
      return node;
    }
    throw new Error('Unknow node type; ' + JSON.stringify(fq));
  }

  toXCQL(c) {
    c = typeof c === 'undefined' ? ' ' : c;
    return this.tree.toXCQL(0, c);
  }

  toFQ(c, nl) {
    c = typeof c === 'undefined' ? '  ' : c;
    nl = typeof nl === 'undefined' ? '\n' : c;
    return this.tree.toFQ(0, c, nl);
  }

  toString() {
    return this.tree.toString();
  }

  _parseQuery(field, relation, modifiers) {
    let left = this._parseSearchClause(field, relation, modifiers);
    while (this.look === 's' && (
      this.lval === 'and' ||
        this.lval === 'or' ||
        this.lval === 'not' ||
        this.lval === 'prox')) {
      const b = new CQLBoolean();
      b.op = this.lval;
      this._move();
      b.modifiers = this._parseModifiers();
      b.left = left;
      b.right = this._parseSearchClause(field, relation, modifiers);
      left = b;
    }
    return left;
  }

  _parseModifiers() {
    const ar = [];
    while (this.look === '/') {
      this._move();
      if (this.look !== 's' && this.look !== 'q') {
        throw new Error('Invalid modifier.');
      }

      const name = this.lval;
      this._move();
      if (this.look.length > 0 &&
        this._strchr('<>=', this.look.charAt(0))) {
        const rel = this.look;
        this._move();
        if (this.look !== 's' && this.look !== 'q') {
          throw new Error('Invalid relation within the modifier.');
        }

        const m = new CQLModifier();
        m.name = name;
        m.relation = rel;
        m.value = this.val;
        ar.push(m);
        this._move();
      } else {
        const m = new CQLModifier();
        m.name = name;
        m.relation = '';
        m.value = '';
        ar.push(m);
      }
    }
    return ar;
  }

  _parseSearchClause(field, relation, modifiers) {
    if (this.look === '(') {
      this._move();
      const b = this._parseQuery(field, relation, modifiers);
      if (this.look === ')') {
        this._move();
      } else {
        throw new Error('Missing closing parenthesis.');
      }

      return b;
    } else if (this.look === 's' || this.look === 'q') {
      const first = this.val; // dont know if field or term yet
      this._move();
      if (this.look === 'q' ||
        (this.look === 's' &&
          this.lval !== 'and' &&
          this.lval !== 'or' &&
          this.lval !== 'not' &&
          this.lval !== 'prox')) {
        const rel = this.val; // string relation
        this._move();
        return this._parseSearchClause(first, rel,
          this._parseModifiers());
      } else if (this.look.length > 0 &&
        this._strchr('<>=', this.look.charAt(0))) {
        const rel = this.look; // other relation <, = ,etc
        this._move();
        return this._parseSearchClause(first, rel,
          this._parseModifiers());
      } else {
        // it's a search term
        let pos = field.indexOf('.');
        let pre = '';
        if (pos !== -1) {
          pre = field.substring(0, pos);
        }

        const uri = this._lookupPrefix(pre);
        if (uri.length > 0) {
          field = field.substring(pos + 1);
        }

        pos = relation.indexOf('.');
        if (pos === -1) {
          pre = 'cql';
        } else {
          pre = relation.substring(0, pos);
        }

        const reluri = this._lookupPrefix(pre);
        if (reluri.Length > 0) {
          relation = relation.Substring(pos + 1);
        }

        const sc = new CQLSearchClause(
          field,
          uri,
          relation,
          reluri,
          modifiers,
          first,
          this.scf,
          this.scr
        );
        return sc;
      }
      // prefixes
    } else if (this.look === '>') {
      this._move();
      if (this.look !== 's' && this.look !== 'q') {
        throw new Error('Expecting string or a quoted expression.');
      }

      const first = this.lval;
      this._move();
      if (this.look === '=') {
        this._move();
        if (this.look !== 's' && this.look !== 'q') {
          throw new Error('Expecting string or a quoted expression.');
        }

        this._addPrefix(first, this.lval);
        this._move();
        return this._parseQuery(field, relation, modifiers);
      } else {
        this._addPrefix('default', first);
        return this._parseQuery(field, relation, modifiers);
      }
    } else {
      throw new Error('Invalid search clause.');
    }
  }

  _move() {
    // eat whitespace
    while (this.qi < this.ql &&
      this._strchr(' \t\r\n', this.qs.charAt(this.qi))) {
      this.qi++;
    }
    // eof
    if (this.qi === this.ql) {
      this.look = '';
      return;
    }
    // current char
    const c = this.qs.charAt(this.qi);
    // separators
    if (this._strchr('()/', c)) {
      this.look = c;
      this.qi++;
      // comparitor
    } else if (this._strchr('<>=', c)) {
      this.look = c;
      this.qi++;
      // comparitors can repeat, could be if
      while (this.qi < this.ql &&
        this._strchr('<>=', this.qs.charAt(this.qi))) {
        this.look = this.look + this.qs.charAt(this.qi);
        this.qi++;
      }
      // quoted string
    } else if (this._strchr("\"'", c)) {
      this.look = 'q';
      // remember quote char
      const mark = c;
      this.qi++;
      this.val = '';
      let escaped = false;
      while (this.qi < this.ql) {
        if (!escaped && this.qs.charAt(this.qi) === mark) {
          break;
        }
        if (!escaped && this.qs.charAt(this.qi) === '\\') {
          escaped = true;
        } else {
          escaped = false;
        }
        this.val += this.qs.charAt(this.qi);
        this.qi++;
      }
      this.lval = this.val.toLowerCase();
      if (this.qi < this.ql) {
        this.qi++;
      } else { // unterminated
        this.look = ''; // notify error
      }
      // unquoted string
    } else {
      this.look = 's';
      this.val = '';
      while (this.qi < this.ql &&
        !this._strchr('()/<>= \t\r\n', this.qs.charAt(this.qi))) {
        this.val = this.val + this.qs.charAt(this.qi);
        this.qi++;
      }
      this.lval = this.val.toLowerCase();
    }
  }

  _strchr(s, ch) {
    return s.indexOf(ch) >= 0;
  }

  _lookupPrefix(name) {
    return this.prefixes[name] ? this.prefixes[name] : '';
  }

  _addPrefix(name, value) {
    // overwrite existing items
    this.prefixes[name] = value;
  }
}
