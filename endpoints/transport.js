exports.parseTransportResponse = (responseBody) => {
  const strippedResponse = responseBody.replace(/\n/g, '');
  const values = strippedResponse.split('\t');
  const result = {
    time: values[2],
    measure: values[4],
    playing: values[3]
  };
  return result;
}

exports.endpoint = '/_/TRANSPORT';
