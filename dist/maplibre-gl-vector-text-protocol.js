(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.VectorTextProtocol = {}));
})(this, (function (exports) { 'use strict';

	function getAugmentedNamespace(n) {
	  if (n.__esModule) return n;
	  var f = n.default;
		if (typeof f == "function") {
			var a = function a () {
				if (this instanceof a) {
					var args = [null];
					args.push.apply(args, arguments);
					var Ctor = Function.bind.apply(f, args);
					return new Ctor();
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
		dsvFormat: dsv$1,
		csvParse: csvParse,
		csvParseRows: csvParseRows,
		csvFormat: csvFormat,
		csvFormatRows: csvFormatRows,
		tsvParse: tsvParse,
		tsvParseRows: tsvParseRows,
		tsvFormat: tsvFormat,
		tsvFormatRows: tsvFormatRows
	});

	var require$$0 = /*@__PURE__*/getAugmentedNamespace(d3Dsv);

	var sexagesimalExports = {};
	var sexagesimal$1 = {
	  get exports(){ return sexagesimalExports; },
	  set exports(v){ sexagesimalExports = v; },
	};

	sexagesimal$1.exports = element;
	sexagesimalExports.pair = pair;
	sexagesimalExports.format = format;
	sexagesimalExports.formatPair = formatPair;
	sexagesimalExports.coordToDMS = coordToDMS;


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
	    if (val && callback)
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
	function getPlacemark(node, styleMap, schema) {
	    const { coordTimes, geometries } = getGeometry(node);
	    const feature = {
	        type: "Feature",
	        geometry: geometryListToGeometry(geometries),
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
	            type: "Polygon",
	            coordinates: [ring],
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
	            const angle = Math.atan2(dy, dx) - rotation * DEGREES_TO_RADIANS;
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
	                type: "Polygon",
	                coordinates,
	            };
	        }
	    }
	    return null;
	}
	function getGroundOverlay(node, styleMap, schema) {
	    const geometry = getGroundOverlayBox(node);
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
	function kmlWithFolders(node) {
	    const styleMap = buildStyleMap(node);
	    const schema = buildSchema(node);
	    const tree = { type: "root", children: [] };
	    function traverse(node, pointer) {
	        if (isElement(node)) {
	            switch (node.tagName) {
	                case "GroundOverlay": {
	                    const placemark = getGroundOverlay(node, styleMap, schema);
	                    if (placemark) {
	                        pointer.children.push(placemark);
	                    }
	                    break;
	                }
	                case "Placemark": {
	                    const placemark = getPlacemark(node, styleMap, schema);
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
	                traverse(node.childNodes[i], pointer);
	            }
	        }
	    }
	    traverse(node, tree);
	    return tree;
	}
	/**
	 * Convert KML to GeoJSON incrementally, returning
	 * a [Generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators)
	 * that yields output feature by feature.
	 */
	function* kmlGen(node) {
	    const styleMap = buildStyleMap(node);
	    const schema = buildSchema(node);
	    for (const placemark of $(node, "Placemark")) {
	        const feature = getPlacemark(placemark, styleMap, schema);
	        if (feature)
	            yield feature;
	    }
	    for (const groundOverlay of $(node, "GroundOverlay")) {
	        const feature = getGroundOverlay(groundOverlay, styleMap, schema);
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
	function kml(node) {
	    return {
	        type: "FeatureCollection",
	        features: Array.from(kmlGen(node)),
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

	const supportedFormats = ['topojson', 'kml', 'gpx', 'tcx', 'csv', 'tsv'];
	class Converter {
	    constructor(format, data) {
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
	        const converters = {
	            'topojson': this.loadTopoJson,
	            'kml': this.loadXml,
	            'gpx': this.loadXml,
	            'tcx': this.loadXml,
	            'csv': this.loadCsv,
	            'tsv': this.loadCsv
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
	        let options = {}; // TODO allow CSV options
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

	var WorkerFactory = createBase64WorkerFactory('Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwooZnVuY3Rpb24gKCkgewoJJ3VzZSBzdHJpY3QnOwoKCWZ1bmN0aW9uIGdldEF1Z21lbnRlZE5hbWVzcGFjZShuKSB7CgkgIGlmIChuLl9fZXNNb2R1bGUpIHJldHVybiBuOwoJICB2YXIgZiA9IG4uZGVmYXVsdDsKCQlpZiAodHlwZW9mIGYgPT0gImZ1bmN0aW9uIikgewoJCQl2YXIgYSA9IGZ1bmN0aW9uIGEgKCkgewoJCQkJaWYgKHRoaXMgaW5zdGFuY2VvZiBhKSB7CgkJCQkJdmFyIGFyZ3MgPSBbbnVsbF07CgkJCQkJYXJncy5wdXNoLmFwcGx5KGFyZ3MsIGFyZ3VtZW50cyk7CgkJCQkJdmFyIEN0b3IgPSBGdW5jdGlvbi5iaW5kLmFwcGx5KGYsIGFyZ3MpOwoJCQkJCXJldHVybiBuZXcgQ3RvcigpOwoJCQkJfQoJCQkJcmV0dXJuIGYuYXBwbHkodGhpcywgYXJndW1lbnRzKTsKCQkJfTsKCQkJYS5wcm90b3R5cGUgPSBmLnByb3RvdHlwZTsKCSAgfSBlbHNlIGEgPSB7fTsKCSAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGEsICdfX2VzTW9kdWxlJywge3ZhbHVlOiB0cnVlfSk7CgkJT2JqZWN0LmtleXMobikuZm9yRWFjaChmdW5jdGlvbiAoaykgewoJCQl2YXIgZCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iobiwgayk7CgkJCU9iamVjdC5kZWZpbmVQcm9wZXJ0eShhLCBrLCBkLmdldCA/IGQgOiB7CgkJCQllbnVtZXJhYmxlOiB0cnVlLAoJCQkJZ2V0OiBmdW5jdGlvbiAoKSB7CgkJCQkJcmV0dXJuIG5ba107CgkJCQl9CgkJCX0pOwoJCX0pOwoJCXJldHVybiBhOwoJfQoKCWZ1bmN0aW9uIG9iamVjdENvbnZlcnRlcihjb2x1bW5zKSB7CgkgIHJldHVybiBuZXcgRnVuY3Rpb24oImQiLCAicmV0dXJuIHsiICsgY29sdW1ucy5tYXAoZnVuY3Rpb24obmFtZSwgaSkgewoJICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShuYW1lKSArICI6IGRbIiArIGkgKyAiXSI7CgkgIH0pLmpvaW4oIiwiKSArICJ9Iik7Cgl9CgoJZnVuY3Rpb24gY3VzdG9tQ29udmVydGVyKGNvbHVtbnMsIGYpIHsKCSAgdmFyIG9iamVjdCA9IG9iamVjdENvbnZlcnRlcihjb2x1bW5zKTsKCSAgcmV0dXJuIGZ1bmN0aW9uKHJvdywgaSkgewoJICAgIHJldHVybiBmKG9iamVjdChyb3cpLCBpLCBjb2x1bW5zKTsKCSAgfTsKCX0KCgkvLyBDb21wdXRlIHVuaXF1ZSBjb2x1bW5zIGluIG9yZGVyIG9mIGRpc2NvdmVyeS4KCWZ1bmN0aW9uIGluZmVyQ29sdW1ucyhyb3dzKSB7CgkgIHZhciBjb2x1bW5TZXQgPSBPYmplY3QuY3JlYXRlKG51bGwpLAoJICAgICAgY29sdW1ucyA9IFtdOwoKCSAgcm93cy5mb3JFYWNoKGZ1bmN0aW9uKHJvdykgewoJICAgIGZvciAodmFyIGNvbHVtbiBpbiByb3cpIHsKCSAgICAgIGlmICghKGNvbHVtbiBpbiBjb2x1bW5TZXQpKSB7CgkgICAgICAgIGNvbHVtbnMucHVzaChjb2x1bW5TZXRbY29sdW1uXSA9IGNvbHVtbik7CgkgICAgICB9CgkgICAgfQoJICB9KTsKCgkgIHJldHVybiBjb2x1bW5zOwoJfQoKCWZ1bmN0aW9uIGRzdiQxKGRlbGltaXRlcikgewoJICB2YXIgcmVGb3JtYXQgPSBuZXcgUmVnRXhwKCJbXCIiICsgZGVsaW1pdGVyICsgIlxuXSIpLAoJICAgICAgZGVsaW1pdGVyQ29kZSA9IGRlbGltaXRlci5jaGFyQ29kZUF0KDApOwoKCSAgZnVuY3Rpb24gcGFyc2UodGV4dCwgZikgewoJICAgIHZhciBjb252ZXJ0LCBjb2x1bW5zLCByb3dzID0gcGFyc2VSb3dzKHRleHQsIGZ1bmN0aW9uKHJvdywgaSkgewoJICAgICAgaWYgKGNvbnZlcnQpIHJldHVybiBjb252ZXJ0KHJvdywgaSAtIDEpOwoJICAgICAgY29sdW1ucyA9IHJvdywgY29udmVydCA9IGYgPyBjdXN0b21Db252ZXJ0ZXIocm93LCBmKSA6IG9iamVjdENvbnZlcnRlcihyb3cpOwoJICAgIH0pOwoJICAgIHJvd3MuY29sdW1ucyA9IGNvbHVtbnM7CgkgICAgcmV0dXJuIHJvd3M7CgkgIH0KCgkgIGZ1bmN0aW9uIHBhcnNlUm93cyh0ZXh0LCBmKSB7CgkgICAgdmFyIEVPTCA9IHt9LCAvLyBzZW50aW5lbCB2YWx1ZSBmb3IgZW5kLW9mLWxpbmUKCSAgICAgICAgRU9GID0ge30sIC8vIHNlbnRpbmVsIHZhbHVlIGZvciBlbmQtb2YtZmlsZQoJICAgICAgICByb3dzID0gW10sIC8vIG91dHB1dCByb3dzCgkgICAgICAgIE4gPSB0ZXh0Lmxlbmd0aCwKCSAgICAgICAgSSA9IDAsIC8vIGN1cnJlbnQgY2hhcmFjdGVyIGluZGV4CgkgICAgICAgIG4gPSAwLCAvLyB0aGUgY3VycmVudCBsaW5lIG51bWJlcgoJICAgICAgICB0LCAvLyB0aGUgY3VycmVudCB0b2tlbgoJICAgICAgICBlb2w7IC8vIGlzIHRoZSBjdXJyZW50IHRva2VuIGZvbGxvd2VkIGJ5IEVPTD8KCgkgICAgZnVuY3Rpb24gdG9rZW4oKSB7CgkgICAgICBpZiAoSSA+PSBOKSByZXR1cm4gRU9GOyAvLyBzcGVjaWFsIGNhc2U6IGVuZCBvZiBmaWxlCgkgICAgICBpZiAoZW9sKSByZXR1cm4gZW9sID0gZmFsc2UsIEVPTDsgLy8gc3BlY2lhbCBjYXNlOiBlbmQgb2YgbGluZQoKCSAgICAgIC8vIHNwZWNpYWwgY2FzZTogcXVvdGVzCgkgICAgICB2YXIgaiA9IEksIGM7CgkgICAgICBpZiAodGV4dC5jaGFyQ29kZUF0KGopID09PSAzNCkgewoJICAgICAgICB2YXIgaSA9IGo7CgkgICAgICAgIHdoaWxlIChpKysgPCBOKSB7CgkgICAgICAgICAgaWYgKHRleHQuY2hhckNvZGVBdChpKSA9PT0gMzQpIHsKCSAgICAgICAgICAgIGlmICh0ZXh0LmNoYXJDb2RlQXQoaSArIDEpICE9PSAzNCkgYnJlYWs7CgkgICAgICAgICAgICArK2k7CgkgICAgICAgICAgfQoJICAgICAgICB9CgkgICAgICAgIEkgPSBpICsgMjsKCSAgICAgICAgYyA9IHRleHQuY2hhckNvZGVBdChpICsgMSk7CgkgICAgICAgIGlmIChjID09PSAxMykgewoJICAgICAgICAgIGVvbCA9IHRydWU7CgkgICAgICAgICAgaWYgKHRleHQuY2hhckNvZGVBdChpICsgMikgPT09IDEwKSArK0k7CgkgICAgICAgIH0gZWxzZSBpZiAoYyA9PT0gMTApIHsKCSAgICAgICAgICBlb2wgPSB0cnVlOwoJICAgICAgICB9CgkgICAgICAgIHJldHVybiB0ZXh0LnNsaWNlKGogKyAxLCBpKS5yZXBsYWNlKC8iIi9nLCAiXCIiKTsKCSAgICAgIH0KCgkgICAgICAvLyBjb21tb24gY2FzZTogZmluZCBuZXh0IGRlbGltaXRlciBvciBuZXdsaW5lCgkgICAgICB3aGlsZSAoSSA8IE4pIHsKCSAgICAgICAgdmFyIGsgPSAxOwoJICAgICAgICBjID0gdGV4dC5jaGFyQ29kZUF0KEkrKyk7CgkgICAgICAgIGlmIChjID09PSAxMCkgZW9sID0gdHJ1ZTsgLy8gXG4KCSAgICAgICAgZWxzZSBpZiAoYyA9PT0gMTMpIHsgZW9sID0gdHJ1ZTsgaWYgKHRleHQuY2hhckNvZGVBdChJKSA9PT0gMTApICsrSSwgKytrOyB9IC8vIFxyfFxyXG4KCSAgICAgICAgZWxzZSBpZiAoYyAhPT0gZGVsaW1pdGVyQ29kZSkgY29udGludWU7CgkgICAgICAgIHJldHVybiB0ZXh0LnNsaWNlKGosIEkgLSBrKTsKCSAgICAgIH0KCgkgICAgICAvLyBzcGVjaWFsIGNhc2U6IGxhc3QgdG9rZW4gYmVmb3JlIEVPRgoJICAgICAgcmV0dXJuIHRleHQuc2xpY2Uoaik7CgkgICAgfQoKCSAgICB3aGlsZSAoKHQgPSB0b2tlbigpKSAhPT0gRU9GKSB7CgkgICAgICB2YXIgYSA9IFtdOwoJICAgICAgd2hpbGUgKHQgIT09IEVPTCAmJiB0ICE9PSBFT0YpIHsKCSAgICAgICAgYS5wdXNoKHQpOwoJICAgICAgICB0ID0gdG9rZW4oKTsKCSAgICAgIH0KCSAgICAgIGlmIChmICYmIChhID0gZihhLCBuKyspKSA9PSBudWxsKSBjb250aW51ZTsKCSAgICAgIHJvd3MucHVzaChhKTsKCSAgICB9CgoJICAgIHJldHVybiByb3dzOwoJICB9CgoJICBmdW5jdGlvbiBmb3JtYXQocm93cywgY29sdW1ucykgewoJICAgIGlmIChjb2x1bW5zID09IG51bGwpIGNvbHVtbnMgPSBpbmZlckNvbHVtbnMocm93cyk7CgkgICAgcmV0dXJuIFtjb2x1bW5zLm1hcChmb3JtYXRWYWx1ZSkuam9pbihkZWxpbWl0ZXIpXS5jb25jYXQocm93cy5tYXAoZnVuY3Rpb24ocm93KSB7CgkgICAgICByZXR1cm4gY29sdW1ucy5tYXAoZnVuY3Rpb24oY29sdW1uKSB7CgkgICAgICAgIHJldHVybiBmb3JtYXRWYWx1ZShyb3dbY29sdW1uXSk7CgkgICAgICB9KS5qb2luKGRlbGltaXRlcik7CgkgICAgfSkpLmpvaW4oIlxuIik7CgkgIH0KCgkgIGZ1bmN0aW9uIGZvcm1hdFJvd3Mocm93cykgewoJICAgIHJldHVybiByb3dzLm1hcChmb3JtYXRSb3cpLmpvaW4oIlxuIik7CgkgIH0KCgkgIGZ1bmN0aW9uIGZvcm1hdFJvdyhyb3cpIHsKCSAgICByZXR1cm4gcm93Lm1hcChmb3JtYXRWYWx1ZSkuam9pbihkZWxpbWl0ZXIpOwoJICB9CgoJICBmdW5jdGlvbiBmb3JtYXRWYWx1ZSh0ZXh0KSB7CgkgICAgcmV0dXJuIHRleHQgPT0gbnVsbCA/ICIiCgkgICAgICAgIDogcmVGb3JtYXQudGVzdCh0ZXh0ICs9ICIiKSA/ICJcIiIgKyB0ZXh0LnJlcGxhY2UoL1wiL2csICJcIlwiIikgKyAiXCIiCgkgICAgICAgIDogdGV4dDsKCSAgfQoKCSAgcmV0dXJuIHsKCSAgICBwYXJzZTogcGFyc2UsCgkgICAgcGFyc2VSb3dzOiBwYXJzZVJvd3MsCgkgICAgZm9ybWF0OiBmb3JtYXQsCgkgICAgZm9ybWF0Um93czogZm9ybWF0Um93cwoJICB9OwoJfQoKCXZhciBjc3YgPSBkc3YkMSgiLCIpOwoKCXZhciBjc3ZQYXJzZSA9IGNzdi5wYXJzZTsKCXZhciBjc3ZQYXJzZVJvd3MgPSBjc3YucGFyc2VSb3dzOwoJdmFyIGNzdkZvcm1hdCA9IGNzdi5mb3JtYXQ7Cgl2YXIgY3N2Rm9ybWF0Um93cyA9IGNzdi5mb3JtYXRSb3dzOwoKCXZhciB0c3YgPSBkc3YkMSgiXHQiKTsKCgl2YXIgdHN2UGFyc2UgPSB0c3YucGFyc2U7Cgl2YXIgdHN2UGFyc2VSb3dzID0gdHN2LnBhcnNlUm93czsKCXZhciB0c3ZGb3JtYXQgPSB0c3YuZm9ybWF0OwoJdmFyIHRzdkZvcm1hdFJvd3MgPSB0c3YuZm9ybWF0Um93czsKCgl2YXIgZDNEc3YgPSAvKiNfX1BVUkVfXyovT2JqZWN0LmZyZWV6ZSh7CgkJX19wcm90b19fOiBudWxsLAoJCWRzdkZvcm1hdDogZHN2JDEsCgkJY3N2UGFyc2U6IGNzdlBhcnNlLAoJCWNzdlBhcnNlUm93czogY3N2UGFyc2VSb3dzLAoJCWNzdkZvcm1hdDogY3N2Rm9ybWF0LAoJCWNzdkZvcm1hdFJvd3M6IGNzdkZvcm1hdFJvd3MsCgkJdHN2UGFyc2U6IHRzdlBhcnNlLAoJCXRzdlBhcnNlUm93czogdHN2UGFyc2VSb3dzLAoJCXRzdkZvcm1hdDogdHN2Rm9ybWF0LAoJCXRzdkZvcm1hdFJvd3M6IHRzdkZvcm1hdFJvd3MKCX0pOwoKCXZhciByZXF1aXJlJCQwID0gLypAX19QVVJFX18qL2dldEF1Z21lbnRlZE5hbWVzcGFjZShkM0Rzdik7CgoJdmFyIHNleGFnZXNpbWFsRXhwb3J0cyA9IHt9OwoJdmFyIHNleGFnZXNpbWFsJDEgPSB7CgkgIGdldCBleHBvcnRzKCl7IHJldHVybiBzZXhhZ2VzaW1hbEV4cG9ydHM7IH0sCgkgIHNldCBleHBvcnRzKHYpeyBzZXhhZ2VzaW1hbEV4cG9ydHMgPSB2OyB9LAoJfTsKCglzZXhhZ2VzaW1hbCQxLmV4cG9ydHMgPSBlbGVtZW50OwoJc2V4YWdlc2ltYWxFeHBvcnRzLnBhaXIgPSBwYWlyOwoJc2V4YWdlc2ltYWxFeHBvcnRzLmZvcm1hdCA9IGZvcm1hdDsKCXNleGFnZXNpbWFsRXhwb3J0cy5mb3JtYXRQYWlyID0gZm9ybWF0UGFpcjsKCXNleGFnZXNpbWFsRXhwb3J0cy5jb29yZFRvRE1TID0gY29vcmRUb0RNUzsKCgoJZnVuY3Rpb24gZWxlbWVudChpbnB1dCwgZGltcykgewoJICB2YXIgcmVzdWx0ID0gc2VhcmNoKGlucHV0LCBkaW1zKTsKCSAgcmV0dXJuIChyZXN1bHQgPT09IG51bGwpID8gbnVsbCA6IHJlc3VsdC52YWw7Cgl9CgoKCWZ1bmN0aW9uIGZvcm1hdFBhaXIoaW5wdXQpIHsKCSAgcmV0dXJuIGZvcm1hdChpbnB1dC5sYXQsICdsYXQnKSArICcgJyArIGZvcm1hdChpbnB1dC5sb24sICdsb24nKTsKCX0KCgoJLy8gSXMgMCBOb3J0aCBvciBTb3V0aD8KCWZ1bmN0aW9uIGZvcm1hdChpbnB1dCwgZGltKSB7CgkgIHZhciBkbXMgPSBjb29yZFRvRE1TKGlucHV0LCBkaW0pOwoJICByZXR1cm4gZG1zLndob2xlICsgJ8KwICcgKwoJICAgIChkbXMubWludXRlcyA/IGRtcy5taW51dGVzICsgJ1wnICcgOiAnJykgKwoJICAgIChkbXMuc2Vjb25kcyA/IGRtcy5zZWNvbmRzICsgJyIgJyA6ICcnKSArIGRtcy5kaXI7Cgl9CgoKCWZ1bmN0aW9uIGNvb3JkVG9ETVMoaW5wdXQsIGRpbSkgewoJICB2YXIgZGlycyA9IHsgbGF0OiBbJ04nLCAnUyddLCBsb246IFsnRScsICdXJ10gfVtkaW1dIHx8ICcnOwoJICB2YXIgZGlyID0gZGlyc1tpbnB1dCA+PSAwID8gMCA6IDFdOwoJICB2YXIgYWJzID0gTWF0aC5hYnMoaW5wdXQpOwoJICB2YXIgd2hvbGUgPSBNYXRoLmZsb29yKGFicyk7CgkgIHZhciBmcmFjdGlvbiA9IGFicyAtIHdob2xlOwoJICB2YXIgZnJhY3Rpb25NaW51dGVzID0gZnJhY3Rpb24gKiA2MDsKCSAgdmFyIG1pbnV0ZXMgPSBNYXRoLmZsb29yKGZyYWN0aW9uTWludXRlcyk7CgkgIHZhciBzZWNvbmRzID0gTWF0aC5mbG9vcigoZnJhY3Rpb25NaW51dGVzIC0gbWludXRlcykgKiA2MCk7CgoJICByZXR1cm4gewoJICAgIHdob2xlOiB3aG9sZSwKCSAgICBtaW51dGVzOiBtaW51dGVzLAoJICAgIHNlY29uZHM6IHNlY29uZHMsCgkgICAgZGlyOiBkaXIKCSAgfTsKCX0KCgoJZnVuY3Rpb24gc2VhcmNoKGlucHV0LCBkaW1zKSB7CgkgIGlmICghZGltcykgZGltcyA9ICdOU0VXJzsKCSAgaWYgKHR5cGVvZiBpbnB1dCAhPT0gJ3N0cmluZycpIHJldHVybiBudWxsOwoKCSAgaW5wdXQgPSBpbnB1dC50b1VwcGVyQ2FzZSgpOwoJICB2YXIgcmVnZXggPSAvXltcc1wsXSooW05TRVddKT9ccyooW1wtfFzigJR8XOKAlV0/WzAtOS5dKylbwrDCusuaXT9ccyooPzooWzAtOS5dKylbJ+KAmeKAsuKAmF1ccyopPyg/OihbMC05Ll0rKSg/OicnfCJ84oCdfOKAsylccyopPyhbTlNFV10pPy87CgoJICB2YXIgbSA9IGlucHV0Lm1hdGNoKHJlZ2V4KTsKCSAgaWYgKCFtKSByZXR1cm4gbnVsbDsgIC8vIG5vIG1hdGNoCgoJICB2YXIgbWF0Y2hlZCA9IG1bMF07CgoJICAvLyBleHRyYWN0IGRpbWVuc2lvbi4uIG1bMV0gPSBsZWFkaW5nLCBtWzVdID0gdHJhaWxpbmcKCSAgdmFyIGRpbTsKCSAgaWYgKG1bMV0gJiYgbVs1XSkgeyAgICAgICAgICAgICAgICAgLy8gaWYgbWF0Y2hlZCBib3RoLi4KCSAgICBkaW0gPSBtWzFdOyAgICAgICAgICAgICAgICAgICAgICAgLy8ga2VlcCBsZWFkaW5nCgkgICAgbWF0Y2hlZCA9IG1hdGNoZWQuc2xpY2UoMCwgLTEpOyAgIC8vIHJlbW92ZSB0cmFpbGluZyBkaW1lbnNpb24gZnJvbSBtYXRjaAoJICB9IGVsc2UgewoJICAgIGRpbSA9IG1bMV0gfHwgbVs1XTsKCSAgfQoKCSAgLy8gaWYgdW5yZWNvZ25pemVkIGRpbWVuc2lvbgoJICBpZiAoZGltICYmIGRpbXMuaW5kZXhPZihkaW0pID09PSAtMSkgcmV0dXJuIG51bGw7CgoJICAvLyBleHRyYWN0IERNUwoJICB2YXIgZGVnID0gbVsyXSA/IHBhcnNlRmxvYXQobVsyXSkgOiAwOwoJICB2YXIgbWluID0gbVszXSA/IHBhcnNlRmxvYXQobVszXSkgLyA2MCA6IDA7CgkgIHZhciBzZWMgPSBtWzRdID8gcGFyc2VGbG9hdChtWzRdKSAvIDM2MDAgOiAwOwoJICB2YXIgc2lnbiA9IChkZWcgPCAwKSA/IC0xIDogMTsKCSAgaWYgKGRpbSA9PT0gJ1MnIHx8IGRpbSA9PT0gJ1cnKSBzaWduICo9IC0xOwoKCSAgcmV0dXJuIHsKCSAgICB2YWw6IChNYXRoLmFicyhkZWcpICsgbWluICsgc2VjKSAqIHNpZ24sCgkgICAgZGltOiBkaW0sCgkgICAgbWF0Y2hlZDogbWF0Y2hlZCwKCSAgICByZW1haW46IGlucHV0LnNsaWNlKG1hdGNoZWQubGVuZ3RoKQoJICB9OwoJfQoKCglmdW5jdGlvbiBwYWlyKGlucHV0LCBkaW1zKSB7CgkgIGlucHV0ID0gaW5wdXQudHJpbSgpOwoJICB2YXIgb25lID0gc2VhcmNoKGlucHV0LCBkaW1zKTsKCSAgaWYgKCFvbmUpIHJldHVybiBudWxsOwoKCSAgaW5wdXQgPSBvbmUucmVtYWluLnRyaW0oKTsKCSAgdmFyIHR3byA9IHNlYXJjaChpbnB1dCwgZGltcyk7CgkgIGlmICghdHdvIHx8IHR3by5yZW1haW4pIHJldHVybiBudWxsOwoKCSAgaWYgKG9uZS5kaW0pIHsKCSAgICByZXR1cm4gc3dhcGRpbShvbmUudmFsLCB0d28udmFsLCBvbmUuZGltKTsKCSAgfSBlbHNlIHsKCSAgICByZXR1cm4gW29uZS52YWwsIHR3by52YWxdOwoJICB9Cgl9CgoKCWZ1bmN0aW9uIHN3YXBkaW0oYSwgYiwgZGltKSB7CgkgIGlmIChkaW0gPT09ICdOJyB8fCBkaW0gPT09ICdTJykgcmV0dXJuIFthLCBiXTsKCSAgaWYgKGRpbSA9PT0gJ1cnIHx8IGRpbSA9PT0gJ0UnKSByZXR1cm4gW2IsIGFdOwoJfQoKCXZhciBkc3YgPSByZXF1aXJlJCQwLAoJICAgIHNleGFnZXNpbWFsID0gc2V4YWdlc2ltYWxFeHBvcnRzOwoKCXZhciBsYXRSZWdleCA9IC8oTGF0KShpdHVkZSk/L2dpLAoJICAgIGxvblJlZ2V4ID0gLyhMKShvbnxuZykoZ2l0dWRlKT8vaTsKCglmdW5jdGlvbiBndWVzc0hlYWRlcihyb3csIHJlZ2V4cCkgewoJICAgIHZhciBuYW1lLCBtYXRjaCwgc2NvcmU7CgkgICAgZm9yICh2YXIgZiBpbiByb3cpIHsKCSAgICAgICAgbWF0Y2ggPSBmLm1hdGNoKHJlZ2V4cCk7CgkgICAgICAgIGlmIChtYXRjaCAmJiAoIW5hbWUgfHwgbWF0Y2hbMF0ubGVuZ3RoIC8gZi5sZW5ndGggPiBzY29yZSkpIHsKCSAgICAgICAgICAgIHNjb3JlID0gbWF0Y2hbMF0ubGVuZ3RoIC8gZi5sZW5ndGg7CgkgICAgICAgICAgICBuYW1lID0gZjsKCSAgICAgICAgfQoJICAgIH0KCSAgICByZXR1cm4gbmFtZTsKCX0KCglmdW5jdGlvbiBndWVzc0xhdEhlYWRlcihyb3cpIHsgcmV0dXJuIGd1ZXNzSGVhZGVyKHJvdywgbGF0UmVnZXgpOyB9CglmdW5jdGlvbiBndWVzc0xvbkhlYWRlcihyb3cpIHsgcmV0dXJuIGd1ZXNzSGVhZGVyKHJvdywgbG9uUmVnZXgpOyB9CgoJZnVuY3Rpb24gaXNMYXQoZikgeyByZXR1cm4gISFmLm1hdGNoKGxhdFJlZ2V4KTsgfQoJZnVuY3Rpb24gaXNMb24oZikgeyByZXR1cm4gISFmLm1hdGNoKGxvblJlZ2V4KTsgfQoKCWZ1bmN0aW9uIGtleUNvdW50KG8pIHsKCSAgICByZXR1cm4gKHR5cGVvZiBvID09ICdvYmplY3QnKSA/IE9iamVjdC5rZXlzKG8pLmxlbmd0aCA6IDA7Cgl9CgoJZnVuY3Rpb24gYXV0b0RlbGltaXRlcih4KSB7CgkgICAgdmFyIGRlbGltaXRlcnMgPSBbJywnLCAnOycsICdcdCcsICd8J107CgkgICAgdmFyIHJlc3VsdHMgPSBbXTsKCgkgICAgZGVsaW1pdGVycy5mb3JFYWNoKGZ1bmN0aW9uIChkZWxpbWl0ZXIpIHsKCSAgICAgICAgdmFyIHJlcyA9IGRzdi5kc3ZGb3JtYXQoZGVsaW1pdGVyKS5wYXJzZSh4KTsKCSAgICAgICAgaWYgKHJlcy5sZW5ndGggPj0gMSkgewoJICAgICAgICAgICAgdmFyIGNvdW50ID0ga2V5Q291bnQocmVzWzBdKTsKCSAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVzLmxlbmd0aDsgaSsrKSB7CgkgICAgICAgICAgICAgICAgaWYgKGtleUNvdW50KHJlc1tpXSkgIT09IGNvdW50KSByZXR1cm47CgkgICAgICAgICAgICB9CgkgICAgICAgICAgICByZXN1bHRzLnB1c2goewoJICAgICAgICAgICAgICAgIGRlbGltaXRlcjogZGVsaW1pdGVyLAoJICAgICAgICAgICAgICAgIGFyaXR5OiBPYmplY3Qua2V5cyhyZXNbMF0pLmxlbmd0aCwKCSAgICAgICAgICAgIH0pOwoJICAgICAgICB9CgkgICAgfSk7CgoJICAgIGlmIChyZXN1bHRzLmxlbmd0aCkgewoJICAgICAgICByZXR1cm4gcmVzdWx0cy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7CgkgICAgICAgICAgICByZXR1cm4gYi5hcml0eSAtIGEuYXJpdHk7CgkgICAgICAgIH0pWzBdLmRlbGltaXRlcjsKCSAgICB9IGVsc2UgewoJICAgICAgICByZXR1cm4gbnVsbDsKCSAgICB9Cgl9CgoJLyoqCgkgKiBTaWxseSBzdG9wZ2FwIGZvciBkc3YgdG8gZDMtZHN2IHVwZ3JhZGUKCSAqCgkgKiBAcGFyYW0ge0FycmF5fSB4IGRzdiBvdXRwdXQKCSAqIEByZXR1cm5zIHtBcnJheX0gYXJyYXkgd2l0aG91dCBjb2x1bW5zIG1lbWJlcgoJICovCglmdW5jdGlvbiBkZWxldGVDb2x1bW5zKHgpIHsKCSAgICBkZWxldGUgeC5jb2x1bW5zOwoJICAgIHJldHVybiB4OwoJfQoKCWZ1bmN0aW9uIGF1dG8oeCkgewoJICAgIHZhciBkZWxpbWl0ZXIgPSBhdXRvRGVsaW1pdGVyKHgpOwoJICAgIGlmICghZGVsaW1pdGVyKSByZXR1cm4gbnVsbDsKCSAgICByZXR1cm4gZGVsZXRlQ29sdW1ucyhkc3YuZHN2Rm9ybWF0KGRlbGltaXRlcikucGFyc2UoeCkpOwoJfQoKCWZ1bmN0aW9uIGNzdjJnZW9qc29uKHgsIG9wdGlvbnMsIGNhbGxiYWNrKSB7CgoJICAgIGlmICghY2FsbGJhY2spIHsKCSAgICAgICAgY2FsbGJhY2sgPSBvcHRpb25zOwoJICAgICAgICBvcHRpb25zID0ge307CgkgICAgfQoKCSAgICBvcHRpb25zLmRlbGltaXRlciA9IG9wdGlvbnMuZGVsaW1pdGVyIHx8ICcsJzsKCgkgICAgdmFyIGxhdGZpZWxkID0gb3B0aW9ucy5sYXRmaWVsZCB8fCAnJywKCSAgICAgICAgbG9uZmllbGQgPSBvcHRpb25zLmxvbmZpZWxkIHx8ICcnLAoJICAgICAgICBjcnMgPSBvcHRpb25zLmNycyB8fCAnJzsKCgkgICAgdmFyIGZlYXR1cmVzID0gW10sCgkgICAgICAgIGZlYXR1cmVjb2xsZWN0aW9uID0ge3R5cGU6ICdGZWF0dXJlQ29sbGVjdGlvbicsIGZlYXR1cmVzOiBmZWF0dXJlc307CgoJICAgIGlmIChjcnMgIT09ICcnKSB7CgkgICAgICAgIGZlYXR1cmVjb2xsZWN0aW9uLmNycyA9IHt0eXBlOiAnbmFtZScsIHByb3BlcnRpZXM6IHtuYW1lOiBjcnN9fTsKCSAgICB9CgoJICAgIGlmIChvcHRpb25zLmRlbGltaXRlciA9PT0gJ2F1dG8nICYmIHR5cGVvZiB4ID09ICdzdHJpbmcnKSB7CgkgICAgICAgIG9wdGlvbnMuZGVsaW1pdGVyID0gYXV0b0RlbGltaXRlcih4KTsKCSAgICAgICAgaWYgKCFvcHRpb25zLmRlbGltaXRlcikgewoJICAgICAgICAgICAgY2FsbGJhY2soewoJICAgICAgICAgICAgICAgIHR5cGU6ICdFcnJvcicsCgkgICAgICAgICAgICAgICAgbWVzc2FnZTogJ0NvdWxkIG5vdCBhdXRvZGV0ZWN0IGRlbGltaXRlcicKCSAgICAgICAgICAgIH0pOwoJICAgICAgICAgICAgcmV0dXJuOwoJICAgICAgICB9CgkgICAgfQoKCSAgICB2YXIgbnVtZXJpY0ZpZWxkcyA9IG9wdGlvbnMubnVtZXJpY0ZpZWxkcyA/IG9wdGlvbnMubnVtZXJpY0ZpZWxkcy5zcGxpdCgnLCcpIDogbnVsbDsKCgkgICAgdmFyIHBhcnNlZCA9ICh0eXBlb2YgeCA9PSAnc3RyaW5nJykgPwoJICAgICAgICBkc3YuZHN2Rm9ybWF0KG9wdGlvbnMuZGVsaW1pdGVyKS5wYXJzZSh4LCBmdW5jdGlvbiAoZCkgewoJICAgICAgICAgICAgaWYgKG51bWVyaWNGaWVsZHMpIHsKCSAgICAgICAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gZCkgewoJICAgICAgICAgICAgICAgICAgICBpZiAobnVtZXJpY0ZpZWxkcy5pbmNsdWRlcyhrZXkpKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICBkW2tleV0gPSArZFtrZXldOwoJICAgICAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgfQoJICAgICAgICAgICAgcmV0dXJuIGQ7CgkgICAgICAgIH0pIDogeDsKCgkgICAgaWYgKCFwYXJzZWQubGVuZ3RoKSB7CgkgICAgICAgIGNhbGxiYWNrKG51bGwsIGZlYXR1cmVjb2xsZWN0aW9uKTsKCSAgICAgICAgcmV0dXJuOwoJICAgIH0KCgkgICAgdmFyIGVycm9ycyA9IFtdOwoJICAgIHZhciBpOwoKCgkgICAgaWYgKCFsYXRmaWVsZCkgbGF0ZmllbGQgPSBndWVzc0xhdEhlYWRlcihwYXJzZWRbMF0pOwoJICAgIGlmICghbG9uZmllbGQpIGxvbmZpZWxkID0gZ3Vlc3NMb25IZWFkZXIocGFyc2VkWzBdKTsKCSAgICB2YXIgbm9HZW9tZXRyeSA9ICghbGF0ZmllbGQgfHwgIWxvbmZpZWxkKTsKCgkgICAgaWYgKG5vR2VvbWV0cnkpIHsKCSAgICAgICAgZm9yIChpID0gMDsgaSA8IHBhcnNlZC5sZW5ndGg7IGkrKykgewoJICAgICAgICAgICAgZmVhdHVyZXMucHVzaCh7CgkgICAgICAgICAgICAgICAgdHlwZTogJ0ZlYXR1cmUnLAoJICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHBhcnNlZFtpXSwKCSAgICAgICAgICAgICAgICBnZW9tZXRyeTogbnVsbAoJICAgICAgICAgICAgfSk7CgkgICAgICAgIH0KCSAgICAgICAgY2FsbGJhY2soZXJyb3JzLmxlbmd0aCA/IGVycm9ycyA6IG51bGwsIGZlYXR1cmVjb2xsZWN0aW9uKTsKCSAgICAgICAgcmV0dXJuOwoJICAgIH0KCgkgICAgZm9yIChpID0gMDsgaSA8IHBhcnNlZC5sZW5ndGg7IGkrKykgewoJICAgICAgICBpZiAocGFyc2VkW2ldW2xvbmZpZWxkXSAhPT0gdW5kZWZpbmVkICYmCgkgICAgICAgICAgICBwYXJzZWRbaV1bbGF0ZmllbGRdICE9PSB1bmRlZmluZWQpIHsKCgkgICAgICAgICAgICB2YXIgbG9uayA9IHBhcnNlZFtpXVtsb25maWVsZF0sCgkgICAgICAgICAgICAgICAgbGF0ayA9IHBhcnNlZFtpXVtsYXRmaWVsZF0sCgkgICAgICAgICAgICAgICAgbG9uZiwgbGF0ZiwKCSAgICAgICAgICAgICAgICBhOwoKCSAgICAgICAgICAgIGEgPSBzZXhhZ2VzaW1hbChsb25rLCAnRVcnKTsKCSAgICAgICAgICAgIGlmIChhKSBsb25rID0gYTsKCSAgICAgICAgICAgIGEgPSBzZXhhZ2VzaW1hbChsYXRrLCAnTlMnKTsKCSAgICAgICAgICAgIGlmIChhKSBsYXRrID0gYTsKCgkgICAgICAgICAgICBsb25mID0gcGFyc2VGbG9hdChsb25rKTsKCSAgICAgICAgICAgIGxhdGYgPSBwYXJzZUZsb2F0KGxhdGspOwoKCSAgICAgICAgICAgIGlmIChpc05hTihsb25mKSB8fAoJICAgICAgICAgICAgICAgIGlzTmFOKGxhdGYpKSB7CgkgICAgICAgICAgICAgICAgZXJyb3JzLnB1c2goewoJICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnQSByb3cgY29udGFpbmVkIGFuIGludmFsaWQgdmFsdWUgZm9yIGxhdGl0dWRlIG9yIGxvbmdpdHVkZScsCgkgICAgICAgICAgICAgICAgICAgIHJvdzogcGFyc2VkW2ldLAoJICAgICAgICAgICAgICAgICAgICBpbmRleDogaQoJICAgICAgICAgICAgICAgIH0pOwoJICAgICAgICAgICAgfSBlbHNlIHsKCSAgICAgICAgICAgICAgICBpZiAoIW9wdGlvbnMuaW5jbHVkZUxhdExvbikgewoJICAgICAgICAgICAgICAgICAgICBkZWxldGUgcGFyc2VkW2ldW2xvbmZpZWxkXTsKCSAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHBhcnNlZFtpXVtsYXRmaWVsZF07CgkgICAgICAgICAgICAgICAgfQoKCSAgICAgICAgICAgICAgICBmZWF0dXJlcy5wdXNoKHsKCSAgICAgICAgICAgICAgICAgICAgdHlwZTogJ0ZlYXR1cmUnLAoJICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiBwYXJzZWRbaV0sCgkgICAgICAgICAgICAgICAgICAgIGdlb21ldHJ5OiB7CgkgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnUG9pbnQnLAoJICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRpbmF0ZXM6IFsKCSAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJzZUZsb2F0KGxvbmYpLAoJICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlRmxvYXQobGF0ZikKCSAgICAgICAgICAgICAgICAgICAgICAgIF0KCSAgICAgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgIH0pOwoJICAgICAgICAgICAgfQoJICAgICAgICB9CgkgICAgfQoKCSAgICBjYWxsYmFjayhlcnJvcnMubGVuZ3RoID8gZXJyb3JzIDogbnVsbCwgZmVhdHVyZWNvbGxlY3Rpb24pOwoJfQoKCWZ1bmN0aW9uIHRvTGluZShnaikgewoJICAgIHZhciBmZWF0dXJlcyA9IGdqLmZlYXR1cmVzOwoJICAgIHZhciBsaW5lID0gewoJICAgICAgICB0eXBlOiAnRmVhdHVyZScsCgkgICAgICAgIGdlb21ldHJ5OiB7CgkgICAgICAgICAgICB0eXBlOiAnTGluZVN0cmluZycsCgkgICAgICAgICAgICBjb29yZGluYXRlczogW10KCSAgICAgICAgfQoJICAgIH07CgkgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmZWF0dXJlcy5sZW5ndGg7IGkrKykgewoJICAgICAgICBsaW5lLmdlb21ldHJ5LmNvb3JkaW5hdGVzLnB1c2goZmVhdHVyZXNbaV0uZ2VvbWV0cnkuY29vcmRpbmF0ZXMpOwoJICAgIH0KCSAgICBsaW5lLnByb3BlcnRpZXMgPSBmZWF0dXJlcy5yZWR1Y2UoZnVuY3Rpb24gKGFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzLCBuZXdGZWF0dXJlKSB7CgkgICAgICAgIGZvciAodmFyIGtleSBpbiBuZXdGZWF0dXJlLnByb3BlcnRpZXMpIHsKCSAgICAgICAgICAgIGlmICghYWdncmVnYXRlZFByb3BlcnRpZXNba2V5XSkgewoJICAgICAgICAgICAgICAgIGFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzW2tleV0gPSBbXTsKCSAgICAgICAgICAgIH0KCSAgICAgICAgICAgIGFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzW2tleV0ucHVzaChuZXdGZWF0dXJlLnByb3BlcnRpZXNba2V5XSk7CgkgICAgICAgIH0KCSAgICAgICAgcmV0dXJuIGFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzOwoJICAgIH0sIHt9KTsKCSAgICByZXR1cm4gewoJICAgICAgICB0eXBlOiAnRmVhdHVyZUNvbGxlY3Rpb24nLAoJICAgICAgICBmZWF0dXJlczogW2xpbmVdCgkgICAgfTsKCX0KCglmdW5jdGlvbiB0b1BvbHlnb24oZ2opIHsKCSAgICB2YXIgZmVhdHVyZXMgPSBnai5mZWF0dXJlczsKCSAgICB2YXIgcG9seSA9IHsKCSAgICAgICAgdHlwZTogJ0ZlYXR1cmUnLAoJICAgICAgICBnZW9tZXRyeTogewoJICAgICAgICAgICAgdHlwZTogJ1BvbHlnb24nLAoJICAgICAgICAgICAgY29vcmRpbmF0ZXM6IFtbXV0KCSAgICAgICAgfQoJICAgIH07CgkgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmZWF0dXJlcy5sZW5ndGg7IGkrKykgewoJICAgICAgICBwb2x5Lmdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdLnB1c2goZmVhdHVyZXNbaV0uZ2VvbWV0cnkuY29vcmRpbmF0ZXMpOwoJICAgIH0KCSAgICBwb2x5LnByb3BlcnRpZXMgPSBmZWF0dXJlcy5yZWR1Y2UoZnVuY3Rpb24gKGFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzLCBuZXdGZWF0dXJlKSB7CgkgICAgICAgIGZvciAodmFyIGtleSBpbiBuZXdGZWF0dXJlLnByb3BlcnRpZXMpIHsKCSAgICAgICAgICAgIGlmICghYWdncmVnYXRlZFByb3BlcnRpZXNba2V5XSkgewoJICAgICAgICAgICAgICAgIGFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzW2tleV0gPSBbXTsKCSAgICAgICAgICAgIH0KCSAgICAgICAgICAgIGFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzW2tleV0ucHVzaChuZXdGZWF0dXJlLnByb3BlcnRpZXNba2V5XSk7CgkgICAgICAgIH0KCSAgICAgICAgcmV0dXJuIGFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzOwoJICAgIH0sIHt9KTsKCSAgICByZXR1cm4gewoJICAgICAgICB0eXBlOiAnRmVhdHVyZUNvbGxlY3Rpb24nLAoJICAgICAgICBmZWF0dXJlczogW3BvbHldCgkgICAgfTsKCX0KCgl2YXIgY3N2Mmdlb2pzb25fMSA9IHsKCSAgICBpc0xvbjogaXNMb24sCgkgICAgaXNMYXQ6IGlzTGF0LAoJICAgIGd1ZXNzTGF0SGVhZGVyOiBndWVzc0xhdEhlYWRlciwKCSAgICBndWVzc0xvbkhlYWRlcjogZ3Vlc3NMb25IZWFkZXIsCgkgICAgY3N2OiBkc3YuY3N2UGFyc2UsCgkgICAgdHN2OiBkc3YudHN2UGFyc2UsCgkgICAgZHN2OiBkc3YsCgkgICAgYXV0bzogYXV0bywKCSAgICBjc3YyZ2VvanNvbjogY3N2Mmdlb2pzb24sCgkgICAgdG9MaW5lOiB0b0xpbmUsCgkgICAgdG9Qb2x5Z29uOiB0b1BvbHlnb24KCX07CgoJZnVuY3Rpb24gaWRlbnRpdHkoeCkgewoJICByZXR1cm4geDsKCX0KCglmdW5jdGlvbiB0cmFuc2Zvcm0odHJhbnNmb3JtKSB7CgkgIGlmICh0cmFuc2Zvcm0gPT0gbnVsbCkgcmV0dXJuIGlkZW50aXR5OwoJICB2YXIgeDAsCgkgICAgICB5MCwKCSAgICAgIGt4ID0gdHJhbnNmb3JtLnNjYWxlWzBdLAoJICAgICAga3kgPSB0cmFuc2Zvcm0uc2NhbGVbMV0sCgkgICAgICBkeCA9IHRyYW5zZm9ybS50cmFuc2xhdGVbMF0sCgkgICAgICBkeSA9IHRyYW5zZm9ybS50cmFuc2xhdGVbMV07CgkgIHJldHVybiBmdW5jdGlvbihpbnB1dCwgaSkgewoJICAgIGlmICghaSkgeDAgPSB5MCA9IDA7CgkgICAgdmFyIGogPSAyLCBuID0gaW5wdXQubGVuZ3RoLCBvdXRwdXQgPSBuZXcgQXJyYXkobik7CgkgICAgb3V0cHV0WzBdID0gKHgwICs9IGlucHV0WzBdKSAqIGt4ICsgZHg7CgkgICAgb3V0cHV0WzFdID0gKHkwICs9IGlucHV0WzFdKSAqIGt5ICsgZHk7CgkgICAgd2hpbGUgKGogPCBuKSBvdXRwdXRbal0gPSBpbnB1dFtqXSwgKytqOwoJICAgIHJldHVybiBvdXRwdXQ7CgkgIH07Cgl9CgoJZnVuY3Rpb24gcmV2ZXJzZShhcnJheSwgbikgewoJICB2YXIgdCwgaiA9IGFycmF5Lmxlbmd0aCwgaSA9IGogLSBuOwoJICB3aGlsZSAoaSA8IC0taikgdCA9IGFycmF5W2ldLCBhcnJheVtpKytdID0gYXJyYXlbal0sIGFycmF5W2pdID0gdDsKCX0KCglmdW5jdGlvbiB0b3BvanNvbkZlYXR1cmUodG9wb2xvZ3ksIG8pIHsKCSAgaWYgKHR5cGVvZiBvID09PSAic3RyaW5nIikgbyA9IHRvcG9sb2d5Lm9iamVjdHNbb107CgkgIHJldHVybiBvLnR5cGUgPT09ICJHZW9tZXRyeUNvbGxlY3Rpb24iCgkgICAgICA/IHt0eXBlOiAiRmVhdHVyZUNvbGxlY3Rpb24iLCBmZWF0dXJlczogby5nZW9tZXRyaWVzLm1hcChmdW5jdGlvbihvKSB7IHJldHVybiBmZWF0dXJlKHRvcG9sb2d5LCBvKTsgfSl9CgkgICAgICA6IGZlYXR1cmUodG9wb2xvZ3ksIG8pOwoJfQoKCWZ1bmN0aW9uIGZlYXR1cmUodG9wb2xvZ3ksIG8pIHsKCSAgdmFyIGlkID0gby5pZCwKCSAgICAgIGJib3ggPSBvLmJib3gsCgkgICAgICBwcm9wZXJ0aWVzID0gby5wcm9wZXJ0aWVzID09IG51bGwgPyB7fSA6IG8ucHJvcGVydGllcywKCSAgICAgIGdlb21ldHJ5ID0gb2JqZWN0KHRvcG9sb2d5LCBvKTsKCSAgcmV0dXJuIGlkID09IG51bGwgJiYgYmJveCA9PSBudWxsID8ge3R5cGU6ICJGZWF0dXJlIiwgcHJvcGVydGllczogcHJvcGVydGllcywgZ2VvbWV0cnk6IGdlb21ldHJ5fQoJICAgICAgOiBiYm94ID09IG51bGwgPyB7dHlwZTogIkZlYXR1cmUiLCBpZDogaWQsIHByb3BlcnRpZXM6IHByb3BlcnRpZXMsIGdlb21ldHJ5OiBnZW9tZXRyeX0KCSAgICAgIDoge3R5cGU6ICJGZWF0dXJlIiwgaWQ6IGlkLCBiYm94OiBiYm94LCBwcm9wZXJ0aWVzOiBwcm9wZXJ0aWVzLCBnZW9tZXRyeTogZ2VvbWV0cnl9OwoJfQoKCWZ1bmN0aW9uIG9iamVjdCh0b3BvbG9neSwgbykgewoJICB2YXIgdHJhbnNmb3JtUG9pbnQgPSB0cmFuc2Zvcm0odG9wb2xvZ3kudHJhbnNmb3JtKSwKCSAgICAgIGFyY3MgPSB0b3BvbG9neS5hcmNzOwoKCSAgZnVuY3Rpb24gYXJjKGksIHBvaW50cykgewoJICAgIGlmIChwb2ludHMubGVuZ3RoKSBwb2ludHMucG9wKCk7CgkgICAgZm9yICh2YXIgYSA9IGFyY3NbaSA8IDAgPyB+aSA6IGldLCBrID0gMCwgbiA9IGEubGVuZ3RoOyBrIDwgbjsgKytrKSB7CgkgICAgICBwb2ludHMucHVzaCh0cmFuc2Zvcm1Qb2ludChhW2tdLCBrKSk7CgkgICAgfQoJICAgIGlmIChpIDwgMCkgcmV2ZXJzZShwb2ludHMsIG4pOwoJICB9CgoJICBmdW5jdGlvbiBwb2ludChwKSB7CgkgICAgcmV0dXJuIHRyYW5zZm9ybVBvaW50KHApOwoJICB9CgoJICBmdW5jdGlvbiBsaW5lKGFyY3MpIHsKCSAgICB2YXIgcG9pbnRzID0gW107CgkgICAgZm9yICh2YXIgaSA9IDAsIG4gPSBhcmNzLmxlbmd0aDsgaSA8IG47ICsraSkgYXJjKGFyY3NbaV0sIHBvaW50cyk7CgkgICAgaWYgKHBvaW50cy5sZW5ndGggPCAyKSBwb2ludHMucHVzaChwb2ludHNbMF0pOyAvLyBUaGlzIHNob3VsZCBuZXZlciBoYXBwZW4gcGVyIHRoZSBzcGVjaWZpY2F0aW9uLgoJICAgIHJldHVybiBwb2ludHM7CgkgIH0KCgkgIGZ1bmN0aW9uIHJpbmcoYXJjcykgewoJICAgIHZhciBwb2ludHMgPSBsaW5lKGFyY3MpOwoJICAgIHdoaWxlIChwb2ludHMubGVuZ3RoIDwgNCkgcG9pbnRzLnB1c2gocG9pbnRzWzBdKTsgLy8gVGhpcyBtYXkgaGFwcGVuIGlmIGFuIGFyYyBoYXMgb25seSB0d28gcG9pbnRzLgoJICAgIHJldHVybiBwb2ludHM7CgkgIH0KCgkgIGZ1bmN0aW9uIHBvbHlnb24oYXJjcykgewoJICAgIHJldHVybiBhcmNzLm1hcChyaW5nKTsKCSAgfQoKCSAgZnVuY3Rpb24gZ2VvbWV0cnkobykgewoJICAgIHZhciB0eXBlID0gby50eXBlLCBjb29yZGluYXRlczsKCSAgICBzd2l0Y2ggKHR5cGUpIHsKCSAgICAgIGNhc2UgIkdlb21ldHJ5Q29sbGVjdGlvbiI6IHJldHVybiB7dHlwZTogdHlwZSwgZ2VvbWV0cmllczogby5nZW9tZXRyaWVzLm1hcChnZW9tZXRyeSl9OwoJICAgICAgY2FzZSAiUG9pbnQiOiBjb29yZGluYXRlcyA9IHBvaW50KG8uY29vcmRpbmF0ZXMpOyBicmVhazsKCSAgICAgIGNhc2UgIk11bHRpUG9pbnQiOiBjb29yZGluYXRlcyA9IG8uY29vcmRpbmF0ZXMubWFwKHBvaW50KTsgYnJlYWs7CgkgICAgICBjYXNlICJMaW5lU3RyaW5nIjogY29vcmRpbmF0ZXMgPSBsaW5lKG8uYXJjcyk7IGJyZWFrOwoJICAgICAgY2FzZSAiTXVsdGlMaW5lU3RyaW5nIjogY29vcmRpbmF0ZXMgPSBvLmFyY3MubWFwKGxpbmUpOyBicmVhazsKCSAgICAgIGNhc2UgIlBvbHlnb24iOiBjb29yZGluYXRlcyA9IHBvbHlnb24oby5hcmNzKTsgYnJlYWs7CgkgICAgICBjYXNlICJNdWx0aVBvbHlnb24iOiBjb29yZGluYXRlcyA9IG8uYXJjcy5tYXAocG9seWdvbik7IGJyZWFrOwoJICAgICAgZGVmYXVsdDogcmV0dXJuIG51bGw7CgkgICAgfQoJICAgIHJldHVybiB7dHlwZTogdHlwZSwgY29vcmRpbmF0ZXM6IGNvb3JkaW5hdGVzfTsKCSAgfQoKCSAgcmV0dXJuIGdlb21ldHJ5KG8pOwoJfQoKCWZ1bmN0aW9uICQoZWxlbWVudCwgdGFnTmFtZSkgewoJICAgIHJldHVybiBBcnJheS5mcm9tKGVsZW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUodGFnTmFtZSkpOwoJfQoJZnVuY3Rpb24gbm9ybWFsaXplSWQoaWQpIHsKCSAgICByZXR1cm4gaWRbMF0gPT09ICIjIiA/IGlkIDogYCMke2lkfWA7Cgl9CglmdW5jdGlvbiAkbnMoZWxlbWVudCwgdGFnTmFtZSwgbnMpIHsKCSAgICByZXR1cm4gQXJyYXkuZnJvbShlbGVtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lTlMobnMsIHRhZ05hbWUpKTsKCX0KCS8qKgoJICogZ2V0IHRoZSBjb250ZW50IG9mIGEgdGV4dCBub2RlLCBpZiBhbnkKCSAqLwoJZnVuY3Rpb24gbm9kZVZhbChub2RlKSB7CgkgICAgbm9kZT8ubm9ybWFsaXplKCk7CgkgICAgcmV0dXJuIChub2RlICYmIG5vZGUudGV4dENvbnRlbnQpIHx8ICIiOwoJfQoJLyoqCgkgKiBHZXQgb25lIFkgY2hpbGQgb2YgWCwgaWYgYW55LCBvdGhlcndpc2UgbnVsbAoJICovCglmdW5jdGlvbiBnZXQxKG5vZGUsIHRhZ05hbWUsIGNhbGxiYWNrKSB7CgkgICAgY29uc3QgbiA9IG5vZGUuZ2V0RWxlbWVudHNCeVRhZ05hbWUodGFnTmFtZSk7CgkgICAgY29uc3QgcmVzdWx0ID0gbi5sZW5ndGggPyBuWzBdIDogbnVsbDsKCSAgICBpZiAocmVzdWx0ICYmIGNhbGxiYWNrKQoJICAgICAgICBjYWxsYmFjayhyZXN1bHQpOwoJICAgIHJldHVybiByZXN1bHQ7Cgl9CglmdW5jdGlvbiBnZXQobm9kZSwgdGFnTmFtZSwgY2FsbGJhY2spIHsKCSAgICBjb25zdCBwcm9wZXJ0aWVzID0ge307CgkgICAgaWYgKCFub2RlKQoJICAgICAgICByZXR1cm4gcHJvcGVydGllczsKCSAgICBjb25zdCBuID0gbm9kZS5nZXRFbGVtZW50c0J5VGFnTmFtZSh0YWdOYW1lKTsKCSAgICBjb25zdCByZXN1bHQgPSBuLmxlbmd0aCA/IG5bMF0gOiBudWxsOwoJICAgIGlmIChyZXN1bHQgJiYgY2FsbGJhY2spIHsKCSAgICAgICAgcmV0dXJuIGNhbGxiYWNrKHJlc3VsdCwgcHJvcGVydGllcyk7CgkgICAgfQoJICAgIHJldHVybiBwcm9wZXJ0aWVzOwoJfQoJZnVuY3Rpb24gdmFsMShub2RlLCB0YWdOYW1lLCBjYWxsYmFjaykgewoJICAgIGNvbnN0IHZhbCA9IG5vZGVWYWwoZ2V0MShub2RlLCB0YWdOYW1lKSk7CgkgICAgaWYgKHZhbCAmJiBjYWxsYmFjaykKCSAgICAgICAgcmV0dXJuIGNhbGxiYWNrKHZhbCkgfHwge307CgkgICAgcmV0dXJuIHt9OwoJfQoJZnVuY3Rpb24gJG51bShub2RlLCB0YWdOYW1lLCBjYWxsYmFjaykgewoJICAgIGNvbnN0IHZhbCA9IHBhcnNlRmxvYXQobm9kZVZhbChnZXQxKG5vZGUsIHRhZ05hbWUpKSk7CgkgICAgaWYgKGlzTmFOKHZhbCkpCgkgICAgICAgIHJldHVybiB1bmRlZmluZWQ7CgkgICAgaWYgKHZhbCAmJiBjYWxsYmFjaykKCSAgICAgICAgcmV0dXJuIGNhbGxiYWNrKHZhbCkgfHwge307CgkgICAgcmV0dXJuIHt9OwoJfQoJZnVuY3Rpb24gbnVtMShub2RlLCB0YWdOYW1lLCBjYWxsYmFjaykgewoJICAgIGNvbnN0IHZhbCA9IHBhcnNlRmxvYXQobm9kZVZhbChnZXQxKG5vZGUsIHRhZ05hbWUpKSk7CgkgICAgaWYgKGlzTmFOKHZhbCkpCgkgICAgICAgIHJldHVybiB1bmRlZmluZWQ7CgkgICAgaWYgKHZhbCAmJiBjYWxsYmFjaykKCSAgICAgICAgY2FsbGJhY2sodmFsKTsKCSAgICByZXR1cm4gdmFsOwoJfQoJZnVuY3Rpb24gZ2V0TXVsdGkobm9kZSwgcHJvcGVydHlOYW1lcykgewoJICAgIGNvbnN0IHByb3BlcnRpZXMgPSB7fTsKCSAgICBmb3IgKGNvbnN0IHByb3BlcnR5IG9mIHByb3BlcnR5TmFtZXMpIHsKCSAgICAgICAgdmFsMShub2RlLCBwcm9wZXJ0eSwgKHZhbCkgPT4gewoJICAgICAgICAgICAgcHJvcGVydGllc1twcm9wZXJ0eV0gPSB2YWw7CgkgICAgICAgIH0pOwoJICAgIH0KCSAgICByZXR1cm4gcHJvcGVydGllczsKCX0KCWZ1bmN0aW9uIGlzRWxlbWVudChub2RlKSB7CgkgICAgcmV0dXJuIG5vZGU/Lm5vZGVUeXBlID09PSAxOwoJfQoKCWZ1bmN0aW9uIGdldExpbmVTdHlsZShub2RlKSB7CgkgICAgcmV0dXJuIGdldChub2RlLCAibGluZSIsIChsaW5lU3R5bGUpID0+IHsKCSAgICAgICAgY29uc3QgdmFsID0gT2JqZWN0LmFzc2lnbih7fSwgdmFsMShsaW5lU3R5bGUsICJjb2xvciIsIChjb2xvcikgPT4gewoJICAgICAgICAgICAgcmV0dXJuIHsgc3Ryb2tlOiBgIyR7Y29sb3J9YCB9OwoJICAgICAgICB9KSwgJG51bShsaW5lU3R5bGUsICJvcGFjaXR5IiwgKG9wYWNpdHkpID0+IHsKCSAgICAgICAgICAgIHJldHVybiB7ICJzdHJva2Utb3BhY2l0eSI6IG9wYWNpdHkgfTsKCSAgICAgICAgfSksICRudW0obGluZVN0eWxlLCAid2lkdGgiLCAod2lkdGgpID0+IHsKCSAgICAgICAgICAgIC8vIEdQWCB3aWR0aCBpcyBpbiBtbSwgY29udmVydCB0byBweCB3aXRoIDk2IHB4IHBlciBpbmNoCgkgICAgICAgICAgICByZXR1cm4geyAic3Ryb2tlLXdpZHRoIjogKHdpZHRoICogOTYpIC8gMjUuNCB9OwoJICAgICAgICB9KSk7CgkgICAgICAgIHJldHVybiB2YWw7CgkgICAgfSk7Cgl9CgoJZnVuY3Rpb24gZ2V0RXh0ZW5zaW9ucyhub2RlKSB7CgkgICAgbGV0IHZhbHVlcyA9IFtdOwoJICAgIGlmIChub2RlID09PSBudWxsKQoJICAgICAgICByZXR1cm4gdmFsdWVzOwoJICAgIGZvciAoY29uc3QgY2hpbGQgb2YgQXJyYXkuZnJvbShub2RlLmNoaWxkTm9kZXMpKSB7CgkgICAgICAgIGlmICghaXNFbGVtZW50KGNoaWxkKSkKCSAgICAgICAgICAgIGNvbnRpbnVlOwoJICAgICAgICBjb25zdCBuYW1lID0gYWJicmV2aWF0ZU5hbWUoY2hpbGQubm9kZU5hbWUpOwoJICAgICAgICBpZiAobmFtZSA9PT0gImdweHRweDpUcmFja1BvaW50RXh0ZW5zaW9uIikgewoJICAgICAgICAgICAgLy8gbG9vcCBhZ2FpbiBmb3IgbmVzdGVkIGdhcm1pbiBleHRlbnNpb25zIChlZy4gImdweHRweDpociIpCgkgICAgICAgICAgICB2YWx1ZXMgPSB2YWx1ZXMuY29uY2F0KGdldEV4dGVuc2lvbnMoY2hpbGQpKTsKCSAgICAgICAgfQoJICAgICAgICBlbHNlIHsKCSAgICAgICAgICAgIC8vIHB1c2ggY3VzdG9tIGV4dGVuc2lvbiAoZWcuICJwb3dlciIpCgkgICAgICAgICAgICBjb25zdCB2YWwgPSBub2RlVmFsKGNoaWxkKTsKCSAgICAgICAgICAgIHZhbHVlcy5wdXNoKFtuYW1lLCBwYXJzZU51bWVyaWModmFsKV0pOwoJICAgICAgICB9CgkgICAgfQoJICAgIHJldHVybiB2YWx1ZXM7Cgl9CglmdW5jdGlvbiBhYmJyZXZpYXRlTmFtZShuYW1lKSB7CgkgICAgcmV0dXJuIFsiaGVhcnQiLCAiZ3B4dHB4OmhyIiwgImhyIl0uaW5jbHVkZXMobmFtZSkgPyAiaGVhcnQiIDogbmFtZTsKCX0KCWZ1bmN0aW9uIHBhcnNlTnVtZXJpYyh2YWwpIHsKCSAgICBjb25zdCBudW0gPSBwYXJzZUZsb2F0KHZhbCk7CgkgICAgcmV0dXJuIGlzTmFOKG51bSkgPyB2YWwgOiBudW07Cgl9CgoJZnVuY3Rpb24gY29vcmRQYWlyJDEobm9kZSkgewoJICAgIGNvbnN0IGxsID0gWwoJICAgICAgICBwYXJzZUZsb2F0KG5vZGUuZ2V0QXR0cmlidXRlKCJsb24iKSB8fCAiIiksCgkgICAgICAgIHBhcnNlRmxvYXQobm9kZS5nZXRBdHRyaWJ1dGUoImxhdCIpIHx8ICIiKSwKCSAgICBdOwoJICAgIGlmIChpc05hTihsbFswXSkgfHwgaXNOYU4obGxbMV0pKSB7CgkgICAgICAgIHJldHVybiBudWxsOwoJICAgIH0KCSAgICBudW0xKG5vZGUsICJlbGUiLCAodmFsKSA9PiB7CgkgICAgICAgIGxsLnB1c2godmFsKTsKCSAgICB9KTsKCSAgICBjb25zdCB0aW1lID0gZ2V0MShub2RlLCAidGltZSIpOwoJICAgIHJldHVybiB7CgkgICAgICAgIGNvb3JkaW5hdGVzOiBsbCwKCSAgICAgICAgdGltZTogdGltZSA/IG5vZGVWYWwodGltZSkgOiBudWxsLAoJICAgICAgICBleHRlbmRlZFZhbHVlczogZ2V0RXh0ZW5zaW9ucyhnZXQxKG5vZGUsICJleHRlbnNpb25zIikpLAoJICAgIH07Cgl9CgoJZnVuY3Rpb24gZXh0cmFjdFByb3BlcnRpZXMobm9kZSkgewoJICAgIGNvbnN0IHByb3BlcnRpZXMgPSBnZXRNdWx0aShub2RlLCBbCgkgICAgICAgICJuYW1lIiwKCSAgICAgICAgImNtdCIsCgkgICAgICAgICJkZXNjIiwKCSAgICAgICAgInR5cGUiLAoJICAgICAgICAidGltZSIsCgkgICAgICAgICJrZXl3b3JkcyIsCgkgICAgXSk7CgkgICAgY29uc3QgZXh0ZW5zaW9ucyA9IEFycmF5LmZyb20obm9kZS5nZXRFbGVtZW50c0J5VGFnTmFtZU5TKCJodHRwOi8vd3d3Lmdhcm1pbi5jb20veG1sc2NoZW1hcy9HcHhFeHRlbnNpb25zL3YzIiwgIioiKSk7CgkgICAgZm9yIChjb25zdCBjaGlsZCBvZiBleHRlbnNpb25zKSB7CgkgICAgICAgIGlmIChjaGlsZC5wYXJlbnROb2RlPy5wYXJlbnROb2RlID09PSBub2RlKSB7CgkgICAgICAgICAgICBwcm9wZXJ0aWVzW2NoaWxkLnRhZ05hbWUucmVwbGFjZSgiOiIsICJfIildID0gbm9kZVZhbChjaGlsZCk7CgkgICAgICAgIH0KCSAgICB9CgkgICAgY29uc3QgbGlua3MgPSAkKG5vZGUsICJsaW5rIik7CgkgICAgaWYgKGxpbmtzLmxlbmd0aCkgewoJICAgICAgICBwcm9wZXJ0aWVzLmxpbmtzID0gbGlua3MubWFwKChsaW5rKSA9PiBPYmplY3QuYXNzaWduKHsgaHJlZjogbGluay5nZXRBdHRyaWJ1dGUoImhyZWYiKSB9LCBnZXRNdWx0aShsaW5rLCBbInRleHQiLCAidHlwZSJdKSkpOwoJICAgIH0KCSAgICByZXR1cm4gcHJvcGVydGllczsKCX0KCgkvKioKCSAqIEV4dHJhY3QgcG9pbnRzIGZyb20gYSB0cmtzZWcgb3IgcnRlIGVsZW1lbnQuCgkgKi8KCWZ1bmN0aW9uIGdldFBvaW50cyQxKG5vZGUsIHBvaW50bmFtZSkgewoJICAgIGNvbnN0IHB0cyA9ICQobm9kZSwgcG9pbnRuYW1lKTsKCSAgICBjb25zdCBsaW5lID0gW107CgkgICAgY29uc3QgdGltZXMgPSBbXTsKCSAgICBjb25zdCBleHRlbmRlZFZhbHVlcyA9IHt9OwoJICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHRzLmxlbmd0aDsgaSsrKSB7CgkgICAgICAgIGNvbnN0IGMgPSBjb29yZFBhaXIkMShwdHNbaV0pOwoJICAgICAgICBpZiAoIWMpIHsKCSAgICAgICAgICAgIGNvbnRpbnVlOwoJICAgICAgICB9CgkgICAgICAgIGxpbmUucHVzaChjLmNvb3JkaW5hdGVzKTsKCSAgICAgICAgaWYgKGMudGltZSkKCSAgICAgICAgICAgIHRpbWVzLnB1c2goYy50aW1lKTsKCSAgICAgICAgZm9yIChjb25zdCBbbmFtZSwgdmFsXSBvZiBjLmV4dGVuZGVkVmFsdWVzKSB7CgkgICAgICAgICAgICBjb25zdCBwbHVyYWwgPSBuYW1lID09PSAiaGVhcnQiID8gbmFtZSA6IG5hbWUucmVwbGFjZSgiZ3B4dHB4OiIsICIiKSArICJzIjsKCSAgICAgICAgICAgIGlmICghZXh0ZW5kZWRWYWx1ZXNbcGx1cmFsXSkgewoJICAgICAgICAgICAgICAgIGV4dGVuZGVkVmFsdWVzW3BsdXJhbF0gPSBBcnJheShwdHMubGVuZ3RoKS5maWxsKG51bGwpOwoJICAgICAgICAgICAgfQoJICAgICAgICAgICAgZXh0ZW5kZWRWYWx1ZXNbcGx1cmFsXVtpXSA9IHZhbDsKCSAgICAgICAgfQoJICAgIH0KCSAgICBpZiAobGluZS5sZW5ndGggPCAyKQoJICAgICAgICByZXR1cm47IC8vIEludmFsaWQgbGluZSBpbiBHZW9KU09OCgkgICAgcmV0dXJuIHsKCSAgICAgICAgbGluZTogbGluZSwKCSAgICAgICAgdGltZXM6IHRpbWVzLAoJICAgICAgICBleHRlbmRlZFZhbHVlczogZXh0ZW5kZWRWYWx1ZXMsCgkgICAgfTsKCX0KCS8qKgoJICogRXh0cmFjdCBhIExpbmVTdHJpbmcgZ2VvbWV0cnkgZnJvbSBhIHJ0ZQoJICogZWxlbWVudC4KCSAqLwoJZnVuY3Rpb24gZ2V0Um91dGUobm9kZSkgewoJICAgIGNvbnN0IGxpbmUgPSBnZXRQb2ludHMkMShub2RlLCAicnRlcHQiKTsKCSAgICBpZiAoIWxpbmUpCgkgICAgICAgIHJldHVybjsKCSAgICByZXR1cm4gewoJICAgICAgICB0eXBlOiAiRmVhdHVyZSIsCgkgICAgICAgIHByb3BlcnRpZXM6IE9iamVjdC5hc3NpZ24oeyBfZ3B4VHlwZTogInJ0ZSIgfSwgZXh0cmFjdFByb3BlcnRpZXMobm9kZSksIGdldExpbmVTdHlsZShnZXQxKG5vZGUsICJleHRlbnNpb25zIikpKSwKCSAgICAgICAgZ2VvbWV0cnk6IHsKCSAgICAgICAgICAgIHR5cGU6ICJMaW5lU3RyaW5nIiwKCSAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBsaW5lLmxpbmUsCgkgICAgICAgIH0sCgkgICAgfTsKCX0KCWZ1bmN0aW9uIGdldFRyYWNrKG5vZGUpIHsKCSAgICBjb25zdCBzZWdtZW50cyA9ICQobm9kZSwgInRya3NlZyIpOwoJICAgIGNvbnN0IHRyYWNrID0gW107CgkgICAgY29uc3QgdGltZXMgPSBbXTsKCSAgICBjb25zdCBleHRyYWN0ZWRMaW5lcyA9IFtdOwoJICAgIGZvciAoY29uc3Qgc2VnbWVudCBvZiBzZWdtZW50cykgewoJICAgICAgICBjb25zdCBsaW5lID0gZ2V0UG9pbnRzJDEoc2VnbWVudCwgInRya3B0Iik7CgkgICAgICAgIGlmIChsaW5lKSB7CgkgICAgICAgICAgICBleHRyYWN0ZWRMaW5lcy5wdXNoKGxpbmUpOwoJICAgICAgICAgICAgaWYgKGxpbmUudGltZXMgJiYgbGluZS50aW1lcy5sZW5ndGgpCgkgICAgICAgICAgICAgICAgdGltZXMucHVzaChsaW5lLnRpbWVzKTsKCSAgICAgICAgfQoJICAgIH0KCSAgICBpZiAoZXh0cmFjdGVkTGluZXMubGVuZ3RoID09PSAwKQoJICAgICAgICByZXR1cm4gbnVsbDsKCSAgICBjb25zdCBtdWx0aSA9IGV4dHJhY3RlZExpbmVzLmxlbmd0aCA+IDE7CgkgICAgY29uc3QgcHJvcGVydGllcyA9IE9iamVjdC5hc3NpZ24oeyBfZ3B4VHlwZTogInRyayIgfSwgZXh0cmFjdFByb3BlcnRpZXMobm9kZSksIGdldExpbmVTdHlsZShnZXQxKG5vZGUsICJleHRlbnNpb25zIikpLCB0aW1lcy5sZW5ndGgKCSAgICAgICAgPyB7CgkgICAgICAgICAgICBjb29yZGluYXRlUHJvcGVydGllczogewoJICAgICAgICAgICAgICAgIHRpbWVzOiBtdWx0aSA/IHRpbWVzIDogdGltZXNbMF0sCgkgICAgICAgICAgICB9LAoJICAgICAgICB9CgkgICAgICAgIDoge30pOwoJICAgIGZvciAoY29uc3QgbGluZSBvZiBleHRyYWN0ZWRMaW5lcykgewoJICAgICAgICB0cmFjay5wdXNoKGxpbmUubGluZSk7CgkgICAgICAgIGlmICghcHJvcGVydGllcy5jb29yZGluYXRlUHJvcGVydGllcykgewoJICAgICAgICAgICAgcHJvcGVydGllcy5jb29yZGluYXRlUHJvcGVydGllcyA9IHt9OwoJICAgICAgICB9CgkgICAgICAgIGNvbnN0IHByb3BzID0gcHJvcGVydGllcy5jb29yZGluYXRlUHJvcGVydGllczsKCSAgICAgICAgY29uc3QgZW50cmllcyA9IE9iamVjdC5lbnRyaWVzKGxpbmUuZXh0ZW5kZWRWYWx1ZXMpOwoJICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVudHJpZXMubGVuZ3RoOyBpKyspIHsKCSAgICAgICAgICAgIGNvbnN0IFtuYW1lLCB2YWxdID0gZW50cmllc1tpXTsKCSAgICAgICAgICAgIGlmIChtdWx0aSkgewoJICAgICAgICAgICAgICAgIGlmICghcHJvcHNbbmFtZV0pIHsKCSAgICAgICAgICAgICAgICAgICAgcHJvcHNbbmFtZV0gPSBleHRyYWN0ZWRMaW5lcy5tYXAoKGxpbmUpID0+IG5ldyBBcnJheShsaW5lLmxpbmUubGVuZ3RoKS5maWxsKG51bGwpKTsKCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgcHJvcHNbbmFtZV1baV0gPSB2YWw7CgkgICAgICAgICAgICB9CgkgICAgICAgICAgICBlbHNlIHsKCSAgICAgICAgICAgICAgICBwcm9wc1tuYW1lXSA9IHZhbDsKCSAgICAgICAgICAgIH0KCSAgICAgICAgfQoJICAgIH0KCSAgICByZXR1cm4gewoJICAgICAgICB0eXBlOiAiRmVhdHVyZSIsCgkgICAgICAgIHByb3BlcnRpZXM6IHByb3BlcnRpZXMsCgkgICAgICAgIGdlb21ldHJ5OiBtdWx0aQoJICAgICAgICAgICAgPyB7CgkgICAgICAgICAgICAgICAgdHlwZTogIk11bHRpTGluZVN0cmluZyIsCgkgICAgICAgICAgICAgICAgY29vcmRpbmF0ZXM6IHRyYWNrLAoJICAgICAgICAgICAgfQoJICAgICAgICAgICAgOiB7CgkgICAgICAgICAgICAgICAgdHlwZTogIkxpbmVTdHJpbmciLAoJICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzOiB0cmFja1swXSwKCSAgICAgICAgICAgIH0sCgkgICAgfTsKCX0KCS8qKgoJICogRXh0cmFjdCBhIHBvaW50LCBpZiBwb3NzaWJsZSwgZnJvbSBhIGdpdmVuIG5vZGUsCgkgKiB3aGljaCBpcyB1c3VhbGx5IGEgd3B0IG9yIHRya3B0CgkgKi8KCWZ1bmN0aW9uIGdldFBvaW50KG5vZGUpIHsKCSAgICBjb25zdCBwcm9wZXJ0aWVzID0gT2JqZWN0LmFzc2lnbihleHRyYWN0UHJvcGVydGllcyhub2RlKSwgZ2V0TXVsdGkobm9kZSwgWyJzeW0iXSkpOwoJICAgIGNvbnN0IHBhaXIgPSBjb29yZFBhaXIkMShub2RlKTsKCSAgICBpZiAoIXBhaXIpCgkgICAgICAgIHJldHVybiBudWxsOwoJICAgIHJldHVybiB7CgkgICAgICAgIHR5cGU6ICJGZWF0dXJlIiwKCSAgICAgICAgcHJvcGVydGllcywKCSAgICAgICAgZ2VvbWV0cnk6IHsKCSAgICAgICAgICAgIHR5cGU6ICJQb2ludCIsCgkgICAgICAgICAgICBjb29yZGluYXRlczogcGFpci5jb29yZGluYXRlcywKCSAgICAgICAgfSwKCSAgICB9OwoJfQoJLyoqCgkgKiBDb252ZXJ0IEdQWCB0byBHZW9KU09OIGluY3JlbWVudGFsbHksIHJldHVybmluZwoJICogYSBbR2VuZXJhdG9yXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L0d1aWRlL0l0ZXJhdG9yc19hbmRfR2VuZXJhdG9ycykKCSAqIHRoYXQgeWllbGRzIG91dHB1dCBmZWF0dXJlIGJ5IGZlYXR1cmUuCgkgKi8KCWZ1bmN0aW9uKiBncHhHZW4obm9kZSkgewoJICAgIGZvciAoY29uc3QgdHJhY2sgb2YgJChub2RlLCAidHJrIikpIHsKCSAgICAgICAgY29uc3QgZmVhdHVyZSA9IGdldFRyYWNrKHRyYWNrKTsKCSAgICAgICAgaWYgKGZlYXR1cmUpCgkgICAgICAgICAgICB5aWVsZCBmZWF0dXJlOwoJICAgIH0KCSAgICBmb3IgKGNvbnN0IHJvdXRlIG9mICQobm9kZSwgInJ0ZSIpKSB7CgkgICAgICAgIGNvbnN0IGZlYXR1cmUgPSBnZXRSb3V0ZShyb3V0ZSk7CgkgICAgICAgIGlmIChmZWF0dXJlKQoJICAgICAgICAgICAgeWllbGQgZmVhdHVyZTsKCSAgICB9CgkgICAgZm9yIChjb25zdCB3YXlwb2ludCBvZiAkKG5vZGUsICJ3cHQiKSkgewoJICAgICAgICBjb25zdCBwb2ludCA9IGdldFBvaW50KHdheXBvaW50KTsKCSAgICAgICAgaWYgKHBvaW50KQoJICAgICAgICAgICAgeWllbGQgcG9pbnQ7CgkgICAgfQoJfQoJLyoqCgkgKgoJICogQ29udmVydCBhIEdQWCBkb2N1bWVudCB0byBHZW9KU09OLiBUaGUgZmlyc3QgYXJndW1lbnQsIGBkb2NgLCBtdXN0IGJlIGEgR1BYCgkgKiBkb2N1bWVudCBhcyBhbiBYTUwgRE9NIC0gbm90IGFzIGEgc3RyaW5nLiBZb3UgY2FuIGdldCB0aGlzIHVzaW5nIGpRdWVyeSdzIGRlZmF1bHQKCSAqIGAuYWpheGAgZnVuY3Rpb24gb3IgdXNpbmcgYSBiYXJlIFhNTEh0dHBSZXF1ZXN0IHdpdGggdGhlIGAucmVzcG9uc2VgIHByb3BlcnR5CgkgKiBob2xkaW5nIGFuIFhNTCBET00uCgkgKgoJICogVGhlIG91dHB1dCBpcyBhIEphdmFTY3JpcHQgb2JqZWN0IG9mIEdlb0pTT04gZGF0YSwgc2FtZSBhcyBgLmttbGAgb3V0cHV0cywgd2l0aCB0aGUKCSAqIGFkZGl0aW9uIG9mIGEgYF9ncHhUeXBlYCBwcm9wZXJ0eSBvbiBlYWNoIGBMaW5lU3RyaW5nYCBmZWF0dXJlIHRoYXQgaW5kaWNhdGVzIHdoZXRoZXIKCSAqIHRoZSBmZWF0dXJlIHdhcyBlbmNvZGVkIGFzIGEgcm91dGUgKGBydGVgKSBvciB0cmFjayAoYHRya2ApIGluIHRoZSBHUFggZG9jdW1lbnQuCgkgKi8KCWZ1bmN0aW9uIGdweChub2RlKSB7CgkgICAgcmV0dXJuIHsKCSAgICAgICAgdHlwZTogIkZlYXR1cmVDb2xsZWN0aW9uIiwKCSAgICAgICAgZmVhdHVyZXM6IEFycmF5LmZyb20oZ3B4R2VuKG5vZGUpKSwKCSAgICB9OwoJfQoKCWNvbnN0IEVYVEVOU0lPTlNfTlMgPSAiaHR0cDovL3d3dy5nYXJtaW4uY29tL3htbHNjaGVtYXMvQWN0aXZpdHlFeHRlbnNpb24vdjIiOwoJY29uc3QgVFJBQ0tQT0lOVF9BVFRSSUJVVEVTID0gWwoJICAgIFsiaGVhcnRSYXRlIiwgImhlYXJ0UmF0ZXMiXSwKCSAgICBbIkNhZGVuY2UiLCAiY2FkZW5jZXMiXSwKCSAgICAvLyBFeHRlbmRlZCBUcmFja3BvaW50IGF0dHJpYnV0ZXMKCSAgICBbIlNwZWVkIiwgInNwZWVkcyJdLAoJICAgIFsiV2F0dHMiLCAid2F0dHMiXSwKCV07Cgljb25zdCBMQVBfQVRUUklCVVRFUyA9IFsKCSAgICBbIlRvdGFsVGltZVNlY29uZHMiLCAidG90YWxUaW1lU2Vjb25kcyJdLAoJICAgIFsiRGlzdGFuY2VNZXRlcnMiLCAiZGlzdGFuY2VNZXRlcnMiXSwKCSAgICBbIk1heGltdW1TcGVlZCIsICJtYXhTcGVlZCJdLAoJICAgIFsiQXZlcmFnZUhlYXJ0UmF0ZUJwbSIsICJhdmdIZWFydFJhdGUiXSwKCSAgICBbIk1heGltdW1IZWFydFJhdGVCcG0iLCAibWF4SGVhcnRSYXRlIl0sCgkgICAgLy8gRXh0ZW5kZWQgTGFwIGF0dHJpYnV0ZXMKCSAgICBbIkF2Z1NwZWVkIiwgImF2Z1NwZWVkIl0sCgkgICAgWyJBdmdXYXR0cyIsICJhdmdXYXR0cyJdLAoJICAgIFsiTWF4V2F0dHMiLCAibWF4V2F0dHMiXSwKCV07CglmdW5jdGlvbiBnZXRQcm9wZXJ0aWVzKG5vZGUsIGF0dHJpYnV0ZU5hbWVzKSB7CgkgICAgY29uc3QgcHJvcGVydGllcyA9IFtdOwoJICAgIGZvciAoY29uc3QgW3RhZywgYWxpYXNdIG9mIGF0dHJpYnV0ZU5hbWVzKSB7CgkgICAgICAgIGxldCBlbGVtID0gZ2V0MShub2RlLCB0YWcpOwoJICAgICAgICBpZiAoIWVsZW0pIHsKCSAgICAgICAgICAgIGNvbnN0IGVsZW1lbnRzID0gbm9kZS5nZXRFbGVtZW50c0J5VGFnTmFtZU5TKEVYVEVOU0lPTlNfTlMsIHRhZyk7CgkgICAgICAgICAgICBpZiAoZWxlbWVudHMubGVuZ3RoKSB7CgkgICAgICAgICAgICAgICAgZWxlbSA9IGVsZW1lbnRzWzBdOwoJICAgICAgICAgICAgfQoJICAgICAgICB9CgkgICAgICAgIGNvbnN0IHZhbCA9IHBhcnNlRmxvYXQobm9kZVZhbChlbGVtKSk7CgkgICAgICAgIGlmICghaXNOYU4odmFsKSkgewoJICAgICAgICAgICAgcHJvcGVydGllcy5wdXNoKFthbGlhcywgdmFsXSk7CgkgICAgICAgIH0KCSAgICB9CgkgICAgcmV0dXJuIHByb3BlcnRpZXM7Cgl9CglmdW5jdGlvbiBjb29yZFBhaXIobm9kZSkgewoJICAgIGNvbnN0IGxsID0gW251bTEobm9kZSwgIkxvbmdpdHVkZURlZ3JlZXMiKSwgbnVtMShub2RlLCAiTGF0aXR1ZGVEZWdyZWVzIildOwoJICAgIGlmIChsbFswXSA9PT0gdW5kZWZpbmVkIHx8CgkgICAgICAgIGlzTmFOKGxsWzBdKSB8fAoJICAgICAgICBsbFsxXSA9PT0gdW5kZWZpbmVkIHx8CgkgICAgICAgIGlzTmFOKGxsWzFdKSkgewoJICAgICAgICByZXR1cm4gbnVsbDsKCSAgICB9CgkgICAgY29uc3QgaGVhcnRSYXRlID0gZ2V0MShub2RlLCAiSGVhcnRSYXRlQnBtIik7CgkgICAgY29uc3QgdGltZSA9IG5vZGVWYWwoZ2V0MShub2RlLCAiVGltZSIpKTsKCSAgICBnZXQxKG5vZGUsICJBbHRpdHVkZU1ldGVycyIsIChhbHQpID0+IHsKCSAgICAgICAgY29uc3QgYSA9IHBhcnNlRmxvYXQobm9kZVZhbChhbHQpKTsKCSAgICAgICAgaWYgKCFpc05hTihhKSkgewoJICAgICAgICAgICAgbGwucHVzaChhKTsKCSAgICAgICAgfQoJICAgIH0pOwoJICAgIHJldHVybiB7CgkgICAgICAgIGNvb3JkaW5hdGVzOiBsbCwKCSAgICAgICAgdGltZTogdGltZSB8fCBudWxsLAoJICAgICAgICBoZWFydFJhdGU6IGhlYXJ0UmF0ZSA/IHBhcnNlRmxvYXQobm9kZVZhbChoZWFydFJhdGUpKSA6IG51bGwsCgkgICAgICAgIGV4dGVuc2lvbnM6IGdldFByb3BlcnRpZXMobm9kZSwgVFJBQ0tQT0lOVF9BVFRSSUJVVEVTKSwKCSAgICB9OwoJfQoJZnVuY3Rpb24gZ2V0UG9pbnRzKG5vZGUpIHsKCSAgICBjb25zdCBwdHMgPSAkKG5vZGUsICJUcmFja3BvaW50Iik7CgkgICAgY29uc3QgbGluZSA9IFtdOwoJICAgIGNvbnN0IHRpbWVzID0gW107CgkgICAgY29uc3QgaGVhcnRSYXRlcyA9IFtdOwoJICAgIGlmIChwdHMubGVuZ3RoIDwgMikKCSAgICAgICAgcmV0dXJuIG51bGw7IC8vIEludmFsaWQgbGluZSBpbiBHZW9KU09OCgkgICAgY29uc3QgZXh0ZW5kZWRQcm9wZXJ0aWVzID0ge307CgkgICAgY29uc3QgcmVzdWx0ID0geyBleHRlbmRlZFByb3BlcnRpZXMgfTsKCSAgICBmb3IgKGxldCBpID0gMDsgaSA8IHB0cy5sZW5ndGg7IGkrKykgewoJICAgICAgICBjb25zdCBjID0gY29vcmRQYWlyKHB0c1tpXSk7CgkgICAgICAgIGlmIChjID09PSBudWxsKQoJICAgICAgICAgICAgY29udGludWU7CgkgICAgICAgIGxpbmUucHVzaChjLmNvb3JkaW5hdGVzKTsKCSAgICAgICAgY29uc3QgeyB0aW1lLCBoZWFydFJhdGUsIGV4dGVuc2lvbnMgfSA9IGM7CgkgICAgICAgIGlmICh0aW1lKQoJICAgICAgICAgICAgdGltZXMucHVzaCh0aW1lKTsKCSAgICAgICAgaWYgKGhlYXJ0UmF0ZSkKCSAgICAgICAgICAgIGhlYXJ0UmF0ZXMucHVzaChoZWFydFJhdGUpOwoJICAgICAgICBmb3IgKGNvbnN0IFthbGlhcywgdmFsdWVdIG9mIGV4dGVuc2lvbnMpIHsKCSAgICAgICAgICAgIGlmICghZXh0ZW5kZWRQcm9wZXJ0aWVzW2FsaWFzXSkgewoJICAgICAgICAgICAgICAgIGV4dGVuZGVkUHJvcGVydGllc1thbGlhc10gPSBBcnJheShwdHMubGVuZ3RoKS5maWxsKG51bGwpOwoJICAgICAgICAgICAgfQoJICAgICAgICAgICAgZXh0ZW5kZWRQcm9wZXJ0aWVzW2FsaWFzXVtpXSA9IHZhbHVlOwoJICAgICAgICB9CgkgICAgfQoJICAgIGlmIChsaW5lLmxlbmd0aCA8IDIpCgkgICAgICAgIHJldHVybiBudWxsOwoJICAgIHJldHVybiBPYmplY3QuYXNzaWduKHJlc3VsdCwgewoJICAgICAgICBsaW5lOiBsaW5lLAoJICAgICAgICB0aW1lczogdGltZXMsCgkgICAgICAgIGhlYXJ0UmF0ZXM6IGhlYXJ0UmF0ZXMsCgkgICAgfSk7Cgl9CglmdW5jdGlvbiBnZXRMYXAobm9kZSkgewoJICAgIGNvbnN0IHNlZ21lbnRzID0gJChub2RlLCAiVHJhY2siKTsKCSAgICBjb25zdCB0cmFjayA9IFtdOwoJICAgIGNvbnN0IHRpbWVzID0gW107CgkgICAgY29uc3QgaGVhcnRSYXRlcyA9IFtdOwoJICAgIGNvbnN0IGFsbEV4dGVuZGVkUHJvcGVydGllcyA9IFtdOwoJICAgIGxldCBsaW5lOwoJICAgIGNvbnN0IHByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5mcm9tRW50cmllcyhnZXRQcm9wZXJ0aWVzKG5vZGUsIExBUF9BVFRSSUJVVEVTKSksIGdldChub2RlLCAiTmFtZSIsIChuYW1lRWxlbWVudCkgPT4gewoJICAgICAgICByZXR1cm4geyBuYW1lOiBub2RlVmFsKG5hbWVFbGVtZW50KSB9OwoJICAgIH0pKTsKCSAgICBmb3IgKGNvbnN0IHNlZ21lbnQgb2Ygc2VnbWVudHMpIHsKCSAgICAgICAgbGluZSA9IGdldFBvaW50cyhzZWdtZW50KTsKCSAgICAgICAgaWYgKGxpbmUpIHsKCSAgICAgICAgICAgIHRyYWNrLnB1c2gobGluZS5saW5lKTsKCSAgICAgICAgICAgIGlmIChsaW5lLnRpbWVzLmxlbmd0aCkKCSAgICAgICAgICAgICAgICB0aW1lcy5wdXNoKGxpbmUudGltZXMpOwoJICAgICAgICAgICAgaWYgKGxpbmUuaGVhcnRSYXRlcy5sZW5ndGgpCgkgICAgICAgICAgICAgICAgaGVhcnRSYXRlcy5wdXNoKGxpbmUuaGVhcnRSYXRlcyk7CgkgICAgICAgICAgICBhbGxFeHRlbmRlZFByb3BlcnRpZXMucHVzaChsaW5lLmV4dGVuZGVkUHJvcGVydGllcyk7CgkgICAgICAgIH0KCSAgICB9CgkgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhbGxFeHRlbmRlZFByb3BlcnRpZXMubGVuZ3RoOyBpKyspIHsKCSAgICAgICAgY29uc3QgZXh0ZW5kZWRQcm9wZXJ0aWVzID0gYWxsRXh0ZW5kZWRQcm9wZXJ0aWVzW2ldOwoJICAgICAgICBmb3IgKGNvbnN0IHByb3BlcnR5IGluIGV4dGVuZGVkUHJvcGVydGllcykgewoJICAgICAgICAgICAgaWYgKHNlZ21lbnRzLmxlbmd0aCA9PT0gMSkgewoJICAgICAgICAgICAgICAgIGlmIChsaW5lKSB7CgkgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXNbcHJvcGVydHldID0gbGluZS5leHRlbmRlZFByb3BlcnRpZXNbcHJvcGVydHldOwoJICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgIH0KCSAgICAgICAgICAgIGVsc2UgewoJICAgICAgICAgICAgICAgIGlmICghcHJvcGVydGllc1twcm9wZXJ0eV0pIHsKCSAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllc1twcm9wZXJ0eV0gPSB0cmFjay5tYXAoKHRyYWNrKSA9PiBBcnJheSh0cmFjay5sZW5ndGgpLmZpbGwobnVsbCkpOwoJICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzW3Byb3BlcnR5XVtpXSA9IGV4dGVuZGVkUHJvcGVydGllc1twcm9wZXJ0eV07CgkgICAgICAgICAgICB9CgkgICAgICAgIH0KCSAgICB9CgkgICAgaWYgKHRyYWNrLmxlbmd0aCA9PT0gMCkKCSAgICAgICAgcmV0dXJuIG51bGw7CgkgICAgaWYgKHRpbWVzLmxlbmd0aCB8fCBoZWFydFJhdGVzLmxlbmd0aCkgewoJICAgICAgICBwcm9wZXJ0aWVzLmNvb3JkaW5hdGVQcm9wZXJ0aWVzID0gT2JqZWN0LmFzc2lnbih0aW1lcy5sZW5ndGgKCSAgICAgICAgICAgID8gewoJICAgICAgICAgICAgICAgIHRpbWVzOiB0cmFjay5sZW5ndGggPT09IDEgPyB0aW1lc1swXSA6IHRpbWVzLAoJICAgICAgICAgICAgfQoJICAgICAgICAgICAgOiB7fSwgaGVhcnRSYXRlcy5sZW5ndGgKCSAgICAgICAgICAgID8gewoJICAgICAgICAgICAgICAgIGhlYXJ0OiB0cmFjay5sZW5ndGggPT09IDEgPyBoZWFydFJhdGVzWzBdIDogaGVhcnRSYXRlcywKCSAgICAgICAgICAgIH0KCSAgICAgICAgICAgIDoge30pOwoJICAgIH0KCSAgICByZXR1cm4gewoJICAgICAgICB0eXBlOiAiRmVhdHVyZSIsCgkgICAgICAgIHByb3BlcnRpZXM6IHByb3BlcnRpZXMsCgkgICAgICAgIGdlb21ldHJ5OiB0cmFjay5sZW5ndGggPT09IDEKCSAgICAgICAgICAgID8gewoJICAgICAgICAgICAgICAgIHR5cGU6ICJMaW5lU3RyaW5nIiwKCSAgICAgICAgICAgICAgICBjb29yZGluYXRlczogdHJhY2tbMF0sCgkgICAgICAgICAgICB9CgkgICAgICAgICAgICA6IHsKCSAgICAgICAgICAgICAgICB0eXBlOiAiTXVsdGlMaW5lU3RyaW5nIiwKCSAgICAgICAgICAgICAgICBjb29yZGluYXRlczogdHJhY2ssCgkgICAgICAgICAgICB9LAoJICAgIH07Cgl9CgkvKioKCSAqIEluY3JlbWVudGFsbHkgY29udmVydCBhIFRDWCBkb2N1bWVudCB0byBHZW9KU09OLiBUaGUKCSAqIGZpcnN0IGFyZ3VtZW50LCBgZG9jYCwgbXVzdCBiZSBhIFRDWAoJICogZG9jdW1lbnQgYXMgYW4gWE1MIERPTSAtIG5vdCBhcyBhIHN0cmluZy4KCSAqLwoJZnVuY3Rpb24qIHRjeEdlbihub2RlKSB7CgkgICAgZm9yIChjb25zdCBsYXAgb2YgJChub2RlLCAiTGFwIikpIHsKCSAgICAgICAgY29uc3QgZmVhdHVyZSA9IGdldExhcChsYXApOwoJICAgICAgICBpZiAoZmVhdHVyZSkKCSAgICAgICAgICAgIHlpZWxkIGZlYXR1cmU7CgkgICAgfQoJICAgIGZvciAoY29uc3QgY291cnNlIG9mICQobm9kZSwgIkNvdXJzZXMiKSkgewoJICAgICAgICBjb25zdCBmZWF0dXJlID0gZ2V0TGFwKGNvdXJzZSk7CgkgICAgICAgIGlmIChmZWF0dXJlKQoJICAgICAgICAgICAgeWllbGQgZmVhdHVyZTsKCSAgICB9Cgl9CgkvKioKCSAqIENvbnZlcnQgYSBUQ1ggZG9jdW1lbnQgdG8gR2VvSlNPTi4gVGhlIGZpcnN0IGFyZ3VtZW50LCBgZG9jYCwgbXVzdCBiZSBhIFRDWAoJICogZG9jdW1lbnQgYXMgYW4gWE1MIERPTSAtIG5vdCBhcyBhIHN0cmluZy4KCSAqLwoJZnVuY3Rpb24gdGN4KG5vZGUpIHsKCSAgICByZXR1cm4gewoJICAgICAgICB0eXBlOiAiRmVhdHVyZUNvbGxlY3Rpb24iLAoJICAgICAgICBmZWF0dXJlczogQXJyYXkuZnJvbSh0Y3hHZW4obm9kZSkpLAoJICAgIH07Cgl9CgoJZnVuY3Rpb24gZml4Q29sb3IodiwgcHJlZml4KSB7CgkgICAgY29uc3QgcHJvcGVydGllcyA9IHt9OwoJICAgIGNvbnN0IGNvbG9yUHJvcCA9IHByZWZpeCA9PSAic3Ryb2tlIiB8fCBwcmVmaXggPT09ICJmaWxsIiA/IHByZWZpeCA6IHByZWZpeCArICItY29sb3IiOwoJICAgIGlmICh2WzBdID09PSAiIyIpIHsKCSAgICAgICAgdiA9IHYuc3Vic3RyaW5nKDEpOwoJICAgIH0KCSAgICBpZiAodi5sZW5ndGggPT09IDYgfHwgdi5sZW5ndGggPT09IDMpIHsKCSAgICAgICAgcHJvcGVydGllc1tjb2xvclByb3BdID0gIiMiICsgdjsKCSAgICB9CgkgICAgZWxzZSBpZiAodi5sZW5ndGggPT09IDgpIHsKCSAgICAgICAgcHJvcGVydGllc1twcmVmaXggKyAiLW9wYWNpdHkiXSA9IHBhcnNlSW50KHYuc3Vic3RyaW5nKDAsIDIpLCAxNikgLyAyNTU7CgkgICAgICAgIHByb3BlcnRpZXNbY29sb3JQcm9wXSA9CgkgICAgICAgICAgICAiIyIgKyB2LnN1YnN0cmluZyg2LCA4KSArIHYuc3Vic3RyaW5nKDQsIDYpICsgdi5zdWJzdHJpbmcoMiwgNCk7CgkgICAgfQoJICAgIHJldHVybiBwcm9wZXJ0aWVzOwoJfQoKCWZ1bmN0aW9uIG51bWVyaWNQcm9wZXJ0eShub2RlLCBzb3VyY2UsIHRhcmdldCkgewoJICAgIGNvbnN0IHByb3BlcnRpZXMgPSB7fTsKCSAgICBudW0xKG5vZGUsIHNvdXJjZSwgKHZhbCkgPT4gewoJICAgICAgICBwcm9wZXJ0aWVzW3RhcmdldF0gPSB2YWw7CgkgICAgfSk7CgkgICAgcmV0dXJuIHByb3BlcnRpZXM7Cgl9CglmdW5jdGlvbiBnZXRDb2xvcihub2RlLCBvdXRwdXQpIHsKCSAgICByZXR1cm4gZ2V0KG5vZGUsICJjb2xvciIsIChlbGVtKSA9PiBmaXhDb2xvcihub2RlVmFsKGVsZW0pLCBvdXRwdXQpKTsKCX0KCWZ1bmN0aW9uIGV4dHJhY3RJY29uSHJlZihub2RlKSB7CgkgICAgcmV0dXJuIGdldChub2RlLCAiSWNvbiIsIChpY29uLCBwcm9wZXJ0aWVzKSA9PiB7CgkgICAgICAgIHZhbDEoaWNvbiwgImhyZWYiLCAoaHJlZikgPT4gewoJICAgICAgICAgICAgcHJvcGVydGllcy5pY29uID0gaHJlZjsKCSAgICAgICAgfSk7CgkgICAgICAgIHJldHVybiBwcm9wZXJ0aWVzOwoJICAgIH0pOwoJfQoJZnVuY3Rpb24gZXh0cmFjdEljb24obm9kZSkgewoJICAgIHJldHVybiBnZXQobm9kZSwgIkljb25TdHlsZSIsIChpY29uU3R5bGUpID0+IHsKCSAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oZ2V0Q29sb3IoaWNvblN0eWxlLCAiaWNvbiIpLCBudW1lcmljUHJvcGVydHkoaWNvblN0eWxlLCAic2NhbGUiLCAiaWNvbi1zY2FsZSIpLCBudW1lcmljUHJvcGVydHkoaWNvblN0eWxlLCAiaGVhZGluZyIsICJpY29uLWhlYWRpbmciKSwgZ2V0KGljb25TdHlsZSwgImhvdFNwb3QiLCAoaG90c3BvdCkgPT4gewoJICAgICAgICAgICAgY29uc3QgbGVmdCA9IHBhcnNlRmxvYXQoaG90c3BvdC5nZXRBdHRyaWJ1dGUoIngiKSB8fCAiIik7CgkgICAgICAgICAgICBjb25zdCB0b3AgPSBwYXJzZUZsb2F0KGhvdHNwb3QuZ2V0QXR0cmlidXRlKCJ5IikgfHwgIiIpOwoJICAgICAgICAgICAgY29uc3QgeHVuaXRzID0gaG90c3BvdC5nZXRBdHRyaWJ1dGUoInh1bml0cyIpIHx8ICIiOwoJICAgICAgICAgICAgY29uc3QgeXVuaXRzID0gaG90c3BvdC5nZXRBdHRyaWJ1dGUoInl1bml0cyIpIHx8ICIiOwoJICAgICAgICAgICAgaWYgKCFpc05hTihsZWZ0KSAmJiAhaXNOYU4odG9wKSkKCSAgICAgICAgICAgICAgICByZXR1cm4gewoJICAgICAgICAgICAgICAgICAgICAiaWNvbi1vZmZzZXQiOiBbbGVmdCwgdG9wXSwKCSAgICAgICAgICAgICAgICAgICAgImljb24tb2Zmc2V0LXVuaXRzIjogW3h1bml0cywgeXVuaXRzXSwKCSAgICAgICAgICAgICAgICB9OwoJICAgICAgICAgICAgcmV0dXJuIHt9OwoJICAgICAgICB9KSwgZXh0cmFjdEljb25IcmVmKGljb25TdHlsZSkpOwoJICAgIH0pOwoJfQoJZnVuY3Rpb24gZXh0cmFjdExhYmVsKG5vZGUpIHsKCSAgICByZXR1cm4gZ2V0KG5vZGUsICJMYWJlbFN0eWxlIiwgKGxhYmVsU3R5bGUpID0+IHsKCSAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oZ2V0Q29sb3IobGFiZWxTdHlsZSwgImxhYmVsIiksIG51bWVyaWNQcm9wZXJ0eShsYWJlbFN0eWxlLCAic2NhbGUiLCAibGFiZWwtc2NhbGUiKSk7CgkgICAgfSk7Cgl9CglmdW5jdGlvbiBleHRyYWN0TGluZShub2RlKSB7CgkgICAgcmV0dXJuIGdldChub2RlLCAiTGluZVN0eWxlIiwgKGxpbmVTdHlsZSkgPT4gewoJICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihnZXRDb2xvcihsaW5lU3R5bGUsICJzdHJva2UiKSwgbnVtZXJpY1Byb3BlcnR5KGxpbmVTdHlsZSwgIndpZHRoIiwgInN0cm9rZS13aWR0aCIpKTsKCSAgICB9KTsKCX0KCWZ1bmN0aW9uIGV4dHJhY3RQb2x5KG5vZGUpIHsKCSAgICByZXR1cm4gZ2V0KG5vZGUsICJQb2x5U3R5bGUiLCAocG9seVN0eWxlLCBwcm9wZXJ0aWVzKSA9PiB7CgkgICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHByb3BlcnRpZXMsIGdldChwb2x5U3R5bGUsICJjb2xvciIsIChlbGVtKSA9PiBmaXhDb2xvcihub2RlVmFsKGVsZW0pLCAiZmlsbCIpKSwgdmFsMShwb2x5U3R5bGUsICJmaWxsIiwgKGZpbGwpID0+IHsKCSAgICAgICAgICAgIGlmIChmaWxsID09PSAiMCIpCgkgICAgICAgICAgICAgICAgcmV0dXJuIHsgImZpbGwtb3BhY2l0eSI6IDAgfTsKCSAgICAgICAgfSksIHZhbDEocG9seVN0eWxlLCAib3V0bGluZSIsIChvdXRsaW5lKSA9PiB7CgkgICAgICAgICAgICBpZiAob3V0bGluZSA9PT0gIjAiKQoJICAgICAgICAgICAgICAgIHJldHVybiB7ICJzdHJva2Utb3BhY2l0eSI6IDAgfTsKCSAgICAgICAgfSkpOwoJICAgIH0pOwoJfQoJZnVuY3Rpb24gZXh0cmFjdFN0eWxlKG5vZGUpIHsKCSAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgZXh0cmFjdFBvbHkobm9kZSksIGV4dHJhY3RMaW5lKG5vZGUpLCBleHRyYWN0TGFiZWwobm9kZSksIGV4dHJhY3RJY29uKG5vZGUpKTsKCX0KCgljb25zdCB0b051bWJlciA9ICh4KSA9PiBOdW1iZXIoeCk7Cgljb25zdCB0eXBlQ29udmVydGVycyA9IHsKCSAgICBzdHJpbmc6ICh4KSA9PiB4LAoJICAgIGludDogdG9OdW1iZXIsCgkgICAgdWludDogdG9OdW1iZXIsCgkgICAgc2hvcnQ6IHRvTnVtYmVyLAoJICAgIHVzaG9ydDogdG9OdW1iZXIsCgkgICAgZmxvYXQ6IHRvTnVtYmVyLAoJICAgIGRvdWJsZTogdG9OdW1iZXIsCgkgICAgYm9vbDogKHgpID0+IEJvb2xlYW4oeCksCgl9OwoJZnVuY3Rpb24gZXh0cmFjdEV4dGVuZGVkRGF0YShub2RlLCBzY2hlbWEpIHsKCSAgICByZXR1cm4gZ2V0KG5vZGUsICJFeHRlbmRlZERhdGEiLCAoZXh0ZW5kZWREYXRhLCBwcm9wZXJ0aWVzKSA9PiB7CgkgICAgICAgIGZvciAoY29uc3QgZGF0YSBvZiAkKGV4dGVuZGVkRGF0YSwgIkRhdGEiKSkgewoJICAgICAgICAgICAgcHJvcGVydGllc1tkYXRhLmdldEF0dHJpYnV0ZSgibmFtZSIpIHx8ICIiXSA9IG5vZGVWYWwoZ2V0MShkYXRhLCAidmFsdWUiKSk7CgkgICAgICAgIH0KCSAgICAgICAgZm9yIChjb25zdCBzaW1wbGVEYXRhIG9mICQoZXh0ZW5kZWREYXRhLCAiU2ltcGxlRGF0YSIpKSB7CgkgICAgICAgICAgICBjb25zdCBuYW1lID0gc2ltcGxlRGF0YS5nZXRBdHRyaWJ1dGUoIm5hbWUiKSB8fCAiIjsKCSAgICAgICAgICAgIGNvbnN0IHR5cGVDb252ZXJ0ZXIgPSBzY2hlbWFbbmFtZV0gfHwgdHlwZUNvbnZlcnRlcnMuc3RyaW5nOwoJICAgICAgICAgICAgcHJvcGVydGllc1tuYW1lXSA9IHR5cGVDb252ZXJ0ZXIobm9kZVZhbChzaW1wbGVEYXRhKSk7CgkgICAgICAgIH0KCSAgICAgICAgcmV0dXJuIHByb3BlcnRpZXM7CgkgICAgfSk7Cgl9CglmdW5jdGlvbiBnZXRNYXliZUhUTUxEZXNjcmlwdGlvbihub2RlKSB7CgkgICAgY29uc3QgZGVzY3JpcHRpb25Ob2RlID0gZ2V0MShub2RlLCAiZGVzY3JpcHRpb24iKTsKCSAgICBmb3IgKGNvbnN0IGMgb2YgQXJyYXkuZnJvbShkZXNjcmlwdGlvbk5vZGU/LmNoaWxkTm9kZXMgfHwgW10pKSB7CgkgICAgICAgIGlmIChjLm5vZGVUeXBlID09PSA0KSB7CgkgICAgICAgICAgICByZXR1cm4gewoJICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB7CgkgICAgICAgICAgICAgICAgICAgICJAdHlwZSI6ICJodG1sIiwKCSAgICAgICAgICAgICAgICAgICAgdmFsdWU6IG5vZGVWYWwoYyksCgkgICAgICAgICAgICAgICAgfSwKCSAgICAgICAgICAgIH07CgkgICAgICAgIH0KCSAgICB9CgkgICAgcmV0dXJuIHt9OwoJfQoJZnVuY3Rpb24gZXh0cmFjdFRpbWVTcGFuKG5vZGUpIHsKCSAgICByZXR1cm4gZ2V0KG5vZGUsICJUaW1lU3BhbiIsICh0aW1lU3BhbikgPT4gewoJICAgICAgICByZXR1cm4gewoJICAgICAgICAgICAgdGltZXNwYW46IHsKCSAgICAgICAgICAgICAgICBiZWdpbjogbm9kZVZhbChnZXQxKHRpbWVTcGFuLCAiYmVnaW4iKSksCgkgICAgICAgICAgICAgICAgZW5kOiBub2RlVmFsKGdldDEodGltZVNwYW4sICJlbmQiKSksCgkgICAgICAgICAgICB9LAoJICAgICAgICB9OwoJICAgIH0pOwoJfQoJZnVuY3Rpb24gZXh0cmFjdFRpbWVTdGFtcChub2RlKSB7CgkgICAgcmV0dXJuIGdldChub2RlLCAiVGltZVN0YW1wIiwgKHRpbWVTdGFtcCkgPT4gewoJICAgICAgICByZXR1cm4geyB0aW1lc3RhbXA6IG5vZGVWYWwoZ2V0MSh0aW1lU3RhbXAsICJ3aGVuIikpIH07CgkgICAgfSk7Cgl9CglmdW5jdGlvbiBleHRyYWN0Q2FzY2FkZWRTdHlsZShub2RlLCBzdHlsZU1hcCkgewoJICAgIHJldHVybiB2YWwxKG5vZGUsICJzdHlsZVVybCIsIChzdHlsZVVybCkgPT4gewoJICAgICAgICBzdHlsZVVybCA9IG5vcm1hbGl6ZUlkKHN0eWxlVXJsKTsKCSAgICAgICAgaWYgKHN0eWxlTWFwW3N0eWxlVXJsXSkgewoJICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oeyBzdHlsZVVybCB9LCBzdHlsZU1hcFtzdHlsZVVybF0pOwoJICAgICAgICB9CgkgICAgICAgIC8vIEZvciBiYWNrd2FyZC1jb21wYXRpYmlsaXR5LiBTaG91bGQgd2Ugc3RpbGwgaW5jbHVkZQoJICAgICAgICAvLyBzdHlsZVVybCBldmVuIGlmIGl0J3Mgbm90IHJlc29sdmVkPwoJICAgICAgICByZXR1cm4geyBzdHlsZVVybCB9OwoJICAgIH0pOwoJfQoKCWNvbnN0IHJlbW92ZVNwYWNlID0gL1xzKi9nOwoJY29uc3QgdHJpbVNwYWNlID0gL15ccyp8XHMqJC9nOwoJY29uc3Qgc3BsaXRTcGFjZSA9IC9ccysvOwoJLyoqCgkgKiBHZXQgb25lIGNvb3JkaW5hdGUgZnJvbSBhIGNvb3JkaW5hdGUgYXJyYXksIGlmIGFueQoJICovCglmdW5jdGlvbiBjb29yZDEodmFsdWUpIHsKCSAgICByZXR1cm4gdmFsdWUKCSAgICAgICAgLnJlcGxhY2UocmVtb3ZlU3BhY2UsICIiKQoJICAgICAgICAuc3BsaXQoIiwiKQoJICAgICAgICAubWFwKHBhcnNlRmxvYXQpCgkgICAgICAgIC5maWx0ZXIoKG51bSkgPT4gIWlzTmFOKG51bSkpCgkgICAgICAgIC5zbGljZSgwLCAzKTsKCX0KCS8qKgoJICogR2V0IGFsbCBjb29yZGluYXRlcyBmcm9tIGEgY29vcmRpbmF0ZSBhcnJheSBhcyBbW10sW11dCgkgKi8KCWZ1bmN0aW9uIGNvb3JkKHZhbHVlKSB7CgkgICAgcmV0dXJuIHZhbHVlCgkgICAgICAgIC5yZXBsYWNlKHRyaW1TcGFjZSwgIiIpCgkgICAgICAgIC5zcGxpdChzcGxpdFNwYWNlKQoJICAgICAgICAubWFwKGNvb3JkMSkKCSAgICAgICAgLmZpbHRlcigoY29vcmQpID0+IHsKCSAgICAgICAgcmV0dXJuIGNvb3JkLmxlbmd0aCA+PSAyOwoJICAgIH0pOwoJfQoJZnVuY3Rpb24gZ3hDb29yZHMobm9kZSkgewoJICAgIGxldCBlbGVtcyA9ICQobm9kZSwgImNvb3JkIik7CgkgICAgaWYgKGVsZW1zLmxlbmd0aCA9PT0gMCkgewoJICAgICAgICBlbGVtcyA9ICRucyhub2RlLCAiY29vcmQiLCAiKiIpOwoJICAgIH0KCSAgICBjb25zdCBjb29yZGluYXRlcyA9IGVsZW1zLm1hcCgoZWxlbSkgPT4gewoJICAgICAgICByZXR1cm4gbm9kZVZhbChlbGVtKS5zcGxpdCgiICIpLm1hcChwYXJzZUZsb2F0KTsKCSAgICB9KTsKCSAgICBpZiAoY29vcmRpbmF0ZXMubGVuZ3RoID09PSAwKSB7CgkgICAgICAgIHJldHVybiBudWxsOwoJICAgIH0KCSAgICByZXR1cm4gewoJICAgICAgICBnZW9tZXRyeTogY29vcmRpbmF0ZXMubGVuZ3RoID4gMgoJICAgICAgICAgICAgPyB7CgkgICAgICAgICAgICAgICAgdHlwZTogIkxpbmVTdHJpbmciLAoJICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzLAoJICAgICAgICAgICAgfQoJICAgICAgICAgICAgOiB7CgkgICAgICAgICAgICAgICAgdHlwZTogIlBvaW50IiwKCSAgICAgICAgICAgICAgICBjb29yZGluYXRlczogY29vcmRpbmF0ZXNbMF0sCgkgICAgICAgICAgICB9LAoJICAgICAgICB0aW1lczogJChub2RlLCAid2hlbiIpLm1hcCgoZWxlbSkgPT4gbm9kZVZhbChlbGVtKSksCgkgICAgfTsKCX0KCWZ1bmN0aW9uIGZpeFJpbmcocmluZykgewoJICAgIGlmIChyaW5nLmxlbmd0aCA9PT0gMCkKCSAgICAgICAgcmV0dXJuIHJpbmc7CgkgICAgY29uc3QgZmlyc3QgPSByaW5nWzBdOwoJICAgIGNvbnN0IGxhc3QgPSByaW5nW3JpbmcubGVuZ3RoIC0gMV07CgkgICAgbGV0IGVxdWFsID0gdHJ1ZTsKCSAgICBmb3IgKGxldCBpID0gMDsgaSA8IE1hdGgubWF4KGZpcnN0Lmxlbmd0aCwgbGFzdC5sZW5ndGgpOyBpKyspIHsKCSAgICAgICAgaWYgKGZpcnN0W2ldICE9PSBsYXN0W2ldKSB7CgkgICAgICAgICAgICBlcXVhbCA9IGZhbHNlOwoJICAgICAgICAgICAgYnJlYWs7CgkgICAgICAgIH0KCSAgICB9CgkgICAgaWYgKCFlcXVhbCkgewoJICAgICAgICByZXR1cm4gcmluZy5jb25jYXQoW3JpbmdbMF1dKTsKCSAgICB9CgkgICAgcmV0dXJuIHJpbmc7Cgl9CglmdW5jdGlvbiBnZXRDb29yZGluYXRlcyhub2RlKSB7CgkgICAgcmV0dXJuIG5vZGVWYWwoZ2V0MShub2RlLCAiY29vcmRpbmF0ZXMiKSk7Cgl9CglmdW5jdGlvbiBnZXRHZW9tZXRyeShub2RlKSB7CgkgICAgbGV0IGdlb21ldHJpZXMgPSBbXTsKCSAgICBsZXQgY29vcmRUaW1lcyA9IFtdOwoJICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZS5jaGlsZE5vZGVzLmxlbmd0aDsgaSsrKSB7CgkgICAgICAgIGNvbnN0IGNoaWxkID0gbm9kZS5jaGlsZE5vZGVzLml0ZW0oaSk7CgkgICAgICAgIGlmIChpc0VsZW1lbnQoY2hpbGQpKSB7CgkgICAgICAgICAgICBzd2l0Y2ggKGNoaWxkLnRhZ05hbWUpIHsKCSAgICAgICAgICAgICAgICBjYXNlICJNdWx0aUdlb21ldHJ5IjoKCSAgICAgICAgICAgICAgICBjYXNlICJNdWx0aVRyYWNrIjoKCSAgICAgICAgICAgICAgICBjYXNlICJneDpNdWx0aVRyYWNrIjogewoJICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZEdlb21ldHJpZXMgPSBnZXRHZW9tZXRyeShjaGlsZCk7CgkgICAgICAgICAgICAgICAgICAgIGdlb21ldHJpZXMgPSBnZW9tZXRyaWVzLmNvbmNhdChjaGlsZEdlb21ldHJpZXMuZ2VvbWV0cmllcyk7CgkgICAgICAgICAgICAgICAgICAgIGNvb3JkVGltZXMgPSBjb29yZFRpbWVzLmNvbmNhdChjaGlsZEdlb21ldHJpZXMuY29vcmRUaW1lcyk7CgkgICAgICAgICAgICAgICAgICAgIGJyZWFrOwoJICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICBjYXNlICJQb2ludCI6IHsKCSAgICAgICAgICAgICAgICAgICAgY29uc3QgY29vcmRpbmF0ZXMgPSBjb29yZDEoZ2V0Q29vcmRpbmF0ZXMoY2hpbGQpKTsKCSAgICAgICAgICAgICAgICAgICAgaWYgKGNvb3JkaW5hdGVzLmxlbmd0aCA+PSAyKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICBnZW9tZXRyaWVzLnB1c2goewoJICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICJQb2ludCIsCgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRpbmF0ZXMsCgkgICAgICAgICAgICAgICAgICAgICAgICB9KTsKCSAgICAgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgICAgICBicmVhazsKCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgY2FzZSAiTGluZWFyUmluZyI6CgkgICAgICAgICAgICAgICAgY2FzZSAiTGluZVN0cmluZyI6IHsKCSAgICAgICAgICAgICAgICAgICAgY29uc3QgY29vcmRpbmF0ZXMgPSBjb29yZChnZXRDb29yZGluYXRlcyhjaGlsZCkpOwoJICAgICAgICAgICAgICAgICAgICBpZiAoY29vcmRpbmF0ZXMubGVuZ3RoID49IDIpIHsKCSAgICAgICAgICAgICAgICAgICAgICAgIGdlb21ldHJpZXMucHVzaCh7CgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogIkxpbmVTdHJpbmciLAoJICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzLAoJICAgICAgICAgICAgICAgICAgICAgICAgfSk7CgkgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICAgICAgYnJlYWs7CgkgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgIGNhc2UgIlBvbHlnb24iOiB7CgkgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvb3JkcyA9IFtdOwoJICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGxpbmVhclJpbmcgb2YgJChjaGlsZCwgIkxpbmVhclJpbmciKSkgewoJICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmluZyA9IGZpeFJpbmcoY29vcmQoZ2V0Q29vcmRpbmF0ZXMobGluZWFyUmluZykpKTsKCSAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyaW5nLmxlbmd0aCA+PSA0KSB7CgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRzLnB1c2gocmluZyk7CgkgICAgICAgICAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICAgICAgaWYgKGNvb3Jkcy5sZW5ndGgpIHsKCSAgICAgICAgICAgICAgICAgICAgICAgIGdlb21ldHJpZXMucHVzaCh7CgkgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogIlBvbHlnb24iLAoJICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBjb29yZHMsCgkgICAgICAgICAgICAgICAgICAgICAgICB9KTsKCSAgICAgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgICAgICBicmVhazsKCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgY2FzZSAiVHJhY2siOgoJICAgICAgICAgICAgICAgIGNhc2UgImd4OlRyYWNrIjogewoJICAgICAgICAgICAgICAgICAgICBjb25zdCBneCA9IGd4Q29vcmRzKGNoaWxkKTsKCSAgICAgICAgICAgICAgICAgICAgaWYgKCFneCkKCSAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrOwoJICAgICAgICAgICAgICAgICAgICBjb25zdCB7IHRpbWVzLCBnZW9tZXRyeSB9ID0gZ3g7CgkgICAgICAgICAgICAgICAgICAgIGdlb21ldHJpZXMucHVzaChnZW9tZXRyeSk7CgkgICAgICAgICAgICAgICAgICAgIGlmICh0aW1lcy5sZW5ndGgpCgkgICAgICAgICAgICAgICAgICAgICAgICBjb29yZFRpbWVzLnB1c2godGltZXMpOwoJICAgICAgICAgICAgICAgICAgICBicmVhazsKCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICB9CgkgICAgICAgIH0KCSAgICB9CgkgICAgcmV0dXJuIHsKCSAgICAgICAgZ2VvbWV0cmllcywKCSAgICAgICAgY29vcmRUaW1lcywKCSAgICB9OwoJfQoKCWZ1bmN0aW9uIGdlb21ldHJ5TGlzdFRvR2VvbWV0cnkoZ2VvbWV0cmllcykgewoJICAgIHJldHVybiBnZW9tZXRyaWVzLmxlbmd0aCA9PT0gMAoJICAgICAgICA/IG51bGwKCSAgICAgICAgOiBnZW9tZXRyaWVzLmxlbmd0aCA9PT0gMQoJICAgICAgICAgICAgPyBnZW9tZXRyaWVzWzBdCgkgICAgICAgICAgICA6IHsKCSAgICAgICAgICAgICAgICB0eXBlOiAiR2VvbWV0cnlDb2xsZWN0aW9uIiwKCSAgICAgICAgICAgICAgICBnZW9tZXRyaWVzLAoJICAgICAgICAgICAgfTsKCX0KCWZ1bmN0aW9uIGdldFBsYWNlbWFyayhub2RlLCBzdHlsZU1hcCwgc2NoZW1hKSB7CgkgICAgY29uc3QgeyBjb29yZFRpbWVzLCBnZW9tZXRyaWVzIH0gPSBnZXRHZW9tZXRyeShub2RlKTsKCSAgICBjb25zdCBmZWF0dXJlID0gewoJICAgICAgICB0eXBlOiAiRmVhdHVyZSIsCgkgICAgICAgIGdlb21ldHJ5OiBnZW9tZXRyeUxpc3RUb0dlb21ldHJ5KGdlb21ldHJpZXMpLAoJICAgICAgICBwcm9wZXJ0aWVzOiBPYmplY3QuYXNzaWduKGdldE11bHRpKG5vZGUsIFsKCSAgICAgICAgICAgICJuYW1lIiwKCSAgICAgICAgICAgICJhZGRyZXNzIiwKCSAgICAgICAgICAgICJ2aXNpYmlsaXR5IiwKCSAgICAgICAgICAgICJvcGVuIiwKCSAgICAgICAgICAgICJwaG9uZU51bWJlciIsCgkgICAgICAgICAgICAiZGVzY3JpcHRpb24iLAoJICAgICAgICBdKSwgZ2V0TWF5YmVIVE1MRGVzY3JpcHRpb24obm9kZSksIGV4dHJhY3RDYXNjYWRlZFN0eWxlKG5vZGUsIHN0eWxlTWFwKSwgZXh0cmFjdFN0eWxlKG5vZGUpLCBleHRyYWN0RXh0ZW5kZWREYXRhKG5vZGUsIHNjaGVtYSksIGV4dHJhY3RUaW1lU3Bhbihub2RlKSwgZXh0cmFjdFRpbWVTdGFtcChub2RlKSwgY29vcmRUaW1lcy5sZW5ndGgKCSAgICAgICAgICAgID8gewoJICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVQcm9wZXJ0aWVzOiB7CgkgICAgICAgICAgICAgICAgICAgIHRpbWVzOiBjb29yZFRpbWVzLmxlbmd0aCA9PT0gMSA/IGNvb3JkVGltZXNbMF0gOiBjb29yZFRpbWVzLAoJICAgICAgICAgICAgICAgIH0sCgkgICAgICAgICAgICB9CgkgICAgICAgICAgICA6IHt9KSwKCSAgICB9OwoJICAgIGlmIChmZWF0dXJlLnByb3BlcnRpZXM/LnZpc2liaWxpdHkgIT09IHVuZGVmaW5lZCkgewoJICAgICAgICBmZWF0dXJlLnByb3BlcnRpZXMudmlzaWJpbGl0eSA9IGZlYXR1cmUucHJvcGVydGllcy52aXNpYmlsaXR5ICE9PSAiMCI7CgkgICAgfQoJICAgIGNvbnN0IGlkID0gbm9kZS5nZXRBdHRyaWJ1dGUoImlkIik7CgkgICAgaWYgKGlkICE9PSBudWxsICYmIGlkICE9PSAiIikKCSAgICAgICAgZmVhdHVyZS5pZCA9IGlkOwoJICAgIHJldHVybiBmZWF0dXJlOwoJfQoKCWZ1bmN0aW9uIGdldEdyb3VuZE92ZXJsYXlCb3gobm9kZSkgewoJICAgIGNvbnN0IGxhdExvblF1YWQgPSBnZXQxKG5vZGUsICJneDpMYXRMb25RdWFkIik7CgkgICAgaWYgKGxhdExvblF1YWQpIHsKCSAgICAgICAgY29uc3QgcmluZyA9IGZpeFJpbmcoY29vcmQoZ2V0Q29vcmRpbmF0ZXMobm9kZSkpKTsKCSAgICAgICAgcmV0dXJuIHsKCSAgICAgICAgICAgIHR5cGU6ICJQb2x5Z29uIiwKCSAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBbcmluZ10sCgkgICAgICAgIH07CgkgICAgfQoJICAgIHJldHVybiBnZXRMYXRMb25Cb3gobm9kZSk7Cgl9Cgljb25zdCBERUdSRUVTX1RPX1JBRElBTlMgPSBNYXRoLlBJIC8gMTgwOwoJZnVuY3Rpb24gcm90YXRlQm94KGJib3gsIGNvb3JkaW5hdGVzLCByb3RhdGlvbikgewoJICAgIGNvbnN0IGNlbnRlciA9IFsoYmJveFswXSArIGJib3hbMl0pIC8gMiwgKGJib3hbMV0gKyBiYm94WzNdKSAvIDJdOwoJICAgIHJldHVybiBbCgkgICAgICAgIGNvb3JkaW5hdGVzWzBdLm1hcCgoY29vcmRpbmF0ZSkgPT4gewoJICAgICAgICAgICAgY29uc3QgZHkgPSBjb29yZGluYXRlWzFdIC0gY2VudGVyWzFdOwoJICAgICAgICAgICAgY29uc3QgZHggPSBjb29yZGluYXRlWzBdIC0gY2VudGVyWzBdOwoJICAgICAgICAgICAgY29uc3QgZGlzdGFuY2UgPSBNYXRoLnNxcnQoTWF0aC5wb3coZHksIDIpICsgTWF0aC5wb3coZHgsIDIpKTsKCSAgICAgICAgICAgIGNvbnN0IGFuZ2xlID0gTWF0aC5hdGFuMihkeSwgZHgpIC0gcm90YXRpb24gKiBERUdSRUVTX1RPX1JBRElBTlM7CgkgICAgICAgICAgICByZXR1cm4gWwoJICAgICAgICAgICAgICAgIGNlbnRlclswXSArIE1hdGguY29zKGFuZ2xlKSAqIGRpc3RhbmNlLAoJICAgICAgICAgICAgICAgIGNlbnRlclsxXSArIE1hdGguc2luKGFuZ2xlKSAqIGRpc3RhbmNlLAoJICAgICAgICAgICAgXTsKCSAgICAgICAgfSksCgkgICAgXTsKCX0KCWZ1bmN0aW9uIGdldExhdExvbkJveChub2RlKSB7CgkgICAgY29uc3QgbGF0TG9uQm94ID0gZ2V0MShub2RlLCAiTGF0TG9uQm94Iik7CgkgICAgaWYgKGxhdExvbkJveCkgewoJICAgICAgICBjb25zdCBub3J0aCA9IG51bTEobGF0TG9uQm94LCAibm9ydGgiKTsKCSAgICAgICAgY29uc3Qgd2VzdCA9IG51bTEobGF0TG9uQm94LCAid2VzdCIpOwoJICAgICAgICBjb25zdCBlYXN0ID0gbnVtMShsYXRMb25Cb3gsICJlYXN0Iik7CgkgICAgICAgIGNvbnN0IHNvdXRoID0gbnVtMShsYXRMb25Cb3gsICJzb3V0aCIpOwoJICAgICAgICBjb25zdCByb3RhdGlvbiA9IG51bTEobGF0TG9uQm94LCAicm90YXRpb24iKTsKCSAgICAgICAgaWYgKHR5cGVvZiBub3J0aCA9PT0gIm51bWJlciIgJiYKCSAgICAgICAgICAgIHR5cGVvZiBzb3V0aCA9PT0gIm51bWJlciIgJiYKCSAgICAgICAgICAgIHR5cGVvZiB3ZXN0ID09PSAibnVtYmVyIiAmJgoJICAgICAgICAgICAgdHlwZW9mIGVhc3QgPT09ICJudW1iZXIiKSB7CgkgICAgICAgICAgICBjb25zdCBiYm94ID0gW3dlc3QsIHNvdXRoLCBlYXN0LCBub3J0aF07CgkgICAgICAgICAgICBsZXQgY29vcmRpbmF0ZXMgPSBbCgkgICAgICAgICAgICAgICAgWwoJICAgICAgICAgICAgICAgICAgICBbd2VzdCwgbm9ydGhdLAoJICAgICAgICAgICAgICAgICAgICBbZWFzdCwgbm9ydGhdLAoJICAgICAgICAgICAgICAgICAgICBbZWFzdCwgc291dGhdLAoJICAgICAgICAgICAgICAgICAgICBbd2VzdCwgc291dGhdLAoJICAgICAgICAgICAgICAgICAgICBbd2VzdCwgbm9ydGhdLCAvLyB0b3AgbGVmdCAoYWdhaW4pCgkgICAgICAgICAgICAgICAgXSwKCSAgICAgICAgICAgIF07CgkgICAgICAgICAgICBpZiAodHlwZW9mIHJvdGF0aW9uID09PSAibnVtYmVyIikgewoJICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzID0gcm90YXRlQm94KGJib3gsIGNvb3JkaW5hdGVzLCByb3RhdGlvbik7CgkgICAgICAgICAgICB9CgkgICAgICAgICAgICByZXR1cm4gewoJICAgICAgICAgICAgICAgIHR5cGU6ICJQb2x5Z29uIiwKCSAgICAgICAgICAgICAgICBjb29yZGluYXRlcywKCSAgICAgICAgICAgIH07CgkgICAgICAgIH0KCSAgICB9CgkgICAgcmV0dXJuIG51bGw7Cgl9CglmdW5jdGlvbiBnZXRHcm91bmRPdmVybGF5KG5vZGUsIHN0eWxlTWFwLCBzY2hlbWEpIHsKCSAgICBjb25zdCBnZW9tZXRyeSA9IGdldEdyb3VuZE92ZXJsYXlCb3gobm9kZSk7CgkgICAgY29uc3QgZmVhdHVyZSA9IHsKCSAgICAgICAgdHlwZTogIkZlYXR1cmUiLAoJICAgICAgICBnZW9tZXRyeSwKCSAgICAgICAgcHJvcGVydGllczogT2JqZWN0LmFzc2lnbigKCSAgICAgICAgLyoqCgkgICAgICAgICAqIFJlbGF0ZWQgdG8KCSAgICAgICAgICogaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vdG1jdy8wMzdhMWNiNjY2MGQ3NGEzOTJlOWRhNzQ0NjU0MGY0NgoJICAgICAgICAgKi8KCSAgICAgICAgeyAiQGdlb21ldHJ5LXR5cGUiOiAiZ3JvdW5kb3ZlcmxheSIgfSwgZ2V0TXVsdGkobm9kZSwgWwoJICAgICAgICAgICAgIm5hbWUiLAoJICAgICAgICAgICAgImFkZHJlc3MiLAoJICAgICAgICAgICAgInZpc2liaWxpdHkiLAoJICAgICAgICAgICAgIm9wZW4iLAoJICAgICAgICAgICAgInBob25lTnVtYmVyIiwKCSAgICAgICAgICAgICJkZXNjcmlwdGlvbiIsCgkgICAgICAgIF0pLCBnZXRNYXliZUhUTUxEZXNjcmlwdGlvbihub2RlKSwgZXh0cmFjdENhc2NhZGVkU3R5bGUobm9kZSwgc3R5bGVNYXApLCBleHRyYWN0U3R5bGUobm9kZSksIGV4dHJhY3RJY29uSHJlZihub2RlKSwgZXh0cmFjdEV4dGVuZGVkRGF0YShub2RlLCBzY2hlbWEpLCBleHRyYWN0VGltZVNwYW4obm9kZSksIGV4dHJhY3RUaW1lU3RhbXAobm9kZSkpLAoJICAgIH07CgkgICAgaWYgKGZlYXR1cmUucHJvcGVydGllcz8udmlzaWJpbGl0eSAhPT0gdW5kZWZpbmVkKSB7CgkgICAgICAgIGZlYXR1cmUucHJvcGVydGllcy52aXNpYmlsaXR5ID0gZmVhdHVyZS5wcm9wZXJ0aWVzLnZpc2liaWxpdHkgIT09ICIwIjsKCSAgICB9CgkgICAgY29uc3QgaWQgPSBub2RlLmdldEF0dHJpYnV0ZSgiaWQiKTsKCSAgICBpZiAoaWQgIT09IG51bGwgJiYgaWQgIT09ICIiKQoJICAgICAgICBmZWF0dXJlLmlkID0gaWQ7CgkgICAgcmV0dXJuIGZlYXR1cmU7Cgl9CgoJZnVuY3Rpb24gZ2V0U3R5bGVJZChzdHlsZSkgewoJICAgIGxldCBpZCA9IHN0eWxlLmdldEF0dHJpYnV0ZSgiaWQiKTsKCSAgICBjb25zdCBwYXJlbnROb2RlID0gc3R5bGUucGFyZW50Tm9kZTsKCSAgICBpZiAoIWlkICYmCgkgICAgICAgIGlzRWxlbWVudChwYXJlbnROb2RlKSAmJgoJICAgICAgICBwYXJlbnROb2RlLmxvY2FsTmFtZSA9PT0gIkNhc2NhZGluZ1N0eWxlIikgewoJICAgICAgICBpZCA9IHBhcmVudE5vZGUuZ2V0QXR0cmlidXRlKCJrbWw6aWQiKSB8fCBwYXJlbnROb2RlLmdldEF0dHJpYnV0ZSgiaWQiKTsKCSAgICB9CgkgICAgcmV0dXJuIG5vcm1hbGl6ZUlkKGlkIHx8ICIiKTsKCX0KCWZ1bmN0aW9uIGJ1aWxkU3R5bGVNYXAobm9kZSkgewoJICAgIGNvbnN0IHN0eWxlTWFwID0ge307CgkgICAgZm9yIChjb25zdCBzdHlsZSBvZiAkKG5vZGUsICJTdHlsZSIpKSB7CgkgICAgICAgIHN0eWxlTWFwW2dldFN0eWxlSWQoc3R5bGUpXSA9IGV4dHJhY3RTdHlsZShzdHlsZSk7CgkgICAgfQoJICAgIGZvciAoY29uc3QgbWFwIG9mICQobm9kZSwgIlN0eWxlTWFwIikpIHsKCSAgICAgICAgY29uc3QgaWQgPSBub3JtYWxpemVJZChtYXAuZ2V0QXR0cmlidXRlKCJpZCIpIHx8ICIiKTsKCSAgICAgICAgdmFsMShtYXAsICJzdHlsZVVybCIsIChzdHlsZVVybCkgPT4gewoJICAgICAgICAgICAgc3R5bGVVcmwgPSBub3JtYWxpemVJZChzdHlsZVVybCk7CgkgICAgICAgICAgICBpZiAoc3R5bGVNYXBbc3R5bGVVcmxdKSB7CgkgICAgICAgICAgICAgICAgc3R5bGVNYXBbaWRdID0gc3R5bGVNYXBbc3R5bGVVcmxdOwoJICAgICAgICAgICAgfQoJICAgICAgICB9KTsKCSAgICB9CgkgICAgcmV0dXJuIHN0eWxlTWFwOwoJfQoJZnVuY3Rpb24gYnVpbGRTY2hlbWEobm9kZSkgewoJICAgIGNvbnN0IHNjaGVtYSA9IHt9OwoJICAgIGZvciAoY29uc3QgZmllbGQgb2YgJChub2RlLCAiU2ltcGxlRmllbGQiKSkgewoJICAgICAgICBzY2hlbWFbZmllbGQuZ2V0QXR0cmlidXRlKCJuYW1lIikgfHwgIiJdID0KCSAgICAgICAgICAgIHR5cGVDb252ZXJ0ZXJzW2ZpZWxkLmdldEF0dHJpYnV0ZSgidHlwZSIpIHx8ICIiXSB8fAoJICAgICAgICAgICAgICAgIHR5cGVDb252ZXJ0ZXJzWyJzdHJpbmciXTsKCSAgICB9CgkgICAgcmV0dXJuIHNjaGVtYTsKCX0KCWNvbnN0IEZPTERFUl9QUk9QUyA9IFsKCSAgICAibmFtZSIsCgkgICAgInZpc2liaWxpdHkiLAoJICAgICJvcGVuIiwKCSAgICAiYWRkcmVzcyIsCgkgICAgImRlc2NyaXB0aW9uIiwKCSAgICAicGhvbmVOdW1iZXIiLAoJICAgICJ2aXNpYmlsaXR5IiwKCV07CglmdW5jdGlvbiBnZXRGb2xkZXIobm9kZSkgewoJICAgIGNvbnN0IG1ldGEgPSB7fTsKCSAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIEFycmF5LmZyb20obm9kZS5jaGlsZE5vZGVzKSkgewoJICAgICAgICBpZiAoaXNFbGVtZW50KGNoaWxkKSAmJiBGT0xERVJfUFJPUFMuaW5jbHVkZXMoY2hpbGQudGFnTmFtZSkpIHsKCSAgICAgICAgICAgIG1ldGFbY2hpbGQudGFnTmFtZV0gPSBub2RlVmFsKGNoaWxkKTsKCSAgICAgICAgfQoJICAgIH0KCSAgICByZXR1cm4gewoJICAgICAgICB0eXBlOiAiZm9sZGVyIiwKCSAgICAgICAgbWV0YSwKCSAgICAgICAgY2hpbGRyZW46IFtdLAoJICAgIH07Cgl9CgkvKioKCSAqIFlpZWxkIGEgbmVzdGVkIHRyZWUgd2l0aCBLTUwgZm9sZGVyIHN0cnVjdHVyZQoJICoKCSAqIFRoaXMgZ2VuZXJhdGVzIGEgdHJlZSB3aXRoIHRoZSBnaXZlbiBzdHJ1Y3R1cmU6CgkgKgoJICogYGBganMKCSAqIHsKCSAqICAgInR5cGUiOiAicm9vdCIsCgkgKiAgICJjaGlsZHJlbiI6IFsKCSAqICAgICB7CgkgKiAgICAgICAidHlwZSI6ICJmb2xkZXIiLAoJICogICAgICAgIm1ldGEiOiB7CgkgKiAgICAgICAgICJuYW1lIjogIlRlc3QiCgkgKiAgICAgICB9LAoJICogICAgICAgImNoaWxkcmVuIjogWwoJICogICAgICAgICAgLy8gLi4uZmVhdHVyZXMgYW5kIGZvbGRlcnMKCSAqICAgICAgIF0KCSAqICAgICB9CgkgKiAgICAgLy8gLi4uZmVhdHVyZXMKCSAqICAgXQoJICogfQoJICogYGBgCgkgKgoJICogIyMjIEdyb3VuZE92ZXJsYXkKCSAqCgkgKiBHcm91bmRPdmVybGF5IGVsZW1lbnRzIGFyZSBjb252ZXJ0ZWQgaW50bwoJICogYEZlYXR1cmVgIG9iamVjdHMgd2l0aCBgUG9seWdvbmAgZ2VvbWV0cmllcywKCSAqIGEgcHJvcGVydHkgbGlrZToKCSAqCgkgKiBgYGBqc29uCgkgKiB7CgkgKiAgICJAZ2VvbWV0cnktdHlwZSI6ICJncm91bmRvdmVybGF5IgoJICogfQoJICogYGBgCgkgKgoJICogQW5kIHRoZSBncm91bmQgb3ZlcmxheSdzIGltYWdlIFVSTCBpbiB0aGUgYGhyZWZgCgkgKiBwcm9wZXJ0eS4gR3JvdW5kIG92ZXJsYXlzIHdpbGwgbmVlZCB0byBiZSBkaXNwbGF5ZWQKCSAqIHdpdGggYSBzZXBhcmF0ZSBtZXRob2QgdG8gb3RoZXIgZmVhdHVyZXMsIGRlcGVuZGluZwoJICogb24gd2hpY2ggbWFwIGZyYW1ld29yayB5b3UncmUgdXNpbmcuCgkgKi8KCWZ1bmN0aW9uIGttbFdpdGhGb2xkZXJzKG5vZGUpIHsKCSAgICBjb25zdCBzdHlsZU1hcCA9IGJ1aWxkU3R5bGVNYXAobm9kZSk7CgkgICAgY29uc3Qgc2NoZW1hID0gYnVpbGRTY2hlbWEobm9kZSk7CgkgICAgY29uc3QgdHJlZSA9IHsgdHlwZTogInJvb3QiLCBjaGlsZHJlbjogW10gfTsKCSAgICBmdW5jdGlvbiB0cmF2ZXJzZShub2RlLCBwb2ludGVyKSB7CgkgICAgICAgIGlmIChpc0VsZW1lbnQobm9kZSkpIHsKCSAgICAgICAgICAgIHN3aXRjaCAobm9kZS50YWdOYW1lKSB7CgkgICAgICAgICAgICAgICAgY2FzZSAiR3JvdW5kT3ZlcmxheSI6IHsKCSAgICAgICAgICAgICAgICAgICAgY29uc3QgcGxhY2VtYXJrID0gZ2V0R3JvdW5kT3ZlcmxheShub2RlLCBzdHlsZU1hcCwgc2NoZW1hKTsKCSAgICAgICAgICAgICAgICAgICAgaWYgKHBsYWNlbWFyaykgewoJICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRlci5jaGlsZHJlbi5wdXNoKHBsYWNlbWFyayk7CgkgICAgICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICAgICAgYnJlYWs7CgkgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgIGNhc2UgIlBsYWNlbWFyayI6IHsKCSAgICAgICAgICAgICAgICAgICAgY29uc3QgcGxhY2VtYXJrID0gZ2V0UGxhY2VtYXJrKG5vZGUsIHN0eWxlTWFwLCBzY2hlbWEpOwoJICAgICAgICAgICAgICAgICAgICBpZiAocGxhY2VtYXJrKSB7CgkgICAgICAgICAgICAgICAgICAgICAgICBwb2ludGVyLmNoaWxkcmVuLnB1c2gocGxhY2VtYXJrKTsKCSAgICAgICAgICAgICAgICAgICAgfQoJICAgICAgICAgICAgICAgICAgICBicmVhazsKCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICAgICAgY2FzZSAiRm9sZGVyIjogewoJICAgICAgICAgICAgICAgICAgICBjb25zdCBmb2xkZXIgPSBnZXRGb2xkZXIobm9kZSk7CgkgICAgICAgICAgICAgICAgICAgIHBvaW50ZXIuY2hpbGRyZW4ucHVzaChmb2xkZXIpOwoJICAgICAgICAgICAgICAgICAgICBwb2ludGVyID0gZm9sZGVyOwoJICAgICAgICAgICAgICAgICAgICBicmVhazsKCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICB9CgkgICAgICAgIH0KCSAgICAgICAgaWYgKG5vZGUuY2hpbGROb2RlcykgewoJICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub2RlLmNoaWxkTm9kZXMubGVuZ3RoOyBpKyspIHsKCSAgICAgICAgICAgICAgICB0cmF2ZXJzZShub2RlLmNoaWxkTm9kZXNbaV0sIHBvaW50ZXIpOwoJICAgICAgICAgICAgfQoJICAgICAgICB9CgkgICAgfQoJICAgIHRyYXZlcnNlKG5vZGUsIHRyZWUpOwoJICAgIHJldHVybiB0cmVlOwoJfQoJLyoqCgkgKiBDb252ZXJ0IEtNTCB0byBHZW9KU09OIGluY3JlbWVudGFsbHksIHJldHVybmluZwoJICogYSBbR2VuZXJhdG9yXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L0d1aWRlL0l0ZXJhdG9yc19hbmRfR2VuZXJhdG9ycykKCSAqIHRoYXQgeWllbGRzIG91dHB1dCBmZWF0dXJlIGJ5IGZlYXR1cmUuCgkgKi8KCWZ1bmN0aW9uKiBrbWxHZW4obm9kZSkgewoJICAgIGNvbnN0IHN0eWxlTWFwID0gYnVpbGRTdHlsZU1hcChub2RlKTsKCSAgICBjb25zdCBzY2hlbWEgPSBidWlsZFNjaGVtYShub2RlKTsKCSAgICBmb3IgKGNvbnN0IHBsYWNlbWFyayBvZiAkKG5vZGUsICJQbGFjZW1hcmsiKSkgewoJICAgICAgICBjb25zdCBmZWF0dXJlID0gZ2V0UGxhY2VtYXJrKHBsYWNlbWFyaywgc3R5bGVNYXAsIHNjaGVtYSk7CgkgICAgICAgIGlmIChmZWF0dXJlKQoJICAgICAgICAgICAgeWllbGQgZmVhdHVyZTsKCSAgICB9CgkgICAgZm9yIChjb25zdCBncm91bmRPdmVybGF5IG9mICQobm9kZSwgIkdyb3VuZE92ZXJsYXkiKSkgewoJICAgICAgICBjb25zdCBmZWF0dXJlID0gZ2V0R3JvdW5kT3ZlcmxheShncm91bmRPdmVybGF5LCBzdHlsZU1hcCwgc2NoZW1hKTsKCSAgICAgICAgaWYgKGZlYXR1cmUpCgkgICAgICAgICAgICB5aWVsZCBmZWF0dXJlOwoJICAgIH0KCX0KCS8qKgoJICogQ29udmVydCBhIEtNTCBkb2N1bWVudCB0byBHZW9KU09OLiBUaGUgZmlyc3QgYXJndW1lbnQsIGBkb2NgLCBtdXN0IGJlIGEgS01MCgkgKiBkb2N1bWVudCBhcyBhbiBYTUwgRE9NIC0gbm90IGFzIGEgc3RyaW5nLiBZb3UgY2FuIGdldCB0aGlzIHVzaW5nIGpRdWVyeSdzIGRlZmF1bHQKCSAqIGAuYWpheGAgZnVuY3Rpb24gb3IgdXNpbmcgYSBiYXJlIFhNTEh0dHBSZXF1ZXN0IHdpdGggdGhlIGAucmVzcG9uc2VgIHByb3BlcnR5CgkgKiBob2xkaW5nIGFuIFhNTCBET00uCgkgKgoJICogVGhlIG91dHB1dCBpcyBhIEphdmFTY3JpcHQgb2JqZWN0IG9mIEdlb0pTT04gZGF0YS4gWW91IGNhbiBjb252ZXJ0IGl0IHRvIGEgc3RyaW5nCgkgKiB3aXRoIFtKU09OLnN0cmluZ2lmeV0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvSlNPTi9zdHJpbmdpZnkpCgkgKiBvciB1c2UgaXQgZGlyZWN0bHkgaW4gbGlicmFyaWVzLgoJICovCglmdW5jdGlvbiBrbWwobm9kZSkgewoJICAgIHJldHVybiB7CgkgICAgICAgIHR5cGU6ICJGZWF0dXJlQ29sbGVjdGlvbiIsCgkgICAgICAgIGZlYXR1cmVzOiBBcnJheS5mcm9tKGttbEdlbihub2RlKSksCgkgICAgfTsKCX0KCgl2YXIgdG9HZW9Kc29uID0gLyojX19QVVJFX18qL09iamVjdC5mcmVlemUoewoJCV9fcHJvdG9fXzogbnVsbCwKCQlncHg6IGdweCwKCQlncHhHZW46IGdweEdlbiwKCQlrbWw6IGttbCwKCQlrbWxHZW46IGttbEdlbiwKCQlrbWxXaXRoRm9sZGVyczoga21sV2l0aEZvbGRlcnMsCgkJdGN4OiB0Y3gsCgkJdGN4R2VuOiB0Y3hHZW4KCX0pOwoKCWNsYXNzIENvbnZlcnRlciB7CgkgICAgY29uc3RydWN0b3IoZm9ybWF0LCBkYXRhKSB7CgkgICAgICAgIC8qKgoJICAgICAgICAgKiBDcmVhdGVzIGEgYmxhbmsgR2VvSlNPTiBmZWF0dXJlIGNvbGxlY3Rpb24uCgkgICAgICAgICAqIEByZXR1cm5zIEEgbmV3IEdlb0pTT04gZmVhdHVyZSBjb2xsZWN0aW9uIHdpdGggbm8gZmVhdHVyZXMuCgkgICAgICAgICAqLwoJICAgICAgICB0aGlzLmJsYW5rR2VvSlNPTiA9ICgpID0+ICh7CgkgICAgICAgICAgICB0eXBlOiAnRmVhdHVyZUNvbGxlY3Rpb24nLAoJICAgICAgICAgICAgZmVhdHVyZXM6IFtdLAoJICAgICAgICB9KTsKCSAgICAgICAgdGhpcy5fcmF3RGF0YSA9IGRhdGE7CgkgICAgICAgIHRoaXMuX2Zvcm1hdCA9IGZvcm1hdDsKCSAgICAgICAgY29uc3QgY29udmVydGVycyA9IHsKCSAgICAgICAgICAgICd0b3BvanNvbic6IHRoaXMubG9hZFRvcG9Kc29uLAoJICAgICAgICAgICAgJ2ttbCc6IHRoaXMubG9hZFhtbCwKCSAgICAgICAgICAgICdncHgnOiB0aGlzLmxvYWRYbWwsCgkgICAgICAgICAgICAndGN4JzogdGhpcy5sb2FkWG1sLAoJICAgICAgICAgICAgJ2Nzdic6IHRoaXMubG9hZENzdiwKCSAgICAgICAgICAgICd0c3YnOiB0aGlzLmxvYWRDc3YKCSAgICAgICAgfTsKCSAgICAgICAgdGhpcy5fY29udmVyc2lvbkZuID0gY29udmVydGVyc1tmb3JtYXRdOwoJICAgIH0KCSAgICBhc3luYyBjb252ZXJ0KCkgewoJICAgICAgICBpZiAoIXRoaXMuX2NvbnZlcnNpb25GbikgewoJICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChfLCByZWopID0+IHJlaihgTm8gY29udmVydGVyIGV4aXN0cyBmb3IgJHt0aGlzLl9mb3JtYXR9YCkpOwoJICAgICAgICB9CgkgICAgICAgIGVsc2UgewoJICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NvbnZlcnNpb25GbigpOwoJICAgICAgICB9CgkgICAgfQoJICAgIC8qKgoJICAgICAqIExvYWQgdGhlIFhNTCBkYXRhIGFzIEdlb0pTT04KCSAgICAgKiBAcmV0dXJucyBBIHByb21pc2UgcmVzb2x2aW5nIHRvIGEgR2VvSlNPTiBGZWF0dXJlQ29sbGVjdGlvbgoJICAgICAqLwoJICAgIGFzeW5jIGxvYWRYbWwoKSB7CgkgICAgICAgIC8vIFVzZSB0aGUgYXBwcm9wcmlhdGUgcGFyc2VyIGJhc2VkIG9uIHRoZSBmb3JtYXQKCSAgICAgICAgY29uc3QgZ2VvanNvbiA9IHRvR2VvSnNvblt0aGlzLl9mb3JtYXRdKG5ldyBET01QYXJzZXIoKS5wYXJzZUZyb21TdHJpbmcodGhpcy5fcmF3RGF0YSwgInRleHQveG1sIikpOwoJICAgICAgICByZXR1cm4gZ2VvanNvbjsKCSAgICB9CgkgICAgLyoqCgkgICAgICogTG9hZHMgYW5kIHBhcnNlcyBDU1YgZGF0YSBpbnRvIGEgR2VvSlNPTiBGZWF0dXJlQ29sbGVjdGlvbi4KCSAgICAgKiBAcmV0dXJucyBBIFByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZSBHZW9KU09OIEZlYXR1cmVDb2xsZWN0aW9uLgoJICAgICAqLwoJICAgIGFzeW5jIGxvYWRDc3YoKSB7CgkgICAgICAgIC8vIERlZmluZSBvcHRpb25zIGZvciB0aGUgY3N2Mmdlb2pzb24gbGlicmFyeQoJICAgICAgICBsZXQgb3B0aW9ucyA9IHt9OyAvLyBUT0RPIGFsbG93IENTViBvcHRpb25zCgkgICAgICAgIGlmICh0aGlzLl9mb3JtYXQgPT09ICd0c3YnKSB7CgkgICAgICAgICAgICBvcHRpb25zLmRlbGltaXRlciA9ICdcdCc7CgkgICAgICAgIH0KCSAgICAgICAgLy8gVXNlIHRoZSBjc3YyZ2VvanNvbiBsaWJyYXJ5IHRvIGNvbnZlcnQgdGhlIENTViB0byBHZW9KU09OCgkgICAgICAgIGNvbnN0IGdlb2pzb24gPSBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7CgkgICAgICAgICAgICBjc3YyZ2VvanNvbl8xLmNzdjJnZW9qc29uKHRoaXMuX3Jhd0RhdGEsIG9wdGlvbnMsIChlcnIsIGRhdGEpID0+IHsKCSAgICAgICAgICAgICAgICBpZiAoZXJyKSB7CgkgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpOwoJICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICBlbHNlIHsKCSAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShkYXRhKTsKCSAgICAgICAgICAgICAgICB9CgkgICAgICAgICAgICB9KTsKCSAgICAgICAgfSk7CgkgICAgICAgIHJldHVybiBnZW9qc29uOwoJICAgIH0KCSAgICAvKioKCSAgICAgKiBMb2FkcyBUb3BvSlNPTiBkYXRhIGFuZCBjb252ZXJ0cyBpdCBpbnRvIGEgR2VvSlNPTiBGZWF0dXJlQ29sbGVjdGlvbgoJICAgICAqLwoJICAgIGFzeW5jIGxvYWRUb3BvSnNvbigpIHsKCSAgICAgICAgbGV0IHRvcG9Kc29uRGF0YSA9IHt9OwoJICAgICAgICB0cnkgewoJICAgICAgICAgICAgdG9wb0pzb25EYXRhID0gSlNPTi5wYXJzZSh0aGlzLl9yYXdEYXRhKTsKCSAgICAgICAgfQoJICAgICAgICBjYXRjaCAoZSkgewoJICAgICAgICAgICAgdGhyb3cgIkludmFsaWQgVG9wb0pzb24iOwoJICAgICAgICB9CgkgICAgICAgIC8vIENvbnZlcnQgdGhlIGRhdGEKCSAgICAgICAgbGV0IHJlc3VsdCA9IHRoaXMuYmxhbmtHZW9KU09OKCk7CgkgICAgICAgIGlmICh0b3BvSnNvbkRhdGEudHlwZSA9PT0gIlRvcG9sb2d5IiAmJiB0b3BvSnNvbkRhdGEub2JqZWN0cyAhPT0gdW5kZWZpbmVkKSB7CgkgICAgICAgICAgICByZXN1bHQgPSB7CgkgICAgICAgICAgICAgICAgdHlwZTogIkZlYXR1cmVDb2xsZWN0aW9uIiwKCSAgICAgICAgICAgICAgICBmZWF0dXJlczogcmVzdWx0LmZlYXR1cmVzID0gT2JqZWN0LmtleXModG9wb0pzb25EYXRhLm9iamVjdHMpLm1hcChrZXkgPT4gdG9wb2pzb25GZWF0dXJlKHRvcG9Kc29uRGF0YSwga2V5KSkucmVkdWNlKChhLCB2KSA9PiBbLi4uYSwgLi4udi5mZWF0dXJlc10sIFtdKQoJICAgICAgICAgICAgfTsKCSAgICAgICAgfQoJICAgICAgICByZXR1cm4gcmVzdWx0OwoJICAgIH0KCSAgICA7Cgl9CgoJY29uc3QgbGlicmFyaWVzID0gewoJICAgICdDb252ZXJ0ZXInOiBDb252ZXJ0ZXIKCX07CglsZXQgc3ViQ2xhc3M7CglzZWxmLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBlID0+IHsKCSAgICBjb25zdCBkYXRhID0gKGUuZGF0YSB8fCBlKTsKCSAgICBjb25zdCBwb3N0ID0gKGlkLCBlcnIsIHJlcywgdHlwZSkgPT4gewoJICAgICAgICBwb3N0TWVzc2FnZSh7CgkgICAgICAgICAgICB0eXBlOiB0eXBlID8gdHlwZSA6IChlcnIgPyAnZXJyb3InIDogJ3Jlc3BvbnNlJyksCgkgICAgICAgICAgICBpZDogaWQsCgkgICAgICAgICAgICBtZXNzYWdlOiByZXMsCgkgICAgICAgICAgICBlcnJvcjogZXJyCgkgICAgICAgIH0pOwoJICAgIH07CgkgICAgY29uc3QgY29tbWFuZHMgPSB7CgkgICAgICAgICdpbml0JzogKG1zZykgPT4gewoJICAgICAgICAgICAgY29uc3QgeyBpZCwgY29tbWFuZCwgbWVzc2FnZSB9ID0gbXNnOwoJICAgICAgICAgICAgc3ViQ2xhc3MgPSBuZXcgbGlicmFyaWVzW2NvbW1hbmRdKG1lc3NhZ2VbMF0sIG1lc3NhZ2VbMV0pOwoJICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBjbGFzcycgbWV0aG9kcwoJICAgICAgICAgICAgY29uc3QgZm5zID0gWwoJICAgICAgICAgICAgICAgIC4uLk9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGxpYnJhcmllc1tjb21tYW5kXS5wcm90b3R5cGUpLAoJICAgICAgICAgICAgICAgIC4uLk9iamVjdC5rZXlzKHN1YkNsYXNzKQoJICAgICAgICAgICAgXS5tYXAoa2V5ID0+IFtrZXksIHR5cGVvZiBsaWJyYXJpZXNbY29tbWFuZF0ucHJvdG90eXBlW2tleV1dKQoJICAgICAgICAgICAgICAgIC5yZWR1Y2UoKGEsIGMpID0+ICh7IC4uLmEsIC4uLnsgW2NbMF1dOiBjWzFdIH0gfSksIHt9KTsKCSAgICAgICAgICAgIHBvc3QoaWQsIHVuZGVmaW5lZCwgZm5zLCAnaW5pdF9yZXNwb25zZScpOwoJICAgICAgICB9LAoJICAgICAgICAnZ2V0JzogZnVuY3Rpb24gKG1zZykgewoJICAgICAgICAgICAgY29uc3QgeyBpZCwgY29tbWFuZCB9ID0gbXNnOwoJICAgICAgICAgICAgaWYgKHN1YkNsYXNzICYmIHN1YkNsYXNzW2NvbW1hbmRdKSB7CgkgICAgICAgICAgICAgICAgcG9zdChpZCwgdW5kZWZpbmVkLCBzdWJDbGFzc1tjb21tYW5kXSk7CgkgICAgICAgICAgICB9CgkgICAgICAgICAgICBlbHNlIHsKCSAgICAgICAgICAgICAgICBwb3N0KGlkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCk7CgkgICAgICAgICAgICB9CgkgICAgICAgIH0sCgkgICAgICAgICdleGVjJzogZnVuY3Rpb24gKG1zZykgewoJICAgICAgICAgICAgY29uc3QgeyBpZCwgY29tbWFuZCwgbWVzc2FnZSB9ID0gbXNnOwoJICAgICAgICAgICAgaWYgKHN1YkNsYXNzICYmIHN1YkNsYXNzW2NvbW1hbmRdICYmIHR5cGVvZiBzdWJDbGFzc1tjb21tYW5kXSA9PT0gJ2Z1bmN0aW9uJykgewoJICAgICAgICAgICAgICAgIGNvbnN0IGNtZCA9IHN1YkNsYXNzW2NvbW1hbmRdCgkgICAgICAgICAgICAgICAgICAgIC5hcHBseShzdWJDbGFzcywgbWVzc2FnZSk7CgkgICAgICAgICAgICAgICAgaWYgKCEhY21kICYmIHR5cGVvZiBjbWQudGhlbiA9PT0gJ2Z1bmN0aW9uJykgewoJICAgICAgICAgICAgICAgICAgICAvLyBJdCdzIGEgcHJvbWlzZSwgc28gd2FpdCBmb3IgaXQKCSAgICAgICAgICAgICAgICAgICAgY21kCgkgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihyZXMgPT4gcG9zdChpZCwgdW5kZWZpbmVkLCByZXMpKQoJICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKGUgPT4gcG9zdChpZCwgZSkpOwoJICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgICAgICBlbHNlIHsKCSAgICAgICAgICAgICAgICAgICAgLy8gTm90IGEgcHJvbWlzZSwganVzdCByZXR1cm4gaXQKCSAgICAgICAgICAgICAgICAgICAgcG9zdChpZCwgdW5kZWZpbmVkLCBjbWQpOwoJICAgICAgICAgICAgICAgIH0KCSAgICAgICAgICAgIH0KCSAgICAgICAgICAgIGVsc2UgewoJICAgICAgICAgICAgICAgIC8vIEVycm9yCgkgICAgICAgICAgICAgICAgcG9zdChpZCwgbmV3IEVycm9yKGBjb21tYW5kICIke2NvbW1hbmR9IiBub3QgZm91bmRgKSk7CgkgICAgICAgICAgICB9CgkgICAgICAgIH0KCSAgICB9OwoJICAgIGlmIChjb21tYW5kc1tkYXRhLnR5cGVdKSB7CgkgICAgICAgIGNvbW1hbmRzW2RhdGEudHlwZV0oZGF0YSk7CgkgICAgfQoJfSk7Cgp9KSgpOwoK', null, false);
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
	        fetch(cleanUrl, { signal: controller.signal })
	            .then(response => {
	            if (response.status == 200) {
	                response.text().then(rawData => {
	                    let converter;
	                    let fn;
	                    if (['kml', 'tcx', 'gpx'].indexOf(prefix) >= 0 || !supportsWorkers()) {
	                        // XML uses the DOM, which isn't available to web workers
	                        converter = new Converter(prefix, rawData);
	                        fn = converter.convert();
	                    }
	                    else {
	                        converter = new Actor('Converter', [prefix, rawData]);
	                        fn = converter.exec('convert')();
	                    }
	                    fn.then(data => {
	                        callback(null, data, null, null);
	                    }).catch((e) => {
	                        callback(e);
	                    });
	                });
	            }
	            else {
	                callback(new Error(`Data fetch error: ${response.statusText}`));
	            }
	        })
	            .catch(e => {
	            callback(new Error(e));
	        });
	    }
	    // Allow the request to be cancelled
	    return { cancel: () => { controller.abort(); } };
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
	exports.addProtocols = addProtocols;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
