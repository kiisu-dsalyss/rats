exports.parseTransportResponse = (responseBody) => {
  const strippedResponse = responseBody.replace(/\n/g, '');
  const values = strippedResponse.split('\t');
  const result = {
    Position: values[4],
    playing: values[3]
  };
  return result;
}

exports.endpoint = '/_/TRANSPORT';
