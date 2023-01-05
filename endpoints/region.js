exports.parseRegionResponse = (responseBody) => {
  const lines = responseBody.split('\n');
  console.log(lines);
  const regions = [];
  for (let i = 1; i < lines.length - 1; i++) {
    const values = lines[i].split('\t');
    if (values[0] === 'REGION') {
      const regionName = values[1] || '-';
      regions.push({
        name: regionName,
        start: parseInt(values[3], 10),
        end: parseInt(values[4], 10),
        color: values[5]
      });
    }
  }
  regions.sort((a, b) => a.start - b.start);
  return regions.reduce((result, region) => {
    if (region.name !== '-') {
      result[region.name] = {
        Start: region.start,
        End: region.end,
        Color: region.color
      };
    }
    return result;
  }, {});
}

exports.endpoint = '/_/REGION';
