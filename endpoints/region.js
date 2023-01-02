exports.parseRegionResponse = (responseBody) => {
  const lines = responseBody.split('\n');
  const result = {};
  for (let i = 1; i < lines.length - 1; i++) {
    const values = lines[i].split('\t');
    if (values[0] === 'REGION') {
      result[values[1]] = {
        Start: values[2],
        End: values[3]
      };
      if (values[4]) {
        result[values[1]].Color = values[4];
      }
    }
  }
  return result;
}

exports.endpoint = '/_/REGION';
