const parseLyricsResponse = (responseBody) => {
  const values = responseBody.split('\t');
  const result = {
    Position: {}
  };
  for (let i = 2; i < values.length; i += 2) {
    result.Position[values[i]] = values[i + 1];
  }
  return result;
};

exports.parseLyricsResponse = parseLyricsResponse;
exports.endpoint = '/_/LYRICS/';
