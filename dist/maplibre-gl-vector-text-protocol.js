(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.VectorTextProtocol = {}));
})(this, (function (exports) { 'use strict';

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function getAugmentedNamespace(n) {
	  if (n.__esModule) return n;
	  var f = n.default;
		if (typeof f == "function") {
			var a = function a () {
				if (this instanceof a) {
	        return Reflect.construct(f, arguments, this.constructor);
				}
				return f.apply(this, arguments);
			};
			a.prototype = f.prototype;
	  } else a = {};
	  Object.defineProperty(a, '__esModule', {value: true});
		Object.keys(n).forEach(function (k) {
			var d = Object.getOwnPropertyDescriptor(n, k);
			Object.defineProperty(a, k, d.get ? d : {
				enumerable: true,
				get: function () {
					return n[k];
				}
			});
		});
		return a;
	}

	function objectConverter(columns) {
	  return new Function("d", "return {" + columns.map(function(name, i) {
	    return JSON.stringify(name) + ": d[" + i + "]";
	  }).join(",") + "}");
	}

	function customConverter(columns, f) {
	  var object = objectConverter(columns);
	  return function(row, i) {
	    return f(object(row), i, columns);
	  };
	}

	// Compute unique columns in order of discovery.
	function inferColumns(rows) {
	  var columnSet = Object.create(null),
	      columns = [];

	  rows.forEach(function(row) {
	    for (var column in row) {
	      if (!(column in columnSet)) {
	        columns.push(columnSet[column] = column);
	      }
	    }
	  });

	  return columns;
	}

	function dsv$1(delimiter) {
	  var reFormat = new RegExp("[\"" + delimiter + "\n]"),
	      delimiterCode = delimiter.charCodeAt(0);

	  function parse(text, f) {
	    var convert, columns, rows = parseRows(text, function(row, i) {
	      if (convert) return convert(row, i - 1);
	      columns = row, convert = f ? customConverter(row, f) : objectConverter(row);
	    });
	    rows.columns = columns;
	    return rows;
	  }

	  function parseRows(text, f) {
	    var EOL = {}, // sentinel value for end-of-line
	        EOF = {}, // sentinel value for end-of-file
	        rows = [], // output rows
	        N = text.length,
	        I = 0, // current character index
	        n = 0, // the current line number
	        t, // the current token
	        eol; // is the current token followed by EOL?

	    function token() {
	      if (I >= N) return EOF; // special case: end of file
	      if (eol) return eol = false, EOL; // special case: end of line

	      // special case: quotes
	      var j = I, c;
	      if (text.charCodeAt(j) === 34) {
	        var i = j;
	        while (i++ < N) {
	          if (text.charCodeAt(i) === 34) {
	            if (text.charCodeAt(i + 1) !== 34) break;
	            ++i;
	          }
	        }
	        I = i + 2;
	        c = text.charCodeAt(i + 1);
	        if (c === 13) {
	          eol = true;
	          if (text.charCodeAt(i + 2) === 10) ++I;
	        } else if (c === 10) {
	          eol = true;
	        }
	        return text.slice(j + 1, i).replace(/""/g, "\"");
	      }

	      // common case: find next delimiter or newline
	      while (I < N) {
	        var k = 1;
	        c = text.charCodeAt(I++);
	        if (c === 10) eol = true; // \n
	        else if (c === 13) { eol = true; if (text.charCodeAt(I) === 10) ++I, ++k; } // \r|\r\n
	        else if (c !== delimiterCode) continue;
	        return text.slice(j, I - k);
	      }

	      // special case: last token before EOF
	      return text.slice(j);
	    }

	    while ((t = token()) !== EOF) {
	      var a = [];
	      while (t !== EOL && t !== EOF) {
	        a.push(t);
	        t = token();
	      }
	      if (f && (a = f(a, n++)) == null) continue;
	      rows.push(a);
	    }

	    return rows;
	  }

	  function format(rows, columns) {
	    if (columns == null) columns = inferColumns(rows);
	    return [columns.map(formatValue).join(delimiter)].concat(rows.map(function(row) {
	      return columns.map(function(column) {
	        return formatValue(row[column]);
	      }).join(delimiter);
	    })).join("\n");
	  }

	  function formatRows(rows) {
	    return rows.map(formatRow).join("\n");
	  }

	  function formatRow(row) {
	    return row.map(formatValue).join(delimiter);
	  }

	  function formatValue(text) {
	    return text == null ? ""
	        : reFormat.test(text += "") ? "\"" + text.replace(/\"/g, "\"\"") + "\""
	        : text;
	  }

	  return {
	    parse: parse,
	    parseRows: parseRows,
	    format: format,
	    formatRows: formatRows
	  };
	}

	var csv = dsv$1(",");

	var csvParse = csv.parse;
	var csvParseRows = csv.parseRows;
	var csvFormat = csv.format;
	var csvFormatRows = csv.formatRows;

	var tsv = dsv$1("\t");

	var tsvParse = tsv.parse;
	var tsvParseRows = tsv.parseRows;
	var tsvFormat = tsv.format;
	var tsvFormatRows = tsv.formatRows;

	var d3Dsv = /*#__PURE__*/Object.freeze({
		__proto__: null,
		csvFormat: csvFormat,
		csvFormatRows: csvFormatRows,
		csvParse: csvParse,
		csvParseRows: csvParseRows,
		dsvFormat: dsv$1,
		tsvFormat: tsvFormat,
		tsvFormatRows: tsvFormatRows,
		tsvParse: tsvParse,
		tsvParseRows: tsvParseRows
	});

	var require$$0 = /*@__PURE__*/getAugmentedNamespace(d3Dsv);

	var sexagesimal$1 = {exports: {}};

	sexagesimal$1.exports = element;
	sexagesimal$1.exports.pair = pair;
	sexagesimal$1.exports.format = format;
	sexagesimal$1.exports.formatPair = formatPair;
	sexagesimal$1.exports.coordToDMS = coordToDMS;


	function element(input, dims) {
	  var result = search(input, dims);
	  return (result === null) ? null : result.val;
	}


	function formatPair(input) {
	  return format(input.lat, 'lat') + ' ' + format(input.lon, 'lon');
	}


	// Is 0 North or South?
	function format(input, dim) {
	  var dms = coordToDMS(input, dim);
	  return dms.whole + '° ' +
	    (dms.minutes ? dms.minutes + '\' ' : '') +
	    (dms.seconds ? dms.seconds + '" ' : '') + dms.dir;
	}


	function coordToDMS(input, dim) {
	  var dirs = { lat: ['N', 'S'], lon: ['E', 'W'] }[dim] || '';
	  var dir = dirs[input >= 0 ? 0 : 1];
	  var abs = Math.abs(input);
	  var whole = Math.floor(abs);
	  var fraction = abs - whole;
	  var fractionMinutes = fraction * 60;
	  var minutes = Math.floor(fractionMinutes);
	  var seconds = Math.floor((fractionMinutes - minutes) * 60);

	  return {
	    whole: whole,
	    minutes: minutes,
	    seconds: seconds,
	    dir: dir
	  };
	}


	function search(input, dims) {
	  if (!dims) dims = 'NSEW';
	  if (typeof input !== 'string') return null;

	  input = input.toUpperCase();
	  var regex = /^[\s\,]*([NSEW])?\s*([\-|\—|\―]?[0-9.]+)[°º˚]?\s*(?:([0-9.]+)['’′‘]\s*)?(?:([0-9.]+)(?:''|"|”|″)\s*)?([NSEW])?/;

	  var m = input.match(regex);
	  if (!m) return null;  // no match

	  var matched = m[0];

	  // extract dimension.. m[1] = leading, m[5] = trailing
	  var dim;
	  if (m[1] && m[5]) {                 // if matched both..
	    dim = m[1];                       // keep leading
	    matched = matched.slice(0, -1);   // remove trailing dimension from match
	  } else {
	    dim = m[1] || m[5];
	  }

	  // if unrecognized dimension
	  if (dim && dims.indexOf(dim) === -1) return null;

	  // extract DMS
	  var deg = m[2] ? parseFloat(m[2]) : 0;
	  var min = m[3] ? parseFloat(m[3]) / 60 : 0;
	  var sec = m[4] ? parseFloat(m[4]) / 3600 : 0;
	  var sign = (deg < 0) ? -1 : 1;
	  if (dim === 'S' || dim === 'W') sign *= -1;

	  return {
	    val: (Math.abs(deg) + min + sec) * sign,
	    dim: dim,
	    matched: matched,
	    remain: input.slice(matched.length)
	  };
	}


	function pair(input, dims) {
	  input = input.trim();
	  var one = search(input, dims);
	  if (!one) return null;

	  input = one.remain.trim();
	  var two = search(input, dims);
	  if (!two || two.remain) return null;

	  if (one.dim) {
	    return swapdim(one.val, two.val, one.dim);
	  } else {
	    return [one.val, two.val];
	  }
	}


	function swapdim(a, b, dim) {
	  if (dim === 'N' || dim === 'S') return [a, b];
	  if (dim === 'W' || dim === 'E') return [b, a];
	}

	var sexagesimalExports = sexagesimal$1.exports;

	var dsv = require$$0,
	    sexagesimal = sexagesimalExports;

	var latRegex = /(Lat)(itude)?/gi,
	    lonRegex = /(L)(on|ng)(gitude)?/i;

	function guessHeader(row, regexp) {
	    var name, match, score;
	    for (var f in row) {
	        match = f.match(regexp);
	        if (match && (!name || match[0].length / f.length > score)) {
	            score = match[0].length / f.length;
	            name = f;
	        }
	    }
	    return name;
	}

	function guessLatHeader(row) { return guessHeader(row, latRegex); }
	function guessLonHeader(row) { return guessHeader(row, lonRegex); }

	function isLat(f) { return !!f.match(latRegex); }
	function isLon(f) { return !!f.match(lonRegex); }

	function keyCount(o) {
	    return (typeof o == 'object') ? Object.keys(o).length : 0;
	}

	function autoDelimiter(x) {
	    var delimiters = [',', ';', '\t', '|'];
	    var results = [];

	    delimiters.forEach(function (delimiter) {
	        var res = dsv.dsvFormat(delimiter).parse(x);
	        if (res.length >= 1) {
	            var count = keyCount(res[0]);
	            for (var i = 0; i < res.length; i++) {
	                if (keyCount(res[i]) !== count) return;
	            }
	            results.push({
	                delimiter: delimiter,
	                arity: Object.keys(res[0]).length,
	            });
	        }
	    });

	    if (results.length) {
	        return results.sort(function (a, b) {
	            return b.arity - a.arity;
	        })[0].delimiter;
	    } else {
	        return null;
	    }
	}

	/**
	 * Silly stopgap for dsv to d3-dsv upgrade
	 *
	 * @param {Array} x dsv output
	 * @returns {Array} array without columns member
	 */
	function deleteColumns(x) {
	    delete x.columns;
	    return x;
	}

	function auto(x) {
	    var delimiter = autoDelimiter(x);
	    if (!delimiter) return null;
	    return deleteColumns(dsv.dsvFormat(delimiter).parse(x));
	}

	function csv2geojson(x, options, callback) {

	    if (!callback) {
	        callback = options;
	        options = {};
	    }

	    options.delimiter = options.delimiter || ',';

	    var latfield = options.latfield || '',
	        lonfield = options.lonfield || '',
	        crs = options.crs || '';

	    var features = [],
	        featurecollection = {type: 'FeatureCollection', features: features};

	    if (crs !== '') {
	        featurecollection.crs = {type: 'name', properties: {name: crs}};
	    }

	    if (options.delimiter === 'auto' && typeof x == 'string') {
	        options.delimiter = autoDelimiter(x);
	        if (!options.delimiter) {
	            callback({
	                type: 'Error',
	                message: 'Could not autodetect delimiter'
	            });
	            return;
	        }
	    }

	    var numericFields = options.numericFields ? options.numericFields.split(',') : null;

	    var parsed = (typeof x == 'string') ?
	        dsv.dsvFormat(options.delimiter).parse(x, function (d) {
	            if (numericFields) {
	                for (var key in d) {
	                    if (numericFields.includes(key)) {
	                        d[key] = +d[key];
	                    }
	                }
	            }
	            return d;
	        }) : x;

	    if (!parsed.length) {
	        callback(null, featurecollection);
	        return;
	    }

	    var errors = [];
	    var i;


	    if (!latfield) latfield = guessLatHeader(parsed[0]);
	    if (!lonfield) lonfield = guessLonHeader(parsed[0]);
	    var noGeometry = (!latfield || !lonfield);

	    if (noGeometry) {
	        for (i = 0; i < parsed.length; i++) {
	            features.push({
	                type: 'Feature',
	                properties: parsed[i],
	                geometry: null
	            });
	        }
	        callback(errors.length ? errors : null, featurecollection);
	        return;
	    }

	    for (i = 0; i < parsed.length; i++) {
	        if (parsed[i][lonfield] !== undefined &&
	            parsed[i][latfield] !== undefined) {

	            var lonk = parsed[i][lonfield],
	                latk = parsed[i][latfield],
	                lonf, latf,
	                a;

	            a = sexagesimal(lonk, 'EW');
	            if (a) lonk = a;
	            a = sexagesimal(latk, 'NS');
	            if (a) latk = a;

	            lonf = parseFloat(lonk);
	            latf = parseFloat(latk);

	            if (isNaN(lonf) ||
	                isNaN(latf)) {
	                errors.push({
	                    message: 'A row contained an invalid value for latitude or longitude',
	                    row: parsed[i],
	                    index: i
	                });
	            } else {
	                if (!options.includeLatLon) {
	                    delete parsed[i][lonfield];
	                    delete parsed[i][latfield];
	                }

	                features.push({
	                    type: 'Feature',
	                    properties: parsed[i],
	                    geometry: {
	                        type: 'Point',
	                        coordinates: [
	                            parseFloat(lonf),
	                            parseFloat(latf)
	                        ]
	                    }
	                });
	            }
	        }
	    }

	    callback(errors.length ? errors : null, featurecollection);
	}

	function toLine(gj) {
	    var features = gj.features;
	    var line = {
	        type: 'Feature',
	        geometry: {
	            type: 'LineString',
	            coordinates: []
	        }
	    };
	    for (var i = 0; i < features.length; i++) {
	        line.geometry.coordinates.push(features[i].geometry.coordinates);
	    }
	    line.properties = features.reduce(function (aggregatedProperties, newFeature) {
	        for (var key in newFeature.properties) {
	            if (!aggregatedProperties[key]) {
	                aggregatedProperties[key] = [];
	            }
	            aggregatedProperties[key].push(newFeature.properties[key]);
	        }
	        return aggregatedProperties;
	    }, {});
	    return {
	        type: 'FeatureCollection',
	        features: [line]
	    };
	}

	function toPolygon(gj) {
	    var features = gj.features;
	    var poly = {
	        type: 'Feature',
	        geometry: {
	            type: 'Polygon',
	            coordinates: [[]]
	        }
	    };
	    for (var i = 0; i < features.length; i++) {
	        poly.geometry.coordinates[0].push(features[i].geometry.coordinates);
	    }
	    poly.properties = features.reduce(function (aggregatedProperties, newFeature) {
	        for (var key in newFeature.properties) {
	            if (!aggregatedProperties[key]) {
	                aggregatedProperties[key] = [];
	            }
	            aggregatedProperties[key].push(newFeature.properties[key]);
	        }
	        return aggregatedProperties;
	    }, {});
	    return {
	        type: 'FeatureCollection',
	        features: [poly]
	    };
	}

	var csv2geojson_1 = {
	    isLon: isLon,
	    isLat: isLat,
	    guessLatHeader: guessLatHeader,
	    guessLonHeader: guessLonHeader,
	    csv: dsv.csvParse,
	    tsv: dsv.tsvParse,
	    dsv: dsv,
	    auto: auto,
	    csv2geojson: csv2geojson,
	    toLine: toLine,
	    toPolygon: toPolygon
	};

	function identity(x) {
	  return x;
	}

	function transform(transform) {
	  if (transform == null) return identity;
	  var x0,
	      y0,
	      kx = transform.scale[0],
	      ky = transform.scale[1],
	      dx = transform.translate[0],
	      dy = transform.translate[1];
	  return function(input, i) {
	    if (!i) x0 = y0 = 0;
	    var j = 2, n = input.length, output = new Array(n);
	    output[0] = (x0 += input[0]) * kx + dx;
	    output[1] = (y0 += input[1]) * ky + dy;
	    while (j < n) output[j] = input[j], ++j;
	    return output;
	  };
	}

	function reverse(array, n) {
	  var t, j = array.length, i = j - n;
	  while (i < --j) t = array[i], array[i++] = array[j], array[j] = t;
	}

	function topojsonFeature(topology, o) {
	  if (typeof o === "string") o = topology.objects[o];
	  return o.type === "GeometryCollection"
	      ? {type: "FeatureCollection", features: o.geometries.map(function(o) { return feature(topology, o); })}
	      : feature(topology, o);
	}

	function feature(topology, o) {
	  var id = o.id,
	      bbox = o.bbox,
	      properties = o.properties == null ? {} : o.properties,
	      geometry = object(topology, o);
	  return id == null && bbox == null ? {type: "Feature", properties: properties, geometry: geometry}
	      : bbox == null ? {type: "Feature", id: id, properties: properties, geometry: geometry}
	      : {type: "Feature", id: id, bbox: bbox, properties: properties, geometry: geometry};
	}

	function object(topology, o) {
	  var transformPoint = transform(topology.transform),
	      arcs = topology.arcs;

	  function arc(i, points) {
	    if (points.length) points.pop();
	    for (var a = arcs[i < 0 ? ~i : i], k = 0, n = a.length; k < n; ++k) {
	      points.push(transformPoint(a[k], k));
	    }
	    if (i < 0) reverse(points, n);
	  }

	  function point(p) {
	    return transformPoint(p);
	  }

	  function line(arcs) {
	    var points = [];
	    for (var i = 0, n = arcs.length; i < n; ++i) arc(arcs[i], points);
	    if (points.length < 2) points.push(points[0]); // This should never happen per the specification.
	    return points;
	  }

	  function ring(arcs) {
	    var points = line(arcs);
	    while (points.length < 4) points.push(points[0]); // This may happen if an arc has only two points.
	    return points;
	  }

	  function polygon(arcs) {
	    return arcs.map(ring);
	  }

	  function geometry(o) {
	    var type = o.type, coordinates;
	    switch (type) {
	      case "GeometryCollection": return {type: type, geometries: o.geometries.map(geometry)};
	      case "Point": coordinates = point(o.coordinates); break;
	      case "MultiPoint": coordinates = o.coordinates.map(point); break;
	      case "LineString": coordinates = line(o.arcs); break;
	      case "MultiLineString": coordinates = o.arcs.map(line); break;
	      case "Polygon": coordinates = polygon(o.arcs); break;
	      case "MultiPolygon": coordinates = o.arcs.map(polygon); break;
	      default: return null;
	    }
	    return {type: type, coordinates: coordinates};
	  }

	  return geometry(o);
	}

	function $(element, tagName) {
	    return Array.from(element.getElementsByTagName(tagName));
	}
	function normalizeId(id) {
	    return id[0] === "#" ? id : `#${id}`;
	}
	function $ns(element, tagName, ns) {
	    return Array.from(element.getElementsByTagNameNS(ns, tagName));
	}
	/**
	 * get the content of a text node, if any
	 */
	function nodeVal(node) {
	    node?.normalize();
	    return (node && node.textContent) || "";
	}
	/**
	 * Get one Y child of X, if any, otherwise null
	 */
	function get1(node, tagName, callback) {
	    const n = node.getElementsByTagName(tagName);
	    const result = n.length ? n[0] : null;
	    if (result && callback)
	        callback(result);
	    return result;
	}
	function get(node, tagName, callback) {
	    const properties = {};
	    if (!node)
	        return properties;
	    const n = node.getElementsByTagName(tagName);
	    const result = n.length ? n[0] : null;
	    if (result && callback) {
	        return callback(result, properties);
	    }
	    return properties;
	}
	function val1(node, tagName, callback) {
	    const val = nodeVal(get1(node, tagName));
	    if (val && callback)
	        return callback(val) || {};
	    return {};
	}
	function $num(node, tagName, callback) {
	    const val = parseFloat(nodeVal(get1(node, tagName)));
	    if (isNaN(val))
	        return undefined;
	    if (val && callback)
	        return callback(val) || {};
	    return {};
	}
	function num1(node, tagName, callback) {
	    const val = parseFloat(nodeVal(get1(node, tagName)));
	    if (isNaN(val))
	        return undefined;
	    if (callback)
	        callback(val);
	    return val;
	}
	function getMulti(node, propertyNames) {
	    const properties = {};
	    for (const property of propertyNames) {
	        val1(node, property, (val) => {
	            properties[property] = val;
	        });
	    }
	    return properties;
	}
	function isElement(node) {
	    return node?.nodeType === 1;
	}

	function getLineStyle(node) {
	    return get(node, "line", (lineStyle) => {
	        const val = Object.assign({}, val1(lineStyle, "color", (color) => {
	            return { stroke: `#${color}` };
	        }), $num(lineStyle, "opacity", (opacity) => {
	            return { "stroke-opacity": opacity };
	        }), $num(lineStyle, "width", (width) => {
	            // GPX width is in mm, convert to px with 96 px per inch
	            return { "stroke-width": (width * 96) / 25.4 };
	        }));
	        return val;
	    });
	}

	function getExtensions(node) {
	    let values = [];
	    if (node === null)
	        return values;
	    for (const child of Array.from(node.childNodes)) {
	        if (!isElement(child))
	            continue;
	        const name = abbreviateName(child.nodeName);
	        if (name === "gpxtpx:TrackPointExtension") {
	            // loop again for nested garmin extensions (eg. "gpxtpx:hr")
	            values = values.concat(getExtensions(child));
	        }
	        else {
	            // push custom extension (eg. "power")
	            const val = nodeVal(child);
	            values.push([name, parseNumeric(val)]);
	        }
	    }
	    return values;
	}
	function abbreviateName(name) {
	    return ["heart", "gpxtpx:hr", "hr"].includes(name) ? "heart" : name;
	}
	function parseNumeric(val) {
	    const num = parseFloat(val);
	    return isNaN(num) ? val : num;
	}

	function coordPair$1(node) {
	    const ll = [
	        parseFloat(node.getAttribute("lon") || ""),
	        parseFloat(node.getAttribute("lat") || ""),
	    ];
	    if (isNaN(ll[0]) || isNaN(ll[1])) {
	        return null;
	    }
	    num1(node, "ele", (val) => {
	        ll.push(val);
	    });
	    const time = get1(node, "time");
	    return {
	        coordinates: ll,
	        time: time ? nodeVal(time) : null,
	        extendedValues: getExtensions(get1(node, "extensions")),
	    };
	}

	function extractProperties(node) {
	    const properties = getMulti(node, [
	        "name",
	        "cmt",
	        "desc",
	        "type",
	        "time",
	        "keywords",
	    ]);
	    const extensions = Array.from(node.getElementsByTagNameNS("http://www.garmin.com/xmlschemas/GpxExtensions/v3", "*"));
	    for (const child of extensions) {
	        if (child.parentNode?.parentNode === node) {
	            properties[child.tagName.replace(":", "_")] = nodeVal(child);
	        }
	    }
	    const links = $(node, "link");
	    if (links.length) {
	        properties.links = links.map((link) => Object.assign({ href: link.getAttribute("href") }, getMulti(link, ["text", "type"])));
	    }
	    return properties;
	}

	/**
	 * Extract points from a trkseg or rte element.
	 */
	function getPoints$1(node, pointname) {
	    const pts = $(node, pointname);
	    const line = [];
	    const times = [];
	    const extendedValues = {};
	    for (let i = 0; i < pts.length; i++) {
	        const c = coordPair$1(pts[i]);
	        if (!c) {
	            continue;
	        }
	        line.push(c.coordinates);
	        if (c.time)
	            times.push(c.time);
	        for (const [name, val] of c.extendedValues) {
	            const plural = name === "heart" ? name : name.replace("gpxtpx:", "") + "s";
	            if (!extendedValues[plural]) {
	                extendedValues[plural] = Array(pts.length).fill(null);
	            }
	            extendedValues[plural][i] = val;
	        }
	    }
	    if (line.length < 2)
	        return; // Invalid line in GeoJSON
	    return {
	        line: line,
	        times: times,
	        extendedValues: extendedValues,
	    };
	}
	/**
	 * Extract a LineString geometry from a rte
	 * element.
	 */
	function getRoute(node) {
	    const line = getPoints$1(node, "rtept");
	    if (!line)
	        return;
	    return {
	        type: "Feature",
	        properties: Object.assign({ _gpxType: "rte" }, extractProperties(node), getLineStyle(get1(node, "extensions"))),
	        geometry: {
	            type: "LineString",
	            coordinates: line.line,
	        },
	    };
	}
	function getTrack(node) {
	    const segments = $(node, "trkseg");
	    const track = [];
	    const times = [];
	    const extractedLines = [];
	    for (const segment of segments) {
	        const line = getPoints$1(segment, "trkpt");
	        if (line) {
	            extractedLines.push(line);
	            if (line.times && line.times.length)
	                times.push(line.times);
	        }
	    }
	    if (extractedLines.length === 0)
	        return null;
	    const multi = extractedLines.length > 1;
	    const properties = Object.assign({ _gpxType: "trk" }, extractProperties(node), getLineStyle(get1(node, "extensions")), times.length
	        ? {
	            coordinateProperties: {
	                times: multi ? times : times[0],
	            },
	        }
	        : {});
	    for (const line of extractedLines) {
	        track.push(line.line);
	        if (!properties.coordinateProperties) {
	            properties.coordinateProperties = {};
	        }
	        const props = properties.coordinateProperties;
	        const entries = Object.entries(line.extendedValues);
	        for (let i = 0; i < entries.length; i++) {
	            const [name, val] = entries[i];
	            if (multi) {
	                if (!props[name]) {
	                    props[name] = extractedLines.map((line) => new Array(line.line.length).fill(null));
	                }
	                props[name][i] = val;
	            }
	            else {
	                props[name] = val;
	            }
	        }
	    }
	    return {
	        type: "Feature",
	        properties: properties,
	        geometry: multi
	            ? {
	                type: "MultiLineString",
	                coordinates: track,
	            }
	            : {
	                type: "LineString",
	                coordinates: track[0],
	            },
	    };
	}
	/**
	 * Extract a point, if possible, from a given node,
	 * which is usually a wpt or trkpt
	 */
	function getPoint(node) {
	    const properties = Object.assign(extractProperties(node), getMulti(node, ["sym"]));
	    const pair = coordPair$1(node);
	    if (!pair)
	        return null;
	    return {
	        type: "Feature",
	        properties,
	        geometry: {
	            type: "Point",
	            coordinates: pair.coordinates,
	        },
	    };
	}
	/**
	 * Convert GPX to GeoJSON incrementally, returning
	 * a [Generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators)
	 * that yields output feature by feature.
	 */
	function* gpxGen(node) {
	    for (const track of $(node, "trk")) {
	        const feature = getTrack(track);
	        if (feature)
	            yield feature;
	    }
	    for (const route of $(node, "rte")) {
	        const feature = getRoute(route);
	        if (feature)
	            yield feature;
	    }
	    for (const waypoint of $(node, "wpt")) {
	        const point = getPoint(waypoint);
	        if (point)
	            yield point;
	    }
	}
	/**
	 *
	 * Convert a GPX document to GeoJSON. The first argument, `doc`, must be a GPX
	 * document as an XML DOM - not as a string. You can get this using jQuery's default
	 * `.ajax` function or using a bare XMLHttpRequest with the `.response` property
	 * holding an XML DOM.
	 *
	 * The output is a JavaScript object of GeoJSON data, same as `.kml` outputs, with the
	 * addition of a `_gpxType` property on each `LineString` feature that indicates whether
	 * the feature was encoded as a route (`rte`) or track (`trk`) in the GPX document.
	 */
	function gpx(node) {
	    return {
	        type: "FeatureCollection",
	        features: Array.from(gpxGen(node)),
	    };
	}

	const EXTENSIONS_NS = "http://www.garmin.com/xmlschemas/ActivityExtension/v2";
	const TRACKPOINT_ATTRIBUTES = [
	    ["heartRate", "heartRates"],
	    ["Cadence", "cadences"],
	    // Extended Trackpoint attributes
	    ["Speed", "speeds"],
	    ["Watts", "watts"],
	];
	const LAP_ATTRIBUTES = [
	    ["TotalTimeSeconds", "totalTimeSeconds"],
	    ["DistanceMeters", "distanceMeters"],
	    ["MaximumSpeed", "maxSpeed"],
	    ["AverageHeartRateBpm", "avgHeartRate"],
	    ["MaximumHeartRateBpm", "maxHeartRate"],
	    // Extended Lap attributes
	    ["AvgSpeed", "avgSpeed"],
	    ["AvgWatts", "avgWatts"],
	    ["MaxWatts", "maxWatts"],
	];
	function getProperties(node, attributeNames) {
	    const properties = [];
	    for (const [tag, alias] of attributeNames) {
	        let elem = get1(node, tag);
	        if (!elem) {
	            const elements = node.getElementsByTagNameNS(EXTENSIONS_NS, tag);
	            if (elements.length) {
	                elem = elements[0];
	            }
	        }
	        const val = parseFloat(nodeVal(elem));
	        if (!isNaN(val)) {
	            properties.push([alias, val]);
	        }
	    }
	    return properties;
	}
	function coordPair(node) {
	    const ll = [num1(node, "LongitudeDegrees"), num1(node, "LatitudeDegrees")];
	    if (ll[0] === undefined ||
	        isNaN(ll[0]) ||
	        ll[1] === undefined ||
	        isNaN(ll[1])) {
	        return null;
	    }
	    const heartRate = get1(node, "HeartRateBpm");
	    const time = nodeVal(get1(node, "Time"));
	    get1(node, "AltitudeMeters", (alt) => {
	        const a = parseFloat(nodeVal(alt));
	        if (!isNaN(a)) {
	            ll.push(a);
	        }
	    });
	    return {
	        coordinates: ll,
	        time: time || null,
	        heartRate: heartRate ? parseFloat(nodeVal(heartRate)) : null,
	        extensions: getProperties(node, TRACKPOINT_ATTRIBUTES),
	    };
	}
	function getPoints(node) {
	    const pts = $(node, "Trackpoint");
	    const line = [];
	    const times = [];
	    const heartRates = [];
	    if (pts.length < 2)
	        return null; // Invalid line in GeoJSON
	    const extendedProperties = {};
	    const result = { extendedProperties };
	    for (let i = 0; i < pts.length; i++) {
	        const c = coordPair(pts[i]);
	        if (c === null)
	            continue;
	        line.push(c.coordinates);
	        const { time, heartRate, extensions } = c;
	        if (time)
	            times.push(time);
	        if (heartRate)
	            heartRates.push(heartRate);
	        for (const [alias, value] of extensions) {
	            if (!extendedProperties[alias]) {
	                extendedProperties[alias] = Array(pts.length).fill(null);
	            }
	            extendedProperties[alias][i] = value;
	        }
	    }
	    if (line.length < 2)
	        return null;
	    return Object.assign(result, {
	        line: line,
	        times: times,
	        heartRates: heartRates,
	    });
	}
	function getLap(node) {
	    const segments = $(node, "Track");
	    const track = [];
	    const times = [];
	    const heartRates = [];
	    const allExtendedProperties = [];
	    let line;
	    const properties = Object.assign(Object.fromEntries(getProperties(node, LAP_ATTRIBUTES)), get(node, "Name", (nameElement) => {
	        return { name: nodeVal(nameElement) };
	    }));
	    for (const segment of segments) {
	        line = getPoints(segment);
	        if (line) {
	            track.push(line.line);
	            if (line.times.length)
	                times.push(line.times);
	            if (line.heartRates.length)
	                heartRates.push(line.heartRates);
	            allExtendedProperties.push(line.extendedProperties);
	        }
	    }
	    for (let i = 0; i < allExtendedProperties.length; i++) {
	        const extendedProperties = allExtendedProperties[i];
	        for (const property in extendedProperties) {
	            if (segments.length === 1) {
	                if (line) {
	                    properties[property] = line.extendedProperties[property];
	                }
	            }
	            else {
	                if (!properties[property]) {
	                    properties[property] = track.map((track) => Array(track.length).fill(null));
	                }
	                properties[property][i] = extendedProperties[property];
	            }
	        }
	    }
	    if (track.length === 0)
	        return null;
	    if (times.length || heartRates.length) {
	        properties.coordinateProperties = Object.assign(times.length
	            ? {
	                times: track.length === 1 ? times[0] : times,
	            }
	            : {}, heartRates.length
	            ? {
	                heart: track.length === 1 ? heartRates[0] : heartRates,
	            }
	            : {});
	    }
	    return {
	        type: "Feature",
	        properties: properties,
	        geometry: track.length === 1
	            ? {
	                type: "LineString",
	                coordinates: track[0],
	            }
	            : {
	                type: "MultiLineString",
	                coordinates: track,
	            },
	    };
	}
	/**
	 * Incrementally convert a TCX document to GeoJSON. The
	 * first argument, `doc`, must be a TCX
	 * document as an XML DOM - not as a string.
	 */
	function* tcxGen(node) {
	    for (const lap of $(node, "Lap")) {
	        const feature = getLap(lap);
	        if (feature)
	            yield feature;
	    }
	    for (const course of $(node, "Courses")) {
	        const feature = getLap(course);
	        if (feature)
	            yield feature;
	    }
	}
	/**
	 * Convert a TCX document to GeoJSON. The first argument, `doc`, must be a TCX
	 * document as an XML DOM - not as a string.
	 */
	function tcx(node) {
	    return {
	        type: "FeatureCollection",
	        features: Array.from(tcxGen(node)),
	    };
	}

	function fixColor(v, prefix) {
	    const properties = {};
	    const colorProp = prefix == "stroke" || prefix === "fill" ? prefix : prefix + "-color";
	    if (v[0] === "#") {
	        v = v.substring(1);
	    }
	    if (v.length === 6 || v.length === 3) {
	        properties[colorProp] = "#" + v;
	    }
	    else if (v.length === 8) {
	        properties[prefix + "-opacity"] = parseInt(v.substring(0, 2), 16) / 255;
	        properties[colorProp] =
	            "#" + v.substring(6, 8) + v.substring(4, 6) + v.substring(2, 4);
	    }
	    return properties;
	}

	function numericProperty(node, source, target) {
	    const properties = {};
	    num1(node, source, (val) => {
	        properties[target] = val;
	    });
	    return properties;
	}
	function getColor(node, output) {
	    return get(node, "color", (elem) => fixColor(nodeVal(elem), output));
	}
	function extractIconHref(node) {
	    return get(node, "Icon", (icon, properties) => {
	        val1(icon, "href", (href) => {
	            properties.icon = href;
	        });
	        return properties;
	    });
	}
	function extractIcon(node) {
	    return get(node, "IconStyle", (iconStyle) => {
	        return Object.assign(getColor(iconStyle, "icon"), numericProperty(iconStyle, "scale", "icon-scale"), numericProperty(iconStyle, "heading", "icon-heading"), get(iconStyle, "hotSpot", (hotspot) => {
	            const left = parseFloat(hotspot.getAttribute("x") || "");
	            const top = parseFloat(hotspot.getAttribute("y") || "");
	            const xunits = hotspot.getAttribute("xunits") || "";
	            const yunits = hotspot.getAttribute("yunits") || "";
	            if (!isNaN(left) && !isNaN(top))
	                return {
	                    "icon-offset": [left, top],
	                    "icon-offset-units": [xunits, yunits],
	                };
	            return {};
	        }), extractIconHref(iconStyle));
	    });
	}
	function extractLabel(node) {
	    return get(node, "LabelStyle", (labelStyle) => {
	        return Object.assign(getColor(labelStyle, "label"), numericProperty(labelStyle, "scale", "label-scale"));
	    });
	}
	function extractLine(node) {
	    return get(node, "LineStyle", (lineStyle) => {
	        return Object.assign(getColor(lineStyle, "stroke"), numericProperty(lineStyle, "width", "stroke-width"));
	    });
	}
	function extractPoly(node) {
	    return get(node, "PolyStyle", (polyStyle, properties) => {
	        return Object.assign(properties, get(polyStyle, "color", (elem) => fixColor(nodeVal(elem), "fill")), val1(polyStyle, "fill", (fill) => {
	            if (fill === "0")
	                return { "fill-opacity": 0 };
	        }), val1(polyStyle, "outline", (outline) => {
	            if (outline === "0")
	                return { "stroke-opacity": 0 };
	        }));
	    });
	}
	function extractStyle(node) {
	    return Object.assign({}, extractPoly(node), extractLine(node), extractLabel(node), extractIcon(node));
	}

	const toNumber = (x) => Number(x);
	const typeConverters = {
	    string: (x) => x,
	    int: toNumber,
	    uint: toNumber,
	    short: toNumber,
	    ushort: toNumber,
	    float: toNumber,
	    double: toNumber,
	    bool: (x) => Boolean(x),
	};
	function extractExtendedData(node, schema) {
	    return get(node, "ExtendedData", (extendedData, properties) => {
	        for (const data of $(extendedData, "Data")) {
	            properties[data.getAttribute("name") || ""] = nodeVal(get1(data, "value"));
	        }
	        for (const simpleData of $(extendedData, "SimpleData")) {
	            const name = simpleData.getAttribute("name") || "";
	            const typeConverter = schema[name] || typeConverters.string;
	            properties[name] = typeConverter(nodeVal(simpleData));
	        }
	        return properties;
	    });
	}
	function getMaybeHTMLDescription(node) {
	    const descriptionNode = get1(node, "description");
	    for (const c of Array.from(descriptionNode?.childNodes || [])) {
	        if (c.nodeType === 4) {
	            return {
	                description: {
	                    "@type": "html",
	                    value: nodeVal(c),
	                },
	            };
	        }
	    }
	    return {};
	}
	function extractTimeSpan(node) {
	    return get(node, "TimeSpan", (timeSpan) => {
	        return {
	            timespan: {
	                begin: nodeVal(get1(timeSpan, "begin")),
	                end: nodeVal(get1(timeSpan, "end")),
	            },
	        };
	    });
	}
	function extractTimeStamp(node) {
	    return get(node, "TimeStamp", (timeStamp) => {
	        return { timestamp: nodeVal(get1(timeStamp, "when")) };
	    });
	}
	function extractCascadedStyle(node, styleMap) {
	    return val1(node, "styleUrl", (styleUrl) => {
	        styleUrl = normalizeId(styleUrl);
	        if (styleMap[styleUrl]) {
	            return Object.assign({ styleUrl }, styleMap[styleUrl]);
	        }
	        // For backward-compatibility. Should we still include
	        // styleUrl even if it's not resolved?
	        return { styleUrl };
	    });
	}

	const removeSpace = /\s*/g;
	const trimSpace = /^\s*|\s*$/g;
	const splitSpace = /\s+/;
	/**
	 * Get one coordinate from a coordinate array, if any
	 */
	function coord1(value) {
	    return value
	        .replace(removeSpace, "")
	        .split(",")
	        .map(parseFloat)
	        .filter((num) => !isNaN(num))
	        .slice(0, 3);
	}
	/**
	 * Get all coordinates from a coordinate array as [[],[]]
	 */
	function coord(value) {
	    return value
	        .replace(trimSpace, "")
	        .split(splitSpace)
	        .map(coord1)
	        .filter((coord) => {
	        return coord.length >= 2;
	    });
	}
	function gxCoords(node) {
	    let elems = $(node, "coord");
	    if (elems.length === 0) {
	        elems = $ns(node, "coord", "*");
	    }
	    const coordinates = elems.map((elem) => {
	        return nodeVal(elem).split(" ").map(parseFloat);
	    });
	    if (coordinates.length === 0) {
	        return null;
	    }
	    return {
	        geometry: coordinates.length > 2
	            ? {
	                type: "LineString",
	                coordinates,
	            }
	            : {
	                type: "Point",
	                coordinates: coordinates[0],
	            },
	        times: $(node, "when").map((elem) => nodeVal(elem)),
	    };
	}
	function fixRing(ring) {
	    if (ring.length === 0)
	        return ring;
	    const first = ring[0];
	    const last = ring[ring.length - 1];
	    let equal = true;
	    for (let i = 0; i < Math.max(first.length, last.length); i++) {
	        if (first[i] !== last[i]) {
	            equal = false;
	            break;
	        }
	    }
	    if (!equal) {
	        return ring.concat([ring[0]]);
	    }
	    return ring;
	}
	function getCoordinates(node) {
	    return nodeVal(get1(node, "coordinates"));
	}
	function getGeometry(node) {
	    let geometries = [];
	    let coordTimes = [];
	    for (let i = 0; i < node.childNodes.length; i++) {
	        const child = node.childNodes.item(i);
	        if (isElement(child)) {
	            switch (child.tagName) {
	                case "MultiGeometry":
	                case "MultiTrack":
	                case "gx:MultiTrack": {
	                    const childGeometries = getGeometry(child);
	                    geometries = geometries.concat(childGeometries.geometries);
	                    coordTimes = coordTimes.concat(childGeometries.coordTimes);
	                    break;
	                }
	                case "Point": {
	                    const coordinates = coord1(getCoordinates(child));
	                    if (coordinates.length >= 2) {
	                        geometries.push({
	                            type: "Point",
	                            coordinates,
	                        });
	                    }
	                    break;
	                }
	                case "LinearRing":
	                case "LineString": {
	                    const coordinates = coord(getCoordinates(child));
	                    if (coordinates.length >= 2) {
	                        geometries.push({
	                            type: "LineString",
	                            coordinates,
	                        });
	                    }
	                    break;
	                }
	                case "Polygon": {
	                    const coords = [];
	                    for (const linearRing of $(child, "LinearRing")) {
	                        const ring = fixRing(coord(getCoordinates(linearRing)));
	                        if (ring.length >= 4) {
	                            coords.push(ring);
	                        }
	                    }
	                    if (coords.length) {
	                        geometries.push({
	                            type: "Polygon",
	                            coordinates: coords,
	                        });
	                    }
	                    break;
	                }
	                case "Track":
	                case "gx:Track": {
	                    const gx = gxCoords(child);
	                    if (!gx)
	                        break;
	                    const { times, geometry } = gx;
	                    geometries.push(geometry);
	                    if (times.length)
	                        coordTimes.push(times);
	                    break;
	                }
	            }
	        }
	    }
	    return {
	        geometries,
	        coordTimes,
	    };
	}

	function geometryListToGeometry(geometries) {
	    return geometries.length === 0
	        ? null
	        : geometries.length === 1
	            ? geometries[0]
	            : {
	                type: "GeometryCollection",
	                geometries,
	            };
	}
	function getPlacemark(node, styleMap, schema, options) {
	    const { coordTimes, geometries } = getGeometry(node);
	    const geometry = geometryListToGeometry(geometries);
	    if (!geometry && options.skipNullGeometry) {
	        return null;
	    }
	    const feature = {
	        type: "Feature",
	        geometry,
	        properties: Object.assign(getMulti(node, [
	            "name",
	            "address",
	            "visibility",
	            "open",
	            "phoneNumber",
	            "description",
	        ]), getMaybeHTMLDescription(node), extractCascadedStyle(node, styleMap), extractStyle(node), extractExtendedData(node, schema), extractTimeSpan(node), extractTimeStamp(node), coordTimes.length
	            ? {
	                coordinateProperties: {
	                    times: coordTimes.length === 1 ? coordTimes[0] : coordTimes,
	                },
	            }
	            : {}),
	    };
	    if (feature.properties?.visibility !== undefined) {
	        feature.properties.visibility = feature.properties.visibility !== "0";
	    }
	    const id = node.getAttribute("id");
	    if (id !== null && id !== "")
	        feature.id = id;
	    return feature;
	}

	function getGroundOverlayBox(node) {
	    const latLonQuad = get1(node, "gx:LatLonQuad");
	    if (latLonQuad) {
	        const ring = fixRing(coord(getCoordinates(node)));
	        return {
	            geometry: {
	                type: "Polygon",
	                coordinates: [ring],
	            },
	        };
	    }
	    return getLatLonBox(node);
	}
	const DEGREES_TO_RADIANS = Math.PI / 180;
	function rotateBox(bbox, coordinates, rotation) {
	    const center = [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2];
	    return [
	        coordinates[0].map((coordinate) => {
	            const dy = coordinate[1] - center[1];
	            const dx = coordinate[0] - center[0];
	            const distance = Math.sqrt(Math.pow(dy, 2) + Math.pow(dx, 2));
	            const angle = Math.atan2(dy, dx) + rotation * DEGREES_TO_RADIANS;
	            return [
	                center[0] + Math.cos(angle) * distance,
	                center[1] + Math.sin(angle) * distance,
	            ];
	        }),
	    ];
	}
	function getLatLonBox(node) {
	    const latLonBox = get1(node, "LatLonBox");
	    if (latLonBox) {
	        const north = num1(latLonBox, "north");
	        const west = num1(latLonBox, "west");
	        const east = num1(latLonBox, "east");
	        const south = num1(latLonBox, "south");
	        const rotation = num1(latLonBox, "rotation");
	        if (typeof north === "number" &&
	            typeof south === "number" &&
	            typeof west === "number" &&
	            typeof east === "number") {
	            const bbox = [west, south, east, north];
	            let coordinates = [
	                [
	                    [west, north],
	                    [east, north],
	                    [east, south],
	                    [west, south],
	                    [west, north], // top left (again)
	                ],
	            ];
	            if (typeof rotation === "number") {
	                coordinates = rotateBox(bbox, coordinates, rotation);
	            }
	            return {
	                bbox,
	                geometry: {
	                    type: "Polygon",
	                    coordinates,
	                },
	            };
	        }
	    }
	    return null;
	}
	function getGroundOverlay(node, styleMap, schema, options) {
	    const box = getGroundOverlayBox(node);
	    const geometry = box?.geometry || null;
	    if (!geometry && options.skipNullGeometry) {
	        return null;
	    }
	    const feature = {
	        type: "Feature",
	        geometry,
	        properties: Object.assign(
	        /**
	         * Related to
	         * https://gist.github.com/tmcw/037a1cb6660d74a392e9da7446540f46
	         */
	        { "@geometry-type": "groundoverlay" }, getMulti(node, [
	            "name",
	            "address",
	            "visibility",
	            "open",
	            "phoneNumber",
	            "description",
	        ]), getMaybeHTMLDescription(node), extractCascadedStyle(node, styleMap), extractStyle(node), extractIconHref(node), extractExtendedData(node, schema), extractTimeSpan(node), extractTimeStamp(node)),
	    };
	    if (box?.bbox) {
	        feature.bbox = box.bbox;
	    }
	    if (feature.properties?.visibility !== undefined) {
	        feature.properties.visibility = feature.properties.visibility !== "0";
	    }
	    const id = node.getAttribute("id");
	    if (id !== null && id !== "")
	        feature.id = id;
	    return feature;
	}

	function getStyleId(style) {
	    let id = style.getAttribute("id");
	    const parentNode = style.parentNode;
	    if (!id &&
	        isElement(parentNode) &&
	        parentNode.localName === "CascadingStyle") {
	        id = parentNode.getAttribute("kml:id") || parentNode.getAttribute("id");
	    }
	    return normalizeId(id || "");
	}
	function buildStyleMap(node) {
	    const styleMap = {};
	    for (const style of $(node, "Style")) {
	        styleMap[getStyleId(style)] = extractStyle(style);
	    }
	    for (const map of $(node, "StyleMap")) {
	        const id = normalizeId(map.getAttribute("id") || "");
	        val1(map, "styleUrl", (styleUrl) => {
	            styleUrl = normalizeId(styleUrl);
	            if (styleMap[styleUrl]) {
	                styleMap[id] = styleMap[styleUrl];
	            }
	        });
	    }
	    return styleMap;
	}
	function buildSchema(node) {
	    const schema = {};
	    for (const field of $(node, "SimpleField")) {
	        schema[field.getAttribute("name") || ""] =
	            typeConverters[field.getAttribute("type") || ""] ||
	                typeConverters["string"];
	    }
	    return schema;
	}
	const FOLDER_PROPS = [
	    "name",
	    "visibility",
	    "open",
	    "address",
	    "description",
	    "phoneNumber",
	    "visibility",
	];
	function getFolder(node) {
	    const meta = {};
	    for (const child of Array.from(node.childNodes)) {
	        if (isElement(child) && FOLDER_PROPS.includes(child.tagName)) {
	            meta[child.tagName] = nodeVal(child);
	        }
	    }
	    return {
	        type: "folder",
	        meta,
	        children: [],
	    };
	}
	/**
	 * Yield a nested tree with KML folder structure
	 *
	 * This generates a tree with the given structure:
	 *
	 * ```js
	 * {
	 *   "type": "root",
	 *   "children": [
	 *     {
	 *       "type": "folder",
	 *       "meta": {
	 *         "name": "Test"
	 *       },
	 *       "children": [
	 *          // ...features and folders
	 *       ]
	 *     }
	 *     // ...features
	 *   ]
	 * }
	 * ```
	 *
	 * ### GroundOverlay
	 *
	 * GroundOverlay elements are converted into
	 * `Feature` objects with `Polygon` geometries,
	 * a property like:
	 *
	 * ```json
	 * {
	 *   "@geometry-type": "groundoverlay"
	 * }
	 * ```
	 *
	 * And the ground overlay's image URL in the `href`
	 * property. Ground overlays will need to be displayed
	 * with a separate method to other features, depending
	 * on which map framework you're using.
	 */
	function kmlWithFolders(node, options = {
	    skipNullGeometry: false,
	}) {
	    const styleMap = buildStyleMap(node);
	    const schema = buildSchema(node);
	    const tree = { type: "root", children: [] };
	    function traverse(node, pointer, options) {
	        if (isElement(node)) {
	            switch (node.tagName) {
	                case "GroundOverlay": {
	                    const placemark = getGroundOverlay(node, styleMap, schema, options);
	                    if (placemark) {
	                        pointer.children.push(placemark);
	                    }
	                    break;
	                }
	                case "Placemark": {
	                    const placemark = getPlacemark(node, styleMap, schema, options);
	                    if (placemark) {
	                        pointer.children.push(placemark);
	                    }
	                    break;
	                }
	                case "Folder": {
	                    const folder = getFolder(node);
	                    pointer.children.push(folder);
	                    pointer = folder;
	                    break;
	                }
	            }
	        }
	        if (node.childNodes) {
	            for (let i = 0; i < node.childNodes.length; i++) {
	                traverse(node.childNodes[i], pointer, options);
	            }
	        }
	    }
	    traverse(node, tree, options);
	    return tree;
	}
	/**
	 * Convert KML to GeoJSON incrementally, returning
	 * a [Generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators)
	 * that yields output feature by feature.
	 */
	function* kmlGen(node, options = {
	    skipNullGeometry: false,
	}) {
	    const styleMap = buildStyleMap(node);
	    const schema = buildSchema(node);
	    for (const placemark of $(node, "Placemark")) {
	        const feature = getPlacemark(placemark, styleMap, schema, options);
	        if (feature)
	            yield feature;
	    }
	    for (const groundOverlay of $(node, "GroundOverlay")) {
	        const feature = getGroundOverlay(groundOverlay, styleMap, schema, options);
	        if (feature)
	            yield feature;
	    }
	}
	/**
	 * Convert a KML document to GeoJSON. The first argument, `doc`, must be a KML
	 * document as an XML DOM - not as a string. You can get this using jQuery's default
	 * `.ajax` function or using a bare XMLHttpRequest with the `.response` property
	 * holding an XML DOM.
	 *
	 * The output is a JavaScript object of GeoJSON data. You can convert it to a string
	 * with [JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
	 * or use it directly in libraries.
	 */
	function kml(node, options = {
	    skipNullGeometry: false,
	}) {
	    return {
	        type: "FeatureCollection",
	        features: Array.from(kmlGen(node, options)),
	    };
	}

	var toGeoJson = /*#__PURE__*/Object.freeze({
		__proto__: null,
		gpx: gpx,
		gpxGen: gpxGen,
		kml: kml,
		kmlGen: kmlGen,
		kmlWithFolders: kmlWithFolders,
		tcx: tcx,
		tcxGen: tcxGen
	});

	var polyline = {exports: {}};

	(function (module) {

		/**
		 * Based off of [the offical Google document](https://developers.google.com/maps/documentation/utilities/polylinealgorithm)
		 *
		 * Some parts from [this implementation](http://facstaff.unca.edu/mcmcclur/GoogleMaps/EncodePolyline/PolylineEncoder.js)
		 * by [Mark McClure](http://facstaff.unca.edu/mcmcclur/)
		 *
		 * @module polyline
		 */

		var polyline = {};

		function py2_round(value) {
		    // Google's polyline algorithm uses the same rounding strategy as Python 2, which is different from JS for negative values
		    return Math.floor(Math.abs(value) + 0.5) * (value >= 0 ? 1 : -1);
		}

		function encode(current, previous, factor) {
		    current = py2_round(current * factor);
		    previous = py2_round(previous * factor);
		    var coordinate = (current - previous) * 2;
		    if (coordinate < 0) {
		        coordinate = -coordinate - 1;
		    }
		    var output = '';
		    while (coordinate >= 0x20) {
		        output += String.fromCharCode((0x20 | (coordinate & 0x1f)) + 63);
		        coordinate /= 32;
		    }
		    output += String.fromCharCode((coordinate | 0) + 63);
		    return output;
		}

		/**
		 * Decodes to a [latitude, longitude] coordinates array.
		 *
		 * This is adapted from the implementation in Project-OSRM.
		 *
		 * @param {String} str
		 * @param {Number} precision
		 * @returns {Array}
		 *
		 * @see https://github.com/Project-OSRM/osrm-frontend/blob/master/WebContent/routing/OSRM.RoutingGeometry.js
		 */
		polyline.decode = function(str, precision) {
		    var index = 0,
		        lat = 0,
		        lng = 0,
		        coordinates = [],
		        shift = 0,
		        result = 0,
		        byte = null,
		        latitude_change,
		        longitude_change,
		        factor = Math.pow(10, Number.isInteger(precision) ? precision : 5);

		    // Coordinates have variable length when encoded, so just keep
		    // track of whether we've hit the end of the string. In each
		    // loop iteration, a single coordinate is decoded.
		    while (index < str.length) {

		        // Reset shift, result, and byte
		        byte = null;
		        shift = 1;
		        result = 0;

		        do {
		            byte = str.charCodeAt(index++) - 63;
		            result += (byte & 0x1f) * shift;
		            shift *= 32;
		        } while (byte >= 0x20);

		        latitude_change = (result & 1) ? ((-result - 1) / 2) : (result / 2);

		        shift = 1;
		        result = 0;

		        do {
		            byte = str.charCodeAt(index++) - 63;
		            result += (byte & 0x1f) * shift;
		            shift *= 32;
		        } while (byte >= 0x20);

		        longitude_change = (result & 1) ? ((-result - 1) / 2) : (result / 2);

		        lat += latitude_change;
		        lng += longitude_change;

		        coordinates.push([lat / factor, lng / factor]);
		    }

		    return coordinates;
		};

		/**
		 * Encodes the given [latitude, longitude] coordinates array.
		 *
		 * @param {Array.<Array.<Number>>} coordinates
		 * @param {Number} precision
		 * @returns {String}
		 */
		polyline.encode = function(coordinates, precision) {
		    if (!coordinates.length) { return ''; }

		    var factor = Math.pow(10, Number.isInteger(precision) ? precision : 5),
		        output = encode(coordinates[0][0], 0, factor) + encode(coordinates[0][1], 0, factor);

		    for (var i = 1; i < coordinates.length; i++) {
		        var a = coordinates[i], b = coordinates[i - 1];
		        output += encode(a[0], b[0], factor);
		        output += encode(a[1], b[1], factor);
		    }

		    return output;
		};

		function flipped(coords) {
		    var flipped = [];
		    for (var i = 0; i < coords.length; i++) {
		        var coord = coords[i].slice();
		        flipped.push([coord[1], coord[0]]);
		    }
		    return flipped;
		}

		/**
		 * Encodes a GeoJSON LineString feature/geometry.
		 *
		 * @param {Object} geojson
		 * @param {Number} precision
		 * @returns {String}
		 */
		polyline.fromGeoJSON = function(geojson, precision) {
		    if (geojson && geojson.type === 'Feature') {
		        geojson = geojson.geometry;
		    }
		    if (!geojson || geojson.type !== 'LineString') {
		        throw new Error('Input must be a GeoJSON LineString');
		    }
		    return polyline.encode(flipped(geojson.coordinates), precision);
		};

		/**
		 * Decodes to a GeoJSON LineString geometry.
		 *
		 * @param {String} str
		 * @param {Number} precision
		 * @returns {Object}
		 */
		polyline.toGeoJSON = function(str, precision) {
		    var coords = polyline.decode(str, precision);
		    return {
		        type: 'LineString',
		        coordinates: flipped(coords)
		    };
		};

		if (module.exports) {
		    module.exports = polyline;
		} 
	} (polyline));

	var polylineExports = polyline.exports;

	var utils = (() => {

	    const purgeProps = (obj, blacklist) => {
	        if (obj) {
	            let rs = Object.assign({}, obj);
	            if (blacklist) {
	                for (let prop of blacklist) {
	                    delete rs[prop];
	                }
	            }
	            return rs;
	        }
	        return {};
	    };

	    const mergeProps = (obj1, obj2) => {
	        obj1 = obj1 ? obj1 : {};
	        obj2 = obj2 ? obj2 : {};
	        return Object.assign(obj1, obj2);
	    };

	    const first = a => a[0];
	    const last = a => a[a.length - 1];
	    const coordsToKey = a => a.join(',');

	    const addToMap = (m, k, v) => {
	        let a = m[k];
	        if (a) {
	            a.push(v);
	        } else {
	            m[k] = [v];
	        }
	    };

	    const removeFromMap = (m, k, v) => {
	        let a = m[k];
	        let idx = null;
	        if (a && (idx = a.indexOf(v)) >= 0) {
	            a.splice(idx, 1);
	        }
	    };

	    const getFirstFromMap = (m, k) => {
	        let a = m[k];
	        if (a && a.length > 0) {
	            return a[0];
	        }
	        return null;
	    };

	    // need 3+ different points to form a ring, here using > 3 is 'coz a the first and the last points are actually the same
	    const isRing = a => a.length > 3 && coordsToKey(first(a)) === coordsToKey(last(a));

	    const ringDirection = (a, xIdx, yIdx) => {
	        xIdx = xIdx || 0, yIdx = yIdx || 1;
	        // get the index of the point which has the maximum x value
	        let m = a.reduce((maxxIdx, v, idx) => a[maxxIdx][xIdx] > v[xIdx] ? maxxIdx : idx, 0);
	        // 'coz the first point is virtually the same one as the last point, 
	        // we need to skip a.length - 1 for left when m = 0,
	        // and skip 0 for right when m = a.length - 1;
	        let l = m <= 0 ? a.length - 2 : m - 1, r = m >= a.length - 1 ? 1 : m + 1;
	        let xa = a[l][xIdx], xb = a[m][xIdx], xc = a[r][xIdx];
	        let ya = a[l][yIdx], yb = a[m][yIdx], yc = a[r][yIdx];
	        let det = (xb - xa) * (yc - ya) - (xc - xa) * (yb - ya);
	        return det < 0 ? 'clockwise' : 'counterclockwise';
	    };

	    const ptInsidePolygon = (pt, polygon, xIdx, yIdx) => {
	        xIdx = xIdx || 0, yIdx = yIdx || 1;
	        let result = false;
	        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
	            if ((polygon[i][xIdx] <= pt[xIdx] && pt[xIdx] < polygon[j][xIdx] ||
	                polygon[j][xIdx] <= pt[xIdx] && pt[xIdx] < polygon[i][xIdx]) &&
	                pt[yIdx] < (polygon[j][yIdx] - polygon[i][yIdx]) * (pt[xIdx] - polygon[i][xIdx]) / (polygon[j][xIdx] - polygon[i][xIdx]) + polygon[i][yIdx]) {
	                result = !result;
	            }

	        }
	        return result;
	    };

	    const strToFloat = el => el instanceof Array ? el.map(strToFloat) : parseFloat(el);

	    class RefElements extends Map {
	        constructor() {
	            super();
	            this.binders = [];
	        }

	        add(k, v) {
	            if (!this.has(k)) {
	                this.set(k, v);
	            }
	            // suppress duplcated key error
	            // else
	            // throw `Error: adding duplicated key '${k}' to RefElements`;
	        }

	        addBinder(binder) {
	            this.binders.push(binder);
	        }

	        bindAll() {
	            this.binders.forEach(binder => binder.bind());
	        }
	    }

	    class LateBinder {
	        constructor(container, valueFunc, ctx, args) {
	            this.container = container;
	            this.valueFunc = valueFunc;
	            this.ctx = ctx;
	            this.args = args;
	        }

	        bind() {
	            let v = this.valueFunc.apply(this.ctx, this.args);
	            if (this.container instanceof Array) {
	                let idx = this.container.indexOf(this);
	                if (idx >= 0) {
	                    let args = [idx, 1];
	                    if (v) {
	                        args.push(v);
	                    }
	                    [].splice.apply(this.container, args);
	                }
	            } else if (typeof this.container === 'object') {
	                let k = Object.keys(this.container).find(v => this.container[v] === this);
	                if (k) {
	                    if (v) {
	                        this.container[k] = v;
	                    } else {
	                        delete this.container[k];
	                    }
	                }
	            }
	        }
	    }

	    class WayCollection extends Array {
	        constructor() {
	            super();
	            this.firstMap = {};
	            this.lastMap = {};
	        }

	        addWay(way) {
	            way = way.toCoordsArray();
	            if (way.length > 0) {
	                this.push(way);
	                addToMap(this.firstMap, coordsToKey(first(way)), way);
	                addToMap(this.lastMap, coordsToKey(last(way)), way);
	            }
	        }

	        toStrings() {
	            let strings = [], way = null;
	            while (way = this.shift()) {
	                removeFromMap(this.firstMap, coordsToKey(first(way)), way);
	                removeFromMap(this.lastMap, coordsToKey(last(way)), way);
	                let current = way, next = null;
	                do {
	                    let key = coordsToKey(last(current)), shouldReverse = false;

	                    next = getFirstFromMap(this.firstMap, key);
	                    if (!next) {
	                        next = getFirstFromMap(this.lastMap, key);
	                        shouldReverse = true;
	                    }

	                    if (next) {
	                        this.splice(this.indexOf(next), 1);
	                        removeFromMap(this.firstMap, coordsToKey(first(next)), next);
	                        removeFromMap(this.lastMap, coordsToKey(last(next)), next);
	                        if (shouldReverse) {
	                            // always reverse shorter one to save time
	                            if (next.length > current.length) {
	                                [current, next] = [next, current];
	                            }
	                            next.reverse();
	                        }

	                        current = current.concat(next.slice(1));
	                    }
	                } while (next);
	                strings.push(strToFloat(current));
	            }

	            return strings;
	        }

	        toRings(direction) {
	            let strings = this.toStrings();
	            let rings = [], string = null;
	            while (string = strings.shift()) {
	                if (isRing(string)) {
	                    if (ringDirection(string) !== direction) {
	                        string.reverse();
	                    }
	                    rings.push(string);
	                }
	            }
	            return rings;
	        }
	    }

	    return {
	        purgeProps, mergeProps,
	        first, last, coordsToKey,
	        addToMap, removeFromMap, getFirstFromMap,
	        isRing, ringDirection, ptInsidePolygon, strToFloat,
	        RefElements, LateBinder, WayCollection
	    };
	})();

	var building = {
	};
	var highway = {
		whitelist: [
			"services",
			"rest_area",
			"escape",
			"elevator"
		]
	};
	var natural = {
		blacklist: [
			"coastline",
			"cliff",
			"ridge",
			"arete",
			"tree_row"
		]
	};
	var landuse = {
	};
	var waterway = {
		whitelist: [
			"riverbank",
			"dock",
			"boatyard",
			"dam"
		]
	};
	var amenity = {
	};
	var leisure = {
	};
	var barrier = {
		whitelist: [
			"city_wall",
			"ditch",
			"hedge",
			"retaining_wall",
			"wall",
			"spikes"
		]
	};
	var railway = {
		whitelist: [
			"station",
			"turntable",
			"roundhouse",
			"platform"
		]
	};
	var area = {
	};
	var boundary = {
	};
	var man_made = {
		blacklist: [
			"cutline",
			"embankment",
			"pipeline"
		]
	};
	var power = {
		whitelist: [
			"plant",
			"substation",
			"generator",
			"transformer"
		]
	};
	var place = {
	};
	var shop = {
	};
	var aeroway = {
		blacklist: [
			"taxiway"
		]
	};
	var tourism = {
	};
	var historic = {
	};
	var public_transport = {
	};
	var office = {
	};
	var military = {
	};
	var ruins = {
	};
	var craft = {
	};
	var golf = {
	};
	var indoor = {
	};
	var require$$1 = {
		building: building,
		highway: highway,
		natural: natural,
		landuse: landuse,
		waterway: waterway,
		amenity: amenity,
		leisure: leisure,
		barrier: barrier,
		railway: railway,
		area: area,
		boundary: boundary,
		man_made: man_made,
		power: power,
		place: place,
		shop: shop,
		aeroway: aeroway,
		tourism: tourism,
		historic: historic,
		public_transport: public_transport,
		office: office,
		"building:part": {
	},
		military: military,
		ruins: ruins,
		"area:highway": {
	},
		craft: craft,
		golf: golf,
		indoor: indoor
	};

	var osmobjs = (() => {

	    const { first, last, coordsToKey,
	        addToMap, removeFromMap, getFirstFromMap,
	        isRing, ringDirection, ptInsidePolygon, strToFloat,
	        LateBinder, WayCollection } = utils,
	        polygonTags = require$$1;

	    class OsmObject {
	        constructor(type, id, refElems) {
	            this.type = type;
	            this.id = id;
	            this.refElems = refElems;
	            this.tags = {};
	            this.props = { id: this.getCompositeId() };
	            this.refCount = 0;
	            this.hasTag = false;
	            if (refElems) {
	                refElems.add(this.getCompositeId(), this);
	            }
	        }

	        addTags(tags) {
	            this.tags = Object.assign(this.tags, tags);
	            this.hasTag = tags ? true : false;
	        }

	        addTag(k, v) {
	            this.tags[k] = v;
	            this.hasTag = k ? true : false;
	        }

	        addProp(k, v) {
	            this.props[k] = v;
	        }

	        addProps(props) {
	            this.props = Object.assign(this.props, props);
	        }

	        getCompositeId() {
	            return `${this.type}/${this.id}`;
	        }

	        getProps() {
	            return Object.assign(this.props, this.tags);
	        }

	        toFeatureArray() {
	            return [];
	        }
	    }

	    class Node extends OsmObject {
	        constructor(id, refElems) {
	            super('node', id, refElems);
	            this.latLng = null;
	        }

	        setLatLng(latLng) {
	            this.latLng = latLng;
	        }

	        toFeatureArray() {
	            if (this.latLng) {
	                return [{
	                    type: 'Feature',
	                    id: this.getCompositeId(),
	                    properties: this.getProps(),
	                    geometry: {
	                        type: 'Point',
	                        coordinates: strToFloat([this.latLng.lon, this.latLng.lat])
	                    }
	                }];
	            }

	            return [];
	        }

	        getLatLng() {
	            return this.latLng;
	        }
	    }

	    class Way extends OsmObject {
	        constructor(id, refElems) {
	            super('way', id, refElems);
	            this.latLngArray = [];
	            this.isPolygon = false;
	        }

	        addLatLng(latLng) {
	            this.latLngArray.push(latLng);
	        }

	        setLatLngArray(latLngArray) {
	            this.latLngArray = latLngArray;
	        }

	        addNodeRef(ref) {
	            let binder = new LateBinder(this.latLngArray, function (id) {
	                let node = this.refElems.get(`node/${id}`);
	                if (node) {
	                    node.refCount++;
	                    return node.getLatLng();
	                }
	            }, this, [ref]);

	            this.latLngArray.push(binder);
	            this.refElems.addBinder(binder);
	        }

	        analyzeGeometryType(k, v) {
	            let o = polygonTags[k];
	            if (o) {
	                this.isPolygon = true;
	                if (o.whitelist) {
	                    this.isPolygon = o.whitelist.indexOf(v) >= 0 ? true : false;
	                } else if (o.blacklist) {
	                    this.isPolygon = o.blacklist.indexOf(v) >= 0 ? false : true;
	                }
	            }
	        }

	        addTags(tags) {
	            super.addTags(tags);
	            for (let [k, v] of Object.entries(tags)) {
	                this.analyzeGeometryType(k, v);
	            }
	        }

	        addTag(k, v) {
	            super.addTag(k, v);
	            this.analyzeGeometryType(k, v);
	        }

	        toCoordsArray() {
	            return this.latLngArray.map(latLng => [latLng.lon, latLng.lat]);
	        }

	        toFeatureArray() {
	            let coordsArray = this.toCoordsArray();
	            if (coordsArray.length > 1) {
	                coordsArray = strToFloat(coordsArray);
	                let feature = {
	                    type: 'Feature',
	                    id: this.getCompositeId(),
	                    properties: this.getProps(),
	                    geometry: {
	                        type: 'LineString',
	                        coordinates: coordsArray
	                    }
	                };

	                if (this.isPolygon && isRing(coordsArray)) {
	                    if (ringDirection(coordsArray) !== 'counterclockwise') {
	                        coordsArray.reverse();
	                    }

	                    feature.geometry = {
	                        type: 'Polygon',
	                        coordinates: [coordsArray]
	                    };

	                    return [feature];
	                }

	                return [feature];
	            }

	            return [];
	        }
	    }

	    class Relation extends OsmObject {
	        constructor(id, refElems) {
	            super('relation', id, refElems);
	            this.relations = [];
	            this.nodes = [];
	            this.bounds = null;
	        }

	        setBounds(bounds) {
	            this.bounds = bounds;
	        }

	        addMember(member) {
	            switch (member.type) {
	                // super relation, need to do combination
	                case 'relation':
	                    let binder = new LateBinder(this.relations, function (id) {
	                        let relation = this.refElems.get(`relation/${id}`);
	                        if (relation) {
	                            relation.refCount++;
	                            return relation;
	                        }
	                    }, this, [member.ref]);
	                    this.relations.push(binder);
	                    this.refElems.addBinder(binder);
	                    break;

	                case 'way':
	                    if (!member.role) {
	                        member.role = '';
	                    }
	                    let ways = this[member.role];
	                    if (!ways) {
	                        ways = this[member.role] = [];
	                    }
	                    if (member.geometry) {
	                        let way = new Way(member.ref, this.refElems);
	                        way.setLatLngArray(member.geometry);
	                        way.refCount++;
	                        ways.push(way);
	                    } else if (member.nodes) {
	                        let way = new Way(member.ref, this.refElems);
	                        for (let nid of member.nodes) {
	                            way.addNodeRef(nid);
	                        }
	                        way.refCount++;
	                        ways.push(way);
	                    } else {
	                        let binder = new LateBinder(ways, function (id) {
	                            let way = this.refElems.get(`way/${id}`);
	                            if (way) {
	                                way.refCount++;
	                                return way;
	                            }
	                        }, this, [member.ref]);
	                        ways.push(binder);
	                        this.refElems.addBinder(binder);
	                    }
	                    break;

	                case 'node':
	                    let node = null;
	                    if (member.lat && member.lon) {
	                        node = new Node(member.ref, this.refElems);
	                        node.setLatLng({ lon: member.lon, lat: member.lat });
	                        if (member.tags) {
	                            node.addTags(member.tags);
	                        }
	                        for (let [k, v] of Object.entries(member)) {
	                            if (['id', 'type', 'lat', 'lon'].indexOf(k) < 0) {
	                                node.addProp(k, v);
	                            }
	                        }

	                        node.refCount++;
	                        this.nodes.push(node);
	                    } else {
	                        let binder = new LateBinder(this.nodes, function (id) {
	                            let node = this.refElems.get(`node/${id}`);
	                            if (node) {
	                                node.refCount++;
	                                return node;
	                            }
	                        }, this, [member.ref]);
	                        this.nodes.push(binder);
	                        this.refElems.addBinder(binder);
	                    }
	                    break;
	            }
	        }

	        toFeatureArray() {
	            const constructStringGeometry = (ws) => {
	                let strings = ws ? ws.toStrings() : [];
	                if (strings.length > 0) {
	                    if (strings.length === 1) return {
	                        type: 'LineString',
	                        coordinates: strings[0]
	                    }

	                    return {
	                        type: 'MultiLineString',
	                        coordinates: strings
	                    }
	                }
	                return null;
	            };

	            const constructPolygonGeometry = (ows, iws) => {
	                let outerRings = ows ? ows.toRings('counterclockwise') : [],
	                    innerRings = iws ? iws.toRings('clockwise') : [];

	                if (outerRings.length > 0) {
	                    let compositPolyons = [];

	                    let ring = null;
	                    for (ring of outerRings)
	                        compositPolyons.push([ring]);

	                    // link inner polygons to outer containers
	                    while (ring = innerRings.shift()) {
	                        for (let idx in outerRings) {
	                            if (ptInsidePolygon(first(ring), outerRings[idx])) {
	                                compositPolyons[idx].push(ring);
	                                break;
	                            }
	                        }
	                    }

	                    // construct the Polygon/MultiPolygon geometry
	                    if (compositPolyons.length === 1) {
	                        return {
	                            type: 'Polygon',
	                            coordinates: compositPolyons[0]
	                        };
	                    }

	                    return {
	                        type: 'MultiPolygon',
	                        coordinates: compositPolyons
	                    }
	                }

	                return null;
	            };

	            let polygonFeatures = [], stringFeatures = [], pointFeatures = [];
	            const waysFieldNames = ['outer', 'inner', ''];
	            // need to do combination when there're nested relations
	            for (let relation of this.relations) {
	                if (relation) {
	                    for (let fieldName of waysFieldNames) {
	                        let ways = relation[fieldName];
	                        if (ways) {
	                            let thisWays = this[fieldName];
	                            if (thisWays) {
	                                [].splice.apply(thisWays, [thisWays.length, 0].concat(ways));
	                            } else {
	                                this[fieldName] = ways;
	                            }
	                        }
	                    }
	                }
	            }

	            for (let fieldName of waysFieldNames) {
	                let ways = this[fieldName];
	                if (ways) {
	                    this[fieldName] = new WayCollection();
	                    for (let way of ways) {
	                        this[fieldName].addWay(way);
	                    }
	                }
	            }

	            let geometry = null;

	            let feature = {
	                type: 'Feature',
	                id: this.getCompositeId(),
	                bbox: this.bounds,
	                properties: this.getProps()
	            };

	            if (!this.bounds) {
	                delete feature.bbox;
	            }

	            if (this.outer) {
	                geometry = constructPolygonGeometry(this.outer, this.inner);
	                if (geometry) {
	                    feature.geometry = geometry;
	                    polygonFeatures.push(feature);
	                }
	            }
	            else if (this['']) {
	                geometry = constructStringGeometry(this['']);
	                if (geometry) {
	                    feature.geometry = geometry;
	                    stringFeatures.push(feature);
	                }
	            }

	            for (let node of this.nodes) {
	                pointFeatures = pointFeatures.concat(node.toFeatureArray());
	            }

	            return polygonFeatures.concat(stringFeatures).concat(pointFeatures);
	        }
	    }

	    return { Node, Way, Relation };
	})();

	var xmlparser = (() => {

	    function conditioned(evt) {
	        return evt.match(/^(.+?)\[(.+?)\]>$/g) != null;
	    }

	    function parseEvent(evt) {
	        let match = /^(.+?)\[(.+?)\]>$/g.exec(evt);
	        if (match) {
	            return { evt: match[1] + '>', exp: match[2] };
	        }
	        return { evt: evt };
	    }

	    function genConditionFunc(cond) {
	        let body = 'return ' + cond.replace(/(\$.+?)(?=[=!.])/g, 'node.$&') + ';';
	        return new Function('node', body);
	    }

	    return class {
	        constructor(opts) {
	            if (opts) {
	                this.queryParent = opts.queryParent ? true : false;
	                this.progressive = opts.progressive;
	                if (this.queryParent) {
	                    this.parentMap = new WeakMap();
	                }
	            }
	            this.evtListeners = {};
	        }

	        parse(xml, parent, dir) {
	            dir = dir ? dir + '.' : '';
	            let nodeRegEx = /<([^ >\/]+)(.*?)>/mg, nodeMatch = null, nodes = [];
	            while (nodeMatch = nodeRegEx.exec(xml)) {
	                let tag = nodeMatch[1], node = { $tag: tag }, fullTag = dir + tag;

	                let attrText = nodeMatch[2].trim(), closed = false;
	                if (attrText.endsWith('/') || tag.startsWith('?') || tag.startsWith('!')) {
	                    closed = true;
	                }

	                let attRegEx1 = /([^ ]+?)="(.+?)"/g, attRegEx2 = /([^ ]+?)='(.+?)'/g;
	                let attMatch = null, hasAttrs = false;
	                while (attMatch = attRegEx1.exec(attrText)) {
	                    hasAttrs = true;
	                    node[attMatch[1]] = attMatch[2];
	                }
	                if (!hasAttrs)
	                    while (attMatch = attRegEx2.exec(attrText)) {
	                        hasAttrs = true;
	                        node[attMatch[1]] = attMatch[2];
	                    }

	                if (!hasAttrs && attrText !== '') {
	                    node.text = attrText;
	                }
	                if (this.progressive) {
	                    this.emit(`<${fullTag}>`, node, parent);
	                }

	                if (!closed) {
	                    let innerRegEx = new RegExp(`([^]+?)<\/${tag}>`, 'g');
	                    innerRegEx.lastIndex = nodeRegEx.lastIndex;
	                    let innerMatch = innerRegEx.exec(xml);
	                    if (innerMatch && innerMatch[1]) {
	                        nodeRegEx.lastIndex = innerRegEx.lastIndex;
	                        let innerNodes = this.parse(innerMatch[1], node, fullTag);
	                        if (innerNodes.length > 0) {
	                            node.$innerNodes = innerNodes;
	                        } else {
	                            node.$innerText = innerMatch[1];
	                        }
	                    }
	                }
	                if (this.queryParent && parent) {
	                    this.parentMap.set(node, parent);
	                }

	                if (this.progressive) {
	                    this.emit(`</${fullTag}>`, node, parent);
	                }

	                nodes.push(node);
	            }

	            return nodes;
	        }

	        getParent(node) {
	            if (this.queryParent) {
	                return this.parentMap.get(node);
	            }
	            return null;
	        }

	        #addListener(evt, func) {
	            let funcs = this.evtListeners[evt];
	            if (funcs) {
	                funcs.push(func);
	            } else {
	                this.evtListeners[evt] = [func];
	            }
	        }

	        // support javascript condition for the last tag
	        addListener(evt, func) {
	            if (conditioned(evt)) {
	                // func.prototype = evt;
	                evt = parseEvent(evt);
	                func.condition = genConditionFunc(evt.exp);
	                evt = evt.evt;
	            }
	            this.#addListener(evt, func);
	        }

	        #removeListener(evt, func) {
	            let funcs = this.evtListeners[evt];
	            let idx = null;
	            if (funcs && (idx = funcs.indexOf(func)) >= 0) {
	                funcs.splice(idx, 1);
	            }
	        }

	        removeListener(evt, func) {
	            if (conditioned(evt)) {
	                evt = parseEvent(evt);
	                evt = evt.evt;
	            }
	            this.#removeListener(evt, func);
	        }

	        emit(evt, ...args) {
	            let funcs = this.evtListeners[evt];
	            if (funcs) {
	                for (let func of funcs) {
	                    if (func.condition) {
	                        if (func.condition.apply(null, args) === true) {
	                            func.apply(null, args);
	                        }
	                    } else {
	                        func.apply(null, args);
	                    }
	                }
	            }
	        }

	        on(evt, func) {
	            this.addListener(evt, func);
	        }

	        off(evt, func) {
	            this.removeListener(evt, func);
	        }
	    };
	})();

	const { Node, Way, Relation } = osmobjs,
	    { purgeProps, RefElements } = utils,
	    XmlParser = xmlparser;

	var lib = (osm, opts) => {
	    let completeFeature = false, renderTagged = false, excludeWay = true;

	    const parseOpts = opts => {
	        if (opts) {
	            completeFeature = opts.completeFeature || opts.allFeatures ? true : false;
	            renderTagged = opts.renderTagged ? true : false;
	            let wayOpt = opts.suppressWay || opts.excludeWay;
	            if (wayOpt !== undefined && !wayOpt) {
	                excludeWay = false;
	            }
	        }
	    };

	    parseOpts(opts);

	    const detectFormat = osm => {
	        if (osm.elements) {
	            return 'json';
	        }
	        if (osm.indexOf('<osm') >= 0) {
	            return 'xml';
	        }
	        if (osm.trim().startsWith('{')) {
	            return 'json-raw';
	        }
	        return 'invalid';
	    };

	    let format = detectFormat(osm);

	    let refElements = new RefElements(), featureArray = [];

	    const analyzeFeaturesFromJson = osm => {
	        for (let elem of osm.elements) {
	            switch (elem.type) {
	                case 'node':
	                    let node = new Node(elem.id, refElements);
	                    if (elem.tags) {
	                        node.addTags(elem.tags);
	                    }
	                    node.addProps(purgeProps(elem, ['id', 'type', 'tags', 'lat', 'lon']));
	                    node.setLatLng(elem);
	                    break;

	                case 'way':
	                    let way = new Way(elem.id, refElements);
	                    if (elem.tags) {
	                        way.addTags(elem.tags);
	                    }
	                    way.addProps(purgeProps(elem, ['id', 'type', 'tags', 'nodes', 'geometry']));
	                    if (elem.nodes) {
	                        for (let n of elem.nodes) {
	                            way.addNodeRef(n);
	                        }
	                    } else if (elem.geometry) {
	                        way.setLatLngArray(elem.geometry);
	                    }
	                    break;

	                case 'relation':
	                    let relation = new Relation(elem.id, refElements);
	                    if (elem.bounds) {
	                        relation.setBounds([parseFloat(elem.bounds.minlon), parseFloat(elem.bounds.minlat), parseFloat(elem.bounds.maxlon), parseFloat(elem.bounds.maxlat)]);
	                    }
	                    if (elem.tags) {
	                        relation.addTags(elem.tags);
	                    }
	                    relation.addProps(purgeProps(elem, ['id', 'type', 'tags', 'bounds', 'members']));
	                    if (elem.members) {
	                        for (let member of elem.members) {
	                            relation.addMember(member);
	                        }
	                    }
	                    break;
	            }
	        }
	    };

	    const analyzeFeaturesFromXml = osm => {
	        const xmlParser = new XmlParser({ progressive: true });

	        xmlParser.on('</osm.node>', node => {
	            let nd = new Node(node.id, refElements);
	            for (let [k, v] of Object.entries(node))
	                if (!k.startsWith('$') && ['id', 'lon', 'lat'].indexOf(k) < 0) {
	                    nd.addProp(k, v);
	                }
	            nd.setLatLng(node);
	            if (node.$innerNodes) {
	                for (let ind of node.$innerNodes) {
	                    if (ind.$tag === 'tag') {
	                        nd.addTag(ind.k, ind.v);
	                    }
	                }
	            }
	        });

	        xmlParser.on('</osm.way>', node => {
	            let way = new Way(node.id, refElements);
	            for (let [k, v] of Object.entries(node)) {
	                if (!k.startsWith('$') && ['id'].indexOf(k) < 0) {
	                    way.addProp(k, v);
	                }
	            }
	            if (node.$innerNodes) {
	                for (let ind of node.$innerNodes) {
	                    if (ind.$tag === 'nd') {
	                        if (ind.lon && ind.lat) {
	                            way.addLatLng(ind);
	                        } else if (ind.ref) {
	                            way.addNodeRef(ind.ref);
	                        }
	                    } else if (ind.$tag === 'tag')
	                        way.addTag(ind.k, ind.v);
	                }
	            }
	        });

	        xmlParser.on('<osm.relation>', node => {
	            new Relation(node.id, refElements);
	        });

	        xmlParser.on('</osm.relation.member>', (node, parent) => {
	            let relation = refElements.get(`relation/${parent.id}`);
	            let member = {
	                type: node.type,
	                role: node.role ? node.role : '',
	                ref: node.ref
	            };
	            if (node.lat && node.lon) {
	                member.lat = node.lat, member.lon = node.lon, member.tags = {};
	                for (let [k, v] of Object.entries(node)) {
	                    if (!k.startsWith('$') && ['type', 'lat', 'lon'].indexOf(k) < 0) {
	                        member[k] = v;
	                    }
	                }
	            }
	            if (node.$innerNodes) {
	                let geometry = [];
	                let nodes = [];
	                for (let ind of node.$innerNodes) {
	                    if (ind.lat && ind.lon) {
	                        geometry.push(ind);
	                    } else {
	                        nodes.push(ind.ref);
	                    }
	                }
	                if (geometry.length > 0) {
	                    member.geometry = geometry;
	                } else if (nodes.length > 0) {
	                    member.nodes = nodes;
	                }
	            }
	            relation.addMember(member);
	        });

	        xmlParser.on('</osm.relation.bounds>', (node, parent) => {
	            refElements.get(`relation/${parent.id}`).setBounds([parseFloat(node.minlon), parseFloat(node.minlat), parseFloat(node.maxlon), parseFloat(node.maxlat)]);
	        });

	        xmlParser.on('</osm.relation.tag>', (node, parent) => {
	            refElements.get(`relation/${parent.id}`).addTag(node.k, node.v);
	        });

	        xmlParser.parse(osm);
	    };

	    if (format === 'json-raw') {
	        osm = JSON.parse(osm);
	        if (osm.elements) {
	            format = 'json';
	        } else {
	            format = 'invalid';
	        }
	    }

	    if (format === 'json') {
	        analyzeFeaturesFromJson(osm);
	    } else if (format === 'xml') {
	        analyzeFeaturesFromXml(osm);
	    }

	    refElements.bindAll();

	    for (let v of refElements.values()) {
	        if (v.refCount <= 0 || (v.hasTag && renderTagged && !(v instanceof Way && excludeWay))) {
	            let features = v.toFeatureArray();
	            // return the first geometry of the first relation element
	            if (v instanceof Relation && !completeFeature && features.length > 0) {
	                return features[0].geometry;
	            }
	            featureArray = featureArray.concat(features);
	        }
	    }

	    return { type: 'FeatureCollection', features: featureArray };
	};

	var osm2geojson = /*@__PURE__*/getDefaultExportFromCjs(lib);

	const supportedFormats = ['topojson', 'osm', 'kml', 'gpx', 'tcx', 'csv', 'tsv', 'polyline'];
	class Converter {
	    constructor(format, data, options = {}) {
	        /**
	         * Creates a blank GeoJSON feature collection.
	         * @returns A new GeoJSON feature collection with no features.
	         */
	        this.blankGeoJSON = () => ({
	            type: 'FeatureCollection',
	            features: [],
	        });
	        this._rawData = data;
	        this._format = format;
	        this._options = options;
	        const converters = {
	            'topojson': this.loadTopoJson,
	            'osm': this.loadOsm,
	            'kml': this.loadXml,
	            'gpx': this.loadXml,
	            'tcx': this.loadXml,
	            'csv': this.loadCsv,
	            'tsv': this.loadCsv,
	            'polyline': this.loadPolyline
	        };
	        this._conversionFn = converters[format];
	    }
	    async convert() {
	        if (!this._conversionFn) {
	            return new Promise((_, rej) => rej(`No converter exists for ${this._format}`));
	        }
	        else {
	            return this._conversionFn();
	        }
	    }
	    /**
	     * Load the XML data as GeoJSON
	     * @returns A promise resolving to a GeoJSON FeatureCollection
	     */
	    async loadXml() {
	        // Use the appropriate parser based on the format
	        const geojson = toGeoJson[this._format](new DOMParser().parseFromString(this._rawData, "text/xml"));
	        return geojson;
	    }
	    /**
	     * Loads and parses CSV data into a GeoJSON FeatureCollection.
	     * @returns A Promise that resolves with the GeoJSON FeatureCollection.
	     */
	    async loadCsv() {
	        // Define options for the csv2geojson library
	        let options = this._options.csvOptions || {}; // TODO allow CSV options
	        if (this._format === 'tsv') {
	            options.delimiter = '\t';
	        }
	        // Use the csv2geojson library to convert the CSV to GeoJSON
	        const geojson = await new Promise((resolve, reject) => {
	            csv2geojson_1.csv2geojson(this._rawData, options, (err, data) => {
	                if (err) {
	                    reject(err);
	                }
	                else {
	                    resolve(data);
	                }
	            });
	        });
	        return geojson;
	    }
	    /**
	     * Loads TopoJSON data and converts it into a GeoJSON FeatureCollection
	     * @returns A Promise that resolves with the GeoJSON FeatureCollection.
	     */
	    async loadTopoJson() {
	        let topoJsonData = {};
	        try {
	            topoJsonData = JSON.parse(this._rawData);
	        }
	        catch (e) {
	            throw "Invalid TopoJson";
	        }
	        // Convert the data
	        let result = this.blankGeoJSON();
	        if (topoJsonData.type === "Topology" && topoJsonData.objects !== undefined) {
	            result = {
	                type: "FeatureCollection",
	                features: result.features = Object.keys(topoJsonData.objects).map(key => topojsonFeature(topoJsonData, key)).reduce((a, v) => [...a, ...v.features], [])
	            };
	        }
	        return result;
	    }
	    ;
	    /**
	     * Loads OSM data and converts it into a GeoJSON FeatureCollection
	     * @returns A Promise that resolves with the GeoJSON FeatureCollection.
	     */
	    async loadOsm() {
	        return osm2geojson(this._rawData);
	    }
	    /**
	     * Loads and parses Polyline data into a GeoJSON FeatureCollection.
	     * @returns A Promise that resolves with the GeoJSON FeatureCollection.
	     */
	    async loadPolyline() {
	        let options = this._options.polylineOptions || {};
	        // Use the csv2geojson library to convert the CSV to GeoJSON
	        const geojson = await new Promise((resolve, reject) => {
	            try {
	                const lineString = polylineExports.toGeoJSON(this._rawData, options.precision);
	                let geometry = lineString;
	                if (options.type === 'point') {
	                    if (lineString.coordinates.length === 1) {
	                        // Make it a point
	                        geometry = {
	                            'type': 'Point',
	                            'coordinates': lineString.coordinates[0]
	                        };
	                    }
	                    else {
	                        console.warn('Cannot convert polyline to ' + options.type);
	                    }
	                }
	                else if (options.type === 'polygon') {
	                    if (lineString.coordinates[0][0] === lineString.coordinates[lineString.coordinates.length - 1][0] &&
	                        lineString.coordinates[0][1] === lineString.coordinates[lineString.coordinates.length - 1][1]) {
	                        // Make it a polygon
	                        geometry = {
	                            'type': 'Polygon',
	                            'coordinates': [lineString.coordinates]
	                        };
	                    }
	                    else {
	                        console.warn('Cannot convert polyline to ' + options.type);
	                    }
	                }
	                resolve({
	                    type: "FeatureCollection",
	                    features: [{
	                            "type": "Feature",
	                            "geometry": geometry,
	                            "properties": options.properties || {}
	                        }]
	                });
	            }
	            catch (err) {
	                reject(err);
	            }
	        });
	        return geojson;
	    }
	}

	var WorkerClass = null;

	try {
	    var WorkerThreads =
	        typeof module !== 'undefined' && typeof module.require === 'function' && module.require('worker_threads') ||
	        typeof __non_webpack_require__ === 'function' && __non_webpack_require__('worker_threads') ||
	        typeof require === 'function' && require('worker_threads');
	    WorkerClass = WorkerThreads.Worker;
	} catch(e) {} // eslint-disable-line

	function decodeBase64$1(base64, enableUnicode) {
	    return Buffer.from(base64, 'base64').toString(enableUnicode ? 'utf16' : 'utf8');
	}

	function createBase64WorkerFactory$2(base64, sourcemapArg, enableUnicodeArg) {
	    var sourcemap = sourcemapArg === undefined ? null : sourcemapArg;
	    var enableUnicode = enableUnicodeArg === undefined ? false : enableUnicodeArg;
	    var source = decodeBase64$1(base64, enableUnicode);
	    var start = source.indexOf('\n', 10) + 1;
	    var body = source.substring(start) + (sourcemap ? '\/\/# sourceMappingURL=' + sourcemap : '');
	    return function WorkerFactory(options) {
	        return new WorkerClass(body, Object.assign({}, options, { eval: true }));
	    };
	}

	function decodeBase64(base64, enableUnicode) {
	    var binaryString = atob(base64);
	    if (enableUnicode) {
	        var binaryView = new Uint8Array(binaryString.length);
	        for (var i = 0, n = binaryString.length; i < n; ++i) {
	            binaryView[i] = binaryString.charCodeAt(i);
	        }
	        return String.fromCharCode.apply(null, new Uint16Array(binaryView.buffer));
	    }
	    return binaryString;
	}

	function createURL(base64, sourcemapArg, enableUnicodeArg) {
	    var sourcemap = sourcemapArg === undefined ? null : sourcemapArg;
	    var enableUnicode = enableUnicodeArg === undefined ? false : enableUnicodeArg;
	    var source = decodeBase64(base64, enableUnicode);
	    var start = source.indexOf('\n', 10) + 1;
	    var body = source.substring(start) + (sourcemap ? '\/\/# sourceMappingURL=' + sourcemap : '');
	    var blob = new Blob([body], { type: 'application/javascript' });
	    return URL.createObjectURL(blob);
	}

	function createBase64WorkerFactory$1(base64, sourcemapArg, enableUnicodeArg) {
	    var url;
	    return function WorkerFactory(options) {
	        url = url || createURL(base64, sourcemapArg, enableUnicodeArg);
	        return new Worker(url, options);
	    };
	}

	var kIsNodeJS = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]';

	function isNodeJS() {
	    return kIsNodeJS;
	}

	function createBase64WorkerFactory(base64, sourcemapArg, enableUnicodeArg) {
	    if (isNodeJS()) {
	        return createBase64WorkerFactory$2(base64, sourcemapArg, enableUnicodeArg);
	    }
	    return createBase64WorkerFactory$1(base64, sourcemapArg, enableUnicodeArg);
	}

	var WorkerFactory = createBase64WorkerFactory('Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwooZnVuY3Rpb24gKCkgewoJJ3VzZSBzdHJpY3QnOwoKCWZ1bmN0aW9uIGdldERlZmF1bHRFeHBvcnRGcm9tQ2pzICh4KSB7CgkJcmV0dXJuIHggJiYgeC5fX2VzTW9kdWxlICYmIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh4LCAnZGVmYXVsdCcpID8geFsnZGVmYXVsdCddIDogeDsKCX0KCglmdW5jdGlvbiBnZXRBdWdtZW50ZWROYW1lc3BhY2UobikgewoJICBpZiAobi5fX2VzTW9kdWxlKSByZXR1cm4gbjsKCSAgdmFyIGYgPSBuLmRlZmF1bHQ7CgkJaWYgKHR5cGVvZiBmID09ICJmdW5jdGlvbiIpIHsKCQkJdmFyIGEgPSBmdW5jdGlvbiBhICgpIHsKCQkJCWlmICh0aGlzIGluc3RhbmNlb2YgYSkgewoJICAgICAgICByZXR1cm4gUmVmbGVjdC5jb25zdHJ1Y3QoZiwgYXJndW1lbnRzLCB0aGlzLmNvbnN0cnVjdG9yKTsKCQkJCX0KCQkJCXJldHVybiBmLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7CgkJCX07CgkJCWEucHJvdG90eXBlID0gZi5wcm90b3R5cGU7CgkgIH0gZWxzZSBhID0ge307CgkgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShhLCAnX19lc01vZHVsZScsIHt2YWx1ZTogdHJ1ZX0pOwoJCU9iamVjdC5rZXlzKG4pLmZvckVhY2goZnVuY3Rpb24gKGspIHsKCQkJdmFyIGQgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG4sIGspOwoJCQlPYmplY3QuZGVmaW5lUHJvcGVydHkoYSwgaywgZC5nZXQgPyBkIDogewoJCQkJZW51bWVyYWJsZTogdHJ1ZSwKCQkJCWdldDogZnVuY3Rpb24gKCkgewoJCQkJCXJldHVybiBuW2tdOwoJCQkJfQoJCQl9KTsKCQl9KTsKCQlyZXR1cm4gYTsKCX0KCglmdW5jdGlvbiBvYmplY3RDb252ZXJ0ZXIoY29sdW1ucykgewoJICByZXR1cm4gbmV3IEZ1bmN0aW9uKCJkIiwgInJldHVybiB7IiArIGNvbHVtbnMubWFwKGZ1bmN0aW9uKG5hbWUsIGkpIHsKCSAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkobmFtZSkgKyAiOiBkWyIgKyBpICsgIl0iOwoJICB9KS5qb2luKCIsIikgKyAifSIpOwoJfQoKCWZ1bmN0aW9uIGN1c3RvbUNvbnZlcnRlcihjb2x1bW5zLCBmKSB7CgkgIHZhciBvYmplY3QgPSBvYmplY3RDb252ZXJ0ZXIoY29sdW1ucyk7CgkgIHJldHVybiBmdW5jdGlvbihyb3csIGkpIHsKCSAgICByZXR1cm4gZihvYmplY3Qocm93KSwgaSwgY29sdW1ucyk7CgkgIH07Cgl9CgoJLy8gQ29tcHV0ZSB1bmlxdWUgY29sdW1ucyBpbiBvcmRlciBvZiBkaXNjb3ZlcnkuCglmdW5jdGlvbiBpbmZlckNvbHVtbnMocm93cykgewoJICB2YXIgY29sdW1uU2V0ID0gT2JqZWN0LmNyZWF0ZShudWxsKSwKCSAgICAgIGNvbHVtbnMgPSBbXTsKCgkgIHJvd3MuZm9yRWFjaChmdW5jdGlvbihyb3cpIHsKCSAgICBmb3IgKHZhciBjb2x1bW4gaW4gcm93KSB7CgkgICAgICBpZiAoIShjb2x1bW4gaW4gY29sdW1uU2V0KSkgewoJICAgICAgICBjb2x1bW5zLnB1c2goY29sdW1uU2V0W2NvbHVtbl0gPSBjb2x1bW4pOwoJICAgICAgfQoJICAgIH0KCSAgfSk7CgoJICByZXR1cm4gY29sdW1uczsKCX0KCglmdW5jdGlvbiBkc3YkMShkZWxpbWl0ZXIpIHsKCSAgdmFyIHJlRm9ybWF0ID0gbmV3IFJlZ0V4cCgiW1wiIiArIGRlbGltaXRlciArICJcbl0iKSwKCSAgICAgIGRlbGltaXRlckNvZGUgPSBkZWxpbWl0ZXIuY2hhckNvZGVBdCgwKTsKCgkgIGZ1bmN0aW9uIHBhcnNlKHRleHQsIGYpIHsKCSAgICB2YXIgY29udmVydCwgY29sdW1ucywgcm93cyA9IHBhcnNlUm93cyh0ZXh0LCBmdW5jdGlvbihyb3csIGkpIHsKCSAgICAgIGlmIChjb252ZXJ0KSByZXR1cm4gY29udmVydChyb3csIGkgLSAxKTsKCSAgICAgIGNvbHVtbnMgPSByb3csIGNvbnZlcnQgPSBmID8gY3VzdG9tQ29udmVydGVyKHJvdywgZikgOiBvYmplY3RDb252ZXJ0ZXIocm93KTsKCSAgICB9KTsKCSAgICByb3dzLmNvbHVtbnMgPSBjb2x1bW5zOwoJICAgIHJldHVybiByb3dzOwoJICB9CgoJICBmdW5jdGlvbiBwYXJzZVJvd3ModGV4dCwgZikgewoJICAgIHZhciBFT0wgPSB7fSwgLy8gc2VudGluZWwgdmFsdWUgZm9yIGVuZC1vZi1saW5lCgkgICAgICAgIEVPRiA9IHt9LCAvLyBzZW50aW5lbCB2YWx1ZSBmb3IgZW5kLW9mLWZpbGUKCSAgICAgICAgcm93cyA9IFtdLCAvLyBvdXRwdXQgcm93cwoJICAgICAgICBOID0gdGV4dC5sZW5ndGgsCgkgICAgICAgIEkgPSAwLCAvLyBjdXJyZW50IGNoYXJhY3RlciBpbmRleAoJICAgICAgICBuID0gMCwgLy8gdGhlIGN1cnJlbnQgbGluZSBudW1iZXIKCSAgICAgICAgdCwgLy8gdGhlIGN1cnJlbnQgdG9rZW4KCSAgICAgICAgZW9sOyAvLyBpcyB0aGUgY3VycmVudCB0b2tlbiBmb2xsb3dlZCBieSBFT0w/CgoJICAgIGZ1bmN0aW9uIHRva2VuKCkgewoJICAgICAgaWYgKEkgPj0gTikgcmV0dXJuIEVPRjsgLy8gc3BlY2lhbCBjYXNlOiBlbmQgb2YgZmlsZQoJICAgICAgaWYgKGVvbCkgcmV0dXJuIGVvbCA9IGZhbHNlLCBFT0w7IC8vIHNwZWNpYWwgY2FzZTogZW5kIG9mIGxpbmUKCgkgICAgICAvLyBzcGVjaWFsIGNhc2U6IHF1b3RlcwoJICAgICAgdmFyIGogPSBJLCBjOwoJICAgICAgaWYgKHRleHQuY2hhckNvZGVBdChqKSA9PT0gMzQpIHsKCSAgICAgICAgdmFyIGkgPSBqOwoJICAgICAgICB3aGlsZSAoaSsrIDwgTikgewoJICAgICAgICAgIGlmICh0ZXh0LmNoYXJDb2RlQXQoaSkgPT09IDM0KSB7CgkgICAgICAgICAgICBpZiAodGV4dC5jaGFyQ29kZUF0KGkgKyAxKSAhPT0gMzQpIGJyZWFrOwoJICAgICAgICAgICAgKytpOwoJICAgICAgICAgIH0KCSAgICAgICAgfQoJICAgICAgICBJID0gaSArIDI7CgkgICAgICAgIGMgPSB0ZXh0LmNoYXJDb2RlQXQoaSArIDEpOwoJICAgICAgICBpZiAoYyA9PT0gMTMpIHsKCSAgICAgICAgICBlb2wgPSB0cnVlOwoJICAgICAgICAgIGlmICh0ZXh0LmNoYXJDb2RlQXQoaSArIDIpID09PSAxMCkgKytJOwoJICAgICAgICB9IGVsc2UgaWYgKGMgPT09IDEwKSB7CgkgICAgICAgICAgZW9sID0gdHJ1ZTsKCSAgICAgICAgfQoJICAgICAgICByZXR1cm4gdGV4dC5zbGljZShqICsgMSwgaSkucmVwbGFjZSgvIiIvZywgIlwiIik7CgkgICAgICB9CgoJICAgICAgLy8gY29tbW9uIGNhc2U6IGZpbmQgbmV4dCBkZWxpbWl0ZXIgb3IgbmV3bGluZQoJICAgICAgd2hpbGUgKEkgPCBOKSB7CgkgICAgICAgIHZhciBrID0gMTsKCSAgICAgICAgYyA9IHRleHQuY2hhckNvZGVBdChJKyspOwoJICAgICAgICBpZiAoYyA9PT0gMTApIGVvbCA9IHRydWU7IC8vIFxuCgkgICAgICAgIGVsc2UgaWYgKGMgPT09IDEzKSB7IGVvbCA9IHRydWU7IGlmICh0ZXh0LmNoYXJDb2RlQXQoSSkgPT09IDEwKSArK0ksICsrazsgfSAvLyBccnxcclxuCgkgICAgICAgIGVsc2UgaWYgKGMgIT09IGRlbGltaXRlckNvZGUpIGNvbnRpbnVlOwoJICAgICAgICByZXR1cm4gdGV4dC5zbGljZShqLCBJIC0gayk7CgkgICAgICB9CgoJICAgICAgLy8gc3BlY2lhbCBjYXNlOiBsYXN0IHRva2VuIGJlZm9yZSBFT0YKCSAgICAgIHJldHVybiB0ZXh0LnNsaWNlKGopOwoJICAgIH0KCgkgICAgd2hpbGUgKCh0ID0gdG9rZW4oKSkgIT09IEVPRikgewoJICAgICAgdmFyIGEgPSBbXTsKCSAgICAgIHdoaWxlICh0ICE9PSBFT0wgJiYgdCAhPT0gRU9GKSB7CgkgICAgICAgIGEucHVzaCh0KTsKCSAgICAgICAgdCA9IHRva2VuKCk7CgkgICAgICB9CgkgICAgICBpZiAoZiAmJiAoYSA9IGYoYSwgbisrKSkgPT0gbnVsbCkgY29udGludWU7CgkgICAgICByb3dzLnB1c2goYSk7CgkgICAgfQoKCSAgICByZXR1cm4gcm93czsKCSAgfQoKCSAgZnVuY3Rpb24gZm9ybWF0KHJvd3MsIGNvbHVtbnMpIHsKCSAgICBpZiAoY29sdW1ucyA9PSBudWxsKSBjb2x1bW5zID0gaW5mZXJDb2x1bW5zKHJvd3MpOwoJICAgIHJldHVybiBbY29sdW1ucy5tYXAoZm9ybWF0VmFsdWUpLmpvaW4oZGVsaW1pdGVyKV0uY29uY2F0KHJvd3MubWFwKGZ1bmN0aW9uKHJvdykgewoJICAgICAgcmV0dXJuIGNvbHVtbnMubWFwKGZ1bmN0aW9uKGNvbHVtbikgewoJICAgICAgICByZXR1cm4gZm9ybWF0VmFsdWUocm93W2NvbHVtbl0pOwoJICAgICAgfSkuam9pbihkZWxpbWl0ZXIpOwoJICAgIH0pKS5qb2luKCJcbiIpOwoJICB9CgoJICBmdW5jdGlvbiBmb3JtYXRSb3dzKHJvd3MpIHsKCSAgICByZXR1cm4gcm93cy5tYXAoZm9ybWF0Um93KS5qb2luKCJcbiIpOwoJICB9CgoJICBmdW5jdGlvbiBmb3JtYXRSb3cocm93KSB7CgkgICAgcmV0dXJuIHJvdy5tYXAoZm9ybWF0VmFsdWUpLmpvaW4oZGVsaW1pdGVyKTsKCSAgfQoKCSAgZnVuY3Rpb24gZm9ybWF0VmFsdWUodGV4dCkgewoJICAgIHJldHVybiB0ZXh0ID09IG51bGwgPyAiIgoJICAgICAgICA6IHJlRm9ybWF0LnRlc3QodGV4dCArPSAiIikgPyAiXCIiICsgdGV4dC5yZXBsYWNlKC9cIi9nLCAiXCJcIiIpICsgIlwiIgoJICAgICAgICA6IHRleHQ7CgkgIH0KCgkgIHJldHVybiB7CgkgICAgcGFyc2U6IHBhcnNlLAoJICAgIHBhcnNlUm93czogcGFyc2VSb3dzLAoJICAgIGZvcm1hdDogZm9ybWF0LAoJICAgIGZvcm1hdFJvd3M6IGZvcm1hdFJvd3MKCSAgfTsKCX0KCgl2YXIgY3N2ID0gZHN2JDEoIiwiKTsKCgl2YXIgY3N2UGFyc2UgPSBjc3YucGFyc2U7Cgl2YXIgY3N2UGFyc2VSb3dzID0gY3N2LnBhcnNlUm93czsKCXZhciBjc3ZGb3JtYXQgPSBjc3YuZm9ybWF0OwoJdmFyIGNzdkZvcm1hdFJvd3MgPSBjc3YuZm9ybWF0Um93czsKCgl2YXIgdHN2ID0gZHN2JDEoIlx0Iik7CgoJdmFyIHRzdlBhcnNlID0gdHN2LnBhcnNlOwoJdmFyIHRzdlBhcnNlUm93cyA9IHRzdi5wYXJzZVJvd3M7Cgl2YXIgdHN2Rm9ybWF0ID0gdHN2LmZvcm1hdDsKCXZhciB0c3ZGb3JtYXRSb3dzID0gdHN2LmZvcm1hdFJvd3M7CgoJdmFyIGQzRHN2ID0gLyojX19QVVJFX18qL09iamVjdC5mcmVlemUoewoJCV9fcHJvdG9fXzogbnVsbCwKCQljc3ZGb3JtYXQ6IGNzdkZvcm1hdCwKCQljc3ZGb3JtYXRSb3dzOiBjc3ZGb3JtYXRSb3dzLAoJCWNzdlBhcnNlOiBjc3ZQYXJzZSwKCQljc3ZQYXJzZVJvd3M6IGNzdlBhcnNlUm93cywKCQlkc3ZGb3JtYXQ6IGRzdiQxLAoJCXRzdkZvcm1hdDogdHN2Rm9ybWF0LAoJCXRzdkZvcm1hdFJvd3M6IHRzdkZvcm1hdFJvd3MsCgkJdHN2UGFyc2U6IHRzdlBhcnNlLAoJCXRzdlBhcnNlUm93czogdHN2UGFyc2VSb3dzCgl9KTsKCgl2YXIgcmVxdWlyZSQkMCA9IC8qQF9fUFVSRV9fKi9nZXRBdWdtZW50ZWROYW1lc3BhY2UoZDNEc3YpOwoKCXZhciBzZXhhZ2VzaW1hbCQxID0ge2V4cG9ydHM6IHt9fTsKCglzZXhhZ2VzaW1hbCQxLmV4cG9ydHMgPSBlbGVtZW50OwoJc2V4YWdlc2ltYWwkMS5leHBvcnRzLnBhaXIgPSBwYWlyOwoJc2V4YWdlc2ltYWwkMS5leHBvcnRzLmZvcm1hdCA9IGZvcm1hdDsKCXNleGFnZXNpbWFsJDEuZXhwb3J0cy5mb3JtYXRQYWlyID0gZm9ybWF0UGFpcjsKCXNleGFnZXNpbWFsJDEuZXhwb3J0cy5jb29yZFRvRE1TID0gY29vcmRUb0RNUzsKCgoJZnVuY3Rpb24gZWxlbWVudChpbnB1dCwgZGltcykgewoJICB2YXIgcmVzdWx0ID0gc2VhcmNoKGlucHV0LCBkaW1zKTsKCSAgcmV0dXJuIChyZXN1bHQgPT09IG51bGwpID8gbnVsbCA6IHJlc3VsdC52YWw7Cgl9CgoKCWZ1bmN0aW9uIGZvcm1hdFBhaXIoaW5wdXQpIHsKCSAgcmV0dXJuIGZvcm1hdChpbnB1dC5sYXQsICdsYXQnKSArICcgJyArIGZvcm1hdChpbnB1dC5sb24sICdsb24nKTsKCX0KCgoJLy8gSXMgMCBOb3J0aCBvciBTb3V0aD8KCWZ1bmN0aW9uIGZvcm1hdChpbnB1dCwgZGltKSB7CgkgIHZhciBkbXMgPSBjb29yZFRvRE1TKGlucHV0LCBkaW0pOwoJICByZXR1cm4gZG1zLndob2xlICsgJ8KwICcgKwoJICAgIChkbXMubWludXRlcyA/IGRtcy5taW51dGVzICsgJ1wnICcgOiAnJykgKwoJICAgIChkbXMuc2Vjb25kcyA/IGRtcy5zZWNvbmRzICsgJyIgJyA6ICcnKSArIGRtcy5kaXI7Cgl9CgoKCWZ1bmN0aW9uIGNvb3JkVG9ETVMoaW5wdXQsIGRpbSkgewoJICB2YXIgZGlycyA9IHsgbGF0OiBbJ04nLCAnUyddLCBsb246IFsnRScsICdXJ10gfVtkaW1dIHx8ICcnOwoJICB2YXIgZGlyID0gZGlyc1tpbnB1dCA+PSAwID8gMCA6IDFdOwoJICB2YXIgYWJzID0gTWF0aC5hYnMoaW5wdXQpOwoJICB2YXIgd2hvbGUgPSBNYXRoLmZsb29yKGFicyk7CgkgIHZhciBmcmFjdGlvbiA9IGFicyAtIHdob2xlOwoJICB2YXIgZnJhY3Rpb25NaW51dGVzID0gZnJhY3Rpb24gKiA2MDsKCSAgdmFyIG1pbnV0ZXMgPSBNYXRoLmZsb29yKGZyYWN0aW9uTWludXRlcyk7CgkgIHZhciBzZWNvbmRzID0gTWF0aC5mbG9vcigoZnJhY3Rpb25NaW51dGVzIC0gbWludXRlcykgKiA2MCk7CgoJICByZXR1cm4gewoJICAgIHdob2xlOiB3aG9sZSwKCSAgICBtaW51dGVzOiBtaW51dGVzLAoJICAgIHNlY29uZHM6IHNlY29uZHMsCgkgICAgZGlyOiBkaXIKCSAgfTsKCX0KCgoJZnVuY3Rpb24gc2VhcmNoKGlucHV0LCBkaW1zKSB7CgkgIGlmICghZGltcykgZGltcyA9ICdOU0VXJzsKCSAgaWYgKHR5cGVvZiBpbnB1dCAhPT0gJ3N0cmluZycpIHJldHVybiBudWxsOwoKCSAgaW5wdXQgPSBpbnB1dC50b1VwcGVyQ2FzZSgpOwoJICB2YXIgcmVnZXggPSAvXltcc1wsXSooW05TRVddKT9ccyooW1wtfFzigJR8XOKAlV0/WzAtOS5dKylbwrDCusuaXT9ccyooPzooWzAtOS5dKylbJ+KAmeKAsuKAmF1ccyopPyg/OihbMC05Ll0rKSg/OicnfCJ84oCdfOKAsylccyopPyhbTlNFV10pPy87CgoJICB2YXIgbSA9IGlucHV0Lm1hdGNoKHJlZ2V4KTsKCSAgaWYgKCFtKSByZXR1cm4gbnVsbDsgIC8vIG5vIG1hdGNoCgoJICB2YXIgbWF0Y2hlZCA9IG1bMF07CgoJICAvLyBleHRyYWN0IGRpbWVuc2lvbi4uIG1bMV0gPSBsZWFkaW5nLCBtWzVdID0gdHJhaWxpbmcKCSAgdmFyIGRpbTsKCSAgaWYgKG1bMV0gJiYgbVs1XSkgeyAgICAgICAgICAgICAgICAgLy8gaWYgbWF0Y2hlZCBib3RoLi4KCSAgICBkaW0gPSBtWzFdOyAgICAgICAgICAgICAgICAgICAgICAgLy8ga2VlcCBsZWFkaW5nCgkgICAgbWF0Y2hlZCA9IG1hdGNoZWQuc2xpY2UoMCwgLTEpOyAgIC8vIHJlbW92ZSB0cmFpbGluZyBkaW1lbnNpb24gZnJvbSBtYXRjaAoJICB9IGVsc2UgewoJICAgIGRpbSA9IG1bMV0gfHwgbVs1XTsKCSAgfQoKCSAgLy8gaWYgdW5yZWNvZ25pemVkIGRpbWVuc2lvbgoJICBpZiAoZGltICYmIGRpbXMuaW5kZXhPZihkaW0pID09PSAtMSkgcmV0dXJuIG51bGw7CgoJICAvLyBleHRyYWN0IERNUwoJICB2YXIgZGVnID0gbVsyXSA/IHBhcnNlRmxvYXQobVsyXSkgOiAwOwoJICB2YXIgbWluID0gbVszXSA/IHBhcnNlRmxvYXQobVszXSkgLyA2MCA6IDA7CgkgIHZhciBzZWMgPSBtWzRdID8gcGFyc2VGbG9hdChtWzRdKSAvIDM2MDAgOiAwOwoJICB2YXIgc2lnbiA9IChkZWcgPCAwKSA/IC0xIDogMTsKCSAgaWYgKGRpbSA9PT0gJ1MnIHx8IGRpbSA9PT0gJ1cnKSBzaWduICo9IC0xOwoKCSAgcmV0dXJuIHsKCSAgICB2YWw6IChNYXRoLmFicyhkZWcpICsgbWluICsgc2VjKSAqIHNpZ24sCgkgICAgZGltOiBkaW0sCgkgICAgbWF0Y2hlZDogbWF0Y2hlZCwKCSAgICByZW1haW46IGlucHV0LnNsaWNlKG1hdGNoZWQubGVuZ3RoKQoJICB9OwoJfQoKCglmdW5jdGlvbiBwYWlyKGlucHV0LCBkaW1zKSB7CgkgIGlucHV0ID0gaW5wdXQudHJpbSgpOwoJICB2YXIgb25lID0gc2VhcmNoKGlucHV0LCBkaW1zKTsKCSAgaWYgKCFvbmUpIHJldHVybiBudWxsOwoKCSAgaW5wdXQgPSBvbmUucmVtYWluLnRyaW0oKTsKCSAgdmFyIHR3byA9IHNlYXJjaChpbnB1dCwgZGltcyk7CgkgIGlmICghdHdvIHx8IHR3by5yZW1haW4pIHJldHVybiBudWxsOwoKCSAgaWYgKG9uZS5kaW0pIHsKCSAgICByZXR1cm4gc3dhcGRpbShvbmUudmFsLCB0d28udmFsLCBvbmUuZGltKTsKCSAgfSBlbHNlIHsKCSAgICByZXR1cm4gW29uZS52YWwsIHR3by52YWxdOwoJICB9Cgl9CgoKCWZ1bmN0aW9uIHN3YXBkaW0oYSwgYiwgZGltKSB7CgkgIGlmIChkaW0gPT09ICdOJyB8fCBkaW0gPT09ICdTJykgcmV0dXJuIFthLCBiXTsKCSAgaWYgKGRpbSA9PT0gJ1cnIHx8IGRpbSA9PT0gJ0UnKSByZXR1cm4gW2IsIGFdOwoJfQoKCXZhciBzZXhhZ2VzaW1hbEV4cG9ydHMgPSBzZXhhZ2VzaW1hbCQxLmV4cG9ydHM7CgoJdmFyIGRzdiA9IHJlcXVpcmUkJDAsCgkgICAgc2V4YWdlc2ltYWwgPSBzZXhhZ2VzaW1hbEV4cG9ydHM7CgoJdmFyIGxhdFJlZ2V4ID0gLyhMYXQpKGl0dWRlKT8vZ2ksCgkgICAgbG9uUmVnZXggPSAvKEwpKG9ufG5nKShnaXR1ZGUpPy9pOwoKCWZ1bmN0aW9uIGd1ZXNzSGVhZGVyKHJvdywgcmVnZXhwKSB7CgkgICAgdmFyIG5hbWUsIG1hdGNoLCBzY29yZTsKCSAgICBmb3IgKHZhciBmIGluIHJvdykgewoJICAgICAgICBtYXRjaCA9IGYubWF0Y2gocmVnZXhwKTsKCSAgICAgICAgaWYgKG1hdGNoICYmICghbmFtZSB8fCBtYXRjaFswXS5sZW5ndGggLyBmLmxlbmd0aCA+IHNjb3JlKSkgewoJICAgICAgICAgICAgc2NvcmUgPSBtYXRjaFswXS5sZW5ndGggLyBmLmxlbmd0aDsKCSAgICAgICAgICAgIG5hbWUgPSBmOwoJICAgICAgICB9CgkgICAgfQoJICAgIHJldHVybiBuYW1lOwoJfQoKCWZ1bmN0aW9uIGd1ZXNzTGF0SGVhZGVyKHJvdykgeyByZXR1cm4gZ3Vlc3NIZWFkZXIocm93LCBsYXRSZWdleCk7IH0KCWZ1bmN0aW9uIGd1ZXNzTG9uSGVhZGVyKHJvdykgeyByZXR1cm4gZ3Vlc3NIZWFkZXIocm93LCBsb25SZWdleCk7IH0KCglmdW5jdGlvbiBpc0xhdChmKSB7IHJldHVybiAhIWYubWF0Y2gobGF0UmVnZXgpOyB9CglmdW5jdGlvbiBpc0xvbihmKSB7IHJldHVybiAhIWYubWF0Y2gobG9uUmVnZXgpOyB9CgoJZnVuY3Rpb24ga2V5Q291bnQobykgewoJICAgIHJldHVybiAodHlwZW9mIG8gPT0gJ29iamVjdCcpID8gT2JqZWN0LmtleXMobykubGVuZ3RoIDogMDsKCX0KCglmdW5jdGlvbiBhdXRvRGVsaW1pdGVyKHgpIHsKCSAgICB2YXIgZGVsaW1pdGVycyA9IFsnLCcsICc7JywgJ1x0JywgJ3wnXTsKCSAgICB2YXIgcmVzdWx0cyA9IFtdOwoKCSAgICBkZWxpbWl0ZXJzLmZvckVhY2goZnVuY3Rpb24gKGRlbGltaXRlcikgewoJICAgICAgICB2YXIgcmVzID0gZHN2LmRzdkZvcm1hdChkZWxpbWl0ZXIpLnBhcnNlKHgpOwoJICAgICAgICBpZiAocmVzLmxlbmd0aCA+PSAxKSB7CgkgICAgICAgICAgICB2YXIgY291bnQgPSBrZXlDb3VudChyZXNbMF0pOwoJICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXMubGVuZ3RoOyBpKyspIHsKCSAgICAgICAgICAgICAgICBpZiAoa2V5Q291bnQocmVzW2ldKSAhPT0gY291bnQpIHJldHVybjsKCSAgICAgICAgICAgIH0KCSAgICAgICAgICAgIHJlc3VsdHMucHVzaCh7CgkgICAgICAgICAgICAgICAgZGVsaW1pdGVyOiBkZWxpbWl0ZXIsCgkgICAgICAgICAgICAgICAgYXJpdHk6IE9iamVjdC5rZXlzKHJlc1swXSkubGVuZ3RoLAoJICAgICAgICAgICAgfSk7CgkgICAgICAgIH0KCSAgICB9KTsKCgkgICAgaWYgKHJlc3VsdHMubGVuZ3RoKSB7CgkgICAgICAgIHJldHVybiByZXN1bHRzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHsKCSAgICAgICAgICAgIHJldHVybiBiLmFyaXR5IC0gYS5hcml0eTsKCSAgICAgICAgfSlbMF0uZGVsaW1pdGVyOwoJICAgIH0gZWxzZSB7CgkgICAgICAgIHJldHVybiBudWxsOwoJICAgIH0KCX0KCgkvKioKCSAqIFNpbGx5IHN0b3BnYXAgZm9yIGRzdiB0byBkMy1kc3YgdXBncmFkZQoJICoKCSAqIEBwYXJhbSB7QXJyYXl9IHggZHN2IG91dHB1dAoJICogQHJldHVybnMge0FycmF5fSBhcnJheSB3aXRob3V0IGNvbHVtbnMgbWVtYmVyCgkgKi8KCWZ1bmN0aW9uIGRlbGV0ZUNvbHVtbnMoeCkgewoJICAgIGRlbGV0ZSB4LmNvbHVtbnM7CgkgICAgcmV0dXJuIHg7Cgl9CgoJZnVuY3Rpb24gYXV0byh4KSB7CgkgICAgdmFyIGRlbGltaXRlciA9IGF1dG9EZWxpbWl0ZXIoeCk7CgkgICAgaWYgKCFkZWxpbWl0ZXIpIHJldHVybiBudWxsOwoJICAgIHJldHVybiBkZWxldGVDb2x1bW5zKGRzdi5kc3ZGb3JtYXQoZGVsaW1pdGVyKS5wYXJzZSh4KSk7Cgl9CgoJZnVuY3Rpb24gY3N2Mmdlb2pzb24oeCwgb3B0aW9ucywgY2FsbGJhY2spIHsKCgkgICAgaWYgKCFjYWxsYmFjaykgewoJICAgICAgICBjYWxsYmFjayA9IG9wdGlvbnM7CgkgICAgICAgIG9wdGlvbnMgPSB7fTsKCSAgICB9CgoJICAgIG9wdGlvbnMuZGVsaW1pdGVyID0gb3B0aW9ucy5kZWxpbWl0ZXIgfHwgJywnOwoKCSAgICB2YXIgbGF0ZmllbGQgPSBvcHRpb25zLmxhdGZpZWxkIHx8ICcnLAoJICAgICAgICBsb25maWVsZCA9IG9wdGlvbnMubG9uZmllbGQgfHwgJycsCgkgICAgICAgIGNycyA9IG9wdGlvbnMuY3JzIHx8ICcnOwoKCSAgICB2YXIgZmVhdHVyZXMgPSBbXSwKCSAgICAgICAgZmVhdHVyZWNvbGxlY3Rpb24gPSB7dHlwZTogJ0ZlYXR1cmVDb2xsZWN0aW9uJywgZmVhdHVyZXM6IGZlYXR1cmVzfTsKCgkgICAgaWYgKGNycyAhPT0gJycpIHsKCSAgICAgICAgZmVhdHVyZWNvbGxlY3Rpb24uY3JzID0ge3R5cGU6ICduYW1lJywgcHJvcGVydGllczoge25hbWU6IGNyc319OwoJICAgIH0KCgkgICAgaWYgKG9wdGlvbnMuZGVsaW1pdGVyID09PSAnYXV0bycgJiYgdHlwZW9mIHggPT0gJ3N0cmluZycpIHsKCSAgICAgICAgb3B0aW9ucy5kZWxpbWl0ZXIgPSBhdXRvRGVsaW1pdGVyKHgpOwoJICAgICAgICBpZiAoIW9wdGlvbnMuZGVsaW1pdGVyKSB7CgkgICAgICAgICAgICBjYWxsYmFjayh7CgkgICAgICAgICAgICAgICAgdHlwZTogJ0Vycm9yJywKCSAgICAgICAgICAgICAgICBtZXNzYWdlOiAnQ291bGQgbm90IGF1dG9kZXRlY3QgZGVsaW1pdGVyJwoJICAgICAgICAgICAgfSk7CgkgICAgICAgICAgICByZXR1cm47CgkgICAgICAgIH0KCSAgICB9CgoJICAgIHZhciBudW1lcmljRmllbGRzID0gb3B0aW9ucy5udW1lcmljRmllbGRzID8gb3B0aW9ucy5udW1lcmljRmllbGRzLnNwbGl0KCcsJykgOiBudWxsOwoKCSAgICB2YXIgcGFyc2VkID0gKHR5cGVvZiB4ID09ICdzdHJpbmcnKSA/CgkgICAgICAgIGRzdi5kc3ZGb3JtYXQob3B0aW9ucy5kZWxpbWl0ZXIpLnBhcnNlKHgsIGZ1bmN0aW9uIChkKSB7CgkgICAgICAgICAgICBpZiAobnVtZXJpY0ZpZWxkcykgewoJICAgICAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiBkKSB7CgkgICAgICAgICAgICAgICAgICAgIGlmIChudW1lcmljRmllbGRzLmluY2x1ZGVzKGtleSkpIHsKCSAgICAgICAgICAgICAgICAgICAgICAgIGRba2V5XSA9ICtkW2tleV07CgkgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICB9CgkgICAgICAgICAgICByZXR1cm4gZDsKCSAgICAgICAgfSkgOiB4OwoKCSAgICBpZiAoIXBhcnNlZC5sZW5ndGgpIHsKCSAgICAgICAgY2FsbGJhY2sobnVsbCwgZmVhdHVyZWNvbGxlY3Rpb24pOwoJICAgICAgICByZXR1cm47CgkgICAgfQoKCSAgICB2YXIgZXJyb3JzID0gW107CgkgICAgdmFyIGk7CgoKCSAgICBpZiAoIWxhdGZpZWxkKSBsYXRmaWVsZCA9IGd1ZXNzTGF0SGVhZGVyKHBhcnNlZFswXSk7CgkgICAgaWYgKCFsb25maWVsZCkgbG9uZmllbGQgPSBndWVzc0xvbkhlYWRlcihwYXJzZWRbMF0pOwoJICAgIHZhciBub0dlb21ldHJ5ID0gKCFsYXRmaWVsZCB8fCAhbG9uZmllbGQpOwoKCSAgICBpZiAobm9HZW9tZXRyeSkgewoJICAgICAgICBmb3IgKGkgPSAwOyBpIDwgcGFyc2VkLmxlbmd0aDsgaSsrKSB7CgkgICAgICAgICAgICBmZWF0dXJlcy5wdXNoKHsKCSAgICAgICAgICAgICAgICB0eXBlOiAnRmVhdHVyZScsCgkgICAgICAgICAgICAgICAgcHJvcGVydGllczogcGFyc2VkW2ldLAoJICAgICAgICAgICAgICAgIGdlb21ldHJ5OiBudWxsCgkgICAgICAgICAgICB9KTsKCSAgICAgICAgfQoJICAgICAgICBjYWxsYmFjayhlcnJvcnMubGVuZ3RoID8gZXJyb3JzIDogbnVsbCwgZmVhdHVyZWNvbGxlY3Rpb24pOwoJICAgICAgICByZXR1cm47CgkgICAgfQoKCSAgICBmb3IgKGkgPSAwOyBpIDwgcGFyc2VkLmxlbmd0aDsgaSsrKSB7CgkgICAgICAgIGlmIChwYXJzZWRbaV1bbG9uZmllbGRdICE9PSB1bmRlZmluZWQgJiYKCSAgICAgICAgICAgIHBhcnNlZFtpXVtsYXRmaWVsZF0gIT09IHVuZGVmaW5lZCkgewoKCSAgICAgICAgICAgIHZhciBsb25rID0gcGFyc2VkW2ldW2xvbmZpZWxkXSwKCSAgICAgICAgICAgICAgICBsYXRrID0gcGFyc2VkW2ldW2xhdGZpZWxkXSwKCSAgICAgICAgICAgICAgICBsb25mLCBsYXRmLAoJICAgICAgICAgICAgICAgIGE7CgoJICAgICAgICAgICAgYSA9IHNleGFnZXNpbWFsKGxvbmssICdFVycpOwoJICAgICAgICAgICAgaWYgKGEpIGxvbmsgPSBhOwoJICAgICAgICAgICAgYSA9IHNleGFnZXNpbWFsKGxhdGssICdOUycpOwoJICAgICAgICAgICAgaWYgKGEpIGxhdGsgPSBhOwoKCSAgICAgICAgICAgIGxvbmYgPSBwYXJzZUZsb2F0KGxvbmspOwoJICAgICAgICAgICAgbGF0ZiA9IHBhcnNlRmxvYXQobGF0ayk7CgoJICAgICAgICAgICAgaWYgKGlzTmFOKGxvbmYpIHx8CgkgICAgICAgICAgICAgICAgaXNOYU4obGF0ZikpIHsKCSAgICAgICAgICAgICAgICBlcnJvcnMucHVzaCh7CgkgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdBIHJvdyBjb250YWluZWQgYW4gaW52YWxpZCB2YWx1ZSBmb3IgbGF0aXR1ZGUgb3IgbG9uZ2l0dWRlJywKCSAgICAgICAgICAgICAgICAgICAgcm93OiBwYXJzZWRbaV0sCgkgICAgICAgICAgICAgICAgICAgIGluZGV4OiBpCgkgICAgICAgICAgICAgICAgfSk7CgkgICAgICAgICAgICB9IGVsc2UgewoJICAgICAgICAgICAgICAgIGlmICghb3B0aW9ucy5pbmNsdWRlTGF0TG9uKSB7CgkgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBwYXJzZWRbaV1bbG9uZmllbGRdOwoJICAgICAgICAgICAgICAgICAgICBkZWxldGUgcGFyc2VkW2ldW2xhdGZpZWxkXTsKCSAgICAgICAgICAgICAgICB9CgoJICAgICAgICAgICAgICAgIGZlYXR1cmVzLnB1c2goewoJICAgICAgICAgICAgICAgICAgICB0eXBlOiAnRmVhdHVyZScsCgkgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHBhcnNlZFtpXSwKCSAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cnk6IHsKCSAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdQb2ludCcsCgkgICAgICAgICAgICAgICAgICAgICAgICBjb29yZGluYXRlczogWwoJICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlRmxvYXQobG9uZiksCgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VGbG9hdChsYXRmKQoJICAgICAgICAgICAgICAgICAgICAgICAgXQoJICAgICAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgfSk7CgkgICAgICAgICAgICB9CgkgICAgICAgIH0KCSAgICB9CgoJICAgIGNhbGxiYWNrKGVycm9ycy5sZW5ndGggPyBlcnJvcnMgOiBudWxsLCBmZWF0dXJlY29sbGVjdGlvbik7Cgl9CgoJZnVuY3Rpb24gdG9MaW5lKGdqKSB7CgkgICAgdmFyIGZlYXR1cmVzID0gZ2ouZmVhdHVyZXM7CgkgICAgdmFyIGxpbmUgPSB7CgkgICAgICAgIHR5cGU6ICdGZWF0dXJlJywKCSAgICAgICAgZ2VvbWV0cnk6IHsKCSAgICAgICAgICAgIHR5cGU6ICdMaW5lU3RyaW5nJywKCSAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBbXQoJICAgICAgICB9CgkgICAgfTsKCSAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZlYXR1cmVzLmxlbmd0aDsgaSsrKSB7CgkgICAgICAgIGxpbmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXMucHVzaChmZWF0dXJlc1tpXS5nZW9tZXRyeS5jb29yZGluYXRlcyk7CgkgICAgfQoJICAgIGxpbmUucHJvcGVydGllcyA9IGZlYXR1cmVzLnJlZHVjZShmdW5jdGlvbiAoYWdncmVnYXRlZFByb3BlcnRpZXMsIG5ld0ZlYXR1cmUpIHsKCSAgICAgICAgZm9yICh2YXIga2V5IGluIG5ld0ZlYXR1cmUucHJvcGVydGllcykgewoJICAgICAgICAgICAgaWYgKCFhZ2dyZWdhdGVkUHJvcGVydGllc1trZXldKSB7CgkgICAgICAgICAgICAgICAgYWdncmVnYXRlZFByb3BlcnRpZXNba2V5XSA9IFtdOwoJICAgICAgICAgICAgfQoJICAgICAgICAgICAgYWdncmVnYXRlZFByb3BlcnRpZXNba2V5XS5wdXNoKG5ld0ZlYXR1cmUucHJvcGVydGllc1trZXldKTsKCSAgICAgICAgfQoJICAgICAgICByZXR1cm4gYWdncmVnYXRlZFByb3BlcnRpZXM7CgkgICAgfSwge30pOwoJICAgIHJldHVybiB7CgkgICAgICAgIHR5cGU6ICdGZWF0dXJlQ29sbGVjdGlvbicsCgkgICAgICAgIGZlYXR1cmVzOiBbbGluZV0KCSAgICB9OwoJfQoKCWZ1bmN0aW9uIHRvUG9seWdvbihnaikgewoJICAgIHZhciBmZWF0dXJlcyA9IGdqLmZlYXR1cmVzOwoJICAgIHZhciBwb2x5ID0gewoJICAgICAgICB0eXBlOiAnRmVhdHVyZScsCgkgICAgICAgIGdlb21ldHJ5OiB7CgkgICAgICAgICAgICB0eXBlOiAnUG9seWdvbicsCgkgICAgICAgICAgICBjb29yZGluYXRlczogW1tdXQoJICAgICAgICB9CgkgICAgfTsKCSAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZlYXR1cmVzLmxlbmd0aDsgaSsrKSB7CgkgICAgICAgIHBvbHkuZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMF0ucHVzaChmZWF0dXJlc1tpXS5nZW9tZXRyeS5jb29yZGluYXRlcyk7CgkgICAgfQoJICAgIHBvbHkucHJvcGVydGllcyA9IGZlYXR1cmVzLnJlZHVjZShmdW5jdGlvbiAoYWdncmVnYXRlZFByb3BlcnRpZXMsIG5ld0ZlYXR1cmUpIHsKCSAgICAgICAgZm9yICh2YXIga2V5IGluIG5ld0ZlYXR1cmUucHJvcGVydGllcykgewoJICAgICAgICAgICAgaWYgKCFhZ2dyZWdhdGVkUHJvcGVydGllc1trZXldKSB7CgkgICAgICAgICAgICAgICAgYWdncmVnYXRlZFByb3BlcnRpZXNba2V5XSA9IFtdOwoJICAgICAgICAgICAgfQoJICAgICAgICAgICAgYWdncmVnYXRlZFByb3BlcnRpZXNba2V5XS5wdXNoKG5ld0ZlYXR1cmUucHJvcGVydGllc1trZXldKTsKCSAgICAgICAgfQoJICAgICAgICByZXR1cm4gYWdncmVnYXRlZFByb3BlcnRpZXM7CgkgICAgfSwge30pOwoJICAgIHJldHVybiB7CgkgICAgICAgIHR5cGU6ICdGZWF0dXJlQ29sbGVjdGlvbicsCgkgICAgICAgIGZlYXR1cmVzOiBbcG9seV0KCSAgICB9OwoJfQoKCXZhciBjc3YyZ2VvanNvbl8xID0gewoJICAgIGlzTG9uOiBpc0xvbiwKCSAgICBpc0xhdDogaXNMYXQsCgkgICAgZ3Vlc3NMYXRIZWFkZXI6IGd1ZXNzTGF0SGVhZGVyLAoJICAgIGd1ZXNzTG9uSGVhZGVyOiBndWVzc0xvbkhlYWRlciwKCSAgICBjc3Y6IGRzdi5jc3ZQYXJzZSwKCSAgICB0c3Y6IGRzdi50c3ZQYXJzZSwKCSAgICBkc3Y6IGRzdiwKCSAgICBhdXRvOiBhdXRvLAoJICAgIGNzdjJnZW9qc29uOiBjc3YyZ2VvanNvbiwKCSAgICB0b0xpbmU6IHRvTGluZSwKCSAgICB0b1BvbHlnb246IHRvUG9seWdvbgoJfTsKCglmdW5jdGlvbiBpZGVudGl0eSh4KSB7CgkgIHJldHVybiB4OwoJfQoKCWZ1bmN0aW9uIHRyYW5zZm9ybSh0cmFuc2Zvcm0pIHsKCSAgaWYgKHRyYW5zZm9ybSA9PSBudWxsKSByZXR1cm4gaWRlbnRpdHk7CgkgIHZhciB4MCwKCSAgICAgIHkwLAoJICAgICAga3ggPSB0cmFuc2Zvcm0uc2NhbGVbMF0sCgkgICAgICBreSA9IHRyYW5zZm9ybS5zY2FsZVsxXSwKCSAgICAgIGR4ID0gdHJhbnNmb3JtLnRyYW5zbGF0ZVswXSwKCSAgICAgIGR5ID0gdHJhbnNmb3JtLnRyYW5zbGF0ZVsxXTsKCSAgcmV0dXJuIGZ1bmN0aW9uKGlucHV0LCBpKSB7CgkgICAgaWYgKCFpKSB4MCA9IHkwID0gMDsKCSAgICB2YXIgaiA9IDIsIG4gPSBpbnB1dC5sZW5ndGgsIG91dHB1dCA9IG5ldyBBcnJheShuKTsKCSAgICBvdXRwdXRbMF0gPSAoeDAgKz0gaW5wdXRbMF0pICoga3ggKyBkeDsKCSAgICBvdXRwdXRbMV0gPSAoeTAgKz0gaW5wdXRbMV0pICoga3kgKyBkeTsKCSAgICB3aGlsZSAoaiA8IG4pIG91dHB1dFtqXSA9IGlucHV0W2pdLCArK2o7CgkgICAgcmV0dXJuIG91dHB1dDsKCSAgfTsKCX0KCglmdW5jdGlvbiByZXZlcnNlKGFycmF5LCBuKSB7CgkgIHZhciB0LCBqID0gYXJyYXkubGVuZ3RoLCBpID0gaiAtIG47CgkgIHdoaWxlIChpIDwgLS1qKSB0ID0gYXJyYXlbaV0sIGFycmF5W2krK10gPSBhcnJheVtqXSwgYXJyYXlbal0gPSB0OwoJfQoKCWZ1bmN0aW9uIHRvcG9qc29uRmVhdHVyZSh0b3BvbG9neSwgbykgewoJICBpZiAodHlwZW9mIG8gPT09ICJzdHJpbmciKSBvID0gdG9wb2xvZ3kub2JqZWN0c1tvXTsKCSAgcmV0dXJuIG8udHlwZSA9PT0gIkdlb21ldHJ5Q29sbGVjdGlvbiIKCSAgICAgID8ge3R5cGU6ICJGZWF0dXJlQ29sbGVjdGlvbiIsIGZlYXR1cmVzOiBvLmdlb21ldHJpZXMubWFwKGZ1bmN0aW9uKG8pIHsgcmV0dXJuIGZlYXR1cmUodG9wb2xvZ3ksIG8pOyB9KX0KCSAgICAgIDogZmVhdHVyZSh0b3BvbG9neSwgbyk7Cgl9CgoJZnVuY3Rpb24gZmVhdHVyZSh0b3BvbG9neSwgbykgewoJICB2YXIgaWQgPSBvLmlkLAoJICAgICAgYmJveCA9IG8uYmJveCwKCSAgICAgIHByb3BlcnRpZXMgPSBvLnByb3BlcnRpZXMgPT0gbnVsbCA/IHt9IDogby5wcm9wZXJ0aWVzLAoJICAgICAgZ2VvbWV0cnkgPSBvYmplY3QodG9wb2xvZ3ksIG8pOwoJICByZXR1cm4gaWQgPT0gbnVsbCAmJiBiYm94ID09IG51bGwgPyB7dHlwZTogIkZlYXR1cmUiLCBwcm9wZXJ0aWVzOiBwcm9wZXJ0aWVzLCBnZW9tZXRyeTogZ2VvbWV0cnl9CgkgICAgICA6IGJib3ggPT0gbnVsbCA/IHt0eXBlOiAiRmVhdHVyZSIsIGlkOiBpZCwgcHJvcGVydGllczogcHJvcGVydGllcywgZ2VvbWV0cnk6IGdlb21ldHJ5fQoJICAgICAgOiB7dHlwZTogIkZlYXR1cmUiLCBpZDogaWQsIGJib3g6IGJib3gsIHByb3BlcnRpZXM6IHByb3BlcnRpZXMsIGdlb21ldHJ5OiBnZW9tZXRyeX07Cgl9CgoJZnVuY3Rpb24gb2JqZWN0KHRvcG9sb2d5LCBvKSB7CgkgIHZhciB0cmFuc2Zvcm1Qb2ludCA9IHRyYW5zZm9ybSh0b3BvbG9neS50cmFuc2Zvcm0pLAoJICAgICAgYXJjcyA9IHRvcG9sb2d5LmFyY3M7CgoJICBmdW5jdGlvbiBhcmMoaSwgcG9pbnRzKSB7CgkgICAgaWYgKHBvaW50cy5sZW5ndGgpIHBvaW50cy5wb3AoKTsKCSAgICBmb3IgKHZhciBhID0gYXJjc1tpIDwgMCA/IH5pIDogaV0sIGsgPSAwLCBuID0gYS5sZW5ndGg7IGsgPCBuOyArK2spIHsKCSAgICAgIHBvaW50cy5wdXNoKHRyYW5zZm9ybVBvaW50KGFba10sIGspKTsKCSAgICB9CgkgICAgaWYgKGkgPCAwKSByZXZlcnNlKHBvaW50cywgbik7CgkgIH0KCgkgIGZ1bmN0aW9uIHBvaW50KHApIHsKCSAgICByZXR1cm4gdHJhbnNmb3JtUG9pbnQocCk7CgkgIH0KCgkgIGZ1bmN0aW9uIGxpbmUoYXJjcykgewoJICAgIHZhciBwb2ludHMgPSBbXTsKCSAgICBmb3IgKHZhciBpID0gMCwgbiA9IGFyY3MubGVuZ3RoOyBpIDwgbjsgKytpKSBhcmMoYXJjc1tpXSwgcG9pbnRzKTsKCSAgICBpZiAocG9pbnRzLmxlbmd0aCA8IDIpIHBvaW50cy5wdXNoKHBvaW50c1swXSk7IC8vIFRoaXMgc2hvdWxkIG5ldmVyIGhhcHBlbiBwZXIgdGhlIHNwZWNpZmljYXRpb24uCgkgICAgcmV0dXJuIHBvaW50czsKCSAgfQoKCSAgZnVuY3Rpb24gcmluZyhhcmNzKSB7CgkgICAgdmFyIHBvaW50cyA9IGxpbmUoYXJjcyk7CgkgICAgd2hpbGUgKHBvaW50cy5sZW5ndGggPCA0KSBwb2ludHMucHVzaChwb2ludHNbMF0pOyAvLyBUaGlzIG1heSBoYXBwZW4gaWYgYW4gYXJjIGhhcyBvbmx5IHR3byBwb2ludHMuCgkgICAgcmV0dXJuIHBvaW50czsKCSAgfQoKCSAgZnVuY3Rpb24gcG9seWdvbihhcmNzKSB7CgkgICAgcmV0dXJuIGFyY3MubWFwKHJpbmcpOwoJICB9CgoJICBmdW5jdGlvbiBnZW9tZXRyeShvKSB7CgkgICAgdmFyIHR5cGUgPSBvLnR5cGUsIGNvb3JkaW5hdGVzOwoJICAgIHN3aXRjaCAodHlwZSkgewoJICAgICAgY2FzZSAiR2VvbWV0cnlDb2xsZWN0aW9uIjogcmV0dXJuIHt0eXBlOiB0eXBlLCBnZW9tZXRyaWVzOiBvLmdlb21ldHJpZXMubWFwKGdlb21ldHJ5KX07CgkgICAgICBjYXNlICJQb2ludCI6IGNvb3JkaW5hdGVzID0gcG9pbnQoby5jb29yZGluYXRlcyk7IGJyZWFrOwoJICAgICAgY2FzZSAiTXVsdGlQb2ludCI6IGNvb3JkaW5hdGVzID0gby5jb29yZGluYXRlcy5tYXAocG9pbnQpOyBicmVhazsKCSAgICAgIGNhc2UgIkxpbmVTdHJpbmciOiBjb29yZGluYXRlcyA9IGxpbmUoby5hcmNzKTsgYnJlYWs7CgkgICAgICBjYXNlICJNdWx0aUxpbmVTdHJpbmciOiBjb29yZGluYXRlcyA9IG8uYXJjcy5tYXAobGluZSk7IGJyZWFrOwoJICAgICAgY2FzZSAiUG9seWdvbiI6IGNvb3JkaW5hdGVzID0gcG9seWdvbihvLmFyY3MpOyBicmVhazsKCSAgICAgIGNhc2UgIk11bHRpUG9seWdvbiI6IGNvb3JkaW5hdGVzID0gby5hcmNzLm1hcChwb2x5Z29uKTsgYnJlYWs7CgkgICAgICBkZWZhdWx0OiByZXR1cm4gbnVsbDsKCSAgICB9CgkgICAgcmV0dXJuIHt0eXBlOiB0eXBlLCBjb29yZGluYXRlczogY29vcmRpbmF0ZXN9OwoJICB9CgoJICByZXR1cm4gZ2VvbWV0cnkobyk7Cgl9CgoJZnVuY3Rpb24gJChlbGVtZW50LCB0YWdOYW1lKSB7CgkgICAgcmV0dXJuIEFycmF5LmZyb20oZWxlbWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSh0YWdOYW1lKSk7Cgl9CglmdW5jdGlvbiBub3JtYWxpemVJZChpZCkgewoJICAgIHJldHVybiBpZFswXSA9PT0gIiMiID8gaWQgOiBgIyR7aWR9YDsKCX0KCWZ1bmN0aW9uICRucyhlbGVtZW50LCB0YWdOYW1lLCBucykgewoJICAgIHJldHVybiBBcnJheS5mcm9tKGVsZW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWVOUyhucywgdGFnTmFtZSkpOwoJfQoJLyoqCgkgKiBnZXQgdGhlIGNvbnRlbnQgb2YgYSB0ZXh0IG5vZGUsIGlmIGFueQoJICovCglmdW5jdGlvbiBub2RlVmFsKG5vZGUpIHsKCSAgICBub2RlPy5ub3JtYWxpemUoKTsKCSAgICByZXR1cm4gKG5vZGUgJiYgbm9kZS50ZXh0Q29udGVudCkgfHwgIiI7Cgl9CgkvKioKCSAqIEdldCBvbmUgWSBjaGlsZCBvZiBYLCBpZiBhbnksIG90aGVyd2lzZSBudWxsCgkgKi8KCWZ1bmN0aW9uIGdldDEobm9kZSwgdGFnTmFtZSwgY2FsbGJhY2spIHsKCSAgICBjb25zdCBuID0gbm9kZS5nZXRFbGVtZW50c0J5VGFnTmFtZSh0YWdOYW1lKTsKCSAgICBjb25zdCByZXN1bHQgPSBuLmxlbmd0aCA/IG5bMF0gOiBudWxsOwoJICAgIGlmIChyZXN1bHQgJiYgY2FsbGJhY2spCgkgICAgICAgIGNhbGxiYWNrKHJlc3VsdCk7CgkgICAgcmV0dXJuIHJlc3VsdDsKCX0KCWZ1bmN0aW9uIGdldChub2RlLCB0YWdOYW1lLCBjYWxsYmFjaykgewoJICAgIGNvbnN0IHByb3BlcnRpZXMgPSB7fTsKCSAgICBpZiAoIW5vZGUpCgkgICAgICAgIHJldHVybiBwcm9wZXJ0aWVzOwoJICAgIGNvbnN0IG4gPSBub2RlLmdldEVsZW1lbnRzQnlUYWdOYW1lKHRhZ05hbWUpOwoJICAgIGNvbnN0IHJlc3VsdCA9IG4ubGVuZ3RoID8gblswXSA6IG51bGw7CgkgICAgaWYgKHJlc3VsdCAmJiBjYWxsYmFjaykgewoJICAgICAgICByZXR1cm4gY2FsbGJhY2socmVzdWx0LCBwcm9wZXJ0aWVzKTsKCSAgICB9CgkgICAgcmV0dXJuIHByb3BlcnRpZXM7Cgl9CglmdW5jdGlvbiB2YWwxKG5vZGUsIHRhZ05hbWUsIGNhbGxiYWNrKSB7CgkgICAgY29uc3QgdmFsID0gbm9kZVZhbChnZXQxKG5vZGUsIHRhZ05hbWUpKTsKCSAgICBpZiAodmFsICYmIGNhbGxiYWNrKQoJICAgICAgICByZXR1cm4gY2FsbGJhY2sodmFsKSB8fCB7fTsKCSAgICByZXR1cm4ge307Cgl9CglmdW5jdGlvbiAkbnVtKG5vZGUsIHRhZ05hbWUsIGNhbGxiYWNrKSB7CgkgICAgY29uc3QgdmFsID0gcGFyc2VGbG9hdChub2RlVmFsKGdldDEobm9kZSwgdGFnTmFtZSkpKTsKCSAgICBpZiAoaXNOYU4odmFsKSkKCSAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDsKCSAgICBpZiAodmFsICYmIGNhbGxiYWNrKQoJICAgICAgICByZXR1cm4gY2FsbGJhY2sodmFsKSB8fCB7fTsKCSAgICByZXR1cm4ge307Cgl9CglmdW5jdGlvbiBudW0xKG5vZGUsIHRhZ05hbWUsIGNhbGxiYWNrKSB7CgkgICAgY29uc3QgdmFsID0gcGFyc2VGbG9hdChub2RlVmFsKGdldDEobm9kZSwgdGFnTmFtZSkpKTsKCSAgICBpZiAoaXNOYU4odmFsKSkKCSAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDsKCSAgICBpZiAoY2FsbGJhY2spCgkgICAgICAgIGNhbGxiYWNrKHZhbCk7CgkgICAgcmV0dXJuIHZhbDsKCX0KCWZ1bmN0aW9uIGdldE11bHRpKG5vZGUsIHByb3BlcnR5TmFtZXMpIHsKCSAgICBjb25zdCBwcm9wZXJ0aWVzID0ge307CgkgICAgZm9yIChjb25zdCBwcm9wZXJ0eSBvZiBwcm9wZXJ0eU5hbWVzKSB7CgkgICAgICAgIHZhbDEobm9kZSwgcHJvcGVydHksICh2YWwpID0+IHsKCSAgICAgICAgICAgIHByb3BlcnRpZXNbcHJvcGVydHldID0gdmFsOwoJICAgICAgICB9KTsKCSAgICB9CgkgICAgcmV0dXJuIHByb3BlcnRpZXM7Cgl9CglmdW5jdGlvbiBpc0VsZW1lbnQobm9kZSkgewoJICAgIHJldHVybiBub2RlPy5ub2RlVHlwZSA9PT0gMTsKCX0KCglmdW5jdGlvbiBnZXRMaW5lU3R5bGUobm9kZSkgewoJICAgIHJldHVybiBnZXQobm9kZSwgImxpbmUiLCAobGluZVN0eWxlKSA9PiB7CgkgICAgICAgIGNvbnN0IHZhbCA9IE9iamVjdC5hc3NpZ24oe30sIHZhbDEobGluZVN0eWxlLCAiY29sb3IiLCAoY29sb3IpID0+IHsKCSAgICAgICAgICAgIHJldHVybiB7IHN0cm9rZTogYCMke2NvbG9yfWAgfTsKCSAgICAgICAgfSksICRudW0obGluZVN0eWxlLCAib3BhY2l0eSIsIChvcGFjaXR5KSA9PiB7CgkgICAgICAgICAgICByZXR1cm4geyAic3Ryb2tlLW9wYWNpdHkiOiBvcGFjaXR5IH07CgkgICAgICAgIH0pLCAkbnVtKGxpbmVTdHlsZSwgIndpZHRoIiwgKHdpZHRoKSA9PiB7CgkgICAgICAgICAgICAvLyBHUFggd2lkdGggaXMgaW4gbW0sIGNvbnZlcnQgdG8gcHggd2l0aCA5NiBweCBwZXIgaW5jaAoJICAgICAgICAgICAgcmV0dXJuIHsgInN0cm9rZS13aWR0aCI6ICh3aWR0aCAqIDk2KSAvIDI1LjQgfTsKCSAgICAgICAgfSkpOwoJICAgICAgICByZXR1cm4gdmFsOwoJICAgIH0pOwoJfQoKCWZ1bmN0aW9uIGdldEV4dGVuc2lvbnMobm9kZSkgewoJICAgIGxldCB2YWx1ZXMgPSBbXTsKCSAgICBpZiAobm9kZSA9PT0gbnVsbCkKCSAgICAgICAgcmV0dXJuIHZhbHVlczsKCSAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIEFycmF5LmZyb20obm9kZS5jaGlsZE5vZGVzKSkgewoJICAgICAgICBpZiAoIWlzRWxlbWVudChjaGlsZCkpCgkgICAgICAgICAgICBjb250aW51ZTsKCSAgICAgICAgY29uc3QgbmFtZSA9IGFiYnJldmlhdGVOYW1lKGNoaWxkLm5vZGVOYW1lKTsKCSAgICAgICAgaWYgKG5hbWUgPT09ICJncHh0cHg6VHJhY2tQb2ludEV4dGVuc2lvbiIpIHsKCSAgICAgICAgICAgIC8vIGxvb3AgYWdhaW4gZm9yIG5lc3RlZCBnYXJtaW4gZXh0ZW5zaW9ucyAoZWcuICJncHh0cHg6aHIiKQoJICAgICAgICAgICAgdmFsdWVzID0gdmFsdWVzLmNvbmNhdChnZXRFeHRlbnNpb25zKGNoaWxkKSk7CgkgICAgICAgIH0KCSAgICAgICAgZWxzZSB7CgkgICAgICAgICAgICAvLyBwdXNoIGN1c3RvbSBleHRlbnNpb24gKGVnLiAicG93ZXIiKQoJICAgICAgICAgICAgY29uc3QgdmFsID0gbm9kZVZhbChjaGlsZCk7CgkgICAgICAgICAgICB2YWx1ZXMucHVzaChbbmFtZSwgcGFyc2VOdW1lcmljKHZhbCldKTsKCSAgICAgICAgfQoJICAgIH0KCSAgICByZXR1cm4gdmFsdWVzOwoJfQoJZnVuY3Rpb24gYWJicmV2aWF0ZU5hbWUobmFtZSkgewoJICAgIHJldHVybiBbImhlYXJ0IiwgImdweHRweDpociIsICJociJdLmluY2x1ZGVzKG5hbWUpID8gImhlYXJ0IiA6IG5hbWU7Cgl9CglmdW5jdGlvbiBwYXJzZU51bWVyaWModmFsKSB7CgkgICAgY29uc3QgbnVtID0gcGFyc2VGbG9hdCh2YWwpOwoJICAgIHJldHVybiBpc05hTihudW0pID8gdmFsIDogbnVtOwoJfQoKCWZ1bmN0aW9uIGNvb3JkUGFpciQxKG5vZGUpIHsKCSAgICBjb25zdCBsbCA9IFsKCSAgICAgICAgcGFyc2VGbG9hdChub2RlLmdldEF0dHJpYnV0ZSgibG9uIikgfHwgIiIpLAoJICAgICAgICBwYXJzZUZsb2F0KG5vZGUuZ2V0QXR0cmlidXRlKCJsYXQiKSB8fCAiIiksCgkgICAgXTsKCSAgICBpZiAoaXNOYU4obGxbMF0pIHx8IGlzTmFOKGxsWzFdKSkgewoJICAgICAgICByZXR1cm4gbnVsbDsKCSAgICB9CgkgICAgbnVtMShub2RlLCAiZWxlIiwgKHZhbCkgPT4gewoJICAgICAgICBsbC5wdXNoKHZhbCk7CgkgICAgfSk7CgkgICAgY29uc3QgdGltZSA9IGdldDEobm9kZSwgInRpbWUiKTsKCSAgICByZXR1cm4gewoJICAgICAgICBjb29yZGluYXRlczogbGwsCgkgICAgICAgIHRpbWU6IHRpbWUgPyBub2RlVmFsKHRpbWUpIDogbnVsbCwKCSAgICAgICAgZXh0ZW5kZWRWYWx1ZXM6IGdldEV4dGVuc2lvbnMoZ2V0MShub2RlLCAiZXh0ZW5zaW9ucyIpKSwKCSAgICB9OwoJfQoKCWZ1bmN0aW9uIGV4dHJhY3RQcm9wZXJ0aWVzKG5vZGUpIHsKCSAgICBjb25zdCBwcm9wZXJ0aWVzID0gZ2V0TXVsdGkobm9kZSwgWwoJICAgICAgICAibmFtZSIsCgkgICAgICAgICJjbXQiLAoJICAgICAgICAiZGVzYyIsCgkgICAgICAgICJ0eXBlIiwKCSAgICAgICAgInRpbWUiLAoJICAgICAgICAia2V5d29yZHMiLAoJICAgIF0pOwoJICAgIGNvbnN0IGV4dGVuc2lvbnMgPSBBcnJheS5mcm9tKG5vZGUuZ2V0RWxlbWVudHNCeVRhZ05hbWVOUygiaHR0cDovL3d3dy5nYXJtaW4uY29tL3htbHNjaGVtYXMvR3B4RXh0ZW5zaW9ucy92MyIsICIqIikpOwoJICAgIGZvciAoY29uc3QgY2hpbGQgb2YgZXh0ZW5zaW9ucykgewoJICAgICAgICBpZiAoY2hpbGQucGFyZW50Tm9kZT8ucGFyZW50Tm9kZSA9PT0gbm9kZSkgewoJICAgICAgICAgICAgcHJvcGVydGllc1tjaGlsZC50YWdOYW1lLnJlcGxhY2UoIjoiLCAiXyIpXSA9IG5vZGVWYWwoY2hpbGQpOwoJICAgICAgICB9CgkgICAgfQoJICAgIGNvbnN0IGxpbmtzID0gJChub2RlLCAibGluayIpOwoJICAgIGlmIChsaW5rcy5sZW5ndGgpIHsKCSAgICAgICAgcHJvcGVydGllcy5saW5rcyA9IGxpbmtzLm1hcCgobGluaykgPT4gT2JqZWN0LmFzc2lnbih7IGhyZWY6IGxpbmsuZ2V0QXR0cmlidXRlKCJocmVmIikgfSwgZ2V0TXVsdGkobGluaywgWyJ0ZXh0IiwgInR5cGUiXSkpKTsKCSAgICB9CgkgICAgcmV0dXJuIHByb3BlcnRpZXM7Cgl9CgoJLyoqCgkgKiBFeHRyYWN0IHBvaW50cyBmcm9tIGEgdHJrc2VnIG9yIHJ0ZSBlbGVtZW50LgoJICovCglmdW5jdGlvbiBnZXRQb2ludHMkMShub2RlLCBwb2ludG5hbWUpIHsKCSAgICBjb25zdCBwdHMgPSAkKG5vZGUsIHBvaW50bmFtZSk7CgkgICAgY29uc3QgbGluZSA9IFtdOwoJICAgIGNvbnN0IHRpbWVzID0gW107CgkgICAgY29uc3QgZXh0ZW5kZWRWYWx1ZXMgPSB7fTsKCSAgICBmb3IgKGxldCBpID0gMDsgaSA8IHB0cy5sZW5ndGg7IGkrKykgewoJICAgICAgICBjb25zdCBjID0gY29vcmRQYWlyJDEocHRzW2ldKTsKCSAgICAgICAgaWYgKCFjKSB7CgkgICAgICAgICAgICBjb250aW51ZTsKCSAgICAgICAgfQoJICAgICAgICBsaW5lLnB1c2goYy5jb29yZGluYXRlcyk7CgkgICAgICAgIGlmIChjLnRpbWUpCgkgICAgICAgICAgICB0aW1lcy5wdXNoKGMudGltZSk7CgkgICAgICAgIGZvciAoY29uc3QgW25hbWUsIHZhbF0gb2YgYy5leHRlbmRlZFZhbHVlcykgewoJICAgICAgICAgICAgY29uc3QgcGx1cmFsID0gbmFtZSA9PT0gImhlYXJ0IiA/IG5hbWUgOiBuYW1lLnJlcGxhY2UoImdweHRweDoiLCAiIikgKyAicyI7CgkgICAgICAgICAgICBpZiAoIWV4dGVuZGVkVmFsdWVzW3BsdXJhbF0pIHsKCSAgICAgICAgICAgICAgICBleHRlbmRlZFZhbHVlc1twbHVyYWxdID0gQXJyYXkocHRzLmxlbmd0aCkuZmlsbChudWxsKTsKCSAgICAgICAgICAgIH0KCSAgICAgICAgICAgIGV4dGVuZGVkVmFsdWVzW3BsdXJhbF1baV0gPSB2YWw7CgkgICAgICAgIH0KCSAgICB9CgkgICAgaWYgKGxpbmUubGVuZ3RoIDwgMikKCSAgICAgICAgcmV0dXJuOyAvLyBJbnZhbGlkIGxpbmUgaW4gR2VvSlNPTgoJICAgIHJldHVybiB7CgkgICAgICAgIGxpbmU6IGxpbmUsCgkgICAgICAgIHRpbWVzOiB0aW1lcywKCSAgICAgICAgZXh0ZW5kZWRWYWx1ZXM6IGV4dGVuZGVkVmFsdWVzLAoJICAgIH07Cgl9CgkvKioKCSAqIEV4dHJhY3QgYSBMaW5lU3RyaW5nIGdlb21ldHJ5IGZyb20gYSBydGUKCSAqIGVsZW1lbnQuCgkgKi8KCWZ1bmN0aW9uIGdldFJvdXRlKG5vZGUpIHsKCSAgICBjb25zdCBsaW5lID0gZ2V0UG9pbnRzJDEobm9kZSwgInJ0ZXB0Iik7CgkgICAgaWYgKCFsaW5lKQoJICAgICAgICByZXR1cm47CgkgICAgcmV0dXJuIHsKCSAgICAgICAgdHlwZTogIkZlYXR1cmUiLAoJICAgICAgICBwcm9wZXJ0aWVzOiBPYmplY3QuYXNzaWduKHsgX2dweFR5cGU6ICJydGUiIH0sIGV4dHJhY3RQcm9wZXJ0aWVzKG5vZGUpLCBnZXRMaW5lU3R5bGUoZ2V0MShub2RlLCAiZXh0ZW5zaW9ucyIpKSksCgkgICAgICAgIGdlb21ldHJ5OiB7CgkgICAgICAgICAgICB0eXBlOiAiTGluZVN0cmluZyIsCgkgICAgICAgICAgICBjb29yZGluYXRlczogbGluZS5saW5lLAoJICAgICAgICB9LAoJICAgIH07Cgl9CglmdW5jdGlvbiBnZXRUcmFjayhub2RlKSB7CgkgICAgY29uc3Qgc2VnbWVudHMgPSAkKG5vZGUsICJ0cmtzZWciKTsKCSAgICBjb25zdCB0cmFjayA9IFtdOwoJICAgIGNvbnN0IHRpbWVzID0gW107CgkgICAgY29uc3QgZXh0cmFjdGVkTGluZXMgPSBbXTsKCSAgICBmb3IgKGNvbnN0IHNlZ21lbnQgb2Ygc2VnbWVudHMpIHsKCSAgICAgICAgY29uc3QgbGluZSA9IGdldFBvaW50cyQxKHNlZ21lbnQsICJ0cmtwdCIpOwoJICAgICAgICBpZiAobGluZSkgewoJICAgICAgICAgICAgZXh0cmFjdGVkTGluZXMucHVzaChsaW5lKTsKCSAgICAgICAgICAgIGlmIChsaW5lLnRpbWVzICYmIGxpbmUudGltZXMubGVuZ3RoKQoJICAgICAgICAgICAgICAgIHRpbWVzLnB1c2gobGluZS50aW1lcyk7CgkgICAgICAgIH0KCSAgICB9CgkgICAgaWYgKGV4dHJhY3RlZExpbmVzLmxlbmd0aCA9PT0gMCkKCSAgICAgICAgcmV0dXJuIG51bGw7CgkgICAgY29uc3QgbXVsdGkgPSBleHRyYWN0ZWRMaW5lcy5sZW5ndGggPiAxOwoJICAgIGNvbnN0IHByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKHsgX2dweFR5cGU6ICJ0cmsiIH0sIGV4dHJhY3RQcm9wZXJ0aWVzKG5vZGUpLCBnZXRMaW5lU3R5bGUoZ2V0MShub2RlLCAiZXh0ZW5zaW9ucyIpKSwgdGltZXMubGVuZ3RoCgkgICAgICAgID8gewoJICAgICAgICAgICAgY29vcmRpbmF0ZVByb3BlcnRpZXM6IHsKCSAgICAgICAgICAgICAgICB0aW1lczogbXVsdGkgPyB0aW1lcyA6IHRpbWVzWzBdLAoJICAgICAgICAgICAgfSwKCSAgICAgICAgfQoJICAgICAgICA6IHt9KTsKCSAgICBmb3IgKGNvbnN0IGxpbmUgb2YgZXh0cmFjdGVkTGluZXMpIHsKCSAgICAgICAgdHJhY2sucHVzaChsaW5lLmxpbmUpOwoJICAgICAgICBpZiAoIXByb3BlcnRpZXMuY29vcmRpbmF0ZVByb3BlcnRpZXMpIHsKCSAgICAgICAgICAgIHByb3BlcnRpZXMuY29vcmRpbmF0ZVByb3BlcnRpZXMgPSB7fTsKCSAgICAgICAgfQoJICAgICAgICBjb25zdCBwcm9wcyA9IHByb3BlcnRpZXMuY29vcmRpbmF0ZVByb3BlcnRpZXM7CgkgICAgICAgIGNvbnN0IGVudHJpZXMgPSBPYmplY3QuZW50cmllcyhsaW5lLmV4dGVuZGVkVmFsdWVzKTsKCSAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbnRyaWVzLmxlbmd0aDsgaSsrKSB7CgkgICAgICAgICAgICBjb25zdCBbbmFtZSwgdmFsXSA9IGVudHJpZXNbaV07CgkgICAgICAgICAgICBpZiAobXVsdGkpIHsKCSAgICAgICAgICAgICAgICBpZiAoIXByb3BzW25hbWVdKSB7CgkgICAgICAgICAgICAgICAgICAgIHByb3BzW25hbWVdID0gZXh0cmFjdGVkTGluZXMubWFwKChsaW5lKSA9PiBuZXcgQXJyYXkobGluZS5saW5lLmxlbmd0aCkuZmlsbChudWxsKSk7CgkgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgIHByb3BzW25hbWVdW2ldID0gdmFsOwoJICAgICAgICAgICAgfQoJICAgICAgICAgICAgZWxzZSB7CgkgICAgICAgICAgICAgICAgcHJvcHNbbmFtZV0gPSB2YWw7CgkgICAgICAgICAgICB9CgkgICAgICAgIH0KCSAgICB9CgkgICAgcmV0dXJuIHsKCSAgICAgICAgdHlwZTogIkZlYXR1cmUiLAoJICAgICAgICBwcm9wZXJ0aWVzOiBwcm9wZXJ0aWVzLAoJICAgICAgICBnZW9tZXRyeTogbXVsdGkKCSAgICAgICAgICAgID8gewoJICAgICAgICAgICAgICAgIHR5cGU6ICJNdWx0aUxpbmVTdHJpbmciLAoJICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzOiB0cmFjaywKCSAgICAgICAgICAgIH0KCSAgICAgICAgICAgIDogewoJICAgICAgICAgICAgICAgIHR5cGU6ICJMaW5lU3RyaW5nIiwKCSAgICAgICAgICAgICAgICBjb29yZGluYXRlczogdHJhY2tbMF0sCgkgICAgICAgICAgICB9LAoJICAgIH07Cgl9CgkvKioKCSAqIEV4dHJhY3QgYSBwb2ludCwgaWYgcG9zc2libGUsIGZyb20gYSBnaXZlbiBub2RlLAoJICogd2hpY2ggaXMgdXN1YWxseSBhIHdwdCBvciB0cmtwdAoJICovCglmdW5jdGlvbiBnZXRQb2ludChub2RlKSB7CgkgICAgY29uc3QgcHJvcGVydGllcyA9IE9iamVjdC5hc3NpZ24oZXh0cmFjdFByb3BlcnRpZXMobm9kZSksIGdldE11bHRpKG5vZGUsIFsic3ltIl0pKTsKCSAgICBjb25zdCBwYWlyID0gY29vcmRQYWlyJDEobm9kZSk7CgkgICAgaWYgKCFwYWlyKQoJICAgICAgICByZXR1cm4gbnVsbDsKCSAgICByZXR1cm4gewoJICAgICAgICB0eXBlOiAiRmVhdHVyZSIsCgkgICAgICAgIHByb3BlcnRpZXMsCgkgICAgICAgIGdlb21ldHJ5OiB7CgkgICAgICAgICAgICB0eXBlOiAiUG9pbnQiLAoJICAgICAgICAgICAgY29vcmRpbmF0ZXM6IHBhaXIuY29vcmRpbmF0ZXMsCgkgICAgICAgIH0sCgkgICAgfTsKCX0KCS8qKgoJICogQ29udmVydCBHUFggdG8gR2VvSlNPTiBpbmNyZW1lbnRhbGx5LCByZXR1cm5pbmcKCSAqIGEgW0dlbmVyYXRvcl0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9HdWlkZS9JdGVyYXRvcnNfYW5kX0dlbmVyYXRvcnMpCgkgKiB0aGF0IHlpZWxkcyBvdXRwdXQgZmVhdHVyZSBieSBmZWF0dXJlLgoJICovCglmdW5jdGlvbiogZ3B4R2VuKG5vZGUpIHsKCSAgICBmb3IgKGNvbnN0IHRyYWNrIG9mICQobm9kZSwgInRyayIpKSB7CgkgICAgICAgIGNvbnN0IGZlYXR1cmUgPSBnZXRUcmFjayh0cmFjayk7CgkgICAgICAgIGlmIChmZWF0dXJlKQoJICAgICAgICAgICAgeWllbGQgZmVhdHVyZTsKCSAgICB9CgkgICAgZm9yIChjb25zdCByb3V0ZSBvZiAkKG5vZGUsICJydGUiKSkgewoJICAgICAgICBjb25zdCBmZWF0dXJlID0gZ2V0Um91dGUocm91dGUpOwoJICAgICAgICBpZiAoZmVhdHVyZSkKCSAgICAgICAgICAgIHlpZWxkIGZlYXR1cmU7CgkgICAgfQoJICAgIGZvciAoY29uc3Qgd2F5cG9pbnQgb2YgJChub2RlLCAid3B0IikpIHsKCSAgICAgICAgY29uc3QgcG9pbnQgPSBnZXRQb2ludCh3YXlwb2ludCk7CgkgICAgICAgIGlmIChwb2ludCkKCSAgICAgICAgICAgIHlpZWxkIHBvaW50OwoJICAgIH0KCX0KCS8qKgoJICoKCSAqIENvbnZlcnQgYSBHUFggZG9jdW1lbnQgdG8gR2VvSlNPTi4gVGhlIGZpcnN0IGFyZ3VtZW50LCBgZG9jYCwgbXVzdCBiZSBhIEdQWAoJICogZG9jdW1lbnQgYXMgYW4gWE1MIERPTSAtIG5vdCBhcyBhIHN0cmluZy4gWW91IGNhbiBnZXQgdGhpcyB1c2luZyBqUXVlcnkncyBkZWZhdWx0CgkgKiBgLmFqYXhgIGZ1bmN0aW9uIG9yIHVzaW5nIGEgYmFyZSBYTUxIdHRwUmVxdWVzdCB3aXRoIHRoZSBgLnJlc3BvbnNlYCBwcm9wZXJ0eQoJICogaG9sZGluZyBhbiBYTUwgRE9NLgoJICoKCSAqIFRoZSBvdXRwdXQgaXMgYSBKYXZhU2NyaXB0IG9iamVjdCBvZiBHZW9KU09OIGRhdGEsIHNhbWUgYXMgYC5rbWxgIG91dHB1dHMsIHdpdGggdGhlCgkgKiBhZGRpdGlvbiBvZiBhIGBfZ3B4VHlwZWAgcHJvcGVydHkgb24gZWFjaCBgTGluZVN0cmluZ2AgZmVhdHVyZSB0aGF0IGluZGljYXRlcyB3aGV0aGVyCgkgKiB0aGUgZmVhdHVyZSB3YXMgZW5jb2RlZCBhcyBhIHJvdXRlIChgcnRlYCkgb3IgdHJhY2sgKGB0cmtgKSBpbiB0aGUgR1BYIGRvY3VtZW50LgoJICovCglmdW5jdGlvbiBncHgobm9kZSkgewoJICAgIHJldHVybiB7CgkgICAgICAgIHR5cGU6ICJGZWF0dXJlQ29sbGVjdGlvbiIsCgkgICAgICAgIGZlYXR1cmVzOiBBcnJheS5mcm9tKGdweEdlbihub2RlKSksCgkgICAgfTsKCX0KCgljb25zdCBFWFRFTlNJT05TX05TID0gImh0dHA6Ly93d3cuZ2FybWluLmNvbS94bWxzY2hlbWFzL0FjdGl2aXR5RXh0ZW5zaW9uL3YyIjsKCWNvbnN0IFRSQUNLUE9JTlRfQVRUUklCVVRFUyA9IFsKCSAgICBbImhlYXJ0UmF0ZSIsICJoZWFydFJhdGVzIl0sCgkgICAgWyJDYWRlbmNlIiwgImNhZGVuY2VzIl0sCgkgICAgLy8gRXh0ZW5kZWQgVHJhY2twb2ludCBhdHRyaWJ1dGVzCgkgICAgWyJTcGVlZCIsICJzcGVlZHMiXSwKCSAgICBbIldhdHRzIiwgIndhdHRzIl0sCgldOwoJY29uc3QgTEFQX0FUVFJJQlVURVMgPSBbCgkgICAgWyJUb3RhbFRpbWVTZWNvbmRzIiwgInRvdGFsVGltZVNlY29uZHMiXSwKCSAgICBbIkRpc3RhbmNlTWV0ZXJzIiwgImRpc3RhbmNlTWV0ZXJzIl0sCgkgICAgWyJNYXhpbXVtU3BlZWQiLCAibWF4U3BlZWQiXSwKCSAgICBbIkF2ZXJhZ2VIZWFydFJhdGVCcG0iLCAiYXZnSGVhcnRSYXRlIl0sCgkgICAgWyJNYXhpbXVtSGVhcnRSYXRlQnBtIiwgIm1heEhlYXJ0UmF0ZSJdLAoJICAgIC8vIEV4dGVuZGVkIExhcCBhdHRyaWJ1dGVzCgkgICAgWyJBdmdTcGVlZCIsICJhdmdTcGVlZCJdLAoJICAgIFsiQXZnV2F0dHMiLCAiYXZnV2F0dHMiXSwKCSAgICBbIk1heFdhdHRzIiwgIm1heFdhdHRzIl0sCgldOwoJZnVuY3Rpb24gZ2V0UHJvcGVydGllcyhub2RlLCBhdHRyaWJ1dGVOYW1lcykgewoJICAgIGNvbnN0IHByb3BlcnRpZXMgPSBbXTsKCSAgICBmb3IgKGNvbnN0IFt0YWcsIGFsaWFzXSBvZiBhdHRyaWJ1dGVOYW1lcykgewoJICAgICAgICBsZXQgZWxlbSA9IGdldDEobm9kZSwgdGFnKTsKCSAgICAgICAgaWYgKCFlbGVtKSB7CgkgICAgICAgICAgICBjb25zdCBlbGVtZW50cyA9IG5vZGUuZ2V0RWxlbWVudHNCeVRhZ05hbWVOUyhFWFRFTlNJT05TX05TLCB0YWcpOwoJICAgICAgICAgICAgaWYgKGVsZW1lbnRzLmxlbmd0aCkgewoJICAgICAgICAgICAgICAgIGVsZW0gPSBlbGVtZW50c1swXTsKCSAgICAgICAgICAgIH0KCSAgICAgICAgfQoJICAgICAgICBjb25zdCB2YWwgPSBwYXJzZUZsb2F0KG5vZGVWYWwoZWxlbSkpOwoJICAgICAgICBpZiAoIWlzTmFOKHZhbCkpIHsKCSAgICAgICAgICAgIHByb3BlcnRpZXMucHVzaChbYWxpYXMsIHZhbF0pOwoJICAgICAgICB9CgkgICAgfQoJICAgIHJldHVybiBwcm9wZXJ0aWVzOwoJfQoJZnVuY3Rpb24gY29vcmRQYWlyKG5vZGUpIHsKCSAgICBjb25zdCBsbCA9IFtudW0xKG5vZGUsICJMb25naXR1ZGVEZWdyZWVzIiksIG51bTEobm9kZSwgIkxhdGl0dWRlRGVncmVlcyIpXTsKCSAgICBpZiAobGxbMF0gPT09IHVuZGVmaW5lZCB8fAoJICAgICAgICBpc05hTihsbFswXSkgfHwKCSAgICAgICAgbGxbMV0gPT09IHVuZGVmaW5lZCB8fAoJICAgICAgICBpc05hTihsbFsxXSkpIHsKCSAgICAgICAgcmV0dXJuIG51bGw7CgkgICAgfQoJICAgIGNvbnN0IGhlYXJ0UmF0ZSA9IGdldDEobm9kZSwgIkhlYXJ0UmF0ZUJwbSIpOwoJICAgIGNvbnN0IHRpbWUgPSBub2RlVmFsKGdldDEobm9kZSwgIlRpbWUiKSk7CgkgICAgZ2V0MShub2RlLCAiQWx0aXR1ZGVNZXRlcnMiLCAoYWx0KSA9PiB7CgkgICAgICAgIGNvbnN0IGEgPSBwYXJzZUZsb2F0KG5vZGVWYWwoYWx0KSk7CgkgICAgICAgIGlmICghaXNOYU4oYSkpIHsKCSAgICAgICAgICAgIGxsLnB1c2goYSk7CgkgICAgICAgIH0KCSAgICB9KTsKCSAgICByZXR1cm4gewoJICAgICAgICBjb29yZGluYXRlczogbGwsCgkgICAgICAgIHRpbWU6IHRpbWUgfHwgbnVsbCwKCSAgICAgICAgaGVhcnRSYXRlOiBoZWFydFJhdGUgPyBwYXJzZUZsb2F0KG5vZGVWYWwoaGVhcnRSYXRlKSkgOiBudWxsLAoJICAgICAgICBleHRlbnNpb25zOiBnZXRQcm9wZXJ0aWVzKG5vZGUsIFRSQUNLUE9JTlRfQVRUUklCVVRFUyksCgkgICAgfTsKCX0KCWZ1bmN0aW9uIGdldFBvaW50cyhub2RlKSB7CgkgICAgY29uc3QgcHRzID0gJChub2RlLCAiVHJhY2twb2ludCIpOwoJICAgIGNvbnN0IGxpbmUgPSBbXTsKCSAgICBjb25zdCB0aW1lcyA9IFtdOwoJICAgIGNvbnN0IGhlYXJ0UmF0ZXMgPSBbXTsKCSAgICBpZiAocHRzLmxlbmd0aCA8IDIpCgkgICAgICAgIHJldHVybiBudWxsOyAvLyBJbnZhbGlkIGxpbmUgaW4gR2VvSlNPTgoJICAgIGNvbnN0IGV4dGVuZGVkUHJvcGVydGllcyA9IHt9OwoJICAgIGNvbnN0IHJlc3VsdCA9IHsgZXh0ZW5kZWRQcm9wZXJ0aWVzIH07CgkgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwdHMubGVuZ3RoOyBpKyspIHsKCSAgICAgICAgY29uc3QgYyA9IGNvb3JkUGFpcihwdHNbaV0pOwoJICAgICAgICBpZiAoYyA9PT0gbnVsbCkKCSAgICAgICAgICAgIGNvbnRpbnVlOwoJICAgICAgICBsaW5lLnB1c2goYy5jb29yZGluYXRlcyk7CgkgICAgICAgIGNvbnN0IHsgdGltZSwgaGVhcnRSYXRlLCBleHRlbnNpb25zIH0gPSBjOwoJICAgICAgICBpZiAodGltZSkKCSAgICAgICAgICAgIHRpbWVzLnB1c2godGltZSk7CgkgICAgICAgIGlmIChoZWFydFJhdGUpCgkgICAgICAgICAgICBoZWFydFJhdGVzLnB1c2goaGVhcnRSYXRlKTsKCSAgICAgICAgZm9yIChjb25zdCBbYWxpYXMsIHZhbHVlXSBvZiBleHRlbnNpb25zKSB7CgkgICAgICAgICAgICBpZiAoIWV4dGVuZGVkUHJvcGVydGllc1thbGlhc10pIHsKCSAgICAgICAgICAgICAgICBleHRlbmRlZFByb3BlcnRpZXNbYWxpYXNdID0gQXJyYXkocHRzLmxlbmd0aCkuZmlsbChudWxsKTsKCSAgICAgICAgICAgIH0KCSAgICAgICAgICAgIGV4dGVuZGVkUHJvcGVydGllc1thbGlhc11baV0gPSB2YWx1ZTsKCSAgICAgICAgfQoJICAgIH0KCSAgICBpZiAobGluZS5sZW5ndGggPCAyKQoJICAgICAgICByZXR1cm4gbnVsbDsKCSAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihyZXN1bHQsIHsKCSAgICAgICAgbGluZTogbGluZSwKCSAgICAgICAgdGltZXM6IHRpbWVzLAoJICAgICAgICBoZWFydFJhdGVzOiBoZWFydFJhdGVzLAoJICAgIH0pOwoJfQoJZnVuY3Rpb24gZ2V0TGFwKG5vZGUpIHsKCSAgICBjb25zdCBzZWdtZW50cyA9ICQobm9kZSwgIlRyYWNrIik7CgkgICAgY29uc3QgdHJhY2sgPSBbXTsKCSAgICBjb25zdCB0aW1lcyA9IFtdOwoJICAgIGNvbnN0IGhlYXJ0UmF0ZXMgPSBbXTsKCSAgICBjb25zdCBhbGxFeHRlbmRlZFByb3BlcnRpZXMgPSBbXTsKCSAgICBsZXQgbGluZTsKCSAgICBjb25zdCBwcm9wZXJ0aWVzID0gT2JqZWN0LmFzc2lnbihPYmplY3QuZnJvbUVudHJpZXMoZ2V0UHJvcGVydGllcyhub2RlLCBMQVBfQVRUUklCVVRFUykpLCBnZXQobm9kZSwgIk5hbWUiLCAobmFtZUVsZW1lbnQpID0+IHsKCSAgICAgICAgcmV0dXJuIHsgbmFtZTogbm9kZVZhbChuYW1lRWxlbWVudCkgfTsKCSAgICB9KSk7CgkgICAgZm9yIChjb25zdCBzZWdtZW50IG9mIHNlZ21lbnRzKSB7CgkgICAgICAgIGxpbmUgPSBnZXRQb2ludHMoc2VnbWVudCk7CgkgICAgICAgIGlmIChsaW5lKSB7CgkgICAgICAgICAgICB0cmFjay5wdXNoKGxpbmUubGluZSk7CgkgICAgICAgICAgICBpZiAobGluZS50aW1lcy5sZW5ndGgpCgkgICAgICAgICAgICAgICAgdGltZXMucHVzaChsaW5lLnRpbWVzKTsKCSAgICAgICAgICAgIGlmIChsaW5lLmhlYXJ0UmF0ZXMubGVuZ3RoKQoJICAgICAgICAgICAgICAgIGhlYXJ0UmF0ZXMucHVzaChsaW5lLmhlYXJ0UmF0ZXMpOwoJICAgICAgICAgICAgYWxsRXh0ZW5kZWRQcm9wZXJ0aWVzLnB1c2gobGluZS5leHRlbmRlZFByb3BlcnRpZXMpOwoJICAgICAgICB9CgkgICAgfQoJICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWxsRXh0ZW5kZWRQcm9wZXJ0aWVzLmxlbmd0aDsgaSsrKSB7CgkgICAgICAgIGNvbnN0IGV4dGVuZGVkUHJvcGVydGllcyA9IGFsbEV4dGVuZGVkUHJvcGVydGllc1tpXTsKCSAgICAgICAgZm9yIChjb25zdCBwcm9wZXJ0eSBpbiBleHRlbmRlZFByb3BlcnRpZXMpIHsKCSAgICAgICAgICAgIGlmIChzZWdtZW50cy5sZW5ndGggPT09IDEpIHsKCSAgICAgICAgICAgICAgICBpZiAobGluZSkgewoJICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzW3Byb3BlcnR5XSA9IGxpbmUuZXh0ZW5kZWRQcm9wZXJ0aWVzW3Byb3BlcnR5XTsKCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICB9CgkgICAgICAgICAgICBlbHNlIHsKCSAgICAgICAgICAgICAgICBpZiAoIXByb3BlcnRpZXNbcHJvcGVydHldKSB7CgkgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXNbcHJvcGVydHldID0gdHJhY2subWFwKCh0cmFjaykgPT4gQXJyYXkodHJhY2subGVuZ3RoKS5maWxsKG51bGwpKTsKCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgcHJvcGVydGllc1twcm9wZXJ0eV1baV0gPSBleHRlbmRlZFByb3BlcnRpZXNbcHJvcGVydHldOwoJICAgICAgICAgICAgfQoJICAgICAgICB9CgkgICAgfQoJICAgIGlmICh0cmFjay5sZW5ndGggPT09IDApCgkgICAgICAgIHJldHVybiBudWxsOwoJICAgIGlmICh0aW1lcy5sZW5ndGggfHwgaGVhcnRSYXRlcy5sZW5ndGgpIHsKCSAgICAgICAgcHJvcGVydGllcy5jb29yZGluYXRlUHJvcGVydGllcyA9IE9iamVjdC5hc3NpZ24odGltZXMubGVuZ3RoCgkgICAgICAgICAgICA/IHsKCSAgICAgICAgICAgICAgICB0aW1lczogdHJhY2subGVuZ3RoID09PSAxID8gdGltZXNbMF0gOiB0aW1lcywKCSAgICAgICAgICAgIH0KCSAgICAgICAgICAgIDoge30sIGhlYXJ0UmF0ZXMubGVuZ3RoCgkgICAgICAgICAgICA/IHsKCSAgICAgICAgICAgICAgICBoZWFydDogdHJhY2subGVuZ3RoID09PSAxID8gaGVhcnRSYXRlc1swXSA6IGhlYXJ0UmF0ZXMsCgkgICAgICAgICAgICB9CgkgICAgICAgICAgICA6IHt9KTsKCSAgICB9CgkgICAgcmV0dXJuIHsKCSAgICAgICAgdHlwZTogIkZlYXR1cmUiLAoJICAgICAgICBwcm9wZXJ0aWVzOiBwcm9wZXJ0aWVzLAoJICAgICAgICBnZW9tZXRyeTogdHJhY2subGVuZ3RoID09PSAxCgkgICAgICAgICAgICA/IHsKCSAgICAgICAgICAgICAgICB0eXBlOiAiTGluZVN0cmluZyIsCgkgICAgICAgICAgICAgICAgY29vcmRpbmF0ZXM6IHRyYWNrWzBdLAoJICAgICAgICAgICAgfQoJICAgICAgICAgICAgOiB7CgkgICAgICAgICAgICAgICAgdHlwZTogIk11bHRpTGluZVN0cmluZyIsCgkgICAgICAgICAgICAgICAgY29vcmRpbmF0ZXM6IHRyYWNrLAoJICAgICAgICAgICAgfSwKCSAgICB9OwoJfQoJLyoqCgkgKiBJbmNyZW1lbnRhbGx5IGNvbnZlcnQgYSBUQ1ggZG9jdW1lbnQgdG8gR2VvSlNPTi4gVGhlCgkgKiBmaXJzdCBhcmd1bWVudCwgYGRvY2AsIG11c3QgYmUgYSBUQ1gKCSAqIGRvY3VtZW50IGFzIGFuIFhNTCBET00gLSBub3QgYXMgYSBzdHJpbmcuCgkgKi8KCWZ1bmN0aW9uKiB0Y3hHZW4obm9kZSkgewoJICAgIGZvciAoY29uc3QgbGFwIG9mICQobm9kZSwgIkxhcCIpKSB7CgkgICAgICAgIGNvbnN0IGZlYXR1cmUgPSBnZXRMYXAobGFwKTsKCSAgICAgICAgaWYgKGZlYXR1cmUpCgkgICAgICAgICAgICB5aWVsZCBmZWF0dXJlOwoJICAgIH0KCSAgICBmb3IgKGNvbnN0IGNvdXJzZSBvZiAkKG5vZGUsICJDb3Vyc2VzIikpIHsKCSAgICAgICAgY29uc3QgZmVhdHVyZSA9IGdldExhcChjb3Vyc2UpOwoJICAgICAgICBpZiAoZmVhdHVyZSkKCSAgICAgICAgICAgIHlpZWxkIGZlYXR1cmU7CgkgICAgfQoJfQoJLyoqCgkgKiBDb252ZXJ0IGEgVENYIGRvY3VtZW50IHRvIEdlb0pTT04uIFRoZSBmaXJzdCBhcmd1bWVudCwgYGRvY2AsIG11c3QgYmUgYSBUQ1gKCSAqIGRvY3VtZW50IGFzIGFuIFhNTCBET00gLSBub3QgYXMgYSBzdHJpbmcuCgkgKi8KCWZ1bmN0aW9uIHRjeChub2RlKSB7CgkgICAgcmV0dXJuIHsKCSAgICAgICAgdHlwZTogIkZlYXR1cmVDb2xsZWN0aW9uIiwKCSAgICAgICAgZmVhdHVyZXM6IEFycmF5LmZyb20odGN4R2VuKG5vZGUpKSwKCSAgICB9OwoJfQoKCWZ1bmN0aW9uIGZpeENvbG9yKHYsIHByZWZpeCkgewoJICAgIGNvbnN0IHByb3BlcnRpZXMgPSB7fTsKCSAgICBjb25zdCBjb2xvclByb3AgPSBwcmVmaXggPT0gInN0cm9rZSIgfHwgcHJlZml4ID09PSAiZmlsbCIgPyBwcmVmaXggOiBwcmVmaXggKyAiLWNvbG9yIjsKCSAgICBpZiAodlswXSA9PT0gIiMiKSB7CgkgICAgICAgIHYgPSB2LnN1YnN0cmluZygxKTsKCSAgICB9CgkgICAgaWYgKHYubGVuZ3RoID09PSA2IHx8IHYubGVuZ3RoID09PSAzKSB7CgkgICAgICAgIHByb3BlcnRpZXNbY29sb3JQcm9wXSA9ICIjIiArIHY7CgkgICAgfQoJICAgIGVsc2UgaWYgKHYubGVuZ3RoID09PSA4KSB7CgkgICAgICAgIHByb3BlcnRpZXNbcHJlZml4ICsgIi1vcGFjaXR5Il0gPSBwYXJzZUludCh2LnN1YnN0cmluZygwLCAyKSwgMTYpIC8gMjU1OwoJICAgICAgICBwcm9wZXJ0aWVzW2NvbG9yUHJvcF0gPQoJICAgICAgICAgICAgIiMiICsgdi5zdWJzdHJpbmcoNiwgOCkgKyB2LnN1YnN0cmluZyg0LCA2KSArIHYuc3Vic3RyaW5nKDIsIDQpOwoJICAgIH0KCSAgICByZXR1cm4gcHJvcGVydGllczsKCX0KCglmdW5jdGlvbiBudW1lcmljUHJvcGVydHkobm9kZSwgc291cmNlLCB0YXJnZXQpIHsKCSAgICBjb25zdCBwcm9wZXJ0aWVzID0ge307CgkgICAgbnVtMShub2RlLCBzb3VyY2UsICh2YWwpID0+IHsKCSAgICAgICAgcHJvcGVydGllc1t0YXJnZXRdID0gdmFsOwoJICAgIH0pOwoJICAgIHJldHVybiBwcm9wZXJ0aWVzOwoJfQoJZnVuY3Rpb24gZ2V0Q29sb3Iobm9kZSwgb3V0cHV0KSB7CgkgICAgcmV0dXJuIGdldChub2RlLCAiY29sb3IiLCAoZWxlbSkgPT4gZml4Q29sb3Iobm9kZVZhbChlbGVtKSwgb3V0cHV0KSk7Cgl9CglmdW5jdGlvbiBleHRyYWN0SWNvbkhyZWYobm9kZSkgewoJICAgIHJldHVybiBnZXQobm9kZSwgIkljb24iLCAoaWNvbiwgcHJvcGVydGllcykgPT4gewoJICAgICAgICB2YWwxKGljb24sICJocmVmIiwgKGhyZWYpID0+IHsKCSAgICAgICAgICAgIHByb3BlcnRpZXMuaWNvbiA9IGhyZWY7CgkgICAgICAgIH0pOwoJICAgICAgICByZXR1cm4gcHJvcGVydGllczsKCSAgICB9KTsKCX0KCWZ1bmN0aW9uIGV4dHJhY3RJY29uKG5vZGUpIHsKCSAgICByZXR1cm4gZ2V0KG5vZGUsICJJY29uU3R5bGUiLCAoaWNvblN0eWxlKSA9PiB7CgkgICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKGdldENvbG9yKGljb25TdHlsZSwgImljb24iKSwgbnVtZXJpY1Byb3BlcnR5KGljb25TdHlsZSwgInNjYWxlIiwgImljb24tc2NhbGUiKSwgbnVtZXJpY1Byb3BlcnR5KGljb25TdHlsZSwgImhlYWRpbmciLCAiaWNvbi1oZWFkaW5nIiksIGdldChpY29uU3R5bGUsICJob3RTcG90IiwgKGhvdHNwb3QpID0+IHsKCSAgICAgICAgICAgIGNvbnN0IGxlZnQgPSBwYXJzZUZsb2F0KGhvdHNwb3QuZ2V0QXR0cmlidXRlKCJ4IikgfHwgIiIpOwoJICAgICAgICAgICAgY29uc3QgdG9wID0gcGFyc2VGbG9hdChob3RzcG90LmdldEF0dHJpYnV0ZSgieSIpIHx8ICIiKTsKCSAgICAgICAgICAgIGNvbnN0IHh1bml0cyA9IGhvdHNwb3QuZ2V0QXR0cmlidXRlKCJ4dW5pdHMiKSB8fCAiIjsKCSAgICAgICAgICAgIGNvbnN0IHl1bml0cyA9IGhvdHNwb3QuZ2V0QXR0cmlidXRlKCJ5dW5pdHMiKSB8fCAiIjsKCSAgICAgICAgICAgIGlmICghaXNOYU4obGVmdCkgJiYgIWlzTmFOKHRvcCkpCgkgICAgICAgICAgICAgICAgcmV0dXJuIHsKCSAgICAgICAgICAgICAgICAgICAgImljb24tb2Zmc2V0IjogW2xlZnQsIHRvcF0sCgkgICAgICAgICAgICAgICAgICAgICJpY29uLW9mZnNldC11bml0cyI6IFt4dW5pdHMsIHl1bml0c10sCgkgICAgICAgICAgICAgICAgfTsKCSAgICAgICAgICAgIHJldHVybiB7fTsKCSAgICAgICAgfSksIGV4dHJhY3RJY29uSHJlZihpY29uU3R5bGUpKTsKCSAgICB9KTsKCX0KCWZ1bmN0aW9uIGV4dHJhY3RMYWJlbChub2RlKSB7CgkgICAgcmV0dXJuIGdldChub2RlLCAiTGFiZWxTdHlsZSIsIChsYWJlbFN0eWxlKSA9PiB7CgkgICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKGdldENvbG9yKGxhYmVsU3R5bGUsICJsYWJlbCIpLCBudW1lcmljUHJvcGVydHkobGFiZWxTdHlsZSwgInNjYWxlIiwgImxhYmVsLXNjYWxlIikpOwoJICAgIH0pOwoJfQoJZnVuY3Rpb24gZXh0cmFjdExpbmUobm9kZSkgewoJICAgIHJldHVybiBnZXQobm9kZSwgIkxpbmVTdHlsZSIsIChsaW5lU3R5bGUpID0+IHsKCSAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oZ2V0Q29sb3IobGluZVN0eWxlLCAic3Ryb2tlIiksIG51bWVyaWNQcm9wZXJ0eShsaW5lU3R5bGUsICJ3aWR0aCIsICJzdHJva2Utd2lkdGgiKSk7CgkgICAgfSk7Cgl9CglmdW5jdGlvbiBleHRyYWN0UG9seShub2RlKSB7CgkgICAgcmV0dXJuIGdldChub2RlLCAiUG9seVN0eWxlIiwgKHBvbHlTdHlsZSwgcHJvcGVydGllcykgPT4gewoJICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihwcm9wZXJ0aWVzLCBnZXQocG9seVN0eWxlLCAiY29sb3IiLCAoZWxlbSkgPT4gZml4Q29sb3Iobm9kZVZhbChlbGVtKSwgImZpbGwiKSksIHZhbDEocG9seVN0eWxlLCAiZmlsbCIsIChmaWxsKSA9PiB7CgkgICAgICAgICAgICBpZiAoZmlsbCA9PT0gIjAiKQoJICAgICAgICAgICAgICAgIHJldHVybiB7ICJmaWxsLW9wYWNpdHkiOiAwIH07CgkgICAgICAgIH0pLCB2YWwxKHBvbHlTdHlsZSwgIm91dGxpbmUiLCAob3V0bGluZSkgPT4gewoJICAgICAgICAgICAgaWYgKG91dGxpbmUgPT09ICIwIikKCSAgICAgICAgICAgICAgICByZXR1cm4geyAic3Ryb2tlLW9wYWNpdHkiOiAwIH07CgkgICAgICAgIH0pKTsKCSAgICB9KTsKCX0KCWZ1bmN0aW9uIGV4dHJhY3RTdHlsZShub2RlKSB7CgkgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIGV4dHJhY3RQb2x5KG5vZGUpLCBleHRyYWN0TGluZShub2RlKSwgZXh0cmFjdExhYmVsKG5vZGUpLCBleHRyYWN0SWNvbihub2RlKSk7Cgl9CgoJY29uc3QgdG9OdW1iZXIgPSAoeCkgPT4gTnVtYmVyKHgpOwoJY29uc3QgdHlwZUNvbnZlcnRlcnMgPSB7CgkgICAgc3RyaW5nOiAoeCkgPT4geCwKCSAgICBpbnQ6IHRvTnVtYmVyLAoJICAgIHVpbnQ6IHRvTnVtYmVyLAoJICAgIHNob3J0OiB0b051bWJlciwKCSAgICB1c2hvcnQ6IHRvTnVtYmVyLAoJICAgIGZsb2F0OiB0b051bWJlciwKCSAgICBkb3VibGU6IHRvTnVtYmVyLAoJICAgIGJvb2w6ICh4KSA9PiBCb29sZWFuKHgpLAoJfTsKCWZ1bmN0aW9uIGV4dHJhY3RFeHRlbmRlZERhdGEobm9kZSwgc2NoZW1hKSB7CgkgICAgcmV0dXJuIGdldChub2RlLCAiRXh0ZW5kZWREYXRhIiwgKGV4dGVuZGVkRGF0YSwgcHJvcGVydGllcykgPT4gewoJICAgICAgICBmb3IgKGNvbnN0IGRhdGEgb2YgJChleHRlbmRlZERhdGEsICJEYXRhIikpIHsKCSAgICAgICAgICAgIHByb3BlcnRpZXNbZGF0YS5nZXRBdHRyaWJ1dGUoIm5hbWUiKSB8fCAiIl0gPSBub2RlVmFsKGdldDEoZGF0YSwgInZhbHVlIikpOwoJICAgICAgICB9CgkgICAgICAgIGZvciAoY29uc3Qgc2ltcGxlRGF0YSBvZiAkKGV4dGVuZGVkRGF0YSwgIlNpbXBsZURhdGEiKSkgewoJICAgICAgICAgICAgY29uc3QgbmFtZSA9IHNpbXBsZURhdGEuZ2V0QXR0cmlidXRlKCJuYW1lIikgfHwgIiI7CgkgICAgICAgICAgICBjb25zdCB0eXBlQ29udmVydGVyID0gc2NoZW1hW25hbWVdIHx8IHR5cGVDb252ZXJ0ZXJzLnN0cmluZzsKCSAgICAgICAgICAgIHByb3BlcnRpZXNbbmFtZV0gPSB0eXBlQ29udmVydGVyKG5vZGVWYWwoc2ltcGxlRGF0YSkpOwoJICAgICAgICB9CgkgICAgICAgIHJldHVybiBwcm9wZXJ0aWVzOwoJICAgIH0pOwoJfQoJZnVuY3Rpb24gZ2V0TWF5YmVIVE1MRGVzY3JpcHRpb24obm9kZSkgewoJICAgIGNvbnN0IGRlc2NyaXB0aW9uTm9kZSA9IGdldDEobm9kZSwgImRlc2NyaXB0aW9uIik7CgkgICAgZm9yIChjb25zdCBjIG9mIEFycmF5LmZyb20oZGVzY3JpcHRpb25Ob2RlPy5jaGlsZE5vZGVzIHx8IFtdKSkgewoJICAgICAgICBpZiAoYy5ub2RlVHlwZSA9PT0gNCkgewoJICAgICAgICAgICAgcmV0dXJuIHsKCSAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogewoJICAgICAgICAgICAgICAgICAgICAiQHR5cGUiOiAiaHRtbCIsCgkgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBub2RlVmFsKGMpLAoJICAgICAgICAgICAgICAgIH0sCgkgICAgICAgICAgICB9OwoJICAgICAgICB9CgkgICAgfQoJICAgIHJldHVybiB7fTsKCX0KCWZ1bmN0aW9uIGV4dHJhY3RUaW1lU3Bhbihub2RlKSB7CgkgICAgcmV0dXJuIGdldChub2RlLCAiVGltZVNwYW4iLCAodGltZVNwYW4pID0+IHsKCSAgICAgICAgcmV0dXJuIHsKCSAgICAgICAgICAgIHRpbWVzcGFuOiB7CgkgICAgICAgICAgICAgICAgYmVnaW46IG5vZGVWYWwoZ2V0MSh0aW1lU3BhbiwgImJlZ2luIikpLAoJICAgICAgICAgICAgICAgIGVuZDogbm9kZVZhbChnZXQxKHRpbWVTcGFuLCAiZW5kIikpLAoJICAgICAgICAgICAgfSwKCSAgICAgICAgfTsKCSAgICB9KTsKCX0KCWZ1bmN0aW9uIGV4dHJhY3RUaW1lU3RhbXAobm9kZSkgewoJICAgIHJldHVybiBnZXQobm9kZSwgIlRpbWVTdGFtcCIsICh0aW1lU3RhbXApID0+IHsKCSAgICAgICAgcmV0dXJuIHsgdGltZXN0YW1wOiBub2RlVmFsKGdldDEodGltZVN0YW1wLCAid2hlbiIpKSB9OwoJICAgIH0pOwoJfQoJZnVuY3Rpb24gZXh0cmFjdENhc2NhZGVkU3R5bGUobm9kZSwgc3R5bGVNYXApIHsKCSAgICByZXR1cm4gdmFsMShub2RlLCAic3R5bGVVcmwiLCAoc3R5bGVVcmwpID0+IHsKCSAgICAgICAgc3R5bGVVcmwgPSBub3JtYWxpemVJZChzdHlsZVVybCk7CgkgICAgICAgIGlmIChzdHlsZU1hcFtzdHlsZVVybF0pIHsKCSAgICAgICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHsgc3R5bGVVcmwgfSwgc3R5bGVNYXBbc3R5bGVVcmxdKTsKCSAgICAgICAgfQoJICAgICAgICAvLyBGb3IgYmFja3dhcmQtY29tcGF0aWJpbGl0eS4gU2hvdWxkIHdlIHN0aWxsIGluY2x1ZGUKCSAgICAgICAgLy8gc3R5bGVVcmwgZXZlbiBpZiBpdCdzIG5vdCByZXNvbHZlZD8KCSAgICAgICAgcmV0dXJuIHsgc3R5bGVVcmwgfTsKCSAgICB9KTsKCX0KCgljb25zdCByZW1vdmVTcGFjZSA9IC9ccyovZzsKCWNvbnN0IHRyaW1TcGFjZSA9IC9eXHMqfFxzKiQvZzsKCWNvbnN0IHNwbGl0U3BhY2UgPSAvXHMrLzsKCS8qKgoJICogR2V0IG9uZSBjb29yZGluYXRlIGZyb20gYSBjb29yZGluYXRlIGFycmF5LCBpZiBhbnkKCSAqLwoJZnVuY3Rpb24gY29vcmQxKHZhbHVlKSB7CgkgICAgcmV0dXJuIHZhbHVlCgkgICAgICAgIC5yZXBsYWNlKHJlbW92ZVNwYWNlLCAiIikKCSAgICAgICAgLnNwbGl0KCIsIikKCSAgICAgICAgLm1hcChwYXJzZUZsb2F0KQoJICAgICAgICAuZmlsdGVyKChudW0pID0+ICFpc05hTihudW0pKQoJICAgICAgICAuc2xpY2UoMCwgMyk7Cgl9CgkvKioKCSAqIEdldCBhbGwgY29vcmRpbmF0ZXMgZnJvbSBhIGNvb3JkaW5hdGUgYXJyYXkgYXMgW1tdLFtdXQoJICovCglmdW5jdGlvbiBjb29yZCh2YWx1ZSkgewoJICAgIHJldHVybiB2YWx1ZQoJICAgICAgICAucmVwbGFjZSh0cmltU3BhY2UsICIiKQoJICAgICAgICAuc3BsaXQoc3BsaXRTcGFjZSkKCSAgICAgICAgLm1hcChjb29yZDEpCgkgICAgICAgIC5maWx0ZXIoKGNvb3JkKSA9PiB7CgkgICAgICAgIHJldHVybiBjb29yZC5sZW5ndGggPj0gMjsKCSAgICB9KTsKCX0KCWZ1bmN0aW9uIGd4Q29vcmRzKG5vZGUpIHsKCSAgICBsZXQgZWxlbXMgPSAkKG5vZGUsICJjb29yZCIpOwoJICAgIGlmIChlbGVtcy5sZW5ndGggPT09IDApIHsKCSAgICAgICAgZWxlbXMgPSAkbnMobm9kZSwgImNvb3JkIiwgIioiKTsKCSAgICB9CgkgICAgY29uc3QgY29vcmRpbmF0ZXMgPSBlbGVtcy5tYXAoKGVsZW0pID0+IHsKCSAgICAgICAgcmV0dXJuIG5vZGVWYWwoZWxlbSkuc3BsaXQoIiAiKS5tYXAocGFyc2VGbG9hdCk7CgkgICAgfSk7CgkgICAgaWYgKGNvb3JkaW5hdGVzLmxlbmd0aCA9PT0gMCkgewoJICAgICAgICByZXR1cm4gbnVsbDsKCSAgICB9CgkgICAgcmV0dXJuIHsKCSAgICAgICAgZ2VvbWV0cnk6IGNvb3JkaW5hdGVzLmxlbmd0aCA+IDIKCSAgICAgICAgICAgID8gewoJICAgICAgICAgICAgICAgIHR5cGU6ICJMaW5lU3RyaW5nIiwKCSAgICAgICAgICAgICAgICBjb29yZGluYXRlcywKCSAgICAgICAgICAgIH0KCSAgICAgICAgICAgIDogewoJICAgICAgICAgICAgICAgIHR5cGU6ICJQb2ludCIsCgkgICAgICAgICAgICAgICAgY29vcmRpbmF0ZXM6IGNvb3JkaW5hdGVzWzBdLAoJICAgICAgICAgICAgfSwKCSAgICAgICAgdGltZXM6ICQobm9kZSwgIndoZW4iKS5tYXAoKGVsZW0pID0+IG5vZGVWYWwoZWxlbSkpLAoJICAgIH07Cgl9CglmdW5jdGlvbiBmaXhSaW5nKHJpbmcpIHsKCSAgICBpZiAocmluZy5sZW5ndGggPT09IDApCgkgICAgICAgIHJldHVybiByaW5nOwoJICAgIGNvbnN0IGZpcnN0ID0gcmluZ1swXTsKCSAgICBjb25zdCBsYXN0ID0gcmluZ1tyaW5nLmxlbmd0aCAtIDFdOwoJICAgIGxldCBlcXVhbCA9IHRydWU7CgkgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBNYXRoLm1heChmaXJzdC5sZW5ndGgsIGxhc3QubGVuZ3RoKTsgaSsrKSB7CgkgICAgICAgIGlmIChmaXJzdFtpXSAhPT0gbGFzdFtpXSkgewoJICAgICAgICAgICAgZXF1YWwgPSBmYWxzZTsKCSAgICAgICAgICAgIGJyZWFrOwoJICAgICAgICB9CgkgICAgfQoJICAgIGlmICghZXF1YWwpIHsKCSAgICAgICAgcmV0dXJuIHJpbmcuY29uY2F0KFtyaW5nWzBdXSk7CgkgICAgfQoJICAgIHJldHVybiByaW5nOwoJfQoJZnVuY3Rpb24gZ2V0Q29vcmRpbmF0ZXMobm9kZSkgewoJICAgIHJldHVybiBub2RlVmFsKGdldDEobm9kZSwgImNvb3JkaW5hdGVzIikpOwoJfQoJZnVuY3Rpb24gZ2V0R2VvbWV0cnkobm9kZSkgewoJICAgIGxldCBnZW9tZXRyaWVzID0gW107CgkgICAgbGV0IGNvb3JkVGltZXMgPSBbXTsKCSAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGUuY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykgewoJICAgICAgICBjb25zdCBjaGlsZCA9IG5vZGUuY2hpbGROb2Rlcy5pdGVtKGkpOwoJICAgICAgICBpZiAoaXNFbGVtZW50KGNoaWxkKSkgewoJICAgICAgICAgICAgc3dpdGNoIChjaGlsZC50YWdOYW1lKSB7CgkgICAgICAgICAgICAgICAgY2FzZSAiTXVsdGlHZW9tZXRyeSI6CgkgICAgICAgICAgICAgICAgY2FzZSAiTXVsdGlUcmFjayI6CgkgICAgICAgICAgICAgICAgY2FzZSAiZ3g6TXVsdGlUcmFjayI6IHsKCSAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGRHZW9tZXRyaWVzID0gZ2V0R2VvbWV0cnkoY2hpbGQpOwoJICAgICAgICAgICAgICAgICAgICBnZW9tZXRyaWVzID0gZ2VvbWV0cmllcy5jb25jYXQoY2hpbGRHZW9tZXRyaWVzLmdlb21ldHJpZXMpOwoJICAgICAgICAgICAgICAgICAgICBjb29yZFRpbWVzID0gY29vcmRUaW1lcy5jb25jYXQoY2hpbGRHZW9tZXRyaWVzLmNvb3JkVGltZXMpOwoJICAgICAgICAgICAgICAgICAgICBicmVhazsKCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgY2FzZSAiUG9pbnQiOiB7CgkgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gY29vcmQxKGdldENvb3JkaW5hdGVzKGNoaWxkKSk7CgkgICAgICAgICAgICAgICAgICAgIGlmIChjb29yZGluYXRlcy5sZW5ndGggPj0gMikgewoJICAgICAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cmllcy5wdXNoKHsKCSAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAiUG9pbnQiLAoJICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzLAoJICAgICAgICAgICAgICAgICAgICAgICAgfSk7CgkgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICAgICAgYnJlYWs7CgkgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgIGNhc2UgIkxpbmVhclJpbmciOgoJICAgICAgICAgICAgICAgIGNhc2UgIkxpbmVTdHJpbmciOiB7CgkgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gY29vcmQoZ2V0Q29vcmRpbmF0ZXMoY2hpbGQpKTsKCSAgICAgICAgICAgICAgICAgICAgaWYgKGNvb3JkaW5hdGVzLmxlbmd0aCA+PSAyKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICBnZW9tZXRyaWVzLnB1c2goewoJICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICJMaW5lU3RyaW5nIiwKCSAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb29yZGluYXRlcywKCSAgICAgICAgICAgICAgICAgICAgICAgIH0pOwoJICAgICAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgICAgIGJyZWFrOwoJICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICBjYXNlICJQb2x5Z29uIjogewoJICAgICAgICAgICAgICAgICAgICBjb25zdCBjb29yZHMgPSBbXTsKCSAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBsaW5lYXJSaW5nIG9mICQoY2hpbGQsICJMaW5lYXJSaW5nIikpIHsKCSAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJpbmcgPSBmaXhSaW5nKGNvb3JkKGdldENvb3JkaW5hdGVzKGxpbmVhclJpbmcpKSk7CgkgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmluZy5sZW5ndGggPj0gNCkgewoJICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvb3Jkcy5wdXNoKHJpbmcpOwoJICAgICAgICAgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgICAgIGlmIChjb29yZHMubGVuZ3RoKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICBnZW9tZXRyaWVzLnB1c2goewoJICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICJQb2x5Z29uIiwKCSAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb29yZGluYXRlczogY29vcmRzLAoJICAgICAgICAgICAgICAgICAgICAgICAgfSk7CgkgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICAgICAgYnJlYWs7CgkgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgIGNhc2UgIlRyYWNrIjoKCSAgICAgICAgICAgICAgICBjYXNlICJneDpUcmFjayI6IHsKCSAgICAgICAgICAgICAgICAgICAgY29uc3QgZ3ggPSBneENvb3JkcyhjaGlsZCk7CgkgICAgICAgICAgICAgICAgICAgIGlmICghZ3gpCgkgICAgICAgICAgICAgICAgICAgICAgICBicmVhazsKCSAgICAgICAgICAgICAgICAgICAgY29uc3QgeyB0aW1lcywgZ2VvbWV0cnkgfSA9IGd4OwoJICAgICAgICAgICAgICAgICAgICBnZW9tZXRyaWVzLnB1c2goZ2VvbWV0cnkpOwoJICAgICAgICAgICAgICAgICAgICBpZiAodGltZXMubGVuZ3RoKQoJICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRUaW1lcy5wdXNoKHRpbWVzKTsKCSAgICAgICAgICAgICAgICAgICAgYnJlYWs7CgkgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgfQoJICAgICAgICB9CgkgICAgfQoJICAgIHJldHVybiB7CgkgICAgICAgIGdlb21ldHJpZXMsCgkgICAgICAgIGNvb3JkVGltZXMsCgkgICAgfTsKCX0KCglmdW5jdGlvbiBnZW9tZXRyeUxpc3RUb0dlb21ldHJ5KGdlb21ldHJpZXMpIHsKCSAgICByZXR1cm4gZ2VvbWV0cmllcy5sZW5ndGggPT09IDAKCSAgICAgICAgPyBudWxsCgkgICAgICAgIDogZ2VvbWV0cmllcy5sZW5ndGggPT09IDEKCSAgICAgICAgICAgID8gZ2VvbWV0cmllc1swXQoJICAgICAgICAgICAgOiB7CgkgICAgICAgICAgICAgICAgdHlwZTogIkdlb21ldHJ5Q29sbGVjdGlvbiIsCgkgICAgICAgICAgICAgICAgZ2VvbWV0cmllcywKCSAgICAgICAgICAgIH07Cgl9CglmdW5jdGlvbiBnZXRQbGFjZW1hcmsobm9kZSwgc3R5bGVNYXAsIHNjaGVtYSwgb3B0aW9ucykgewoJICAgIGNvbnN0IHsgY29vcmRUaW1lcywgZ2VvbWV0cmllcyB9ID0gZ2V0R2VvbWV0cnkobm9kZSk7CgkgICAgY29uc3QgZ2VvbWV0cnkgPSBnZW9tZXRyeUxpc3RUb0dlb21ldHJ5KGdlb21ldHJpZXMpOwoJICAgIGlmICghZ2VvbWV0cnkgJiYgb3B0aW9ucy5za2lwTnVsbEdlb21ldHJ5KSB7CgkgICAgICAgIHJldHVybiBudWxsOwoJICAgIH0KCSAgICBjb25zdCBmZWF0dXJlID0gewoJICAgICAgICB0eXBlOiAiRmVhdHVyZSIsCgkgICAgICAgIGdlb21ldHJ5LAoJICAgICAgICBwcm9wZXJ0aWVzOiBPYmplY3QuYXNzaWduKGdldE11bHRpKG5vZGUsIFsKCSAgICAgICAgICAgICJuYW1lIiwKCSAgICAgICAgICAgICJhZGRyZXNzIiwKCSAgICAgICAgICAgICJ2aXNpYmlsaXR5IiwKCSAgICAgICAgICAgICJvcGVuIiwKCSAgICAgICAgICAgICJwaG9uZU51bWJlciIsCgkgICAgICAgICAgICAiZGVzY3JpcHRpb24iLAoJICAgICAgICBdKSwgZ2V0TWF5YmVIVE1MRGVzY3JpcHRpb24obm9kZSksIGV4dHJhY3RDYXNjYWRlZFN0eWxlKG5vZGUsIHN0eWxlTWFwKSwgZXh0cmFjdFN0eWxlKG5vZGUpLCBleHRyYWN0RXh0ZW5kZWREYXRhKG5vZGUsIHNjaGVtYSksIGV4dHJhY3RUaW1lU3Bhbihub2RlKSwgZXh0cmFjdFRpbWVTdGFtcChub2RlKSwgY29vcmRUaW1lcy5sZW5ndGgKCSAgICAgICAgICAgID8gewoJICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVQcm9wZXJ0aWVzOiB7CgkgICAgICAgICAgICAgICAgICAgIHRpbWVzOiBjb29yZFRpbWVzLmxlbmd0aCA9PT0gMSA/IGNvb3JkVGltZXNbMF0gOiBjb29yZFRpbWVzLAoJICAgICAgICAgICAgICAgIH0sCgkgICAgICAgICAgICB9CgkgICAgICAgICAgICA6IHt9KSwKCSAgICB9OwoJICAgIGlmIChmZWF0dXJlLnByb3BlcnRpZXM/LnZpc2liaWxpdHkgIT09IHVuZGVmaW5lZCkgewoJICAgICAgICBmZWF0dXJlLnByb3BlcnRpZXMudmlzaWJpbGl0eSA9IGZlYXR1cmUucHJvcGVydGllcy52aXNpYmlsaXR5ICE9PSAiMCI7CgkgICAgfQoJICAgIGNvbnN0IGlkID0gbm9kZS5nZXRBdHRyaWJ1dGUoImlkIik7CgkgICAgaWYgKGlkICE9PSBudWxsICYmIGlkICE9PSAiIikKCSAgICAgICAgZmVhdHVyZS5pZCA9IGlkOwoJICAgIHJldHVybiBmZWF0dXJlOwoJfQoKCWZ1bmN0aW9uIGdldEdyb3VuZE92ZXJsYXlCb3gobm9kZSkgewoJICAgIGNvbnN0IGxhdExvblF1YWQgPSBnZXQxKG5vZGUsICJneDpMYXRMb25RdWFkIik7CgkgICAgaWYgKGxhdExvblF1YWQpIHsKCSAgICAgICAgY29uc3QgcmluZyA9IGZpeFJpbmcoY29vcmQoZ2V0Q29vcmRpbmF0ZXMobm9kZSkpKTsKCSAgICAgICAgcmV0dXJuIHsKCSAgICAgICAgICAgIGdlb21ldHJ5OiB7CgkgICAgICAgICAgICAgICAgdHlwZTogIlBvbHlnb24iLAoJICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBbcmluZ10sCgkgICAgICAgICAgICB9LAoJICAgICAgICB9OwoJICAgIH0KCSAgICByZXR1cm4gZ2V0TGF0TG9uQm94KG5vZGUpOwoJfQoJY29uc3QgREVHUkVFU19UT19SQURJQU5TID0gTWF0aC5QSSAvIDE4MDsKCWZ1bmN0aW9uIHJvdGF0ZUJveChiYm94LCBjb29yZGluYXRlcywgcm90YXRpb24pIHsKCSAgICBjb25zdCBjZW50ZXIgPSBbKGJib3hbMF0gKyBiYm94WzJdKSAvIDIsIChiYm94WzFdICsgYmJveFszXSkgLyAyXTsKCSAgICByZXR1cm4gWwoJICAgICAgICBjb29yZGluYXRlc1swXS5tYXAoKGNvb3JkaW5hdGUpID0+IHsKCSAgICAgICAgICAgIGNvbnN0IGR5ID0gY29vcmRpbmF0ZVsxXSAtIGNlbnRlclsxXTsKCSAgICAgICAgICAgIGNvbnN0IGR4ID0gY29vcmRpbmF0ZVswXSAtIGNlbnRlclswXTsKCSAgICAgICAgICAgIGNvbnN0IGRpc3RhbmNlID0gTWF0aC5zcXJ0KE1hdGgucG93KGR5LCAyKSArIE1hdGgucG93KGR4LCAyKSk7CgkgICAgICAgICAgICBjb25zdCBhbmdsZSA9IE1hdGguYXRhbjIoZHksIGR4KSArIHJvdGF0aW9uICogREVHUkVFU19UT19SQURJQU5TOwoJICAgICAgICAgICAgcmV0dXJuIFsKCSAgICAgICAgICAgICAgICBjZW50ZXJbMF0gKyBNYXRoLmNvcyhhbmdsZSkgKiBkaXN0YW5jZSwKCSAgICAgICAgICAgICAgICBjZW50ZXJbMV0gKyBNYXRoLnNpbihhbmdsZSkgKiBkaXN0YW5jZSwKCSAgICAgICAgICAgIF07CgkgICAgICAgIH0pLAoJICAgIF07Cgl9CglmdW5jdGlvbiBnZXRMYXRMb25Cb3gobm9kZSkgewoJICAgIGNvbnN0IGxhdExvbkJveCA9IGdldDEobm9kZSwgIkxhdExvbkJveCIpOwoJICAgIGlmIChsYXRMb25Cb3gpIHsKCSAgICAgICAgY29uc3Qgbm9ydGggPSBudW0xKGxhdExvbkJveCwgIm5vcnRoIik7CgkgICAgICAgIGNvbnN0IHdlc3QgPSBudW0xKGxhdExvbkJveCwgIndlc3QiKTsKCSAgICAgICAgY29uc3QgZWFzdCA9IG51bTEobGF0TG9uQm94LCAiZWFzdCIpOwoJICAgICAgICBjb25zdCBzb3V0aCA9IG51bTEobGF0TG9uQm94LCAic291dGgiKTsKCSAgICAgICAgY29uc3Qgcm90YXRpb24gPSBudW0xKGxhdExvbkJveCwgInJvdGF0aW9uIik7CgkgICAgICAgIGlmICh0eXBlb2Ygbm9ydGggPT09ICJudW1iZXIiICYmCgkgICAgICAgICAgICB0eXBlb2Ygc291dGggPT09ICJudW1iZXIiICYmCgkgICAgICAgICAgICB0eXBlb2Ygd2VzdCA9PT0gIm51bWJlciIgJiYKCSAgICAgICAgICAgIHR5cGVvZiBlYXN0ID09PSAibnVtYmVyIikgewoJICAgICAgICAgICAgY29uc3QgYmJveCA9IFt3ZXN0LCBzb3V0aCwgZWFzdCwgbm9ydGhdOwoJICAgICAgICAgICAgbGV0IGNvb3JkaW5hdGVzID0gWwoJICAgICAgICAgICAgICAgIFsKCSAgICAgICAgICAgICAgICAgICAgW3dlc3QsIG5vcnRoXSwKCSAgICAgICAgICAgICAgICAgICAgW2Vhc3QsIG5vcnRoXSwKCSAgICAgICAgICAgICAgICAgICAgW2Vhc3QsIHNvdXRoXSwKCSAgICAgICAgICAgICAgICAgICAgW3dlc3QsIHNvdXRoXSwKCSAgICAgICAgICAgICAgICAgICAgW3dlc3QsIG5vcnRoXSwgLy8gdG9wIGxlZnQgKGFnYWluKQoJICAgICAgICAgICAgICAgIF0sCgkgICAgICAgICAgICBdOwoJICAgICAgICAgICAgaWYgKHR5cGVvZiByb3RhdGlvbiA9PT0gIm51bWJlciIpIHsKCSAgICAgICAgICAgICAgICBjb29yZGluYXRlcyA9IHJvdGF0ZUJveChiYm94LCBjb29yZGluYXRlcywgcm90YXRpb24pOwoJICAgICAgICAgICAgfQoJICAgICAgICAgICAgcmV0dXJuIHsKCSAgICAgICAgICAgICAgICBiYm94LAoJICAgICAgICAgICAgICAgIGdlb21ldHJ5OiB7CgkgICAgICAgICAgICAgICAgICAgIHR5cGU6ICJQb2x5Z29uIiwKCSAgICAgICAgICAgICAgICAgICAgY29vcmRpbmF0ZXMsCgkgICAgICAgICAgICAgICAgfSwKCSAgICAgICAgICAgIH07CgkgICAgICAgIH0KCSAgICB9CgkgICAgcmV0dXJuIG51bGw7Cgl9CglmdW5jdGlvbiBnZXRHcm91bmRPdmVybGF5KG5vZGUsIHN0eWxlTWFwLCBzY2hlbWEsIG9wdGlvbnMpIHsKCSAgICBjb25zdCBib3ggPSBnZXRHcm91bmRPdmVybGF5Qm94KG5vZGUpOwoJICAgIGNvbnN0IGdlb21ldHJ5ID0gYm94Py5nZW9tZXRyeSB8fCBudWxsOwoJICAgIGlmICghZ2VvbWV0cnkgJiYgb3B0aW9ucy5za2lwTnVsbEdlb21ldHJ5KSB7CgkgICAgICAgIHJldHVybiBudWxsOwoJICAgIH0KCSAgICBjb25zdCBmZWF0dXJlID0gewoJICAgICAgICB0eXBlOiAiRmVhdHVyZSIsCgkgICAgICAgIGdlb21ldHJ5LAoJICAgICAgICBwcm9wZXJ0aWVzOiBPYmplY3QuYXNzaWduKAoJICAgICAgICAvKioKCSAgICAgICAgICogUmVsYXRlZCB0bwoJICAgICAgICAgKiBodHRwczovL2dpc3QuZ2l0aHViLmNvbS90bWN3LzAzN2ExY2I2NjYwZDc0YTM5MmU5ZGE3NDQ2NTQwZjQ2CgkgICAgICAgICAqLwoJICAgICAgICB7ICJAZ2VvbWV0cnktdHlwZSI6ICJncm91bmRvdmVybGF5IiB9LCBnZXRNdWx0aShub2RlLCBbCgkgICAgICAgICAgICAibmFtZSIsCgkgICAgICAgICAgICAiYWRkcmVzcyIsCgkgICAgICAgICAgICAidmlzaWJpbGl0eSIsCgkgICAgICAgICAgICAib3BlbiIsCgkgICAgICAgICAgICAicGhvbmVOdW1iZXIiLAoJICAgICAgICAgICAgImRlc2NyaXB0aW9uIiwKCSAgICAgICAgXSksIGdldE1heWJlSFRNTERlc2NyaXB0aW9uKG5vZGUpLCBleHRyYWN0Q2FzY2FkZWRTdHlsZShub2RlLCBzdHlsZU1hcCksIGV4dHJhY3RTdHlsZShub2RlKSwgZXh0cmFjdEljb25IcmVmKG5vZGUpLCBleHRyYWN0RXh0ZW5kZWREYXRhKG5vZGUsIHNjaGVtYSksIGV4dHJhY3RUaW1lU3Bhbihub2RlKSwgZXh0cmFjdFRpbWVTdGFtcChub2RlKSksCgkgICAgfTsKCSAgICBpZiAoYm94Py5iYm94KSB7CgkgICAgICAgIGZlYXR1cmUuYmJveCA9IGJveC5iYm94OwoJICAgIH0KCSAgICBpZiAoZmVhdHVyZS5wcm9wZXJ0aWVzPy52aXNpYmlsaXR5ICE9PSB1bmRlZmluZWQpIHsKCSAgICAgICAgZmVhdHVyZS5wcm9wZXJ0aWVzLnZpc2liaWxpdHkgPSBmZWF0dXJlLnByb3BlcnRpZXMudmlzaWJpbGl0eSAhPT0gIjAiOwoJICAgIH0KCSAgICBjb25zdCBpZCA9IG5vZGUuZ2V0QXR0cmlidXRlKCJpZCIpOwoJICAgIGlmIChpZCAhPT0gbnVsbCAmJiBpZCAhPT0gIiIpCgkgICAgICAgIGZlYXR1cmUuaWQgPSBpZDsKCSAgICByZXR1cm4gZmVhdHVyZTsKCX0KCglmdW5jdGlvbiBnZXRTdHlsZUlkKHN0eWxlKSB7CgkgICAgbGV0IGlkID0gc3R5bGUuZ2V0QXR0cmlidXRlKCJpZCIpOwoJICAgIGNvbnN0IHBhcmVudE5vZGUgPSBzdHlsZS5wYXJlbnROb2RlOwoJICAgIGlmICghaWQgJiYKCSAgICAgICAgaXNFbGVtZW50KHBhcmVudE5vZGUpICYmCgkgICAgICAgIHBhcmVudE5vZGUubG9jYWxOYW1lID09PSAiQ2FzY2FkaW5nU3R5bGUiKSB7CgkgICAgICAgIGlkID0gcGFyZW50Tm9kZS5nZXRBdHRyaWJ1dGUoImttbDppZCIpIHx8IHBhcmVudE5vZGUuZ2V0QXR0cmlidXRlKCJpZCIpOwoJICAgIH0KCSAgICByZXR1cm4gbm9ybWFsaXplSWQoaWQgfHwgIiIpOwoJfQoJZnVuY3Rpb24gYnVpbGRTdHlsZU1hcChub2RlKSB7CgkgICAgY29uc3Qgc3R5bGVNYXAgPSB7fTsKCSAgICBmb3IgKGNvbnN0IHN0eWxlIG9mICQobm9kZSwgIlN0eWxlIikpIHsKCSAgICAgICAgc3R5bGVNYXBbZ2V0U3R5bGVJZChzdHlsZSldID0gZXh0cmFjdFN0eWxlKHN0eWxlKTsKCSAgICB9CgkgICAgZm9yIChjb25zdCBtYXAgb2YgJChub2RlLCAiU3R5bGVNYXAiKSkgewoJICAgICAgICBjb25zdCBpZCA9IG5vcm1hbGl6ZUlkKG1hcC5nZXRBdHRyaWJ1dGUoImlkIikgfHwgIiIpOwoJICAgICAgICB2YWwxKG1hcCwgInN0eWxlVXJsIiwgKHN0eWxlVXJsKSA9PiB7CgkgICAgICAgICAgICBzdHlsZVVybCA9IG5vcm1hbGl6ZUlkKHN0eWxlVXJsKTsKCSAgICAgICAgICAgIGlmIChzdHlsZU1hcFtzdHlsZVVybF0pIHsKCSAgICAgICAgICAgICAgICBzdHlsZU1hcFtpZF0gPSBzdHlsZU1hcFtzdHlsZVVybF07CgkgICAgICAgICAgICB9CgkgICAgICAgIH0pOwoJICAgIH0KCSAgICByZXR1cm4gc3R5bGVNYXA7Cgl9CglmdW5jdGlvbiBidWlsZFNjaGVtYShub2RlKSB7CgkgICAgY29uc3Qgc2NoZW1hID0ge307CgkgICAgZm9yIChjb25zdCBmaWVsZCBvZiAkKG5vZGUsICJTaW1wbGVGaWVsZCIpKSB7CgkgICAgICAgIHNjaGVtYVtmaWVsZC5nZXRBdHRyaWJ1dGUoIm5hbWUiKSB8fCAiIl0gPQoJICAgICAgICAgICAgdHlwZUNvbnZlcnRlcnNbZmllbGQuZ2V0QXR0cmlidXRlKCJ0eXBlIikgfHwgIiJdIHx8CgkgICAgICAgICAgICAgICAgdHlwZUNvbnZlcnRlcnNbInN0cmluZyJdOwoJICAgIH0KCSAgICByZXR1cm4gc2NoZW1hOwoJfQoJY29uc3QgRk9MREVSX1BST1BTID0gWwoJICAgICJuYW1lIiwKCSAgICAidmlzaWJpbGl0eSIsCgkgICAgIm9wZW4iLAoJICAgICJhZGRyZXNzIiwKCSAgICAiZGVzY3JpcHRpb24iLAoJICAgICJwaG9uZU51bWJlciIsCgkgICAgInZpc2liaWxpdHkiLAoJXTsKCWZ1bmN0aW9uIGdldEZvbGRlcihub2RlKSB7CgkgICAgY29uc3QgbWV0YSA9IHt9OwoJICAgIGZvciAoY29uc3QgY2hpbGQgb2YgQXJyYXkuZnJvbShub2RlLmNoaWxkTm9kZXMpKSB7CgkgICAgICAgIGlmIChpc0VsZW1lbnQoY2hpbGQpICYmIEZPTERFUl9QUk9QUy5pbmNsdWRlcyhjaGlsZC50YWdOYW1lKSkgewoJICAgICAgICAgICAgbWV0YVtjaGlsZC50YWdOYW1lXSA9IG5vZGVWYWwoY2hpbGQpOwoJICAgICAgICB9CgkgICAgfQoJICAgIHJldHVybiB7CgkgICAgICAgIHR5cGU6ICJmb2xkZXIiLAoJICAgICAgICBtZXRhLAoJICAgICAgICBjaGlsZHJlbjogW10sCgkgICAgfTsKCX0KCS8qKgoJICogWWllbGQgYSBuZXN0ZWQgdHJlZSB3aXRoIEtNTCBmb2xkZXIgc3RydWN0dXJlCgkgKgoJICogVGhpcyBnZW5lcmF0ZXMgYSB0cmVlIHdpdGggdGhlIGdpdmVuIHN0cnVjdHVyZToKCSAqCgkgKiBgYGBqcwoJICogewoJICogICAidHlwZSI6ICJyb290IiwKCSAqICAgImNoaWxkcmVuIjogWwoJICogICAgIHsKCSAqICAgICAgICJ0eXBlIjogImZvbGRlciIsCgkgKiAgICAgICAibWV0YSI6IHsKCSAqICAgICAgICAgIm5hbWUiOiAiVGVzdCIKCSAqICAgICAgIH0sCgkgKiAgICAgICAiY2hpbGRyZW4iOiBbCgkgKiAgICAgICAgICAvLyAuLi5mZWF0dXJlcyBhbmQgZm9sZGVycwoJICogICAgICAgXQoJICogICAgIH0KCSAqICAgICAvLyAuLi5mZWF0dXJlcwoJICogICBdCgkgKiB9CgkgKiBgYGAKCSAqCgkgKiAjIyMgR3JvdW5kT3ZlcmxheQoJICoKCSAqIEdyb3VuZE92ZXJsYXkgZWxlbWVudHMgYXJlIGNvbnZlcnRlZCBpbnRvCgkgKiBgRmVhdHVyZWAgb2JqZWN0cyB3aXRoIGBQb2x5Z29uYCBnZW9tZXRyaWVzLAoJICogYSBwcm9wZXJ0eSBsaWtlOgoJICoKCSAqIGBgYGpzb24KCSAqIHsKCSAqICAgIkBnZW9tZXRyeS10eXBlIjogImdyb3VuZG92ZXJsYXkiCgkgKiB9CgkgKiBgYGAKCSAqCgkgKiBBbmQgdGhlIGdyb3VuZCBvdmVybGF5J3MgaW1hZ2UgVVJMIGluIHRoZSBgaHJlZmAKCSAqIHByb3BlcnR5LiBHcm91bmQgb3ZlcmxheXMgd2lsbCBuZWVkIHRvIGJlIGRpc3BsYXllZAoJICogd2l0aCBhIHNlcGFyYXRlIG1ldGhvZCB0byBvdGhlciBmZWF0dXJlcywgZGVwZW5kaW5nCgkgKiBvbiB3aGljaCBtYXAgZnJhbWV3b3JrIHlvdSdyZSB1c2luZy4KCSAqLwoJZnVuY3Rpb24ga21sV2l0aEZvbGRlcnMobm9kZSwgb3B0aW9ucyA9IHsKCSAgICBza2lwTnVsbEdlb21ldHJ5OiBmYWxzZSwKCX0pIHsKCSAgICBjb25zdCBzdHlsZU1hcCA9IGJ1aWxkU3R5bGVNYXAobm9kZSk7CgkgICAgY29uc3Qgc2NoZW1hID0gYnVpbGRTY2hlbWEobm9kZSk7CgkgICAgY29uc3QgdHJlZSA9IHsgdHlwZTogInJvb3QiLCBjaGlsZHJlbjogW10gfTsKCSAgICBmdW5jdGlvbiB0cmF2ZXJzZShub2RlLCBwb2ludGVyLCBvcHRpb25zKSB7CgkgICAgICAgIGlmIChpc0VsZW1lbnQobm9kZSkpIHsKCSAgICAgICAgICAgIHN3aXRjaCAobm9kZS50YWdOYW1lKSB7CgkgICAgICAgICAgICAgICAgY2FzZSAiR3JvdW5kT3ZlcmxheSI6IHsKCSAgICAgICAgICAgICAgICAgICAgY29uc3QgcGxhY2VtYXJrID0gZ2V0R3JvdW5kT3ZlcmxheShub2RlLCBzdHlsZU1hcCwgc2NoZW1hLCBvcHRpb25zKTsKCSAgICAgICAgICAgICAgICAgICAgaWYgKHBsYWNlbWFyaykgewoJICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRlci5jaGlsZHJlbi5wdXNoKHBsYWNlbWFyayk7CgkgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICAgICAgYnJlYWs7CgkgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgIGNhc2UgIlBsYWNlbWFyayI6IHsKCSAgICAgICAgICAgICAgICAgICAgY29uc3QgcGxhY2VtYXJrID0gZ2V0UGxhY2VtYXJrKG5vZGUsIHN0eWxlTWFwLCBzY2hlbWEsIG9wdGlvbnMpOwoJICAgICAgICAgICAgICAgICAgICBpZiAocGxhY2VtYXJrKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICBwb2ludGVyLmNoaWxkcmVuLnB1c2gocGxhY2VtYXJrKTsKCSAgICAgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgICAgICBicmVhazsKCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgY2FzZSAiRm9sZGVyIjogewoJICAgICAgICAgICAgICAgICAgICBjb25zdCBmb2xkZXIgPSBnZXRGb2xkZXIobm9kZSk7CgkgICAgICAgICAgICAgICAgICAgIHBvaW50ZXIuY2hpbGRyZW4ucHVzaChmb2xkZXIpOwoJICAgICAgICAgICAgICAgICAgICBwb2ludGVyID0gZm9sZGVyOwoJICAgICAgICAgICAgICAgICAgICBicmVhazsKCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICB9CgkgICAgICAgIH0KCSAgICAgICAgaWYgKG5vZGUuY2hpbGROb2RlcykgewoJICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2RlLmNoaWxkTm9kZXMubGVuZ3RoOyBpKyspIHsKCSAgICAgICAgICAgICAgICB0cmF2ZXJzZShub2RlLmNoaWxkTm9kZXNbaV0sIHBvaW50ZXIsIG9wdGlvbnMpOwoJICAgICAgICAgICAgfQoJICAgICAgICB9CgkgICAgfQoJICAgIHRyYXZlcnNlKG5vZGUsIHRyZWUsIG9wdGlvbnMpOwoJICAgIHJldHVybiB0cmVlOwoJfQoJLyoqCgkgKiBDb252ZXJ0IEtNTCB0byBHZW9KU09OIGluY3JlbWVudGFsbHksIHJldHVybmluZwoJICogYSBbR2VuZXJhdG9yXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L0d1aWRlL0l0ZXJhdG9yc19hbmRfR2VuZXJhdG9ycykKCSAqIHRoYXQgeWllbGRzIG91dHB1dCBmZWF0dXJlIGJ5IGZlYXR1cmUuCgkgKi8KCWZ1bmN0aW9uKiBrbWxHZW4obm9kZSwgb3B0aW9ucyA9IHsKCSAgICBza2lwTnVsbEdlb21ldHJ5OiBmYWxzZSwKCX0pIHsKCSAgICBjb25zdCBzdHlsZU1hcCA9IGJ1aWxkU3R5bGVNYXAobm9kZSk7CgkgICAgY29uc3Qgc2NoZW1hID0gYnVpbGRTY2hlbWEobm9kZSk7CgkgICAgZm9yIChjb25zdCBwbGFjZW1hcmsgb2YgJChub2RlLCAiUGxhY2VtYXJrIikpIHsKCSAgICAgICAgY29uc3QgZmVhdHVyZSA9IGdldFBsYWNlbWFyayhwbGFjZW1hcmssIHN0eWxlTWFwLCBzY2hlbWEsIG9wdGlvbnMpOwoJICAgICAgICBpZiAoZmVhdHVyZSkKCSAgICAgICAgICAgIHlpZWxkIGZlYXR1cmU7CgkgICAgfQoJICAgIGZvciAoY29uc3QgZ3JvdW5kT3ZlcmxheSBvZiAkKG5vZGUsICJHcm91bmRPdmVybGF5IikpIHsKCSAgICAgICAgY29uc3QgZmVhdHVyZSA9IGdldEdyb3VuZE92ZXJsYXkoZ3JvdW5kT3ZlcmxheSwgc3R5bGVNYXAsIHNjaGVtYSwgb3B0aW9ucyk7CgkgICAgICAgIGlmIChmZWF0dXJlKQoJICAgICAgICAgICAgeWllbGQgZmVhdHVyZTsKCSAgICB9Cgl9CgkvKioKCSAqIENvbnZlcnQgYSBLTUwgZG9jdW1lbnQgdG8gR2VvSlNPTi4gVGhlIGZpcnN0IGFyZ3VtZW50LCBgZG9jYCwgbXVzdCBiZSBhIEtNTAoJICogZG9jdW1lbnQgYXMgYW4gWE1MIERPTSAtIG5vdCBhcyBhIHN0cmluZy4gWW91IGNhbiBnZXQgdGhpcyB1c2luZyBqUXVlcnkncyBkZWZhdWx0CgkgKiBgLmFqYXhgIGZ1bmN0aW9uIG9yIHVzaW5nIGEgYmFyZSBYTUxIdHRwUmVxdWVzdCB3aXRoIHRoZSBgLnJlc3BvbnNlYCBwcm9wZXJ0eQoJICogaG9sZGluZyBhbiBYTUwgRE9NLgoJICoKCSAqIFRoZSBvdXRwdXQgaXMgYSBKYXZhU2NyaXB0IG9iamVjdCBvZiBHZW9KU09OIGRhdGEuIFlvdSBjYW4gY29udmVydCBpdCB0byBhIHN0cmluZwoJICogd2l0aCBbSlNPTi5zdHJpbmdpZnldKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0pTT04vc3RyaW5naWZ5KQoJICogb3IgdXNlIGl0IGRpcmVjdGx5IGluIGxpYnJhcmllcy4KCSAqLwoJZnVuY3Rpb24ga21sKG5vZGUsIG9wdGlvbnMgPSB7CgkgICAgc2tpcE51bGxHZW9tZXRyeTogZmFsc2UsCgl9KSB7CgkgICAgcmV0dXJuIHsKCSAgICAgICAgdHlwZTogIkZlYXR1cmVDb2xsZWN0aW9uIiwKCSAgICAgICAgZmVhdHVyZXM6IEFycmF5LmZyb20oa21sR2VuKG5vZGUsIG9wdGlvbnMpKSwKCSAgICB9OwoJfQoKCXZhciB0b0dlb0pzb24gPSAvKiNfX1BVUkVfXyovT2JqZWN0LmZyZWV6ZSh7CgkJX19wcm90b19fOiBudWxsLAoJCWdweDogZ3B4LAoJCWdweEdlbjogZ3B4R2VuLAoJCWttbDoga21sLAoJCWttbEdlbjoga21sR2VuLAoJCWttbFdpdGhGb2xkZXJzOiBrbWxXaXRoRm9sZGVycywKCQl0Y3g6IHRjeCwKCQl0Y3hHZW46IHRjeEdlbgoJfSk7CgoJdmFyIHBvbHlsaW5lID0ge2V4cG9ydHM6IHt9fTsKCgkoZnVuY3Rpb24gKG1vZHVsZSkgewoKCQkvKioKCQkgKiBCYXNlZCBvZmYgb2YgW3RoZSBvZmZpY2FsIEdvb2dsZSBkb2N1bWVudF0oaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vbWFwcy9kb2N1bWVudGF0aW9uL3V0aWxpdGllcy9wb2x5bGluZWFsZ29yaXRobSkKCQkgKgoJCSAqIFNvbWUgcGFydHMgZnJvbSBbdGhpcyBpbXBsZW1lbnRhdGlvbl0oaHR0cDovL2ZhY3N0YWZmLnVuY2EuZWR1L21jbWNjbHVyL0dvb2dsZU1hcHMvRW5jb2RlUG9seWxpbmUvUG9seWxpbmVFbmNvZGVyLmpzKQoJCSAqIGJ5IFtNYXJrIE1jQ2x1cmVdKGh0dHA6Ly9mYWNzdGFmZi51bmNhLmVkdS9tY21jY2x1ci8pCgkJICoKCQkgKiBAbW9kdWxlIHBvbHlsaW5lCgkJICovCgoJCXZhciBwb2x5bGluZSA9IHt9OwoKCQlmdW5jdGlvbiBweTJfcm91bmQodmFsdWUpIHsKCQkgICAgLy8gR29vZ2xlJ3MgcG9seWxpbmUgYWxnb3JpdGhtIHVzZXMgdGhlIHNhbWUgcm91bmRpbmcgc3RyYXRlZ3kgYXMgUHl0aG9uIDIsIHdoaWNoIGlzIGRpZmZlcmVudCBmcm9tIEpTIGZvciBuZWdhdGl2ZSB2YWx1ZXMKCQkgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5hYnModmFsdWUpICsgMC41KSAqICh2YWx1ZSA+PSAwID8gMSA6IC0xKTsKCQl9CgoJCWZ1bmN0aW9uIGVuY29kZShjdXJyZW50LCBwcmV2aW91cywgZmFjdG9yKSB7CgkJICAgIGN1cnJlbnQgPSBweTJfcm91bmQoY3VycmVudCAqIGZhY3Rvcik7CgkJICAgIHByZXZpb3VzID0gcHkyX3JvdW5kKHByZXZpb3VzICogZmFjdG9yKTsKCQkgICAgdmFyIGNvb3JkaW5hdGUgPSAoY3VycmVudCAtIHByZXZpb3VzKSAqIDI7CgkJICAgIGlmIChjb29yZGluYXRlIDwgMCkgewoJCSAgICAgICAgY29vcmRpbmF0ZSA9IC1jb29yZGluYXRlIC0gMTsKCQkgICAgfQoJCSAgICB2YXIgb3V0cHV0ID0gJyc7CgkJICAgIHdoaWxlIChjb29yZGluYXRlID49IDB4MjApIHsKCQkgICAgICAgIG91dHB1dCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKCgweDIwIHwgKGNvb3JkaW5hdGUgJiAweDFmKSkgKyA2Myk7CgkJICAgICAgICBjb29yZGluYXRlIC89IDMyOwoJCSAgICB9CgkJICAgIG91dHB1dCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKChjb29yZGluYXRlIHwgMCkgKyA2Myk7CgkJICAgIHJldHVybiBvdXRwdXQ7CgkJfQoKCQkvKioKCQkgKiBEZWNvZGVzIHRvIGEgW2xhdGl0dWRlLCBsb25naXR1ZGVdIGNvb3JkaW5hdGVzIGFycmF5LgoJCSAqCgkJICogVGhpcyBpcyBhZGFwdGVkIGZyb20gdGhlIGltcGxlbWVudGF0aW9uIGluIFByb2plY3QtT1NSTS4KCQkgKgoJCSAqIEBwYXJhbSB7U3RyaW5nfSBzdHIKCQkgKiBAcGFyYW0ge051bWJlcn0gcHJlY2lzaW9uCgkJICogQHJldHVybnMge0FycmF5fQoJCSAqCgkJICogQHNlZSBodHRwczovL2dpdGh1Yi5jb20vUHJvamVjdC1PU1JNL29zcm0tZnJvbnRlbmQvYmxvYi9tYXN0ZXIvV2ViQ29udGVudC9yb3V0aW5nL09TUk0uUm91dGluZ0dlb21ldHJ5LmpzCgkJICovCgkJcG9seWxpbmUuZGVjb2RlID0gZnVuY3Rpb24oc3RyLCBwcmVjaXNpb24pIHsKCQkgICAgdmFyIGluZGV4ID0gMCwKCQkgICAgICAgIGxhdCA9IDAsCgkJICAgICAgICBsbmcgPSAwLAoJCSAgICAgICAgY29vcmRpbmF0ZXMgPSBbXSwKCQkgICAgICAgIHNoaWZ0ID0gMCwKCQkgICAgICAgIHJlc3VsdCA9IDAsCgkJICAgICAgICBieXRlID0gbnVsbCwKCQkgICAgICAgIGxhdGl0dWRlX2NoYW5nZSwKCQkgICAgICAgIGxvbmdpdHVkZV9jaGFuZ2UsCgkJICAgICAgICBmYWN0b3IgPSBNYXRoLnBvdygxMCwgTnVtYmVyLmlzSW50ZWdlcihwcmVjaXNpb24pID8gcHJlY2lzaW9uIDogNSk7CgoJCSAgICAvLyBDb29yZGluYXRlcyBoYXZlIHZhcmlhYmxlIGxlbmd0aCB3aGVuIGVuY29kZWQsIHNvIGp1c3Qga2VlcAoJCSAgICAvLyB0cmFjayBvZiB3aGV0aGVyIHdlJ3ZlIGhpdCB0aGUgZW5kIG9mIHRoZSBzdHJpbmcuIEluIGVhY2gKCQkgICAgLy8gbG9vcCBpdGVyYXRpb24sIGEgc2luZ2xlIGNvb3JkaW5hdGUgaXMgZGVjb2RlZC4KCQkgICAgd2hpbGUgKGluZGV4IDwgc3RyLmxlbmd0aCkgewoKCQkgICAgICAgIC8vIFJlc2V0IHNoaWZ0LCByZXN1bHQsIGFuZCBieXRlCgkJICAgICAgICBieXRlID0gbnVsbDsKCQkgICAgICAgIHNoaWZ0ID0gMTsKCQkgICAgICAgIHJlc3VsdCA9IDA7CgoJCSAgICAgICAgZG8gewoJCSAgICAgICAgICAgIGJ5dGUgPSBzdHIuY2hhckNvZGVBdChpbmRleCsrKSAtIDYzOwoJCSAgICAgICAgICAgIHJlc3VsdCArPSAoYnl0ZSAmIDB4MWYpICogc2hpZnQ7CgkJICAgICAgICAgICAgc2hpZnQgKj0gMzI7CgkJICAgICAgICB9IHdoaWxlIChieXRlID49IDB4MjApOwoKCQkgICAgICAgIGxhdGl0dWRlX2NoYW5nZSA9IChyZXN1bHQgJiAxKSA/ICgoLXJlc3VsdCAtIDEpIC8gMikgOiAocmVzdWx0IC8gMik7CgoJCSAgICAgICAgc2hpZnQgPSAxOwoJCSAgICAgICAgcmVzdWx0ID0gMDsKCgkJICAgICAgICBkbyB7CgkJICAgICAgICAgICAgYnl0ZSA9IHN0ci5jaGFyQ29kZUF0KGluZGV4KyspIC0gNjM7CgkJICAgICAgICAgICAgcmVzdWx0ICs9IChieXRlICYgMHgxZikgKiBzaGlmdDsKCQkgICAgICAgICAgICBzaGlmdCAqPSAzMjsKCQkgICAgICAgIH0gd2hpbGUgKGJ5dGUgPj0gMHgyMCk7CgoJCSAgICAgICAgbG9uZ2l0dWRlX2NoYW5nZSA9IChyZXN1bHQgJiAxKSA/ICgoLXJlc3VsdCAtIDEpIC8gMikgOiAocmVzdWx0IC8gMik7CgoJCSAgICAgICAgbGF0ICs9IGxhdGl0dWRlX2NoYW5nZTsKCQkgICAgICAgIGxuZyArPSBsb25naXR1ZGVfY2hhbmdlOwoKCQkgICAgICAgIGNvb3JkaW5hdGVzLnB1c2goW2xhdCAvIGZhY3RvciwgbG5nIC8gZmFjdG9yXSk7CgkJICAgIH0KCgkJICAgIHJldHVybiBjb29yZGluYXRlczsKCQl9OwoKCQkvKioKCQkgKiBFbmNvZGVzIHRoZSBnaXZlbiBbbGF0aXR1ZGUsIGxvbmdpdHVkZV0gY29vcmRpbmF0ZXMgYXJyYXkuCgkJICoKCQkgKiBAcGFyYW0ge0FycmF5LjxBcnJheS48TnVtYmVyPj59IGNvb3JkaW5hdGVzCgkJICogQHBhcmFtIHtOdW1iZXJ9IHByZWNpc2lvbgoJCSAqIEByZXR1cm5zIHtTdHJpbmd9CgkJICovCgkJcG9seWxpbmUuZW5jb2RlID0gZnVuY3Rpb24oY29vcmRpbmF0ZXMsIHByZWNpc2lvbikgewoJCSAgICBpZiAoIWNvb3JkaW5hdGVzLmxlbmd0aCkgeyByZXR1cm4gJyc7IH0KCgkJICAgIHZhciBmYWN0b3IgPSBNYXRoLnBvdygxMCwgTnVtYmVyLmlzSW50ZWdlcihwcmVjaXNpb24pID8gcHJlY2lzaW9uIDogNSksCgkJICAgICAgICBvdXRwdXQgPSBlbmNvZGUoY29vcmRpbmF0ZXNbMF1bMF0sIDAsIGZhY3RvcikgKyBlbmNvZGUoY29vcmRpbmF0ZXNbMF1bMV0sIDAsIGZhY3Rvcik7CgoJCSAgICBmb3IgKHZhciBpID0gMTsgaSA8IGNvb3JkaW5hdGVzLmxlbmd0aDsgaSsrKSB7CgkJICAgICAgICB2YXIgYSA9IGNvb3JkaW5hdGVzW2ldLCBiID0gY29vcmRpbmF0ZXNbaSAtIDFdOwoJCSAgICAgICAgb3V0cHV0ICs9IGVuY29kZShhWzBdLCBiWzBdLCBmYWN0b3IpOwoJCSAgICAgICAgb3V0cHV0ICs9IGVuY29kZShhWzFdLCBiWzFdLCBmYWN0b3IpOwoJCSAgICB9CgoJCSAgICByZXR1cm4gb3V0cHV0OwoJCX07CgoJCWZ1bmN0aW9uIGZsaXBwZWQoY29vcmRzKSB7CgkJICAgIHZhciBmbGlwcGVkID0gW107CgkJICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29vcmRzLmxlbmd0aDsgaSsrKSB7CgkJICAgICAgICB2YXIgY29vcmQgPSBjb29yZHNbaV0uc2xpY2UoKTsKCQkgICAgICAgIGZsaXBwZWQucHVzaChbY29vcmRbMV0sIGNvb3JkWzBdXSk7CgkJICAgIH0KCQkgICAgcmV0dXJuIGZsaXBwZWQ7CgkJfQoKCQkvKioKCQkgKiBFbmNvZGVzIGEgR2VvSlNPTiBMaW5lU3RyaW5nIGZlYXR1cmUvZ2VvbWV0cnkuCgkJICoKCQkgKiBAcGFyYW0ge09iamVjdH0gZ2VvanNvbgoJCSAqIEBwYXJhbSB7TnVtYmVyfSBwcmVjaXNpb24KCQkgKiBAcmV0dXJucyB7U3RyaW5nfQoJCSAqLwoJCXBvbHlsaW5lLmZyb21HZW9KU09OID0gZnVuY3Rpb24oZ2VvanNvbiwgcHJlY2lzaW9uKSB7CgkJICAgIGlmIChnZW9qc29uICYmIGdlb2pzb24udHlwZSA9PT0gJ0ZlYXR1cmUnKSB7CgkJICAgICAgICBnZW9qc29uID0gZ2VvanNvbi5nZW9tZXRyeTsKCQkgICAgfQoJCSAgICBpZiAoIWdlb2pzb24gfHwgZ2VvanNvbi50eXBlICE9PSAnTGluZVN0cmluZycpIHsKCQkgICAgICAgIHRocm93IG5ldyBFcnJvcignSW5wdXQgbXVzdCBiZSBhIEdlb0pTT04gTGluZVN0cmluZycpOwoJCSAgICB9CgkJICAgIHJldHVybiBwb2x5bGluZS5lbmNvZGUoZmxpcHBlZChnZW9qc29uLmNvb3JkaW5hdGVzKSwgcHJlY2lzaW9uKTsKCQl9OwoKCQkvKioKCQkgKiBEZWNvZGVzIHRvIGEgR2VvSlNPTiBMaW5lU3RyaW5nIGdlb21ldHJ5LgoJCSAqCgkJICogQHBhcmFtIHtTdHJpbmd9IHN0cgoJCSAqIEBwYXJhbSB7TnVtYmVyfSBwcmVjaXNpb24KCQkgKiBAcmV0dXJucyB7T2JqZWN0fQoJCSAqLwoJCXBvbHlsaW5lLnRvR2VvSlNPTiA9IGZ1bmN0aW9uKHN0ciwgcHJlY2lzaW9uKSB7CgkJICAgIHZhciBjb29yZHMgPSBwb2x5bGluZS5kZWNvZGUoc3RyLCBwcmVjaXNpb24pOwoJCSAgICByZXR1cm4gewoJCSAgICAgICAgdHlwZTogJ0xpbmVTdHJpbmcnLAoJCSAgICAgICAgY29vcmRpbmF0ZXM6IGZsaXBwZWQoY29vcmRzKQoJCSAgICB9OwoJCX07CgoJCWlmIChtb2R1bGUuZXhwb3J0cykgewoJCSAgICBtb2R1bGUuZXhwb3J0cyA9IHBvbHlsaW5lOwoJCX0gCgl9IChwb2x5bGluZSkpOwoKCXZhciBwb2x5bGluZUV4cG9ydHMgPSBwb2x5bGluZS5leHBvcnRzOwoKCXZhciB1dGlscyA9ICgoKSA9PiB7CgoJICAgIGNvbnN0IHB1cmdlUHJvcHMgPSAob2JqLCBibGFja2xpc3QpID0+IHsKCSAgICAgICAgaWYgKG9iaikgewoJICAgICAgICAgICAgbGV0IHJzID0gT2JqZWN0LmFzc2lnbih7fSwgb2JqKTsKCSAgICAgICAgICAgIGlmIChibGFja2xpc3QpIHsKCSAgICAgICAgICAgICAgICBmb3IgKGxldCBwcm9wIG9mIGJsYWNrbGlzdCkgewoJICAgICAgICAgICAgICAgICAgICBkZWxldGUgcnNbcHJvcF07CgkgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgfQoJICAgICAgICAgICAgcmV0dXJuIHJzOwoJICAgICAgICB9CgkgICAgICAgIHJldHVybiB7fTsKCSAgICB9OwoKCSAgICBjb25zdCBtZXJnZVByb3BzID0gKG9iajEsIG9iajIpID0+IHsKCSAgICAgICAgb2JqMSA9IG9iajEgPyBvYmoxIDoge307CgkgICAgICAgIG9iajIgPSBvYmoyID8gb2JqMiA6IHt9OwoJICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihvYmoxLCBvYmoyKTsKCSAgICB9OwoKCSAgICBjb25zdCBmaXJzdCA9IGEgPT4gYVswXTsKCSAgICBjb25zdCBsYXN0ID0gYSA9PiBhW2EubGVuZ3RoIC0gMV07CgkgICAgY29uc3QgY29vcmRzVG9LZXkgPSBhID0+IGEuam9pbignLCcpOwoKCSAgICBjb25zdCBhZGRUb01hcCA9IChtLCBrLCB2KSA9PiB7CgkgICAgICAgIGxldCBhID0gbVtrXTsKCSAgICAgICAgaWYgKGEpIHsKCSAgICAgICAgICAgIGEucHVzaCh2KTsKCSAgICAgICAgfSBlbHNlIHsKCSAgICAgICAgICAgIG1ba10gPSBbdl07CgkgICAgICAgIH0KCSAgICB9OwoKCSAgICBjb25zdCByZW1vdmVGcm9tTWFwID0gKG0sIGssIHYpID0+IHsKCSAgICAgICAgbGV0IGEgPSBtW2tdOwoJICAgICAgICBsZXQgaWR4ID0gbnVsbDsKCSAgICAgICAgaWYgKGEgJiYgKGlkeCA9IGEuaW5kZXhPZih2KSkgPj0gMCkgewoJICAgICAgICAgICAgYS5zcGxpY2UoaWR4LCAxKTsKCSAgICAgICAgfQoJICAgIH07CgoJICAgIGNvbnN0IGdldEZpcnN0RnJvbU1hcCA9IChtLCBrKSA9PiB7CgkgICAgICAgIGxldCBhID0gbVtrXTsKCSAgICAgICAgaWYgKGEgJiYgYS5sZW5ndGggPiAwKSB7CgkgICAgICAgICAgICByZXR1cm4gYVswXTsKCSAgICAgICAgfQoJICAgICAgICByZXR1cm4gbnVsbDsKCSAgICB9OwoKCSAgICAvLyBuZWVkIDMrIGRpZmZlcmVudCBwb2ludHMgdG8gZm9ybSBhIHJpbmcsIGhlcmUgdXNpbmcgPiAzIGlzICdjb3ogYSB0aGUgZmlyc3QgYW5kIHRoZSBsYXN0IHBvaW50cyBhcmUgYWN0dWFsbHkgdGhlIHNhbWUKCSAgICBjb25zdCBpc1JpbmcgPSBhID0+IGEubGVuZ3RoID4gMyAmJiBjb29yZHNUb0tleShmaXJzdChhKSkgPT09IGNvb3Jkc1RvS2V5KGxhc3QoYSkpOwoKCSAgICBjb25zdCByaW5nRGlyZWN0aW9uID0gKGEsIHhJZHgsIHlJZHgpID0+IHsKCSAgICAgICAgeElkeCA9IHhJZHggfHwgMCwgeUlkeCA9IHlJZHggfHwgMTsKCSAgICAgICAgLy8gZ2V0IHRoZSBpbmRleCBvZiB0aGUgcG9pbnQgd2hpY2ggaGFzIHRoZSBtYXhpbXVtIHggdmFsdWUKCSAgICAgICAgbGV0IG0gPSBhLnJlZHVjZSgobWF4eElkeCwgdiwgaWR4KSA9PiBhW21heHhJZHhdW3hJZHhdID4gdlt4SWR4XSA/IG1heHhJZHggOiBpZHgsIDApOwoJICAgICAgICAvLyAnY296IHRoZSBmaXJzdCBwb2ludCBpcyB2aXJ0dWFsbHkgdGhlIHNhbWUgb25lIGFzIHRoZSBsYXN0IHBvaW50LCAKCSAgICAgICAgLy8gd2UgbmVlZCB0byBza2lwIGEubGVuZ3RoIC0gMSBmb3IgbGVmdCB3aGVuIG0gPSAwLAoJICAgICAgICAvLyBhbmQgc2tpcCAwIGZvciByaWdodCB3aGVuIG0gPSBhLmxlbmd0aCAtIDE7CgkgICAgICAgIGxldCBsID0gbSA8PSAwID8gYS5sZW5ndGggLSAyIDogbSAtIDEsIHIgPSBtID49IGEubGVuZ3RoIC0gMSA/IDEgOiBtICsgMTsKCSAgICAgICAgbGV0IHhhID0gYVtsXVt4SWR4XSwgeGIgPSBhW21dW3hJZHhdLCB4YyA9IGFbcl1beElkeF07CgkgICAgICAgIGxldCB5YSA9IGFbbF1beUlkeF0sIHliID0gYVttXVt5SWR4XSwgeWMgPSBhW3JdW3lJZHhdOwoJICAgICAgICBsZXQgZGV0ID0gKHhiIC0geGEpICogKHljIC0geWEpIC0gKHhjIC0geGEpICogKHliIC0geWEpOwoJICAgICAgICByZXR1cm4gZGV0IDwgMCA/ICdjbG9ja3dpc2UnIDogJ2NvdW50ZXJjbG9ja3dpc2UnOwoJICAgIH07CgoJICAgIGNvbnN0IHB0SW5zaWRlUG9seWdvbiA9IChwdCwgcG9seWdvbiwgeElkeCwgeUlkeCkgPT4gewoJICAgICAgICB4SWR4ID0geElkeCB8fCAwLCB5SWR4ID0geUlkeCB8fCAxOwoJICAgICAgICBsZXQgcmVzdWx0ID0gZmFsc2U7CgkgICAgICAgIGZvciAobGV0IGkgPSAwLCBqID0gcG9seWdvbi5sZW5ndGggLSAxOyBpIDwgcG9seWdvbi5sZW5ndGg7IGogPSBpKyspIHsKCSAgICAgICAgICAgIGlmICgocG9seWdvbltpXVt4SWR4XSA8PSBwdFt4SWR4XSAmJiBwdFt4SWR4XSA8IHBvbHlnb25bal1beElkeF0gfHwKCSAgICAgICAgICAgICAgICBwb2x5Z29uW2pdW3hJZHhdIDw9IHB0W3hJZHhdICYmIHB0W3hJZHhdIDwgcG9seWdvbltpXVt4SWR4XSkgJiYKCSAgICAgICAgICAgICAgICBwdFt5SWR4XSA8IChwb2x5Z29uW2pdW3lJZHhdIC0gcG9seWdvbltpXVt5SWR4XSkgKiAocHRbeElkeF0gLSBwb2x5Z29uW2ldW3hJZHhdKSAvIChwb2x5Z29uW2pdW3hJZHhdIC0gcG9seWdvbltpXVt4SWR4XSkgKyBwb2x5Z29uW2ldW3lJZHhdKSB7CgkgICAgICAgICAgICAgICAgcmVzdWx0ID0gIXJlc3VsdDsKCSAgICAgICAgICAgIH0KCgkgICAgICAgIH0KCSAgICAgICAgcmV0dXJuIHJlc3VsdDsKCSAgICB9OwoKCSAgICBjb25zdCBzdHJUb0Zsb2F0ID0gZWwgPT4gZWwgaW5zdGFuY2VvZiBBcnJheSA/IGVsLm1hcChzdHJUb0Zsb2F0KSA6IHBhcnNlRmxvYXQoZWwpOwoKCSAgICBjbGFzcyBSZWZFbGVtZW50cyBleHRlbmRzIE1hcCB7CgkgICAgICAgIGNvbnN0cnVjdG9yKCkgewoJICAgICAgICAgICAgc3VwZXIoKTsKCSAgICAgICAgICAgIHRoaXMuYmluZGVycyA9IFtdOwoJICAgICAgICB9CgoJICAgICAgICBhZGQoaywgdikgewoJICAgICAgICAgICAgaWYgKCF0aGlzLmhhcyhrKSkgewoJICAgICAgICAgICAgICAgIHRoaXMuc2V0KGssIHYpOwoJICAgICAgICAgICAgfQoJICAgICAgICAgICAgLy8gc3VwcHJlc3MgZHVwbGNhdGVkIGtleSBlcnJvcgoJICAgICAgICAgICAgLy8gZWxzZQoJICAgICAgICAgICAgLy8gdGhyb3cgYEVycm9yOiBhZGRpbmcgZHVwbGljYXRlZCBrZXkgJyR7a30nIHRvIFJlZkVsZW1lbnRzYDsKCSAgICAgICAgfQoKCSAgICAgICAgYWRkQmluZGVyKGJpbmRlcikgewoJICAgICAgICAgICAgdGhpcy5iaW5kZXJzLnB1c2goYmluZGVyKTsKCSAgICAgICAgfQoKCSAgICAgICAgYmluZEFsbCgpIHsKCSAgICAgICAgICAgIHRoaXMuYmluZGVycy5mb3JFYWNoKGJpbmRlciA9PiBiaW5kZXIuYmluZCgpKTsKCSAgICAgICAgfQoJICAgIH0KCgkgICAgY2xhc3MgTGF0ZUJpbmRlciB7CgkgICAgICAgIGNvbnN0cnVjdG9yKGNvbnRhaW5lciwgdmFsdWVGdW5jLCBjdHgsIGFyZ3MpIHsKCSAgICAgICAgICAgIHRoaXMuY29udGFpbmVyID0gY29udGFpbmVyOwoJICAgICAgICAgICAgdGhpcy52YWx1ZUZ1bmMgPSB2YWx1ZUZ1bmM7CgkgICAgICAgICAgICB0aGlzLmN0eCA9IGN0eDsKCSAgICAgICAgICAgIHRoaXMuYXJncyA9IGFyZ3M7CgkgICAgICAgIH0KCgkgICAgICAgIGJpbmQoKSB7CgkgICAgICAgICAgICBsZXQgdiA9IHRoaXMudmFsdWVGdW5jLmFwcGx5KHRoaXMuY3R4LCB0aGlzLmFyZ3MpOwoJICAgICAgICAgICAgaWYgKHRoaXMuY29udGFpbmVyIGluc3RhbmNlb2YgQXJyYXkpIHsKCSAgICAgICAgICAgICAgICBsZXQgaWR4ID0gdGhpcy5jb250YWluZXIuaW5kZXhPZih0aGlzKTsKCSAgICAgICAgICAgICAgICBpZiAoaWR4ID49IDApIHsKCSAgICAgICAgICAgICAgICAgICAgbGV0IGFyZ3MgPSBbaWR4LCAxXTsKCSAgICAgICAgICAgICAgICAgICAgaWYgKHYpIHsKCSAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3MucHVzaCh2KTsKCSAgICAgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgICAgICBbXS5zcGxpY2UuYXBwbHkodGhpcy5jb250YWluZXIsIGFyZ3MpOwoJICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMuY29udGFpbmVyID09PSAnb2JqZWN0JykgewoJICAgICAgICAgICAgICAgIGxldCBrID0gT2JqZWN0LmtleXModGhpcy5jb250YWluZXIpLmZpbmQodiA9PiB0aGlzLmNvbnRhaW5lclt2XSA9PT0gdGhpcyk7CgkgICAgICAgICAgICAgICAgaWYgKGspIHsKCSAgICAgICAgICAgICAgICAgICAgaWYgKHYpIHsKCSAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29udGFpbmVyW2tdID0gdjsKCSAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHsKCSAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmNvbnRhaW5lcltrXTsKCSAgICAgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgIH0KCSAgICAgICAgfQoJICAgIH0KCgkgICAgY2xhc3MgV2F5Q29sbGVjdGlvbiBleHRlbmRzIEFycmF5IHsKCSAgICAgICAgY29uc3RydWN0b3IoKSB7CgkgICAgICAgICAgICBzdXBlcigpOwoJICAgICAgICAgICAgdGhpcy5maXJzdE1hcCA9IHt9OwoJICAgICAgICAgICAgdGhpcy5sYXN0TWFwID0ge307CgkgICAgICAgIH0KCgkgICAgICAgIGFkZFdheSh3YXkpIHsKCSAgICAgICAgICAgIHdheSA9IHdheS50b0Nvb3Jkc0FycmF5KCk7CgkgICAgICAgICAgICBpZiAod2F5Lmxlbmd0aCA+IDApIHsKCSAgICAgICAgICAgICAgICB0aGlzLnB1c2god2F5KTsKCSAgICAgICAgICAgICAgICBhZGRUb01hcCh0aGlzLmZpcnN0TWFwLCBjb29yZHNUb0tleShmaXJzdCh3YXkpKSwgd2F5KTsKCSAgICAgICAgICAgICAgICBhZGRUb01hcCh0aGlzLmxhc3RNYXAsIGNvb3Jkc1RvS2V5KGxhc3Qod2F5KSksIHdheSk7CgkgICAgICAgICAgICB9CgkgICAgICAgIH0KCgkgICAgICAgIHRvU3RyaW5ncygpIHsKCSAgICAgICAgICAgIGxldCBzdHJpbmdzID0gW10sIHdheSA9IG51bGw7CgkgICAgICAgICAgICB3aGlsZSAod2F5ID0gdGhpcy5zaGlmdCgpKSB7CgkgICAgICAgICAgICAgICAgcmVtb3ZlRnJvbU1hcCh0aGlzLmZpcnN0TWFwLCBjb29yZHNUb0tleShmaXJzdCh3YXkpKSwgd2F5KTsKCSAgICAgICAgICAgICAgICByZW1vdmVGcm9tTWFwKHRoaXMubGFzdE1hcCwgY29vcmRzVG9LZXkobGFzdCh3YXkpKSwgd2F5KTsKCSAgICAgICAgICAgICAgICBsZXQgY3VycmVudCA9IHdheSwgbmV4dCA9IG51bGw7CgkgICAgICAgICAgICAgICAgZG8gewoJICAgICAgICAgICAgICAgICAgICBsZXQga2V5ID0gY29vcmRzVG9LZXkobGFzdChjdXJyZW50KSksIHNob3VsZFJldmVyc2UgPSBmYWxzZTsKCgkgICAgICAgICAgICAgICAgICAgIG5leHQgPSBnZXRGaXJzdEZyb21NYXAodGhpcy5maXJzdE1hcCwga2V5KTsKCSAgICAgICAgICAgICAgICAgICAgaWYgKCFuZXh0KSB7CgkgICAgICAgICAgICAgICAgICAgICAgICBuZXh0ID0gZ2V0Rmlyc3RGcm9tTWFwKHRoaXMubGFzdE1hcCwga2V5KTsKCSAgICAgICAgICAgICAgICAgICAgICAgIHNob3VsZFJldmVyc2UgPSB0cnVlOwoJICAgICAgICAgICAgICAgICAgICB9CgoJICAgICAgICAgICAgICAgICAgICBpZiAobmV4dCkgewoJICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zcGxpY2UodGhpcy5pbmRleE9mKG5leHQpLCAxKTsKCSAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZUZyb21NYXAodGhpcy5maXJzdE1hcCwgY29vcmRzVG9LZXkoZmlyc3QobmV4dCkpLCBuZXh0KTsKCSAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZUZyb21NYXAodGhpcy5sYXN0TWFwLCBjb29yZHNUb0tleShsYXN0KG5leHQpKSwgbmV4dCk7CgkgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2hvdWxkUmV2ZXJzZSkgewoJICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFsd2F5cyByZXZlcnNlIHNob3J0ZXIgb25lIHRvIHNhdmUgdGltZQoJICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXh0Lmxlbmd0aCA+IGN1cnJlbnQubGVuZ3RoKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtjdXJyZW50LCBuZXh0XSA9IFtuZXh0LCBjdXJyZW50XTsKCSAgICAgICAgICAgICAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dC5yZXZlcnNlKCk7CgkgICAgICAgICAgICAgICAgICAgICAgICB9CgoJICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudCA9IGN1cnJlbnQuY29uY2F0KG5leHQuc2xpY2UoMSkpOwoJICAgICAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgfSB3aGlsZSAobmV4dCk7CgkgICAgICAgICAgICAgICAgc3RyaW5ncy5wdXNoKHN0clRvRmxvYXQoY3VycmVudCkpOwoJICAgICAgICAgICAgfQoKCSAgICAgICAgICAgIHJldHVybiBzdHJpbmdzOwoJICAgICAgICB9CgoJICAgICAgICB0b1JpbmdzKGRpcmVjdGlvbikgewoJICAgICAgICAgICAgbGV0IHN0cmluZ3MgPSB0aGlzLnRvU3RyaW5ncygpOwoJICAgICAgICAgICAgbGV0IHJpbmdzID0gW10sIHN0cmluZyA9IG51bGw7CgkgICAgICAgICAgICB3aGlsZSAoc3RyaW5nID0gc3RyaW5ncy5zaGlmdCgpKSB7CgkgICAgICAgICAgICAgICAgaWYgKGlzUmluZyhzdHJpbmcpKSB7CgkgICAgICAgICAgICAgICAgICAgIGlmIChyaW5nRGlyZWN0aW9uKHN0cmluZykgIT09IGRpcmVjdGlvbikgewoJICAgICAgICAgICAgICAgICAgICAgICAgc3RyaW5nLnJldmVyc2UoKTsKCSAgICAgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgICAgICByaW5ncy5wdXNoKHN0cmluZyk7CgkgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgfQoJICAgICAgICAgICAgcmV0dXJuIHJpbmdzOwoJICAgICAgICB9CgkgICAgfQoKCSAgICByZXR1cm4gewoJICAgICAgICBwdXJnZVByb3BzLCBtZXJnZVByb3BzLAoJICAgICAgICBmaXJzdCwgbGFzdCwgY29vcmRzVG9LZXksCgkgICAgICAgIGFkZFRvTWFwLCByZW1vdmVGcm9tTWFwLCBnZXRGaXJzdEZyb21NYXAsCgkgICAgICAgIGlzUmluZywgcmluZ0RpcmVjdGlvbiwgcHRJbnNpZGVQb2x5Z29uLCBzdHJUb0Zsb2F0LAoJICAgICAgICBSZWZFbGVtZW50cywgTGF0ZUJpbmRlciwgV2F5Q29sbGVjdGlvbgoJICAgIH07Cgl9KSgpOwoKCXZhciBidWlsZGluZyA9IHsKCX07Cgl2YXIgaGlnaHdheSA9IHsKCQl3aGl0ZWxpc3Q6IFsKCQkJInNlcnZpY2VzIiwKCQkJInJlc3RfYXJlYSIsCgkJCSJlc2NhcGUiLAoJCQkiZWxldmF0b3IiCgkJXQoJfTsKCXZhciBuYXR1cmFsID0gewoJCWJsYWNrbGlzdDogWwoJCQkiY29hc3RsaW5lIiwKCQkJImNsaWZmIiwKCQkJInJpZGdlIiwKCQkJImFyZXRlIiwKCQkJInRyZWVfcm93IgoJCV0KCX07Cgl2YXIgbGFuZHVzZSA9IHsKCX07Cgl2YXIgd2F0ZXJ3YXkgPSB7CgkJd2hpdGVsaXN0OiBbCgkJCSJyaXZlcmJhbmsiLAoJCQkiZG9jayIsCgkJCSJib2F0eWFyZCIsCgkJCSJkYW0iCgkJXQoJfTsKCXZhciBhbWVuaXR5ID0gewoJfTsKCXZhciBsZWlzdXJlID0gewoJfTsKCXZhciBiYXJyaWVyID0gewoJCXdoaXRlbGlzdDogWwoJCQkiY2l0eV93YWxsIiwKCQkJImRpdGNoIiwKCQkJImhlZGdlIiwKCQkJInJldGFpbmluZ193YWxsIiwKCQkJIndhbGwiLAoJCQkic3Bpa2VzIgoJCV0KCX07Cgl2YXIgcmFpbHdheSA9IHsKCQl3aGl0ZWxpc3Q6IFsKCQkJInN0YXRpb24iLAoJCQkidHVybnRhYmxlIiwKCQkJInJvdW5kaG91c2UiLAoJCQkicGxhdGZvcm0iCgkJXQoJfTsKCXZhciBhcmVhID0gewoJfTsKCXZhciBib3VuZGFyeSA9IHsKCX07Cgl2YXIgbWFuX21hZGUgPSB7CgkJYmxhY2tsaXN0OiBbCgkJCSJjdXRsaW5lIiwKCQkJImVtYmFua21lbnQiLAoJCQkicGlwZWxpbmUiCgkJXQoJfTsKCXZhciBwb3dlciA9IHsKCQl3aGl0ZWxpc3Q6IFsKCQkJInBsYW50IiwKCQkJInN1YnN0YXRpb24iLAoJCQkiZ2VuZXJhdG9yIiwKCQkJInRyYW5zZm9ybWVyIgoJCV0KCX07Cgl2YXIgcGxhY2UgPSB7Cgl9OwoJdmFyIHNob3AgPSB7Cgl9OwoJdmFyIGFlcm93YXkgPSB7CgkJYmxhY2tsaXN0OiBbCgkJCSJ0YXhpd2F5IgoJCV0KCX07Cgl2YXIgdG91cmlzbSA9IHsKCX07Cgl2YXIgaGlzdG9yaWMgPSB7Cgl9OwoJdmFyIHB1YmxpY190cmFuc3BvcnQgPSB7Cgl9OwoJdmFyIG9mZmljZSA9IHsKCX07Cgl2YXIgbWlsaXRhcnkgPSB7Cgl9OwoJdmFyIHJ1aW5zID0gewoJfTsKCXZhciBjcmFmdCA9IHsKCX07Cgl2YXIgZ29sZiA9IHsKCX07Cgl2YXIgaW5kb29yID0gewoJfTsKCXZhciByZXF1aXJlJCQxID0gewoJCWJ1aWxkaW5nOiBidWlsZGluZywKCQloaWdod2F5OiBoaWdod2F5LAoJCW5hdHVyYWw6IG5hdHVyYWwsCgkJbGFuZHVzZTogbGFuZHVzZSwKCQl3YXRlcndheTogd2F0ZXJ3YXksCgkJYW1lbml0eTogYW1lbml0eSwKCQlsZWlzdXJlOiBsZWlzdXJlLAoJCWJhcnJpZXI6IGJhcnJpZXIsCgkJcmFpbHdheTogcmFpbHdheSwKCQlhcmVhOiBhcmVhLAoJCWJvdW5kYXJ5OiBib3VuZGFyeSwKCQltYW5fbWFkZTogbWFuX21hZGUsCgkJcG93ZXI6IHBvd2VyLAoJCXBsYWNlOiBwbGFjZSwKCQlzaG9wOiBzaG9wLAoJCWFlcm93YXk6IGFlcm93YXksCgkJdG91cmlzbTogdG91cmlzbSwKCQloaXN0b3JpYzogaGlzdG9yaWMsCgkJcHVibGljX3RyYW5zcG9ydDogcHVibGljX3RyYW5zcG9ydCwKCQlvZmZpY2U6IG9mZmljZSwKCQkiYnVpbGRpbmc6cGFydCI6IHsKCX0sCgkJbWlsaXRhcnk6IG1pbGl0YXJ5LAoJCXJ1aW5zOiBydWlucywKCQkiYXJlYTpoaWdod2F5IjogewoJfSwKCQljcmFmdDogY3JhZnQsCgkJZ29sZjogZ29sZiwKCQlpbmRvb3I6IGluZG9vcgoJfTsKCgl2YXIgb3Ntb2JqcyA9ICgoKSA9PiB7CgoJICAgIGNvbnN0IHsgZmlyc3QsIGxhc3QsIGNvb3Jkc1RvS2V5LAoJICAgICAgICBhZGRUb01hcCwgcmVtb3ZlRnJvbU1hcCwgZ2V0Rmlyc3RGcm9tTWFwLAoJICAgICAgICBpc1JpbmcsIHJpbmdEaXJlY3Rpb24sIHB0SW5zaWRlUG9seWdvbiwgc3RyVG9GbG9hdCwKCSAgICAgICAgTGF0ZUJpbmRlciwgV2F5Q29sbGVjdGlvbiB9ID0gdXRpbHMsCgkgICAgICAgIHBvbHlnb25UYWdzID0gcmVxdWlyZSQkMTsKCgkgICAgY2xhc3MgT3NtT2JqZWN0IHsKCSAgICAgICAgY29uc3RydWN0b3IodHlwZSwgaWQsIHJlZkVsZW1zKSB7CgkgICAgICAgICAgICB0aGlzLnR5cGUgPSB0eXBlOwoJICAgICAgICAgICAgdGhpcy5pZCA9IGlkOwoJICAgICAgICAgICAgdGhpcy5yZWZFbGVtcyA9IHJlZkVsZW1zOwoJICAgICAgICAgICAgdGhpcy50YWdzID0ge307CgkgICAgICAgICAgICB0aGlzLnByb3BzID0geyBpZDogdGhpcy5nZXRDb21wb3NpdGVJZCgpIH07CgkgICAgICAgICAgICB0aGlzLnJlZkNvdW50ID0gMDsKCSAgICAgICAgICAgIHRoaXMuaGFzVGFnID0gZmFsc2U7CgkgICAgICAgICAgICBpZiAocmVmRWxlbXMpIHsKCSAgICAgICAgICAgICAgICByZWZFbGVtcy5hZGQodGhpcy5nZXRDb21wb3NpdGVJZCgpLCB0aGlzKTsKCSAgICAgICAgICAgIH0KCSAgICAgICAgfQoKCSAgICAgICAgYWRkVGFncyh0YWdzKSB7CgkgICAgICAgICAgICB0aGlzLnRhZ3MgPSBPYmplY3QuYXNzaWduKHRoaXMudGFncywgdGFncyk7CgkgICAgICAgICAgICB0aGlzLmhhc1RhZyA9IHRhZ3MgPyB0cnVlIDogZmFsc2U7CgkgICAgICAgIH0KCgkgICAgICAgIGFkZFRhZyhrLCB2KSB7CgkgICAgICAgICAgICB0aGlzLnRhZ3Nba10gPSB2OwoJICAgICAgICAgICAgdGhpcy5oYXNUYWcgPSBrID8gdHJ1ZSA6IGZhbHNlOwoJICAgICAgICB9CgoJICAgICAgICBhZGRQcm9wKGssIHYpIHsKCSAgICAgICAgICAgIHRoaXMucHJvcHNba10gPSB2OwoJICAgICAgICB9CgoJICAgICAgICBhZGRQcm9wcyhwcm9wcykgewoJICAgICAgICAgICAgdGhpcy5wcm9wcyA9IE9iamVjdC5hc3NpZ24odGhpcy5wcm9wcywgcHJvcHMpOwoJICAgICAgICB9CgoJICAgICAgICBnZXRDb21wb3NpdGVJZCgpIHsKCSAgICAgICAgICAgIHJldHVybiBgJHt0aGlzLnR5cGV9LyR7dGhpcy5pZH1gOwoJICAgICAgICB9CgoJICAgICAgICBnZXRQcm9wcygpIHsKCSAgICAgICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHRoaXMucHJvcHMsIHRoaXMudGFncyk7CgkgICAgICAgIH0KCgkgICAgICAgIHRvRmVhdHVyZUFycmF5KCkgewoJICAgICAgICAgICAgcmV0dXJuIFtdOwoJICAgICAgICB9CgkgICAgfQoKCSAgICBjbGFzcyBOb2RlIGV4dGVuZHMgT3NtT2JqZWN0IHsKCSAgICAgICAgY29uc3RydWN0b3IoaWQsIHJlZkVsZW1zKSB7CgkgICAgICAgICAgICBzdXBlcignbm9kZScsIGlkLCByZWZFbGVtcyk7CgkgICAgICAgICAgICB0aGlzLmxhdExuZyA9IG51bGw7CgkgICAgICAgIH0KCgkgICAgICAgIHNldExhdExuZyhsYXRMbmcpIHsKCSAgICAgICAgICAgIHRoaXMubGF0TG5nID0gbGF0TG5nOwoJICAgICAgICB9CgoJICAgICAgICB0b0ZlYXR1cmVBcnJheSgpIHsKCSAgICAgICAgICAgIGlmICh0aGlzLmxhdExuZykgewoJICAgICAgICAgICAgICAgIHJldHVybiBbewoJICAgICAgICAgICAgICAgICAgICB0eXBlOiAnRmVhdHVyZScsCgkgICAgICAgICAgICAgICAgICAgIGlkOiB0aGlzLmdldENvbXBvc2l0ZUlkKCksCgkgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHRoaXMuZ2V0UHJvcHMoKSwKCSAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cnk6IHsKCSAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdQb2ludCcsCgkgICAgICAgICAgICAgICAgICAgICAgICBjb29yZGluYXRlczogc3RyVG9GbG9hdChbdGhpcy5sYXRMbmcubG9uLCB0aGlzLmxhdExuZy5sYXRdKQoJICAgICAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgfV07CgkgICAgICAgICAgICB9CgoJICAgICAgICAgICAgcmV0dXJuIFtdOwoJICAgICAgICB9CgoJICAgICAgICBnZXRMYXRMbmcoKSB7CgkgICAgICAgICAgICByZXR1cm4gdGhpcy5sYXRMbmc7CgkgICAgICAgIH0KCSAgICB9CgoJICAgIGNsYXNzIFdheSBleHRlbmRzIE9zbU9iamVjdCB7CgkgICAgICAgIGNvbnN0cnVjdG9yKGlkLCByZWZFbGVtcykgewoJICAgICAgICAgICAgc3VwZXIoJ3dheScsIGlkLCByZWZFbGVtcyk7CgkgICAgICAgICAgICB0aGlzLmxhdExuZ0FycmF5ID0gW107CgkgICAgICAgICAgICB0aGlzLmlzUG9seWdvbiA9IGZhbHNlOwoJICAgICAgICB9CgoJICAgICAgICBhZGRMYXRMbmcobGF0TG5nKSB7CgkgICAgICAgICAgICB0aGlzLmxhdExuZ0FycmF5LnB1c2gobGF0TG5nKTsKCSAgICAgICAgfQoKCSAgICAgICAgc2V0TGF0TG5nQXJyYXkobGF0TG5nQXJyYXkpIHsKCSAgICAgICAgICAgIHRoaXMubGF0TG5nQXJyYXkgPSBsYXRMbmdBcnJheTsKCSAgICAgICAgfQoKCSAgICAgICAgYWRkTm9kZVJlZihyZWYpIHsKCSAgICAgICAgICAgIGxldCBiaW5kZXIgPSBuZXcgTGF0ZUJpbmRlcih0aGlzLmxhdExuZ0FycmF5LCBmdW5jdGlvbiAoaWQpIHsKCSAgICAgICAgICAgICAgICBsZXQgbm9kZSA9IHRoaXMucmVmRWxlbXMuZ2V0KGBub2RlLyR7aWR9YCk7CgkgICAgICAgICAgICAgICAgaWYgKG5vZGUpIHsKCSAgICAgICAgICAgICAgICAgICAgbm9kZS5yZWZDb3VudCsrOwoJICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm9kZS5nZXRMYXRMbmcoKTsKCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICB9LCB0aGlzLCBbcmVmXSk7CgoJICAgICAgICAgICAgdGhpcy5sYXRMbmdBcnJheS5wdXNoKGJpbmRlcik7CgkgICAgICAgICAgICB0aGlzLnJlZkVsZW1zLmFkZEJpbmRlcihiaW5kZXIpOwoJICAgICAgICB9CgoJICAgICAgICBhbmFseXplR2VvbWV0cnlUeXBlKGssIHYpIHsKCSAgICAgICAgICAgIGxldCBvID0gcG9seWdvblRhZ3Nba107CgkgICAgICAgICAgICBpZiAobykgewoJICAgICAgICAgICAgICAgIHRoaXMuaXNQb2x5Z29uID0gdHJ1ZTsKCSAgICAgICAgICAgICAgICBpZiAoby53aGl0ZWxpc3QpIHsKCSAgICAgICAgICAgICAgICAgICAgdGhpcy5pc1BvbHlnb24gPSBvLndoaXRlbGlzdC5pbmRleE9mKHYpID49IDAgPyB0cnVlIDogZmFsc2U7CgkgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChvLmJsYWNrbGlzdCkgewoJICAgICAgICAgICAgICAgICAgICB0aGlzLmlzUG9seWdvbiA9IG8uYmxhY2tsaXN0LmluZGV4T2YodikgPj0gMCA/IGZhbHNlIDogdHJ1ZTsKCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICB9CgkgICAgICAgIH0KCgkgICAgICAgIGFkZFRhZ3ModGFncykgewoJICAgICAgICAgICAgc3VwZXIuYWRkVGFncyh0YWdzKTsKCSAgICAgICAgICAgIGZvciAobGV0IFtrLCB2XSBvZiBPYmplY3QuZW50cmllcyh0YWdzKSkgewoJICAgICAgICAgICAgICAgIHRoaXMuYW5hbHl6ZUdlb21ldHJ5VHlwZShrLCB2KTsKCSAgICAgICAgICAgIH0KCSAgICAgICAgfQoKCSAgICAgICAgYWRkVGFnKGssIHYpIHsKCSAgICAgICAgICAgIHN1cGVyLmFkZFRhZyhrLCB2KTsKCSAgICAgICAgICAgIHRoaXMuYW5hbHl6ZUdlb21ldHJ5VHlwZShrLCB2KTsKCSAgICAgICAgfQoKCSAgICAgICAgdG9Db29yZHNBcnJheSgpIHsKCSAgICAgICAgICAgIHJldHVybiB0aGlzLmxhdExuZ0FycmF5Lm1hcChsYXRMbmcgPT4gW2xhdExuZy5sb24sIGxhdExuZy5sYXRdKTsKCSAgICAgICAgfQoKCSAgICAgICAgdG9GZWF0dXJlQXJyYXkoKSB7CgkgICAgICAgICAgICBsZXQgY29vcmRzQXJyYXkgPSB0aGlzLnRvQ29vcmRzQXJyYXkoKTsKCSAgICAgICAgICAgIGlmIChjb29yZHNBcnJheS5sZW5ndGggPiAxKSB7CgkgICAgICAgICAgICAgICAgY29vcmRzQXJyYXkgPSBzdHJUb0Zsb2F0KGNvb3Jkc0FycmF5KTsKCSAgICAgICAgICAgICAgICBsZXQgZmVhdHVyZSA9IHsKCSAgICAgICAgICAgICAgICAgICAgdHlwZTogJ0ZlYXR1cmUnLAoJICAgICAgICAgICAgICAgICAgICBpZDogdGhpcy5nZXRDb21wb3NpdGVJZCgpLAoJICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB0aGlzLmdldFByb3BzKCksCgkgICAgICAgICAgICAgICAgICAgIGdlb21ldHJ5OiB7CgkgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnTGluZVN0cmluZycsCgkgICAgICAgICAgICAgICAgICAgICAgICBjb29yZGluYXRlczogY29vcmRzQXJyYXkKCSAgICAgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgIH07CgoJICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzUG9seWdvbiAmJiBpc1JpbmcoY29vcmRzQXJyYXkpKSB7CgkgICAgICAgICAgICAgICAgICAgIGlmIChyaW5nRGlyZWN0aW9uKGNvb3Jkc0FycmF5KSAhPT0gJ2NvdW50ZXJjbG9ja3dpc2UnKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICBjb29yZHNBcnJheS5yZXZlcnNlKCk7CgkgICAgICAgICAgICAgICAgICAgIH0KCgkgICAgICAgICAgICAgICAgICAgIGZlYXR1cmUuZ2VvbWV0cnkgPSB7CgkgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnUG9seWdvbicsCgkgICAgICAgICAgICAgICAgICAgICAgICBjb29yZGluYXRlczogW2Nvb3Jkc0FycmF5XQoJICAgICAgICAgICAgICAgICAgICB9OwoKCSAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtmZWF0dXJlXTsKCSAgICAgICAgICAgICAgICB9CgoJICAgICAgICAgICAgICAgIHJldHVybiBbZmVhdHVyZV07CgkgICAgICAgICAgICB9CgoJICAgICAgICAgICAgcmV0dXJuIFtdOwoJICAgICAgICB9CgkgICAgfQoKCSAgICBjbGFzcyBSZWxhdGlvbiBleHRlbmRzIE9zbU9iamVjdCB7CgkgICAgICAgIGNvbnN0cnVjdG9yKGlkLCByZWZFbGVtcykgewoJICAgICAgICAgICAgc3VwZXIoJ3JlbGF0aW9uJywgaWQsIHJlZkVsZW1zKTsKCSAgICAgICAgICAgIHRoaXMucmVsYXRpb25zID0gW107CgkgICAgICAgICAgICB0aGlzLm5vZGVzID0gW107CgkgICAgICAgICAgICB0aGlzLmJvdW5kcyA9IG51bGw7CgkgICAgICAgIH0KCgkgICAgICAgIHNldEJvdW5kcyhib3VuZHMpIHsKCSAgICAgICAgICAgIHRoaXMuYm91bmRzID0gYm91bmRzOwoJICAgICAgICB9CgoJICAgICAgICBhZGRNZW1iZXIobWVtYmVyKSB7CgkgICAgICAgICAgICBzd2l0Y2ggKG1lbWJlci50eXBlKSB7CgkgICAgICAgICAgICAgICAgLy8gc3VwZXIgcmVsYXRpb24sIG5lZWQgdG8gZG8gY29tYmluYXRpb24KCSAgICAgICAgICAgICAgICBjYXNlICdyZWxhdGlvbic6CgkgICAgICAgICAgICAgICAgICAgIGxldCBiaW5kZXIgPSBuZXcgTGF0ZUJpbmRlcih0aGlzLnJlbGF0aW9ucywgZnVuY3Rpb24gKGlkKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmVsYXRpb24gPSB0aGlzLnJlZkVsZW1zLmdldChgcmVsYXRpb24vJHtpZH1gKTsKCSAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZWxhdGlvbikgewoJICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbGF0aW9uLnJlZkNvdW50Kys7CgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlbGF0aW9uOwoJICAgICAgICAgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgICAgICB9LCB0aGlzLCBbbWVtYmVyLnJlZl0pOwoJICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbGF0aW9ucy5wdXNoKGJpbmRlcik7CgkgICAgICAgICAgICAgICAgICAgIHRoaXMucmVmRWxlbXMuYWRkQmluZGVyKGJpbmRlcik7CgkgICAgICAgICAgICAgICAgICAgIGJyZWFrOwoKCSAgICAgICAgICAgICAgICBjYXNlICd3YXknOgoJICAgICAgICAgICAgICAgICAgICBpZiAoIW1lbWJlci5yb2xlKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICBtZW1iZXIucm9sZSA9ICcnOwoJICAgICAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgICAgIGxldCB3YXlzID0gdGhpc1ttZW1iZXIucm9sZV07CgkgICAgICAgICAgICAgICAgICAgIGlmICghd2F5cykgewoJICAgICAgICAgICAgICAgICAgICAgICAgd2F5cyA9IHRoaXNbbWVtYmVyLnJvbGVdID0gW107CgkgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICAgICAgaWYgKG1lbWJlci5nZW9tZXRyeSkgewoJICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHdheSA9IG5ldyBXYXkobWVtYmVyLnJlZiwgdGhpcy5yZWZFbGVtcyk7CgkgICAgICAgICAgICAgICAgICAgICAgICB3YXkuc2V0TGF0TG5nQXJyYXkobWVtYmVyLmdlb21ldHJ5KTsKCSAgICAgICAgICAgICAgICAgICAgICAgIHdheS5yZWZDb3VudCsrOwoJICAgICAgICAgICAgICAgICAgICAgICAgd2F5cy5wdXNoKHdheSk7CgkgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobWVtYmVyLm5vZGVzKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICBsZXQgd2F5ID0gbmV3IFdheShtZW1iZXIucmVmLCB0aGlzLnJlZkVsZW1zKTsKCSAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG5pZCBvZiBtZW1iZXIubm9kZXMpIHsKCSAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXkuYWRkTm9kZVJlZihuaWQpOwoJICAgICAgICAgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgICAgICAgICAgd2F5LnJlZkNvdW50Kys7CgkgICAgICAgICAgICAgICAgICAgICAgICB3YXlzLnB1c2god2F5KTsKCSAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHsKCSAgICAgICAgICAgICAgICAgICAgICAgIGxldCBiaW5kZXIgPSBuZXcgTGF0ZUJpbmRlcih3YXlzLCBmdW5jdGlvbiAoaWQpIHsKCSAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgd2F5ID0gdGhpcy5yZWZFbGVtcy5nZXQoYHdheS8ke2lkfWApOwoJICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh3YXkpIHsKCSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F5LnJlZkNvdW50Kys7CgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB3YXk7CgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGhpcywgW21lbWJlci5yZWZdKTsKCSAgICAgICAgICAgICAgICAgICAgICAgIHdheXMucHVzaChiaW5kZXIpOwoJICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWZFbGVtcy5hZGRCaW5kZXIoYmluZGVyKTsKCSAgICAgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgICAgICBicmVhazsKCgkgICAgICAgICAgICAgICAgY2FzZSAnbm9kZSc6CgkgICAgICAgICAgICAgICAgICAgIGxldCBub2RlID0gbnVsbDsKCSAgICAgICAgICAgICAgICAgICAgaWYgKG1lbWJlci5sYXQgJiYgbWVtYmVyLmxvbikgewoJICAgICAgICAgICAgICAgICAgICAgICAgbm9kZSA9IG5ldyBOb2RlKG1lbWJlci5yZWYsIHRoaXMucmVmRWxlbXMpOwoJICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5zZXRMYXRMbmcoeyBsb246IG1lbWJlci5sb24sIGxhdDogbWVtYmVyLmxhdCB9KTsKCSAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtZW1iZXIudGFncykgewoJICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuYWRkVGFncyhtZW1iZXIudGFncyk7CgkgICAgICAgICAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBbaywgdl0gb2YgT2JqZWN0LmVudHJpZXMobWVtYmVyKSkgewoJICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChbJ2lkJywgJ3R5cGUnLCAnbGF0JywgJ2xvbiddLmluZGV4T2YoaykgPCAwKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuYWRkUHJvcChrLCB2KTsKCSAgICAgICAgICAgICAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgICAgICAgICB9CgoJICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5yZWZDb3VudCsrOwoJICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2Rlcy5wdXNoKG5vZGUpOwoJICAgICAgICAgICAgICAgICAgICB9IGVsc2UgewoJICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGJpbmRlciA9IG5ldyBMYXRlQmluZGVyKHRoaXMubm9kZXMsIGZ1bmN0aW9uIChpZCkgewoJICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBub2RlID0gdGhpcy5yZWZFbGVtcy5nZXQoYG5vZGUvJHtpZH1gKTsKCSAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobm9kZSkgewoJICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLnJlZkNvdW50Kys7CgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBub2RlOwoJICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRoaXMsIFttZW1iZXIucmVmXSk7CgkgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5vZGVzLnB1c2goYmluZGVyKTsKCSAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVmRWxlbXMuYWRkQmluZGVyKGJpbmRlcik7CgkgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICAgICAgYnJlYWs7CgkgICAgICAgICAgICB9CgkgICAgICAgIH0KCgkgICAgICAgIHRvRmVhdHVyZUFycmF5KCkgewoJICAgICAgICAgICAgY29uc3QgY29uc3RydWN0U3RyaW5nR2VvbWV0cnkgPSAod3MpID0+IHsKCSAgICAgICAgICAgICAgICBsZXQgc3RyaW5ncyA9IHdzID8gd3MudG9TdHJpbmdzKCkgOiBbXTsKCSAgICAgICAgICAgICAgICBpZiAoc3RyaW5ncy5sZW5ndGggPiAwKSB7CgkgICAgICAgICAgICAgICAgICAgIGlmIChzdHJpbmdzLmxlbmd0aCA9PT0gMSkgcmV0dXJuIHsKCSAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdMaW5lU3RyaW5nJywKCSAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBzdHJpbmdzWzBdCgkgICAgICAgICAgICAgICAgICAgIH0KCgkgICAgICAgICAgICAgICAgICAgIHJldHVybiB7CgkgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnTXVsdGlMaW5lU3RyaW5nJywKCSAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBzdHJpbmdzCgkgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7CgkgICAgICAgICAgICB9OwoKCSAgICAgICAgICAgIGNvbnN0IGNvbnN0cnVjdFBvbHlnb25HZW9tZXRyeSA9IChvd3MsIGl3cykgPT4gewoJICAgICAgICAgICAgICAgIGxldCBvdXRlclJpbmdzID0gb3dzID8gb3dzLnRvUmluZ3MoJ2NvdW50ZXJjbG9ja3dpc2UnKSA6IFtdLAoJICAgICAgICAgICAgICAgICAgICBpbm5lclJpbmdzID0gaXdzID8gaXdzLnRvUmluZ3MoJ2Nsb2Nrd2lzZScpIDogW107CgoJICAgICAgICAgICAgICAgIGlmIChvdXRlclJpbmdzLmxlbmd0aCA+IDApIHsKCSAgICAgICAgICAgICAgICAgICAgbGV0IGNvbXBvc2l0UG9seW9ucyA9IFtdOwoKCSAgICAgICAgICAgICAgICAgICAgbGV0IHJpbmcgPSBudWxsOwoJICAgICAgICAgICAgICAgICAgICBmb3IgKHJpbmcgb2Ygb3V0ZXJSaW5ncykKCSAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvc2l0UG9seW9ucy5wdXNoKFtyaW5nXSk7CgoJICAgICAgICAgICAgICAgICAgICAvLyBsaW5rIGlubmVyIHBvbHlnb25zIHRvIG91dGVyIGNvbnRhaW5lcnMKCSAgICAgICAgICAgICAgICAgICAgd2hpbGUgKHJpbmcgPSBpbm5lclJpbmdzLnNoaWZ0KCkpIHsKCSAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGlkeCBpbiBvdXRlclJpbmdzKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHB0SW5zaWRlUG9seWdvbihmaXJzdChyaW5nKSwgb3V0ZXJSaW5nc1tpZHhdKSkgewoJICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb3NpdFBvbHlvbnNbaWR4XS5wdXNoKHJpbmcpOwoJICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhazsKCSAgICAgICAgICAgICAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgICAgIH0KCgkgICAgICAgICAgICAgICAgICAgIC8vIGNvbnN0cnVjdCB0aGUgUG9seWdvbi9NdWx0aVBvbHlnb24gZ2VvbWV0cnkKCSAgICAgICAgICAgICAgICAgICAgaWYgKGNvbXBvc2l0UG9seW9ucy5sZW5ndGggPT09IDEpIHsKCSAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7CgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ1BvbHlnb24nLAoJICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBjb21wb3NpdFBvbHlvbnNbMF0KCSAgICAgICAgICAgICAgICAgICAgICAgIH07CgkgICAgICAgICAgICAgICAgICAgIH0KCgkgICAgICAgICAgICAgICAgICAgIHJldHVybiB7CgkgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnTXVsdGlQb2x5Z29uJywKCSAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBjb21wb3NpdFBvbHlvbnMKCSAgICAgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgIH0KCgkgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7CgkgICAgICAgICAgICB9OwoKCSAgICAgICAgICAgIGxldCBwb2x5Z29uRmVhdHVyZXMgPSBbXSwgc3RyaW5nRmVhdHVyZXMgPSBbXSwgcG9pbnRGZWF0dXJlcyA9IFtdOwoJICAgICAgICAgICAgY29uc3Qgd2F5c0ZpZWxkTmFtZXMgPSBbJ291dGVyJywgJ2lubmVyJywgJyddOwoJICAgICAgICAgICAgLy8gbmVlZCB0byBkbyBjb21iaW5hdGlvbiB3aGVuIHRoZXJlJ3JlIG5lc3RlZCByZWxhdGlvbnMKCSAgICAgICAgICAgIGZvciAobGV0IHJlbGF0aW9uIG9mIHRoaXMucmVsYXRpb25zKSB7CgkgICAgICAgICAgICAgICAgaWYgKHJlbGF0aW9uKSB7CgkgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGZpZWxkTmFtZSBvZiB3YXlzRmllbGROYW1lcykgewoJICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHdheXMgPSByZWxhdGlvbltmaWVsZE5hbWVdOwoJICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHdheXMpIHsKCSAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGhpc1dheXMgPSB0aGlzW2ZpZWxkTmFtZV07CgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXNXYXlzKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtdLnNwbGljZS5hcHBseSh0aGlzV2F5cywgW3RoaXNXYXlzLmxlbmd0aCwgMF0uY29uY2F0KHdheXMpKTsKCSAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgewoJICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzW2ZpZWxkTmFtZV0gPSB3YXlzOwoJICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgIH0KCgkgICAgICAgICAgICBmb3IgKGxldCBmaWVsZE5hbWUgb2Ygd2F5c0ZpZWxkTmFtZXMpIHsKCSAgICAgICAgICAgICAgICBsZXQgd2F5cyA9IHRoaXNbZmllbGROYW1lXTsKCSAgICAgICAgICAgICAgICBpZiAod2F5cykgewoJICAgICAgICAgICAgICAgICAgICB0aGlzW2ZpZWxkTmFtZV0gPSBuZXcgV2F5Q29sbGVjdGlvbigpOwoJICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCB3YXkgb2Ygd2F5cykgewoJICAgICAgICAgICAgICAgICAgICAgICAgdGhpc1tmaWVsZE5hbWVdLmFkZFdheSh3YXkpOwoJICAgICAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgfQoKCSAgICAgICAgICAgIGxldCBnZW9tZXRyeSA9IG51bGw7CgoJICAgICAgICAgICAgbGV0IGZlYXR1cmUgPSB7CgkgICAgICAgICAgICAgICAgdHlwZTogJ0ZlYXR1cmUnLAoJICAgICAgICAgICAgICAgIGlkOiB0aGlzLmdldENvbXBvc2l0ZUlkKCksCgkgICAgICAgICAgICAgICAgYmJveDogdGhpcy5ib3VuZHMsCgkgICAgICAgICAgICAgICAgcHJvcGVydGllczogdGhpcy5nZXRQcm9wcygpCgkgICAgICAgICAgICB9OwoKCSAgICAgICAgICAgIGlmICghdGhpcy5ib3VuZHMpIHsKCSAgICAgICAgICAgICAgICBkZWxldGUgZmVhdHVyZS5iYm94OwoJICAgICAgICAgICAgfQoKCSAgICAgICAgICAgIGlmICh0aGlzLm91dGVyKSB7CgkgICAgICAgICAgICAgICAgZ2VvbWV0cnkgPSBjb25zdHJ1Y3RQb2x5Z29uR2VvbWV0cnkodGhpcy5vdXRlciwgdGhpcy5pbm5lcik7CgkgICAgICAgICAgICAgICAgaWYgKGdlb21ldHJ5KSB7CgkgICAgICAgICAgICAgICAgICAgIGZlYXR1cmUuZ2VvbWV0cnkgPSBnZW9tZXRyeTsKCSAgICAgICAgICAgICAgICAgICAgcG9seWdvbkZlYXR1cmVzLnB1c2goZmVhdHVyZSk7CgkgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgfQoJICAgICAgICAgICAgZWxzZSBpZiAodGhpc1snJ10pIHsKCSAgICAgICAgICAgICAgICBnZW9tZXRyeSA9IGNvbnN0cnVjdFN0cmluZ0dlb21ldHJ5KHRoaXNbJyddKTsKCSAgICAgICAgICAgICAgICBpZiAoZ2VvbWV0cnkpIHsKCSAgICAgICAgICAgICAgICAgICAgZmVhdHVyZS5nZW9tZXRyeSA9IGdlb21ldHJ5OwoJICAgICAgICAgICAgICAgICAgICBzdHJpbmdGZWF0dXJlcy5wdXNoKGZlYXR1cmUpOwoJICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgIH0KCgkgICAgICAgICAgICBmb3IgKGxldCBub2RlIG9mIHRoaXMubm9kZXMpIHsKCSAgICAgICAgICAgICAgICBwb2ludEZlYXR1cmVzID0gcG9pbnRGZWF0dXJlcy5jb25jYXQobm9kZS50b0ZlYXR1cmVBcnJheSgpKTsKCSAgICAgICAgICAgIH0KCgkgICAgICAgICAgICByZXR1cm4gcG9seWdvbkZlYXR1cmVzLmNvbmNhdChzdHJpbmdGZWF0dXJlcykuY29uY2F0KHBvaW50RmVhdHVyZXMpOwoJICAgICAgICB9CgkgICAgfQoKCSAgICByZXR1cm4geyBOb2RlLCBXYXksIFJlbGF0aW9uIH07Cgl9KSgpOwoKCXZhciB4bWxwYXJzZXIgPSAoKCkgPT4gewoKCSAgICBmdW5jdGlvbiBjb25kaXRpb25lZChldnQpIHsKCSAgICAgICAgcmV0dXJuIGV2dC5tYXRjaCgvXiguKz8pXFsoLis/KVxdPiQvZykgIT0gbnVsbDsKCSAgICB9CgoJICAgIGZ1bmN0aW9uIHBhcnNlRXZlbnQoZXZ0KSB7CgkgICAgICAgIGxldCBtYXRjaCA9IC9eKC4rPylcWyguKz8pXF0+JC9nLmV4ZWMoZXZ0KTsKCSAgICAgICAgaWYgKG1hdGNoKSB7CgkgICAgICAgICAgICByZXR1cm4geyBldnQ6IG1hdGNoWzFdICsgJz4nLCBleHA6IG1hdGNoWzJdIH07CgkgICAgICAgIH0KCSAgICAgICAgcmV0dXJuIHsgZXZ0OiBldnQgfTsKCSAgICB9CgoJICAgIGZ1bmN0aW9uIGdlbkNvbmRpdGlvbkZ1bmMoY29uZCkgewoJICAgICAgICBsZXQgYm9keSA9ICdyZXR1cm4gJyArIGNvbmQucmVwbGFjZSgvKFwkLis/KSg/PVs9IS5dKS9nLCAnbm9kZS4kJicpICsgJzsnOwoJICAgICAgICByZXR1cm4gbmV3IEZ1bmN0aW9uKCdub2RlJywgYm9keSk7CgkgICAgfQoKCSAgICByZXR1cm4gY2xhc3MgewoJICAgICAgICBjb25zdHJ1Y3RvcihvcHRzKSB7CgkgICAgICAgICAgICBpZiAob3B0cykgewoJICAgICAgICAgICAgICAgIHRoaXMucXVlcnlQYXJlbnQgPSBvcHRzLnF1ZXJ5UGFyZW50ID8gdHJ1ZSA6IGZhbHNlOwoJICAgICAgICAgICAgICAgIHRoaXMucHJvZ3Jlc3NpdmUgPSBvcHRzLnByb2dyZXNzaXZlOwoJICAgICAgICAgICAgICAgIGlmICh0aGlzLnF1ZXJ5UGFyZW50KSB7CgkgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50TWFwID0gbmV3IFdlYWtNYXAoKTsKCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICB9CgkgICAgICAgICAgICB0aGlzLmV2dExpc3RlbmVycyA9IHt9OwoJICAgICAgICB9CgoJICAgICAgICBwYXJzZSh4bWwsIHBhcmVudCwgZGlyKSB7CgkgICAgICAgICAgICBkaXIgPSBkaXIgPyBkaXIgKyAnLicgOiAnJzsKCSAgICAgICAgICAgIGxldCBub2RlUmVnRXggPSAvPChbXiA+XC9dKykoLio/KT4vbWcsIG5vZGVNYXRjaCA9IG51bGwsIG5vZGVzID0gW107CgkgICAgICAgICAgICB3aGlsZSAobm9kZU1hdGNoID0gbm9kZVJlZ0V4LmV4ZWMoeG1sKSkgewoJICAgICAgICAgICAgICAgIGxldCB0YWcgPSBub2RlTWF0Y2hbMV0sIG5vZGUgPSB7ICR0YWc6IHRhZyB9LCBmdWxsVGFnID0gZGlyICsgdGFnOwoKCSAgICAgICAgICAgICAgICBsZXQgYXR0clRleHQgPSBub2RlTWF0Y2hbMl0udHJpbSgpLCBjbG9zZWQgPSBmYWxzZTsKCSAgICAgICAgICAgICAgICBpZiAoYXR0clRleHQuZW5kc1dpdGgoJy8nKSB8fCB0YWcuc3RhcnRzV2l0aCgnPycpIHx8IHRhZy5zdGFydHNXaXRoKCchJykpIHsKCSAgICAgICAgICAgICAgICAgICAgY2xvc2VkID0gdHJ1ZTsKCSAgICAgICAgICAgICAgICB9CgoJICAgICAgICAgICAgICAgIGxldCBhdHRSZWdFeDEgPSAvKFteIF0rPyk9IiguKz8pIi9nLCBhdHRSZWdFeDIgPSAvKFteIF0rPyk9JyguKz8pJy9nOwoJICAgICAgICAgICAgICAgIGxldCBhdHRNYXRjaCA9IG51bGwsIGhhc0F0dHJzID0gZmFsc2U7CgkgICAgICAgICAgICAgICAgd2hpbGUgKGF0dE1hdGNoID0gYXR0UmVnRXgxLmV4ZWMoYXR0clRleHQpKSB7CgkgICAgICAgICAgICAgICAgICAgIGhhc0F0dHJzID0gdHJ1ZTsKCSAgICAgICAgICAgICAgICAgICAgbm9kZVthdHRNYXRjaFsxXV0gPSBhdHRNYXRjaFsyXTsKCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgaWYgKCFoYXNBdHRycykKCSAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGF0dE1hdGNoID0gYXR0UmVnRXgyLmV4ZWMoYXR0clRleHQpKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICBoYXNBdHRycyA9IHRydWU7CgkgICAgICAgICAgICAgICAgICAgICAgICBub2RlW2F0dE1hdGNoWzFdXSA9IGF0dE1hdGNoWzJdOwoJICAgICAgICAgICAgICAgICAgICB9CgoJICAgICAgICAgICAgICAgIGlmICghaGFzQXR0cnMgJiYgYXR0clRleHQgIT09ICcnKSB7CgkgICAgICAgICAgICAgICAgICAgIG5vZGUudGV4dCA9IGF0dHJUZXh0OwoJICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9ncmVzc2l2ZSkgewoJICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoYDwke2Z1bGxUYWd9PmAsIG5vZGUsIHBhcmVudCk7CgkgICAgICAgICAgICAgICAgfQoKCSAgICAgICAgICAgICAgICBpZiAoIWNsb3NlZCkgewoJICAgICAgICAgICAgICAgICAgICBsZXQgaW5uZXJSZWdFeCA9IG5ldyBSZWdFeHAoYChbXl0rPyk8XC8ke3RhZ30+YCwgJ2cnKTsKCSAgICAgICAgICAgICAgICAgICAgaW5uZXJSZWdFeC5sYXN0SW5kZXggPSBub2RlUmVnRXgubGFzdEluZGV4OwoJICAgICAgICAgICAgICAgICAgICBsZXQgaW5uZXJNYXRjaCA9IGlubmVyUmVnRXguZXhlYyh4bWwpOwoJICAgICAgICAgICAgICAgICAgICBpZiAoaW5uZXJNYXRjaCAmJiBpbm5lck1hdGNoWzFdKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICBub2RlUmVnRXgubGFzdEluZGV4ID0gaW5uZXJSZWdFeC5sYXN0SW5kZXg7CgkgICAgICAgICAgICAgICAgICAgICAgICBsZXQgaW5uZXJOb2RlcyA9IHRoaXMucGFyc2UoaW5uZXJNYXRjaFsxXSwgbm9kZSwgZnVsbFRhZyk7CgkgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5uZXJOb2Rlcy5sZW5ndGggPiAwKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS4kaW5uZXJOb2RlcyA9IGlubmVyTm9kZXM7CgkgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgewoJICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuJGlubmVyVGV4dCA9IGlubmVyTWF0Y2hbMV07CgkgICAgICAgICAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgaWYgKHRoaXMucXVlcnlQYXJlbnQgJiYgcGFyZW50KSB7CgkgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50TWFwLnNldChub2RlLCBwYXJlbnQpOwoJICAgICAgICAgICAgICAgIH0KCgkgICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvZ3Jlc3NpdmUpIHsKCSAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KGA8LyR7ZnVsbFRhZ30+YCwgbm9kZSwgcGFyZW50KTsKCSAgICAgICAgICAgICAgICB9CgoJICAgICAgICAgICAgICAgIG5vZGVzLnB1c2gobm9kZSk7CgkgICAgICAgICAgICB9CgoJICAgICAgICAgICAgcmV0dXJuIG5vZGVzOwoJICAgICAgICB9CgoJICAgICAgICBnZXRQYXJlbnQobm9kZSkgewoJICAgICAgICAgICAgaWYgKHRoaXMucXVlcnlQYXJlbnQpIHsKCSAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJlbnRNYXAuZ2V0KG5vZGUpOwoJICAgICAgICAgICAgfQoJICAgICAgICAgICAgcmV0dXJuIG51bGw7CgkgICAgICAgIH0KCgkgICAgICAgICNhZGRMaXN0ZW5lcihldnQsIGZ1bmMpIHsKCSAgICAgICAgICAgIGxldCBmdW5jcyA9IHRoaXMuZXZ0TGlzdGVuZXJzW2V2dF07CgkgICAgICAgICAgICBpZiAoZnVuY3MpIHsKCSAgICAgICAgICAgICAgICBmdW5jcy5wdXNoKGZ1bmMpOwoJICAgICAgICAgICAgfSBlbHNlIHsKCSAgICAgICAgICAgICAgICB0aGlzLmV2dExpc3RlbmVyc1tldnRdID0gW2Z1bmNdOwoJICAgICAgICAgICAgfQoJICAgICAgICB9CgoJICAgICAgICAvLyBzdXBwb3J0IGphdmFzY3JpcHQgY29uZGl0aW9uIGZvciB0aGUgbGFzdCB0YWcKCSAgICAgICAgYWRkTGlzdGVuZXIoZXZ0LCBmdW5jKSB7CgkgICAgICAgICAgICBpZiAoY29uZGl0aW9uZWQoZXZ0KSkgewoJICAgICAgICAgICAgICAgIC8vIGZ1bmMucHJvdG90eXBlID0gZXZ0OwoJICAgICAgICAgICAgICAgIGV2dCA9IHBhcnNlRXZlbnQoZXZ0KTsKCSAgICAgICAgICAgICAgICBmdW5jLmNvbmRpdGlvbiA9IGdlbkNvbmRpdGlvbkZ1bmMoZXZ0LmV4cCk7CgkgICAgICAgICAgICAgICAgZXZ0ID0gZXZ0LmV2dDsKCSAgICAgICAgICAgIH0KCSAgICAgICAgICAgIHRoaXMuI2FkZExpc3RlbmVyKGV2dCwgZnVuYyk7CgkgICAgICAgIH0KCgkgICAgICAgICNyZW1vdmVMaXN0ZW5lcihldnQsIGZ1bmMpIHsKCSAgICAgICAgICAgIGxldCBmdW5jcyA9IHRoaXMuZXZ0TGlzdGVuZXJzW2V2dF07CgkgICAgICAgICAgICBsZXQgaWR4ID0gbnVsbDsKCSAgICAgICAgICAgIGlmIChmdW5jcyAmJiAoaWR4ID0gZnVuY3MuaW5kZXhPZihmdW5jKSkgPj0gMCkgewoJICAgICAgICAgICAgICAgIGZ1bmNzLnNwbGljZShpZHgsIDEpOwoJICAgICAgICAgICAgfQoJICAgICAgICB9CgoJICAgICAgICByZW1vdmVMaXN0ZW5lcihldnQsIGZ1bmMpIHsKCSAgICAgICAgICAgIGlmIChjb25kaXRpb25lZChldnQpKSB7CgkgICAgICAgICAgICAgICAgZXZ0ID0gcGFyc2VFdmVudChldnQpOwoJICAgICAgICAgICAgICAgIGV2dCA9IGV2dC5ldnQ7CgkgICAgICAgICAgICB9CgkgICAgICAgICAgICB0aGlzLiNyZW1vdmVMaXN0ZW5lcihldnQsIGZ1bmMpOwoJICAgICAgICB9CgoJICAgICAgICBlbWl0KGV2dCwgLi4uYXJncykgewoJICAgICAgICAgICAgbGV0IGZ1bmNzID0gdGhpcy5ldnRMaXN0ZW5lcnNbZXZ0XTsKCSAgICAgICAgICAgIGlmIChmdW5jcykgewoJICAgICAgICAgICAgICAgIGZvciAobGV0IGZ1bmMgb2YgZnVuY3MpIHsKCSAgICAgICAgICAgICAgICAgICAgaWYgKGZ1bmMuY29uZGl0aW9uKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZnVuYy5jb25kaXRpb24uYXBwbHkobnVsbCwgYXJncykgPT09IHRydWUpIHsKCSAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jLmFwcGx5KG51bGwsIGFyZ3MpOwoJICAgICAgICAgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgICAgICB9IGVsc2UgewoJICAgICAgICAgICAgICAgICAgICAgICAgZnVuYy5hcHBseShudWxsLCBhcmdzKTsKCSAgICAgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgIH0KCSAgICAgICAgfQoKCSAgICAgICAgb24oZXZ0LCBmdW5jKSB7CgkgICAgICAgICAgICB0aGlzLmFkZExpc3RlbmVyKGV2dCwgZnVuYyk7CgkgICAgICAgIH0KCgkgICAgICAgIG9mZihldnQsIGZ1bmMpIHsKCSAgICAgICAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZ0LCBmdW5jKTsKCSAgICAgICAgfQoJICAgIH07Cgl9KSgpOwoKCWNvbnN0IHsgTm9kZSwgV2F5LCBSZWxhdGlvbiB9ID0gb3Ntb2JqcywKCSAgICB7IHB1cmdlUHJvcHMsIFJlZkVsZW1lbnRzIH0gPSB1dGlscywKCSAgICBYbWxQYXJzZXIgPSB4bWxwYXJzZXI7CgoJdmFyIGxpYiA9IChvc20sIG9wdHMpID0+IHsKCSAgICBsZXQgY29tcGxldGVGZWF0dXJlID0gZmFsc2UsIHJlbmRlclRhZ2dlZCA9IGZhbHNlLCBleGNsdWRlV2F5ID0gdHJ1ZTsKCgkgICAgY29uc3QgcGFyc2VPcHRzID0gb3B0cyA9PiB7CgkgICAgICAgIGlmIChvcHRzKSB7CgkgICAgICAgICAgICBjb21wbGV0ZUZlYXR1cmUgPSBvcHRzLmNvbXBsZXRlRmVhdHVyZSB8fCBvcHRzLmFsbEZlYXR1cmVzID8gdHJ1ZSA6IGZhbHNlOwoJICAgICAgICAgICAgcmVuZGVyVGFnZ2VkID0gb3B0cy5yZW5kZXJUYWdnZWQgPyB0cnVlIDogZmFsc2U7CgkgICAgICAgICAgICBsZXQgd2F5T3B0ID0gb3B0cy5zdXBwcmVzc1dheSB8fCBvcHRzLmV4Y2x1ZGVXYXk7CgkgICAgICAgICAgICBpZiAod2F5T3B0ICE9PSB1bmRlZmluZWQgJiYgIXdheU9wdCkgewoJICAgICAgICAgICAgICAgIGV4Y2x1ZGVXYXkgPSBmYWxzZTsKCSAgICAgICAgICAgIH0KCSAgICAgICAgfQoJICAgIH07CgoJICAgIHBhcnNlT3B0cyhvcHRzKTsKCgkgICAgY29uc3QgZGV0ZWN0Rm9ybWF0ID0gb3NtID0+IHsKCSAgICAgICAgaWYgKG9zbS5lbGVtZW50cykgewoJICAgICAgICAgICAgcmV0dXJuICdqc29uJzsKCSAgICAgICAgfQoJICAgICAgICBpZiAob3NtLmluZGV4T2YoJzxvc20nKSA+PSAwKSB7CgkgICAgICAgICAgICByZXR1cm4gJ3htbCc7CgkgICAgICAgIH0KCSAgICAgICAgaWYgKG9zbS50cmltKCkuc3RhcnRzV2l0aCgneycpKSB7CgkgICAgICAgICAgICByZXR1cm4gJ2pzb24tcmF3JzsKCSAgICAgICAgfQoJICAgICAgICByZXR1cm4gJ2ludmFsaWQnOwoJICAgIH07CgoJICAgIGxldCBmb3JtYXQgPSBkZXRlY3RGb3JtYXQob3NtKTsKCgkgICAgbGV0IHJlZkVsZW1lbnRzID0gbmV3IFJlZkVsZW1lbnRzKCksIGZlYXR1cmVBcnJheSA9IFtdOwoKCSAgICBjb25zdCBhbmFseXplRmVhdHVyZXNGcm9tSnNvbiA9IG9zbSA9PiB7CgkgICAgICAgIGZvciAobGV0IGVsZW0gb2Ygb3NtLmVsZW1lbnRzKSB7CgkgICAgICAgICAgICBzd2l0Y2ggKGVsZW0udHlwZSkgewoJICAgICAgICAgICAgICAgIGNhc2UgJ25vZGUnOgoJICAgICAgICAgICAgICAgICAgICBsZXQgbm9kZSA9IG5ldyBOb2RlKGVsZW0uaWQsIHJlZkVsZW1lbnRzKTsKCSAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW0udGFncykgewoJICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5hZGRUYWdzKGVsZW0udGFncyk7CgkgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICAgICAgbm9kZS5hZGRQcm9wcyhwdXJnZVByb3BzKGVsZW0sIFsnaWQnLCAndHlwZScsICd0YWdzJywgJ2xhdCcsICdsb24nXSkpOwoJICAgICAgICAgICAgICAgICAgICBub2RlLnNldExhdExuZyhlbGVtKTsKCSAgICAgICAgICAgICAgICAgICAgYnJlYWs7CgoJICAgICAgICAgICAgICAgIGNhc2UgJ3dheSc6CgkgICAgICAgICAgICAgICAgICAgIGxldCB3YXkgPSBuZXcgV2F5KGVsZW0uaWQsIHJlZkVsZW1lbnRzKTsKCSAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW0udGFncykgewoJICAgICAgICAgICAgICAgICAgICAgICAgd2F5LmFkZFRhZ3MoZWxlbS50YWdzKTsKCSAgICAgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgICAgICB3YXkuYWRkUHJvcHMocHVyZ2VQcm9wcyhlbGVtLCBbJ2lkJywgJ3R5cGUnLCAndGFncycsICdub2RlcycsICdnZW9tZXRyeSddKSk7CgkgICAgICAgICAgICAgICAgICAgIGlmIChlbGVtLm5vZGVzKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBuIG9mIGVsZW0ubm9kZXMpIHsKCSAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXkuYWRkTm9kZVJlZihuKTsKCSAgICAgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlbGVtLmdlb21ldHJ5KSB7CgkgICAgICAgICAgICAgICAgICAgICAgICB3YXkuc2V0TGF0TG5nQXJyYXkoZWxlbS5nZW9tZXRyeSk7CgkgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICAgICAgYnJlYWs7CgoJICAgICAgICAgICAgICAgIGNhc2UgJ3JlbGF0aW9uJzoKCSAgICAgICAgICAgICAgICAgICAgbGV0IHJlbGF0aW9uID0gbmV3IFJlbGF0aW9uKGVsZW0uaWQsIHJlZkVsZW1lbnRzKTsKCSAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW0uYm91bmRzKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICByZWxhdGlvbi5zZXRCb3VuZHMoW3BhcnNlRmxvYXQoZWxlbS5ib3VuZHMubWlubG9uKSwgcGFyc2VGbG9hdChlbGVtLmJvdW5kcy5taW5sYXQpLCBwYXJzZUZsb2F0KGVsZW0uYm91bmRzLm1heGxvbiksIHBhcnNlRmxvYXQoZWxlbS5ib3VuZHMubWF4bGF0KV0pOwoJICAgICAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgICAgIGlmIChlbGVtLnRhZ3MpIHsKCSAgICAgICAgICAgICAgICAgICAgICAgIHJlbGF0aW9uLmFkZFRhZ3MoZWxlbS50YWdzKTsKCSAgICAgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgICAgICByZWxhdGlvbi5hZGRQcm9wcyhwdXJnZVByb3BzKGVsZW0sIFsnaWQnLCAndHlwZScsICd0YWdzJywgJ2JvdW5kcycsICdtZW1iZXJzJ10pKTsKCSAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW0ubWVtYmVycykgewoJICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbWVtYmVyIG9mIGVsZW0ubWVtYmVycykgewoJICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbGF0aW9uLmFkZE1lbWJlcihtZW1iZXIpOwoJICAgICAgICAgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgICAgIGJyZWFrOwoJICAgICAgICAgICAgfQoJICAgICAgICB9CgkgICAgfTsKCgkgICAgY29uc3QgYW5hbHl6ZUZlYXR1cmVzRnJvbVhtbCA9IG9zbSA9PiB7CgkgICAgICAgIGNvbnN0IHhtbFBhcnNlciA9IG5ldyBYbWxQYXJzZXIoeyBwcm9ncmVzc2l2ZTogdHJ1ZSB9KTsKCgkgICAgICAgIHhtbFBhcnNlci5vbignPC9vc20ubm9kZT4nLCBub2RlID0+IHsKCSAgICAgICAgICAgIGxldCBuZCA9IG5ldyBOb2RlKG5vZGUuaWQsIHJlZkVsZW1lbnRzKTsKCSAgICAgICAgICAgIGZvciAobGV0IFtrLCB2XSBvZiBPYmplY3QuZW50cmllcyhub2RlKSkKCSAgICAgICAgICAgICAgICBpZiAoIWsuc3RhcnRzV2l0aCgnJCcpICYmIFsnaWQnLCAnbG9uJywgJ2xhdCddLmluZGV4T2YoaykgPCAwKSB7CgkgICAgICAgICAgICAgICAgICAgIG5kLmFkZFByb3Aoaywgdik7CgkgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgbmQuc2V0TGF0TG5nKG5vZGUpOwoJICAgICAgICAgICAgaWYgKG5vZGUuJGlubmVyTm9kZXMpIHsKCSAgICAgICAgICAgICAgICBmb3IgKGxldCBpbmQgb2Ygbm9kZS4kaW5uZXJOb2RlcykgewoJICAgICAgICAgICAgICAgICAgICBpZiAoaW5kLiR0YWcgPT09ICd0YWcnKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICBuZC5hZGRUYWcoaW5kLmssIGluZC52KTsKCSAgICAgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgIH0KCSAgICAgICAgfSk7CgoJICAgICAgICB4bWxQYXJzZXIub24oJzwvb3NtLndheT4nLCBub2RlID0+IHsKCSAgICAgICAgICAgIGxldCB3YXkgPSBuZXcgV2F5KG5vZGUuaWQsIHJlZkVsZW1lbnRzKTsKCSAgICAgICAgICAgIGZvciAobGV0IFtrLCB2XSBvZiBPYmplY3QuZW50cmllcyhub2RlKSkgewoJICAgICAgICAgICAgICAgIGlmICghay5zdGFydHNXaXRoKCckJykgJiYgWydpZCddLmluZGV4T2YoaykgPCAwKSB7CgkgICAgICAgICAgICAgICAgICAgIHdheS5hZGRQcm9wKGssIHYpOwoJICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgIH0KCSAgICAgICAgICAgIGlmIChub2RlLiRpbm5lck5vZGVzKSB7CgkgICAgICAgICAgICAgICAgZm9yIChsZXQgaW5kIG9mIG5vZGUuJGlubmVyTm9kZXMpIHsKCSAgICAgICAgICAgICAgICAgICAgaWYgKGluZC4kdGFnID09PSAnbmQnKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5kLmxvbiAmJiBpbmQubGF0KSB7CgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F5LmFkZExhdExuZyhpbmQpOwoJICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpbmQucmVmKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F5LmFkZE5vZGVSZWYoaW5kLnJlZik7CgkgICAgICAgICAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaW5kLiR0YWcgPT09ICd0YWcnKQoJICAgICAgICAgICAgICAgICAgICAgICAgd2F5LmFkZFRhZyhpbmQuaywgaW5kLnYpOwoJICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgIH0KCSAgICAgICAgfSk7CgoJICAgICAgICB4bWxQYXJzZXIub24oJzxvc20ucmVsYXRpb24+Jywgbm9kZSA9PiB7CgkgICAgICAgICAgICBuZXcgUmVsYXRpb24obm9kZS5pZCwgcmVmRWxlbWVudHMpOwoJICAgICAgICB9KTsKCgkgICAgICAgIHhtbFBhcnNlci5vbignPC9vc20ucmVsYXRpb24ubWVtYmVyPicsIChub2RlLCBwYXJlbnQpID0+IHsKCSAgICAgICAgICAgIGxldCByZWxhdGlvbiA9IHJlZkVsZW1lbnRzLmdldChgcmVsYXRpb24vJHtwYXJlbnQuaWR9YCk7CgkgICAgICAgICAgICBsZXQgbWVtYmVyID0gewoJICAgICAgICAgICAgICAgIHR5cGU6IG5vZGUudHlwZSwKCSAgICAgICAgICAgICAgICByb2xlOiBub2RlLnJvbGUgPyBub2RlLnJvbGUgOiAnJywKCSAgICAgICAgICAgICAgICByZWY6IG5vZGUucmVmCgkgICAgICAgICAgICB9OwoJICAgICAgICAgICAgaWYgKG5vZGUubGF0ICYmIG5vZGUubG9uKSB7CgkgICAgICAgICAgICAgICAgbWVtYmVyLmxhdCA9IG5vZGUubGF0LCBtZW1iZXIubG9uID0gbm9kZS5sb24sIG1lbWJlci50YWdzID0ge307CgkgICAgICAgICAgICAgICAgZm9yIChsZXQgW2ssIHZdIG9mIE9iamVjdC5lbnRyaWVzKG5vZGUpKSB7CgkgICAgICAgICAgICAgICAgICAgIGlmICghay5zdGFydHNXaXRoKCckJykgJiYgWyd0eXBlJywgJ2xhdCcsICdsb24nXS5pbmRleE9mKGspIDwgMCkgewoJICAgICAgICAgICAgICAgICAgICAgICAgbWVtYmVyW2tdID0gdjsKCSAgICAgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgIH0KCSAgICAgICAgICAgIGlmIChub2RlLiRpbm5lck5vZGVzKSB7CgkgICAgICAgICAgICAgICAgbGV0IGdlb21ldHJ5ID0gW107CgkgICAgICAgICAgICAgICAgbGV0IG5vZGVzID0gW107CgkgICAgICAgICAgICAgICAgZm9yIChsZXQgaW5kIG9mIG5vZGUuJGlubmVyTm9kZXMpIHsKCSAgICAgICAgICAgICAgICAgICAgaWYgKGluZC5sYXQgJiYgaW5kLmxvbikgewoJICAgICAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cnkucHVzaChpbmQpOwoJICAgICAgICAgICAgICAgICAgICB9IGVsc2UgewoJICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXMucHVzaChpbmQucmVmKTsKCSAgICAgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICBpZiAoZ2VvbWV0cnkubGVuZ3RoID4gMCkgewoJICAgICAgICAgICAgICAgICAgICBtZW1iZXIuZ2VvbWV0cnkgPSBnZW9tZXRyeTsKCSAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5vZGVzLmxlbmd0aCA+IDApIHsKCSAgICAgICAgICAgICAgICAgICAgbWVtYmVyLm5vZGVzID0gbm9kZXM7CgkgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgfQoJICAgICAgICAgICAgcmVsYXRpb24uYWRkTWVtYmVyKG1lbWJlcik7CgkgICAgICAgIH0pOwoKCSAgICAgICAgeG1sUGFyc2VyLm9uKCc8L29zbS5yZWxhdGlvbi5ib3VuZHM+JywgKG5vZGUsIHBhcmVudCkgPT4gewoJICAgICAgICAgICAgcmVmRWxlbWVudHMuZ2V0KGByZWxhdGlvbi8ke3BhcmVudC5pZH1gKS5zZXRCb3VuZHMoW3BhcnNlRmxvYXQobm9kZS5taW5sb24pLCBwYXJzZUZsb2F0KG5vZGUubWlubGF0KSwgcGFyc2VGbG9hdChub2RlLm1heGxvbiksIHBhcnNlRmxvYXQobm9kZS5tYXhsYXQpXSk7CgkgICAgICAgIH0pOwoKCSAgICAgICAgeG1sUGFyc2VyLm9uKCc8L29zbS5yZWxhdGlvbi50YWc+JywgKG5vZGUsIHBhcmVudCkgPT4gewoJICAgICAgICAgICAgcmVmRWxlbWVudHMuZ2V0KGByZWxhdGlvbi8ke3BhcmVudC5pZH1gKS5hZGRUYWcobm9kZS5rLCBub2RlLnYpOwoJICAgICAgICB9KTsKCgkgICAgICAgIHhtbFBhcnNlci5wYXJzZShvc20pOwoJICAgIH07CgoJICAgIGlmIChmb3JtYXQgPT09ICdqc29uLXJhdycpIHsKCSAgICAgICAgb3NtID0gSlNPTi5wYXJzZShvc20pOwoJICAgICAgICBpZiAob3NtLmVsZW1lbnRzKSB7CgkgICAgICAgICAgICBmb3JtYXQgPSAnanNvbic7CgkgICAgICAgIH0gZWxzZSB7CgkgICAgICAgICAgICBmb3JtYXQgPSAnaW52YWxpZCc7CgkgICAgICAgIH0KCSAgICB9CgoJICAgIGlmIChmb3JtYXQgPT09ICdqc29uJykgewoJICAgICAgICBhbmFseXplRmVhdHVyZXNGcm9tSnNvbihvc20pOwoJICAgIH0gZWxzZSBpZiAoZm9ybWF0ID09PSAneG1sJykgewoJICAgICAgICBhbmFseXplRmVhdHVyZXNGcm9tWG1sKG9zbSk7CgkgICAgfQoKCSAgICByZWZFbGVtZW50cy5iaW5kQWxsKCk7CgoJICAgIGZvciAobGV0IHYgb2YgcmVmRWxlbWVudHMudmFsdWVzKCkpIHsKCSAgICAgICAgaWYgKHYucmVmQ291bnQgPD0gMCB8fCAodi5oYXNUYWcgJiYgcmVuZGVyVGFnZ2VkICYmICEodiBpbnN0YW5jZW9mIFdheSAmJiBleGNsdWRlV2F5KSkpIHsKCSAgICAgICAgICAgIGxldCBmZWF0dXJlcyA9IHYudG9GZWF0dXJlQXJyYXkoKTsKCSAgICAgICAgICAgIC8vIHJldHVybiB0aGUgZmlyc3QgZ2VvbWV0cnkgb2YgdGhlIGZpcnN0IHJlbGF0aW9uIGVsZW1lbnQKCSAgICAgICAgICAgIGlmICh2IGluc3RhbmNlb2YgUmVsYXRpb24gJiYgIWNvbXBsZXRlRmVhdHVyZSAmJiBmZWF0dXJlcy5sZW5ndGggPiAwKSB7CgkgICAgICAgICAgICAgICAgcmV0dXJuIGZlYXR1cmVzWzBdLmdlb21ldHJ5OwoJICAgICAgICAgICAgfQoJICAgICAgICAgICAgZmVhdHVyZUFycmF5ID0gZmVhdHVyZUFycmF5LmNvbmNhdChmZWF0dXJlcyk7CgkgICAgICAgIH0KCSAgICB9CgoJICAgIHJldHVybiB7IHR5cGU6ICdGZWF0dXJlQ29sbGVjdGlvbicsIGZlYXR1cmVzOiBmZWF0dXJlQXJyYXkgfTsKCX07CgoJdmFyIG9zbTJnZW9qc29uID0gLypAX19QVVJFX18qL2dldERlZmF1bHRFeHBvcnRGcm9tQ2pzKGxpYik7CgoJY2xhc3MgQ29udmVydGVyIHsKCSAgICBjb25zdHJ1Y3Rvcihmb3JtYXQsIGRhdGEsIG9wdGlvbnMgPSB7fSkgewoJICAgICAgICAvKioKCSAgICAgICAgICogQ3JlYXRlcyBhIGJsYW5rIEdlb0pTT04gZmVhdHVyZSBjb2xsZWN0aW9uLgoJICAgICAgICAgKiBAcmV0dXJucyBBIG5ldyBHZW9KU09OIGZlYXR1cmUgY29sbGVjdGlvbiB3aXRoIG5vIGZlYXR1cmVzLgoJICAgICAgICAgKi8KCSAgICAgICAgdGhpcy5ibGFua0dlb0pTT04gPSAoKSA9PiAoewoJICAgICAgICAgICAgdHlwZTogJ0ZlYXR1cmVDb2xsZWN0aW9uJywKCSAgICAgICAgICAgIGZlYXR1cmVzOiBbXSwKCSAgICAgICAgfSk7CgkgICAgICAgIHRoaXMuX3Jhd0RhdGEgPSBkYXRhOwoJICAgICAgICB0aGlzLl9mb3JtYXQgPSBmb3JtYXQ7CgkgICAgICAgIHRoaXMuX29wdGlvbnMgPSBvcHRpb25zOwoJICAgICAgICBjb25zdCBjb252ZXJ0ZXJzID0gewoJICAgICAgICAgICAgJ3RvcG9qc29uJzogdGhpcy5sb2FkVG9wb0pzb24sCgkgICAgICAgICAgICAnb3NtJzogdGhpcy5sb2FkT3NtLAoJICAgICAgICAgICAgJ2ttbCc6IHRoaXMubG9hZFhtbCwKCSAgICAgICAgICAgICdncHgnOiB0aGlzLmxvYWRYbWwsCgkgICAgICAgICAgICAndGN4JzogdGhpcy5sb2FkWG1sLAoJICAgICAgICAgICAgJ2Nzdic6IHRoaXMubG9hZENzdiwKCSAgICAgICAgICAgICd0c3YnOiB0aGlzLmxvYWRDc3YsCgkgICAgICAgICAgICAncG9seWxpbmUnOiB0aGlzLmxvYWRQb2x5bGluZQoJICAgICAgICB9OwoJICAgICAgICB0aGlzLl9jb252ZXJzaW9uRm4gPSBjb252ZXJ0ZXJzW2Zvcm1hdF07CgkgICAgfQoJICAgIGFzeW5jIGNvbnZlcnQoKSB7CgkgICAgICAgIGlmICghdGhpcy5fY29udmVyc2lvbkZuKSB7CgkgICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKF8sIHJlaikgPT4gcmVqKGBObyBjb252ZXJ0ZXIgZXhpc3RzIGZvciAke3RoaXMuX2Zvcm1hdH1gKSk7CgkgICAgICAgIH0KCSAgICAgICAgZWxzZSB7CgkgICAgICAgICAgICByZXR1cm4gdGhpcy5fY29udmVyc2lvbkZuKCk7CgkgICAgICAgIH0KCSAgICB9CgkgICAgLyoqCgkgICAgICogTG9hZCB0aGUgWE1MIGRhdGEgYXMgR2VvSlNPTgoJICAgICAqIEByZXR1cm5zIEEgcHJvbWlzZSByZXNvbHZpbmcgdG8gYSBHZW9KU09OIEZlYXR1cmVDb2xsZWN0aW9uCgkgICAgICovCgkgICAgYXN5bmMgbG9hZFhtbCgpIHsKCSAgICAgICAgLy8gVXNlIHRoZSBhcHByb3ByaWF0ZSBwYXJzZXIgYmFzZWQgb24gdGhlIGZvcm1hdAoJICAgICAgICBjb25zdCBnZW9qc29uID0gdG9HZW9Kc29uW3RoaXMuX2Zvcm1hdF0obmV3IERPTVBhcnNlcigpLnBhcnNlRnJvbVN0cmluZyh0aGlzLl9yYXdEYXRhLCAidGV4dC94bWwiKSk7CgkgICAgICAgIHJldHVybiBnZW9qc29uOwoJICAgIH0KCSAgICAvKioKCSAgICAgKiBMb2FkcyBhbmQgcGFyc2VzIENTViBkYXRhIGludG8gYSBHZW9KU09OIEZlYXR1cmVDb2xsZWN0aW9uLgoJICAgICAqIEByZXR1cm5zIEEgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggdGhlIEdlb0pTT04gRmVhdHVyZUNvbGxlY3Rpb24uCgkgICAgICovCgkgICAgYXN5bmMgbG9hZENzdigpIHsKCSAgICAgICAgLy8gRGVmaW5lIG9wdGlvbnMgZm9yIHRoZSBjc3YyZ2VvanNvbiBsaWJyYXJ5CgkgICAgICAgIGxldCBvcHRpb25zID0gdGhpcy5fb3B0aW9ucy5jc3ZPcHRpb25zIHx8IHt9OyAvLyBUT0RPIGFsbG93IENTViBvcHRpb25zCgkgICAgICAgIGlmICh0aGlzLl9mb3JtYXQgPT09ICd0c3YnKSB7CgkgICAgICAgICAgICBvcHRpb25zLmRlbGltaXRlciA9ICdcdCc7CgkgICAgICAgIH0KCSAgICAgICAgLy8gVXNlIHRoZSBjc3YyZ2VvanNvbiBsaWJyYXJ5IHRvIGNvbnZlcnQgdGhlIENTViB0byBHZW9KU09OCgkgICAgICAgIGNvbnN0IGdlb2pzb24gPSBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7CgkgICAgICAgICAgICBjc3YyZ2VvanNvbl8xLmNzdjJnZW9qc29uKHRoaXMuX3Jhd0RhdGEsIG9wdGlvbnMsIChlcnIsIGRhdGEpID0+IHsKCSAgICAgICAgICAgICAgICBpZiAoZXJyKSB7CgkgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpOwoJICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICBlbHNlIHsKCSAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShkYXRhKTsKCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICB9KTsKCSAgICAgICAgfSk7CgkgICAgICAgIHJldHVybiBnZW9qc29uOwoJICAgIH0KCSAgICAvKioKCSAgICAgKiBMb2FkcyBUb3BvSlNPTiBkYXRhIGFuZCBjb252ZXJ0cyBpdCBpbnRvIGEgR2VvSlNPTiBGZWF0dXJlQ29sbGVjdGlvbgoJICAgICAqIEByZXR1cm5zIEEgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggdGhlIEdlb0pTT04gRmVhdHVyZUNvbGxlY3Rpb24uCgkgICAgICovCgkgICAgYXN5bmMgbG9hZFRvcG9Kc29uKCkgewoJICAgICAgICBsZXQgdG9wb0pzb25EYXRhID0ge307CgkgICAgICAgIHRyeSB7CgkgICAgICAgICAgICB0b3BvSnNvbkRhdGEgPSBKU09OLnBhcnNlKHRoaXMuX3Jhd0RhdGEpOwoJICAgICAgICB9CgkgICAgICAgIGNhdGNoIChlKSB7CgkgICAgICAgICAgICB0aHJvdyAiSW52YWxpZCBUb3BvSnNvbiI7CgkgICAgICAgIH0KCSAgICAgICAgLy8gQ29udmVydCB0aGUgZGF0YQoJICAgICAgICBsZXQgcmVzdWx0ID0gdGhpcy5ibGFua0dlb0pTT04oKTsKCSAgICAgICAgaWYgKHRvcG9Kc29uRGF0YS50eXBlID09PSAiVG9wb2xvZ3kiICYmIHRvcG9Kc29uRGF0YS5vYmplY3RzICE9PSB1bmRlZmluZWQpIHsKCSAgICAgICAgICAgIHJlc3VsdCA9IHsKCSAgICAgICAgICAgICAgICB0eXBlOiAiRmVhdHVyZUNvbGxlY3Rpb24iLAoJICAgICAgICAgICAgICAgIGZlYXR1cmVzOiByZXN1bHQuZmVhdHVyZXMgPSBPYmplY3Qua2V5cyh0b3BvSnNvbkRhdGEub2JqZWN0cykubWFwKGtleSA9PiB0b3BvanNvbkZlYXR1cmUodG9wb0pzb25EYXRhLCBrZXkpKS5yZWR1Y2UoKGEsIHYpID0+IFsuLi5hLCAuLi52LmZlYXR1cmVzXSwgW10pCgkgICAgICAgICAgICB9OwoJICAgICAgICB9CgkgICAgICAgIHJldHVybiByZXN1bHQ7CgkgICAgfQoJICAgIDsKCSAgICAvKioKCSAgICAgKiBMb2FkcyBPU00gZGF0YSBhbmQgY29udmVydHMgaXQgaW50byBhIEdlb0pTT04gRmVhdHVyZUNvbGxlY3Rpb24KCSAgICAgKiBAcmV0dXJucyBBIFByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZSBHZW9KU09OIEZlYXR1cmVDb2xsZWN0aW9uLgoJICAgICAqLwoJICAgIGFzeW5jIGxvYWRPc20oKSB7CgkgICAgICAgIHJldHVybiBvc20yZ2VvanNvbih0aGlzLl9yYXdEYXRhKTsKCSAgICB9CgkgICAgLyoqCgkgICAgICogTG9hZHMgYW5kIHBhcnNlcyBQb2x5bGluZSBkYXRhIGludG8gYSBHZW9KU09OIEZlYXR1cmVDb2xsZWN0aW9uLgoJICAgICAqIEByZXR1cm5zIEEgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggdGhlIEdlb0pTT04gRmVhdHVyZUNvbGxlY3Rpb24uCgkgICAgICovCgkgICAgYXN5bmMgbG9hZFBvbHlsaW5lKCkgewoJICAgICAgICBsZXQgb3B0aW9ucyA9IHRoaXMuX29wdGlvbnMucG9seWxpbmVPcHRpb25zIHx8IHt9OwoJICAgICAgICAvLyBVc2UgdGhlIGNzdjJnZW9qc29uIGxpYnJhcnkgdG8gY29udmVydCB0aGUgQ1NWIHRvIEdlb0pTT04KCSAgICAgICAgY29uc3QgZ2VvanNvbiA9IGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHsKCSAgICAgICAgICAgIHRyeSB7CgkgICAgICAgICAgICAgICAgY29uc3QgbGluZVN0cmluZyA9IHBvbHlsaW5lRXhwb3J0cy50b0dlb0pTT04odGhpcy5fcmF3RGF0YSwgb3B0aW9ucy5wcmVjaXNpb24pOwoJICAgICAgICAgICAgICAgIGxldCBnZW9tZXRyeSA9IGxpbmVTdHJpbmc7CgkgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMudHlwZSA9PT0gJ3BvaW50JykgewoJICAgICAgICAgICAgICAgICAgICBpZiAobGluZVN0cmluZy5jb29yZGluYXRlcy5sZW5ndGggPT09IDEpIHsKCSAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1ha2UgaXQgYSBwb2ludAoJICAgICAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cnkgPSB7CgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3R5cGUnOiAnUG9pbnQnLAoJICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjb29yZGluYXRlcyc6IGxpbmVTdHJpbmcuY29vcmRpbmF0ZXNbMF0KCSAgICAgICAgICAgICAgICAgICAgICAgIH07CgkgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICAgICAgZWxzZSB7CgkgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0Nhbm5vdCBjb252ZXJ0IHBvbHlsaW5lIHRvICcgKyBvcHRpb25zLnR5cGUpOwoJICAgICAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9wdGlvbnMudHlwZSA9PT0gJ3BvbHlnb24nKSB7CgkgICAgICAgICAgICAgICAgICAgIGlmIChsaW5lU3RyaW5nLmNvb3JkaW5hdGVzWzBdWzBdID09PSBsaW5lU3RyaW5nLmNvb3JkaW5hdGVzW2xpbmVTdHJpbmcuY29vcmRpbmF0ZXMubGVuZ3RoIC0gMV1bMF0gJiYKCSAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVTdHJpbmcuY29vcmRpbmF0ZXNbMF1bMV0gPT09IGxpbmVTdHJpbmcuY29vcmRpbmF0ZXNbbGluZVN0cmluZy5jb29yZGluYXRlcy5sZW5ndGggLSAxXVsxXSkgewoJICAgICAgICAgICAgICAgICAgICAgICAgLy8gTWFrZSBpdCBhIHBvbHlnb24KCSAgICAgICAgICAgICAgICAgICAgICAgIGdlb21ldHJ5ID0gewoJICAgICAgICAgICAgICAgICAgICAgICAgICAgICd0eXBlJzogJ1BvbHlnb24nLAoJICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjb29yZGluYXRlcyc6IFtsaW5lU3RyaW5nLmNvb3JkaW5hdGVzXQoJICAgICAgICAgICAgICAgICAgICAgICAgfTsKCSAgICAgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgICAgICBlbHNlIHsKCSAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignQ2Fubm90IGNvbnZlcnQgcG9seWxpbmUgdG8gJyArIG9wdGlvbnMudHlwZSk7CgkgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgcmVzb2x2ZSh7CgkgICAgICAgICAgICAgICAgICAgIHR5cGU6ICJGZWF0dXJlQ29sbGVjdGlvbiIsCgkgICAgICAgICAgICAgICAgICAgIGZlYXR1cmVzOiBbewoJICAgICAgICAgICAgICAgICAgICAgICAgICAgICJ0eXBlIjogIkZlYXR1cmUiLAoJICAgICAgICAgICAgICAgICAgICAgICAgICAgICJnZW9tZXRyeSI6IGdlb21ldHJ5LAoJICAgICAgICAgICAgICAgICAgICAgICAgICAgICJwcm9wZXJ0aWVzIjogb3B0aW9ucy5wcm9wZXJ0aWVzIHx8IHt9CgkgICAgICAgICAgICAgICAgICAgICAgICB9XQoJICAgICAgICAgICAgICAgIH0pOwoJICAgICAgICAgICAgfQoJICAgICAgICAgICAgY2F0Y2ggKGVycikgewoJICAgICAgICAgICAgICAgIHJlamVjdChlcnIpOwoJICAgICAgICAgICAgfQoJICAgICAgICB9KTsKCSAgICAgICAgcmV0dXJuIGdlb2pzb247CgkgICAgfQoJfQoKCWNvbnN0IGxpYnJhcmllcyA9IHsKCSAgICAnQ29udmVydGVyJzogQ29udmVydGVyCgl9OwoJbGV0IHN1YkNsYXNzOwoJc2VsZi5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZSA9PiB7CgkgICAgY29uc3QgZGF0YSA9IChlLmRhdGEgfHwgZSk7CgkgICAgY29uc3QgcG9zdCA9IChpZCwgZXJyLCByZXMsIHR5cGUpID0+IHsKCSAgICAgICAgcG9zdE1lc3NhZ2UoewoJICAgICAgICAgICAgdHlwZTogdHlwZSA/IHR5cGUgOiAoZXJyID8gJ2Vycm9yJyA6ICdyZXNwb25zZScpLAoJICAgICAgICAgICAgaWQ6IGlkLAoJICAgICAgICAgICAgbWVzc2FnZTogcmVzLAoJICAgICAgICAgICAgZXJyb3I6IGVycgoJICAgICAgICB9KTsKCSAgICB9OwoJICAgIGNvbnN0IGNvbW1hbmRzID0gewoJICAgICAgICAnaW5pdCc6IChtc2cpID0+IHsKCSAgICAgICAgICAgIGNvbnN0IHsgaWQsIGNvbW1hbmQsIG1lc3NhZ2UgfSA9IG1zZzsKCSAgICAgICAgICAgIHN1YkNsYXNzID0gbmV3IGxpYnJhcmllc1tjb21tYW5kXShtZXNzYWdlWzBdLCBtZXNzYWdlWzFdKTsKCSAgICAgICAgICAgIC8vIHJldHVybiB0aGUgY2xhc3MnIG1ldGhvZHMKCSAgICAgICAgICAgIGNvbnN0IGZucyA9IFsKCSAgICAgICAgICAgICAgICAuLi5PYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhsaWJyYXJpZXNbY29tbWFuZF0ucHJvdG90eXBlKSwKCSAgICAgICAgICAgICAgICAuLi5PYmplY3Qua2V5cyhzdWJDbGFzcykKCSAgICAgICAgICAgIF0ubWFwKGtleSA9PiBba2V5LCB0eXBlb2YgbGlicmFyaWVzW2NvbW1hbmRdLnByb3RvdHlwZVtrZXldXSkKCSAgICAgICAgICAgICAgICAucmVkdWNlKChhLCBjKSA9PiAoeyAuLi5hLCAuLi57IFtjWzBdXTogY1sxXSB9IH0pLCB7fSk7CgkgICAgICAgICAgICBwb3N0KGlkLCB1bmRlZmluZWQsIGZucywgJ2luaXRfcmVzcG9uc2UnKTsKCSAgICAgICAgfSwKCSAgICAgICAgJ2dldCc6IGZ1bmN0aW9uIChtc2cpIHsKCSAgICAgICAgICAgIGNvbnN0IHsgaWQsIGNvbW1hbmQgfSA9IG1zZzsKCSAgICAgICAgICAgIGlmIChzdWJDbGFzcyAmJiBzdWJDbGFzc1tjb21tYW5kXSkgewoJICAgICAgICAgICAgICAgIHBvc3QoaWQsIHVuZGVmaW5lZCwgc3ViQ2xhc3NbY29tbWFuZF0pOwoJICAgICAgICAgICAgfQoJICAgICAgICAgICAgZWxzZSB7CgkgICAgICAgICAgICAgICAgcG9zdChpZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQpOwoJICAgICAgICAgICAgfQoJICAgICAgICB9LAoJICAgICAgICAnZXhlYyc6IGZ1bmN0aW9uIChtc2cpIHsKCSAgICAgICAgICAgIGNvbnN0IHsgaWQsIGNvbW1hbmQsIG1lc3NhZ2UgfSA9IG1zZzsKCSAgICAgICAgICAgIGlmIChzdWJDbGFzcyAmJiBzdWJDbGFzc1tjb21tYW5kXSAmJiB0eXBlb2Ygc3ViQ2xhc3NbY29tbWFuZF0gPT09ICdmdW5jdGlvbicpIHsKCSAgICAgICAgICAgICAgICBjb25zdCBjbWQgPSBzdWJDbGFzc1tjb21tYW5kXQoJICAgICAgICAgICAgICAgICAgICAuYXBwbHkoc3ViQ2xhc3MsIG1lc3NhZ2UpOwoJICAgICAgICAgICAgICAgIGlmICghIWNtZCAmJiB0eXBlb2YgY21kLnRoZW4gPT09ICdmdW5jdGlvbicpIHsKCSAgICAgICAgICAgICAgICAgICAgLy8gSXQncyBhIHByb21pc2UsIHNvIHdhaXQgZm9yIGl0CgkgICAgICAgICAgICAgICAgICAgIGNtZAoJICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4ocmVzID0+IHBvc3QoaWQsIHVuZGVmaW5lZCwgcmVzKSkKCSAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaChlID0+IHBvc3QoaWQsIGUpKTsKCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgZWxzZSB7CgkgICAgICAgICAgICAgICAgICAgIC8vIE5vdCBhIHByb21pc2UsIGp1c3QgcmV0dXJuIGl0CgkgICAgICAgICAgICAgICAgICAgIHBvc3QoaWQsIHVuZGVmaW5lZCwgY21kKTsKCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICB9CgkgICAgICAgICAgICBlbHNlIHsKCSAgICAgICAgICAgICAgICAvLyBFcnJvcgoJICAgICAgICAgICAgICAgIHBvc3QoaWQsIG5ldyBFcnJvcihgY29tbWFuZCAiJHtjb21tYW5kfSIgbm90IGZvdW5kYCkpOwoJICAgICAgICAgICAgfQoJICAgICAgICB9CgkgICAgfTsKCSAgICBpZiAoY29tbWFuZHNbZGF0YS50eXBlXSkgewoJICAgICAgICBjb21tYW5kc1tkYXRhLnR5cGVdKGRhdGEpOwoJICAgIH0KCX0pOwoKfSkoKTsKLy8jIHNvdXJjZU1hcHBpbmdVUkw9d29ya2VyLmpzLm1hcAoK', null, false);
	/* eslint-enable */

	const randomString = () => Math.random().toString(36).substring(2);
	class Actor {
	    /**
	     * Creates a new instance of the `Actor` class.
	     * @param subClass - The name of the subclass.
	     * @param args - The arguments to pass to the subclass constructor.
	     */
	    constructor(subClass, args) {
	        // Generate a random initialization ID
	        this.initId = randomString() + '-' + subClass;
	        // Create a new Web Worker and a new Map for handlers
	        this.worker = new WorkerFactory();
	        this.handlers = new Map();
	        // Listen for messages from the worker
	        this.worker.onmessage = (event) => {
	            const data = event.data;
	            const handler = this.handlers.get(data.id);
	            const that = this;
	            if (handler) {
	                // Handle responses from the worker
	                if (data.type === 'response') {
	                    handler.resolve(data.message);
	                }
	                // Handle errors from the worker
	                if (data.type === 'error') {
	                    const error = data.error || new Error(`Unknown error with ${subClass}`);
	                    handler.reject(error);
	                }
	                // Handle initialization responses from the worker
	                if (data.type === 'init_response') {
	                    this._ = Object.keys(data.message)
	                        .map(key => {
	                        const isFn = typeof data.message[key] === 'function';
	                        const subFunction = function () {
	                            return isFn ? (that.exec(key))(...arguments) : that.get(key);
	                        };
	                        return [key, subFunction];
	                    })
	                        .reduce((a, c) => ({ ...a, ...{ [c[0]]: c[1] } }), {});
	                    handler.resolve(this._);
	                }
	            }
	        };
	        // Tell the worker to initialize the subclass
	        this.worker.postMessage({
	            type: 'init',
	            id: this.initId,
	            command: subClass,
	            message: args
	        });
	    }
	    /**
	     * Waits for the initialization of the object to complete and returns the resulting object.
	     * @returns A promise that resolves with the initialized object.
	     */
	    onLoad() {
	        return new Promise((resolve) => {
	            // If initialization is still in progress, add a new handler for the initialization result
	            if (this._ === undefined) {
	                this.handlers.set(this.initId, { resolve, 'reject': resolve });
	            }
	            else {
	                // Otherwise, immediately resolve the promise with the initialized object
	                resolve(this._);
	            }
	        });
	    }
	    /**
	     * returns a Promise for a given command that will be executed in a worker.
	     * @param command - The command to execute.
	     * @returns A Promise that resolves with the result of the command execution or rejects with an error.
	     */
	    exec(command) {
	        // Keep track of this class
	        const that = this;
	        // Return a function that returns a Promise
	        return function (...args) {
	            return new Promise((resolve, reject) => {
	                const id = randomString() + '-' + command;
	                // Set up the resolve and reject handlers for the Promise
	                that.handlers.set(id, { resolve, reject });
	                // Tell the worker to run the command with the provided arguments
	                that.worker.postMessage({
	                    type: 'exec',
	                    id: id,
	                    command: command,
	                    message: [...args]
	                });
	            });
	        };
	    }
	    /**
	     * Returns a Promise that resolves with the result of a command sent to a Web Worker.
	     * @param command - The command to send to the Web Worker.
	     * @returns A Promise that resolves with the result of the command.
	     */
	    get(command) {
	        return new Promise((resolve, reject) => {
	            // Generate a unique ID for this request
	            const id = randomString() + '-' + command;
	            // Store the resolve and reject functions for later use
	            this.handlers.set(id, { resolve, reject });
	            // Send the command to the worker
	            this.worker.postMessage({
	                type: 'get',
	                id,
	                command,
	                message: [],
	            });
	        });
	    }
	}

	// Make sure we can support workers in the current browser / runtime
	const supportsWorkers = () => {
	    let supported = false;
	    try {
	        supported = typeof (window.Worker) === 'function';
	    }
	    catch (e) {
	        supported = false;
	    }
	    return supported;
	};
	// Safari changes https:// to http// for some reason, so this is broken in Safari and iPhone
	// So to fix this we add it back
	const needsUrlCheck = (new URL('test://http://example.com')).href !== 'test://http://example.com';
	const checkUrl = (url) => {
	    const safariFixRegex = new RegExp('^(https?)(\/\/)');
	    const cleanUrl = url.replace(safariFixRegex, '$1:$2');
	    return cleanUrl;
	};
	/**
	 * The processData function accepts a URL, prefix, and an optional controller
	 * and tries to read and convert the data
	 * @param url - The URL of the resource.
	 * @param prefix - The prefix used to process the data
	 * @param controller - optional controller that can be used to cancel a request
	 * @returns A geojson FeatureCollection (or undefined)
	 */
	async function processData(url, prefix, controller) {
	    const response = await fetch(url, controller ? { signal: controller.signal } : undefined);
	    let options = {};
	    try {
	        // Parse the URL
	        const urlObject = new URL(url, window.location.href);
	        // Extract the hash (including the "#" symbol)
	        const hash = urlObject.hash;
	        // Remove the "#" symbol from the hash and decode it
	        const decodedHash = decodeURIComponent(hash.slice(1)); // Remove the "#" symbol
	        options = JSON.parse(decodedHash);
	    }
	    catch (error) {
	        console.warn('Error parsing or reading URL:', error);
	    }
	    if (response.status == 200) {
	        const rawData = await response.text();
	        let convertPromise;
	        if (['kml', 'tcx', 'gpx'].indexOf(prefix) >= 0 || !supportsWorkers()) {
	            // XML uses the DOM, which isn't available to web workers
	            const converter = new Converter(prefix, rawData, options);
	            convertPromise = converter.convert();
	        }
	        else {
	            const converter = new Actor('Converter', [prefix, rawData, options]);
	            convertPromise = converter.exec('convert')();
	        }
	        return await convertPromise;
	    }
	    else {
	        throw (new Error(`Data fetch error: ${response.statusText}`));
	    }
	}
	/**
	 * The VectorTextProtocol function handles requests for vector data and returns a Promise with the
	 * response callback function.
	 * Modeled after this: https://github.com/maplibre/maplibre-gl-js/blob/ddf69421c6ae34c808afefec309a5beecdb7500e/src/index.ts#L151
	 * @param requestParameters - The request parameters containing the URL of the resource.
	 * @param callback - The function to be called when the response is available.
	 * @returns An object with the cancel function.
	 */
	const VectorTextProtocol = (requestParameters, callback) => {
	    const controller = new AbortController();
	    const prefix = requestParameters.url.split('://')[0];
	    const url = requestParameters.url.replace(new RegExp(`^${prefix}://`), '');
	    // Apply the Safari fix
	    const cleanUrl = needsUrlCheck ? checkUrl(url) : url;
	    if (cleanUrl) {
	        processData(cleanUrl, prefix, controller)
	            .then(data => callback(null, data))
	            .catch(e => callback(e));
	    }
	    // Allow the request to be cancelled
	    return { cancel: () => { controller.abort(); } };
	};
	const addOptions = (url, options) => {
	    try {
	        // Parse the original URL
	        const urlObject = new URL(url);
	        // Set the hash property with the GeoJSON data
	        urlObject.hash = `#${encodeURIComponent(JSON.stringify(options))}`;
	        // Convert the updated URL object back to a string
	        return urlObject.toString();
	    }
	    catch (error) {
	        console.error('Error parsing or updating URL:', error);
	        return url; // Return the original URL if there's an error
	    }
	};
	/**
	 * Add the vector text protocol to a map library for each supported format.
	 * @param mapLibrary - The MapLibrary object to add the protocols to.
	 */
	const addProtocols = (mapLibrary) => {
	    supportedFormats.forEach(type => {
	        mapLibrary.addProtocol(type, VectorTextProtocol);
	    });
	};

	exports.VectorTextProtocol = VectorTextProtocol;
	exports.addOptions = addOptions;
	exports.addProtocols = addProtocols;

}));
